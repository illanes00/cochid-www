#!/usr/bin/env python3
"""Genera indice.json, el índice estático del buscador del portal. Una sola copia y un solo índice para todas las páginas.

Fuentes (todas con URL real y fecha de consulta registradas en meta):
  - ../taxonomia.json                            los 11 temas, sus subtemas y la clasificación de conjuntos e indicadores
  - GET https://datos.cochid.cl/api/catalog/     conjuntos (305 con tema; 6 archivos auxiliares no se indexan)
  - GET https://datos.cochid.cl/api/indicators/  indicadores (172 únicos)
  - destinos.v1.json (registro de destinos)      sitios, herramientas y páginas
  - https://cochid.cl/sitemap.xml                páginas del apex que responden hoy
  - https://cochid.cl/blog/feed.xml              entradas del blog
  - fuentes/investigaciones.json                 curado (3 estudios y las subpáginas del de medicamentos)

Las URL que empiezan con «~/» (temas y su índice) se resuelven en el navegador contra data-raiz del <script>:
en el mockup es una ruta relativa y en la publicación https://datos.cochid.cl/.

Uso:
  python3 generar_indice.py              # usa fuentes/ si existen, si no descarga
  python3 generar_indice.py --refrescar  # vuelve a descargar todo (refresco activo)
Sin dependencias fuera de la biblioteca estándar.
"""
import json, os, re, sys, unicodedata, datetime, urllib.request
import xml.etree.ElementTree as ET

AQUI = os.path.dirname(os.path.abspath(__file__))
FUENTES = os.path.join(AQUI, 'fuentes')
DESTINOS = os.environ.get('DESTINOS_JSON', os.path.join(AQUI, '..', 'data', 'destinos.v1.json'))
TAXONOMIA = os.environ.get('TAXONOMIA_JSON', os.path.join(AQUI, '..', 'data', 'taxonomia.json'))
API = 'https://datos.cochid.cl'
CUENTA = 'https://cuenta.innovacionsantiago.cl/'
REMOTAS = {
    'catalogo.json': API + '/api/catalog/',
    'indicadores.json': API + '/api/indicators/',
    'temas.json': API + '/api/temas/',
    'sitemap-apex.xml': 'https://cochid.cl/sitemap.xml',
    'feed-blog.xml': 'https://cochid.cl/blog/feed.xml',
}
AHORA = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

# Sinónimos (palabra -> alternativas, peso .65 en el buscador) y frases (peso .9). Van en el índice, no en el JS.
# Las claves y alternativas van sin tildes ni mayúsculas. Se amplían a mano mirando qué buscan las personas.
SINONIMOS = {
    'remedios': 'medicamentos', 'remedio': 'medicamentos', 'farmacos': 'medicamentos', 'farmacia': 'medicamentos', 'medicinas': 'medicamentos',
    'plata': 'presupuesto gasto', 'dinero': 'presupuesto gasto', 'fiscal': 'presupuesto gasto', 'fisco': 'presupuesto',
    'delitos': 'denuncias seguridad victimizacion', 'delito': 'denuncias seguridad', 'crimen': 'denuncias seguridad', 'robos': 'denuncias seguridad',
    'delincuencia': 'denuncias seguridad', 'homicidios': 'denuncias seguridad', 'carcel': 'penitenciario gendarmeria',
    'colegios': 'educacion matricula', 'escuelas': 'educacion matricula', 'liceos': 'educacion matricula', 'universidades': 'educacion',
    'sueldos': 'remuneraciones empleo', 'salarios': 'remuneraciones empleo', 'cesantia': 'desempleo empleo', 'trabajo': 'empleo laboral',
    'diputados': 'congreso camara', 'senadores': 'congreso senado', 'parlamento': 'congreso', 'parlamentarios': 'congreso',
    'votaciones': 'votos elecciones', 'votar': 'elecciones', 'leyes': 'legislacion lex', 'ley': 'legislacion',
    'hospitales': 'salud', 'enfermedades': 'salud', 'pobres': 'pobreza', 'ingresos': 'pobreza casen', 'habitantes': 'poblacion demografia',
    'micro': 'transporte buses', 'buses': 'transporte', 'metro': 'transporte trenes', 'trenes': 'ferroviaria transporte',
    'pymes': 'empresas', 'negocios': 'empresas', 'calor': 'clima temperatura', 'temperatura': 'clima',
    'api': 'descargar acceso', 'descargar': 'api acceso', 'csv': 'descargar api',
    # huecos detectados con consultas reales (2-oct-2026)
    'migrantes': 'migraciones migracion extranjeria', 'migrante': 'migraciones migracion', 'inmigrantes': 'migraciones migracion',
    'extranjeros': 'migraciones migracion', 'accidentes': 'siniestros transito', 'accidente': 'siniestros transito',
    'transito': 'siniestros viales', 'choques': 'siniestros transito',
    'sitios': 'proyectos', 'herramientas': 'proyectos', 'productos': 'proyectos',
}
FRASES = {'plata estado': 'presupuesto gasto', 'dinero publico': 'presupuesto gasto', 'gasto publico': 'presupuesto', 'cambio hora': 'reloj horario',
          'sobre nosotros': 'quienes somos'}
# Palabras clave que la gente usa para cada tema y que no están en sus textos.
CLAVES_TEMA = {
    'salud': 'remedios hospitales enfermedades fonasa isapre', 'educacion': 'colegios escuelas liceos universidades notas',
    'economia-trabajo': 'plata empleo sueldos desempleo precios inflacion', 'empresas-innovacion': 'pymes negocios emprendimiento',
    'finanzas-publicas': 'plata estado dinero publico presupuesto impuestos gasto fiscal', 'seguridad-justicia': 'delitos crimen carabineros carceles',
    'poblacion-sociedad': 'habitantes pobreza migrantes natalidad', 'territorio-vivienda': 'regiones comunas casas mapas',
    'transporte-infraestructura': 'micro buses metro trenes accidentes de tránsito', 'medio-ambiente-energia': 'contaminación aire energía luz solar',
    'politica-instituciones': 'diputados senadores votaciones leyes presidente',
}
# Títulos que la API entrega sin tilde: tabla de normalización de los textos visibles (nunca se toca el id ni la URL).
_PARES = (
    'matricula:matrícula poblacion:población region:región publica:pública publico:público educacion:educación numero:número '
    'victimizacion:victimización fiscalia:fiscalía capita:cápita participacion:participación gendarmeria:gendarmería percepcion:percepción '
    'inversion:inversión exposicion:exposición subvencion:subvención posicion:posición recaudacion:recaudación eleccion:elección '
    'indice:índice inflacion:inflación evaluacion:evaluación aprobacion:aprobación economica:económica economico:económico '
    'distribucion:distribución sobrepoblacion:sobrepoblación duracion:duración ocupacion:ocupación dotacion:dotación '
    'epidemiologica:epidemiológica ejecucion:ejecución economia:economía padron:padrón caracterizacion:caracterización '
    'socioeconomica:socioeconómica estadistico:estadístico estadisticas:estadísticas futbol:fútbol demografia:demografía '
    'legislacion:legislación medicos:médicos poblacional:poblacional produccion:producción informacion:información '
    'basica:básica camara:cámara codigo:código tecnologia:tecnología '
    'administracion:administración direccion:dirección policia:policía policias:policías contraloria:contraloría subsecretaria:subsecretaría'

).split()
TILDES = dict(p.split(':') for p in _PARES)


AMBIGUAS = {'publica', 'numero', 'indice'}  # también son verbos o sustantivos sin tilde: solo se corrigen en títulos


def tildes(s, descripcion=False):
    def r(m):
        w = m.group(0)
        a = TILDES.get(w.lower())
        if not a or a == w.lower() or (descripcion and w.lower() in AMBIGUAS):
            return w
        return a.capitalize() if w[0].isupper() and not w.isupper() else (a.upper() if w.isupper() and len(w) > 3 else a)
    return re.sub(r'[A-Za-zÁÉÍÓÚÑáéíóúñ]+', r, s or '')


def traer(nombre, refrescar):
    ruta = os.path.join(FUENTES, nombre)
    meta = ruta + '.meta'
    if refrescar or not os.path.exists(ruta):
        req = urllib.request.Request(REMOTAS[nombre], headers={'User-Agent': 'cochid-buscador-indice/1'})
        with urllib.request.urlopen(req, timeout=60) as r:
            datos = r.read()
        open(ruta, 'wb').write(datos)
        open(meta, 'w').write(AHORA)
        activo = True
    else:
        activo = False
    consultado = open(meta).read().strip() if os.path.exists(meta) else AHORA
    return open(ruta, 'rb').read(), consultado, ('refresco activo' if activo else 'copia local')


def plano(s):
    s = unicodedata.normalize('NFD', (s or '').lower())
    return ''.join(c for c in s if not unicodedata.combining(c))


def corto(s, n=170):
    s = re.sub(r'\s+', ' ', (s or '')).strip()
    if len(s) <= n:
        return s
    cut = s[:n].rsplit(' ', 1)[0].rstrip(' ,;:.')
    return cut + '…'


def marca(s):
    """Normaliza copias vivas antiguas sin propagar la marca abreviada."""
    return re.sub(r'\b(?:COCHID|Cochid)\b', 'Compañía Chilena de Inteligencia de Datos', s or '')


# Dominios del registro de destinos (taxonomía vieja) hacia los 11 temas de la taxonomía v2.
VIEJO = {'presupuesto-gasto-publico': 'finanzas-publicas', 'poblacion-sociedad-educacion': 'poblacion-sociedad',
         'elecciones-congreso': 'politica-instituciones', 'legislacion': 'politica-instituciones',
         'conocimiento-centros-estudio': 'politica-instituciones', 'salud-medicamentos': 'salud',
         'territorio-clima': 'territorio-vivienda', 'economia-trabajo': 'economia-trabajo',
         'seguridad-justicia': 'seguridad-justicia', 'transporte-infraestructura': 'transporte-infraestructura'}
# Palabras del título para ubicar una entrada del blog (que no trae tema) en uno de los 11 temas.
REGLAS_BLOG = [
    ('salud', r'medicament|farmac|salud'), ('finanzas-publicas', r'presupuest|dipres|gasto publico|deuda|glosa|cargos publicos|anuario'),
    ('seguridad-justicia', r'delito|denuncia|seguridad|justicia'), ('politica-instituciones', r'congreso|elecci|votaci|ley\b'),
    ('transporte-infraestructura', r'transporte|tren|bici'), ('educacion', r'educacion|matricula'),
]


def dominio_blog(titulo, cats):
    t = plano(titulo + ' ' + ' '.join(cats))
    for dom, rx in REGLAS_BLOG:
        if re.search(rx, t):
            return dom
    return 'otros'


def main():
    refrescar = '--refrescar' in sys.argv
    os.makedirs(FUENTES, exist_ok=True)
    reg = json.load(open(DESTINOS, encoding='utf-8'))
    tax = json.load(open(TAXONOMIA, encoding='utf-8'))
    dom = {d['id']: d for d in tax['dominios']}
    sub_et = {(d['id'], s['id']): s['etiqueta'] for d in tax['dominios'] for s in d['subtemas']}
    por_id = {d['id']: d for d in reg['destinos']}

    cat_b, cat_t, cat_m = traer('catalogo.json', refrescar)
    ind_b, ind_t, ind_m = traer('indicadores.json', refrescar)
    sm_b, sm_t, sm_m = traer('sitemap-apex.xml', refrescar)
    fd_b, fd_t, fd_m = traer('feed-blog.xml', refrescar)
    catalogo = {c['dataset_id']: c for c in json.loads(cat_b)}
    indicadores = json.loads(ind_b)
    clas_c = {c['dataset_id']: c for c in tax['clasificacion_conjuntos']}
    clas_i = {c['indicator_id']: c for c in tax['clasificacion_indicadores']}
    sitio_dom = {s['id']: d['id'] for d in tax['dominios'] for s in d['sitios']}

    items = []

    def add(t, i, n, d, s, g, u, k='', w=0, a=None, b=None, e=None):
        it = {'t': t, 'i': i, 'n': marca(tildes(n)).replace(' — ', ' · ').replace('—', '·'), 'd': marca(tildes(d, True)).replace(' — ', ', ').replace('—', ','), 's': marca(tildes(s)).replace(' — ', ' · ').replace('—', '·'), 'g': g, 'u': u}
        if k: it['k'] = k
        if w: it['w'] = w
        if a: it['a'] = a
        if b: it['b'] = b
        if e: it['e'] = e
        items.append(it)

    # ---- temas (11): primero para que el orden de empate los favorezca; la URL es la página canónica del tema
    for d in tax['dominios']:
        k = ' '.join([s['etiqueta'] for s in d['subtemas']] + [CLAVES_TEMA.get(d['id'], '')]).strip()
        add('tema', 'tema-' + d['id'], d['etiqueta'], d['frase'], 'Temas', d['id'], f"~/temas/{d['id']}/", k, 0)

    # ---- conjuntos: los 305 con tema (los 6 archivos auxiliares no son un tema para una persona común y no se indexan)
    n_conj = 0
    for did, c in catalogo.items():
        cl = clas_c.get(did)
        if not cl or not cl.get('dominio'):
            continue
        n_conj += 1
        planned = bool(cl.get('planificado'))
        tags = [t.replace('-', ' ').replace('_', ' ') for t in (c['tags'] or []) if not re.match(r'^(planned|production|etl_|sprint|bronze_only|featured|funnel|ckan|datos\.gob|postgis|ref$|oficial|encuesta$)', t)]
        k = ' '.join(filter(None, [sub_et.get((cl['dominio'], cl.get('subtema')), '')] + tags))
        w = {'gold': 2, 'silver': 1.5, 'ref': 1, 'congreso': 1, 'lex': 1}.get(c['schema_name'], 0)
        if planned:
            w = -2
        yrs = c.get('years') or []
        add('dataset', did, c['name'], corto(c['description']), c['source'] or '', cl['dominio'], f'{API}/dataset/{did}', k, w,
            yrs[0] if yrs else None, yrs[-1] if yrs else None, 'planned' if planned else None)
    assert n_conj == tax['totales']['conjuntos_con_dominio'], (n_conj, tax['totales'])

    # ---- indicadores (178 filas, 172 identificadores: 6 aparecen en dos temas; se indexan una vez)
    vistos = set()
    for x in indicadores:
        iid = x['indicator_id']
        if iid in vistos:
            continue
        vistos.add(iid)
        cl = clas_i[iid]
        k = ' '.join(filter(None, [sub_et.get((cl['dominio'], cl.get('subtema')), ''), x.get('tema_name'), x.get('unit')]))
        add('indicador', iid, x['name'], corto(x['description'], 150), x.get('source_name') or x.get('tema_name') or 'Catálogo de datos',
            cl['dominio'], f'{API}/indicador/{iid}', k, 2 if x.get('featured') else 0)
    assert len(vistos) == tax['totales']['indicadores_ids_unicos']

    # ---- sitios, herramientas y páginas (registro de destinos)
    live_apex = set(l.text.strip() for l in ET.fromstring(sm_b).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'))
    TITULOS = {
        'cochid.apex': 'Compañía Chilena de Inteligencia de Datos', 'cochid.datos': 'Portal de datos', 'cochid.apex.quienes': 'Sobre nosotros',
        'cochid.apex.mapas': 'Mapas', 'cochid.apex.datos': 'Datos', 'cochid.mapas': 'Mapas de Chile', 'cochid.datos.catalogo': 'Catálogo de datos',
        'cochid.datos.mercado': 'Mercado Público', 'cochid.datos.casen': 'CASEN: pobreza e ingresos', 'cochid.datos.seguridad': 'Seguridad: delitos y victimización',
        'cochid.datos.explorar': 'Explorar datos', 'cochid.datos.comparar': 'Comparar indicadores', 'cochid.datos.presupuesto': 'Visor de presupuesto',
        'cochid.economia': 'Economía y empresas', 'cochid.tpte': 'Transporte público', 'cochid.datos.funnel': 'Flujos de justicia',
        'cochid.datos.mapa': 'Mapa de indicadores', 'cochid.datos.futbol': 'Fútbol territorial', 'cochid.votos': 'Votos en la Cámara',
        'cochid.apex.novedades': 'Novedades', 'cochid.apex.herramientas': 'Herramientas', 'cochid.datos.temas': 'Datos por tema',
        'cochid.datos.lineage': 'Trazabilidad de los datos', 'cochid.datos.faq': 'Preguntas frecuentes',
    }
    CLAVES = {  # palabras que la gente usa y que no están en el nombre
        'cochid.congreso': 'diputados senadores parlamentarios proyectos de ley', 'cochid.votos': 'votaciones diputados cámara roll call',
        'cochid.elecciones': 'servel votos candidatos resultados electorales presidencial', 'cochid.tpte': 'micro buses paradas recorridos santiago transporte público',
        'cochid.trenes': 'ferrocarril metro red ferroviaria estaciones', 'cochid.clima': 'temperatura lluvia calor', 'cochid.economia': 'empresas empleo precios ipc imacec',
        'cochid.lex': 'leyes normas decretos', 'cochid.datos.mercado': 'compras públicas chilecompra licitaciones proveedores',
        'cochid.datos.presupuesto': 'dipres ley de presupuestos gasto ejecución glosas ministerios', 'cochid.datos.casen': 'pobreza ingresos hogares encuesta',
        'cochid.datos.seguridad': 'delitos denuncias victimización', 'cochid.graphs': 'gráficos crear gráfico', 'cochid.datos.api-docs': 'api descargar desarrolladores',
        'cochid.datos.acceso-api': 'api descargar csv desarrolladores', 'cochid.apex.contacto': 'escribir correo consulta',
        'cochid.apex.servicios': 'cotizar datos a medida informes planes', 'cochid.apex.quienes': 'quiénes somos equipo empresa institución',
        'cochid.mundial': 'fútbol copa mundial 2026 pronóstico', 'cochid.datos.futbol': 'fútbol equipos partidos',
        'cochid.datos.temas': 'temas clasificación salud educación economía', 'cochid.datos.lineage': 'origen archivo fuente huella',
    }
    excluidos = []
    for d in reg['destinos']:
        if d['clase'] in ('api', 'privado', 'staging', 'personal', 'alias') or d['robots'] != 'indexable' or not d['visible']['paleta'] or ':' in d['ruta']:
            continue
        if d['grupo'] == 'fuera':
            continue
        url = f"https://{d['host']}{d['ruta']}"
        if d['id'] in ('cochid.apex.concepciones', 'cochid.apex.cambio-hora'):
            continue  # entran como investigaciones
        if d['id'].startswith('cochid.datos.dominio'):
            continue  # reemplazados por los 11 temas de la taxonomía v2
        if d['estado'] == 'planificado' and url not in live_apex:
            excluidos.append({'id': d['id'], 'url': url, 'motivo': 'planificado y sin respuesta en el sitemap'})
            continue
        if d['id'] == 'cochid.datos.temas':
            url = '~/temas/'
        tipo = 'sitio' if d['clase'] in ('producto', 'herramienta', 'vista', 'portal') else 'pagina'
        if d['id'] == 'cochid.apex.blog':
            tipo = 'pagina'
        g = sitio_dom.get(d['id']) or VIEJO.get(d.get('dominio') or '', 'otros')
        host_txt = d['host']
        w = -4 if d['id'] == 'cochid.prosa-medicamentos' else 0  # herramienta de revisión de texto del estudio: no es lo primero para «medicamentos»
        add(tipo, d['id'], TITULOS.get(d['id'], d['etiqueta']), d['resumen'], host_txt, g, url, CLAVES.get(d['id'], ''), w)
    # páginas de navegación que el registro no trae como destino propio
    add('pagina', 'nav.proyectos', 'Proyectos', 'Nuestros sitios, agrupados por lo que quieres hacer: datos, mapas, investigaciones y herramientas.',
        'cochid.cl', 'otros', 'https://cochid.cl/#proyectos', 'sitios herramientas productos proyectos mundial especiales', 1)
    add('pagina', 'nav.cuenta', 'Iniciar sesión', 'Entra a tu cuenta para usar las herramientas con sesión.',
        'cuenta', 'otros', CUENTA, 'login cuenta ingresar entrar usuario sesion acceso registrarse', 3)

    # ---- investigaciones (curado): el estudio y los dos cuadernos; las subpáginas del estudio van como páginas
    inv = json.load(open(os.path.join(FUENTES, 'investigaciones.json'), encoding='utf-8'))
    DOM_INV = {'salud-medicamentos': 'salud', 'poblacion-sociedad-educacion': 'poblacion-sociedad', 'territorio-clima': 'medio-ambiente-energia'}
    for x in inv:
        g = DOM_INV.get(x['dominio'], x['dominio'])
        if x['id'] in ('inv-medicamentos', 'inv-concepciones', 'inv-cambio-hora'):
            add('investigacion', x['id'], x['titulo'], x['resumen'], x['fuente'], g, x['url'], x.get('claves', ''), 0, x.get('a'), x.get('b'))
        else:
            add('pagina', x['id'], x['titulo'].replace('Informe en versión web, medicamentos en Chile', 'Informe de medicamentos en versión web'), x['resumen'],
                'Estudio de medicamentos', g, x['url'], x.get('claves', ''), -1)

    # ---- blog (feed RSS)
    for it in ET.fromstring(fd_b).iter('item'):
        link = it.findtext('link')
        cats = [c.text for c in it.findall('category')]
        fecha = datetime.datetime.strptime(it.findtext('pubDate')[:16], '%a, %d %b %Y').strftime('%Y-%m-%d')
        add('blog', link.rstrip('/').rsplit('/', 1)[-1], it.findtext('title'), corto(it.findtext('description'), 190),
            'Blog · ' + fecha, dominio_blog(it.findtext('title'), cats), link, ' '.join(cats), 0, int(fecha[:4]), int(fecha[:4]))

    cuenta = {}
    for it in items:
        cuenta[it['t']] = cuenta.get(it['t'], 0) + 1
    salida = {
        'meta': {
            'esquema': 'cochid.buscador.indice.v2',
            'generado_utc': AHORA,
            'cuenta': cuenta,
            'excluidos': excluidos,
            'fuentes': [
                {'url': 'taxonomia.json', 'generado': tax['generado_utc'], 'nota': '11 temas, 50 subtemas; 311 conjuntos en el catálogo, 305 con tema'},
                {'url': REMOTAS['catalogo.json'], 'consultado_utc': cat_t, 'modo': cat_m, 'filas': len(catalogo), 'nota': '305 conjuntos con tema; 6 archivos auxiliares no se indexan'},
                {'url': REMOTAS['indicadores.json'], 'consultado_utc': ind_t, 'modo': ind_m, 'filas': len(indicadores), 'nota': f'{len(vistos)} identificadores distintos; 6 filas repetidas en dos temas'},
                {'url': REMOTAS['sitemap-apex.xml'], 'consultado_utc': sm_t, 'modo': sm_m},
                {'url': REMOTAS['feed-blog.xml'], 'consultado_utc': fd_t, 'modo': fd_m},
                {'url': 'destinos.v1.json', 'generado': reg['generado'], 'sha_registro': reg['fuentes']['registro_sha']},
            ],
        },
        'sinonimos': SINONIMOS,
        'frases': FRASES,
        'dominios': [{'id': d['id'], 'e': d['etiqueta'], 'p': d['icono']['svg_hijos'], 'u': f"~/temas/{d['id']}/"} for d in tax['dominios']]
                    + [{'id': 'otros', 'e': 'Otros', 'p': '', 'u': ''}],
        'items': items,
    }
    ruta = os.path.join(AQUI, 'indice.json')
    with open(ruta, 'w', encoding='utf-8') as f:
        json.dump(salida, f, ensure_ascii=False, separators=(',', ':'))
    print(f'indice.json: {len(items)} ítems, {os.path.getsize(ruta) / 1024:.0f} KB; por tipo: {cuenta}')


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Genera v2/temas/index.html («Datos por tema») y una página por tema (v2/temas/<tema>/index.html).

Todo sale de v2/taxonomia.json (vía comun/temas.py) y de la barra y el pie comunes (comun/chrome.py).
El índice muestra 4 temas con ícono, nombre, una frase y la cantidad de conjuntos; los otros 7 van detrás de
«Ver todos los temas». Los subtemas, los conjuntos y lo relacionado viven en la página de cada tema.
Los enlaces a los temas son relativos al mockup; en la publicación se construye con RAIZ=https://datos.cochid.cl/.
"""
import json
import os
import sys
from html import escape as e
from pathlib import Path

AQUI = Path(__file__).parent
sys.path.insert(0, str(AQUI.parent / 'comun'))
import chrome  # noqa: E402
import temas as T  # noqa: E402

RAIZ_PUB = os.environ.get('RAIZ')  # p. ej. https://datos.cochid.cl/ al publicar
EXCLUIR_SITIOS = {'cochid.thesis'}  # el registro de destinos lo saca de la familia (grupo «fuera»)
VISIBLES_SUB = 4
VISIBLES_REL = 4
INV = {i['id']: i for i in T.TAX['piezas']['investigaciones']}
IDX = json.loads((AQUI.parent / 'buscador' / 'indice.json').read_text())
BLOG = [i for i in IDX['items'] if i['t'] == 'blog']
CONJ = {}
for c in T.TAX['clasificacion_conjuntos']:
    if c.get('dominio'):
        CONJ.setdefault((c['dominio'], c['subtema']), []).append(c)
TIPO_SITIO = {'investigacion': 'estudio', 'observatorio': 'sitio', 'sitio': 'sitio'}


def url_tema(slug, raiz):
    return chrome.tema_url(slug, RAIZ_PUB or raiz)


def relacionado(d):
    """Estudios, sitios, entradas del blog y temas vecinos de un tema, sin repetir enlaces."""
    vistos, out = set(), []

    def add(rotulo, href, tipo):
        if href not in vistos:
            vistos.add(href)
            out.append((rotulo, href, tipo))
    for iid in d['investigaciones']:
        i = INV[iid]
        if i['url'] and i['estado'] == 'publicado':
            add(i['titulo'], i['url'], i['tipo'].lower())
    for s in d['sitios']:
        if s['id'] not in EXCLUIR_SITIOS and s['estado_en_destinos'] == 'vivo':
            add(s['etiqueta'], s['url'], TIPO_SITIO.get(s['tipo'], 'sitio'))
    for b in BLOG:
        if b['g'] == d['id']:
            add(b['n'], b['u'], 'entrada del blog')
    vecinos = []
    for otro in T.DOM:
        if otro['id'] == d['id']:
            continue
        if any(d['id'] in s.get('tambien_en', []) for s in otro['sitios']) or any(o in s.get('tambien_en', []) for s in d['sitios'] for o in [otro['id']]):
            vecinos.append(otro)
    return out, vecinos


def lista_rel(items, vecinos, raiz):
    li = [f'<li><a href="{h}">{e(r)}</a><span class="rel__t">{e(t)}</span></li>' for r, h, t in items]
    li += [f'<li><a href="{url_tema(v["id"], raiz)}">{e(v["etiqueta"])}</a><span class="rel__t">tema</span></li>' for v in vecinos]
    if len(li) < 3:  # un tema sin sitios ni estudios no queda sin salida
        li += ['<li><a href="https://datos.cochid.cl/catalogo">Catálogo de datos</a><span class="rel__t">todos los conjuntos</span></li>',
               '<li><a href="https://datos.cochid.cl/comparar">Comparar indicadores</a><span class="rel__t">herramienta</span></li>']
    ocultos = li[VISIBLES_REL:]
    if len(ocultos) < 3:  # «Ver más» solo cuando se esconden 3 o más
        return f'<ul class="rel">{"".join(li)}</ul>'
    return (f'<ul class="rel">{"".join(li[:VISIBLES_REL])}</ul><details class="mas"><summary>Ver {len(ocultos)} más</summary>'
            f'<ul class="rel">{"".join(ocultos)}</ul></details>')


def conjuntos_sub(d, s):
    cs = sorted(CONJ.get((d['id'], s['id']), []), key=lambda c: (bool(c['planificado']), c['nombre'].lower()))
    if not cs:
        return ''
    li = lambda c: (f'<li><a href="https://datos.cochid.cl/dataset/{c["dataset_id"]}">{e(c["nombre"])}</a>'
                    f'{"<span class=\"rel__t\">en preparación</span>" if c["planificado"] else ""}</li>')
    vis, oc = cs[:3], cs[3:]
    if len(oc) < 3:
        return f'<ul class="conj">{"".join(li(c) for c in cs)}</ul>'
    return (f'<ul class="conj">{"".join(li(c) for c in vis)}</ul><details class="mas"><summary>Ver los {len(oc)} conjuntos restantes</summary>'
            f'<ul class="conj">{"".join(li(c) for c in oc)}</ul></details>')


def bloque_sub(d, s):
    return (f'<li class="sub"><span class="sub__ico">{T.icono(s["icono"]["svg_hijos"], "ico", T.COLOR[d["id"]])}</span><div>'
            f'<h3>{e(s["etiqueta"])}</h3><p>{e(s["frase"])}</p>{conjuntos_sub(d, s)}</div></li>')


def pagina_tema(d):
    raiz = '../../'
    c = d['conteos']
    n, ind, plan = c['conjuntos_primarios'], c['indicadores'], c['planificados']
    partes = [f'{n} conjuntos de datos']
    if ind:
        partes.append(f'{ind} indicadores')
    resumen = ', '.join(partes) + '.'
    if c['consultables'] == 0:
        resumen += ' Todavía en preparación.'
    elif plan:
        resumen += f' {plan} están en preparación.'
    subs = d['subtemas']
    ocultos = subs[VISIBLES_SUB:]
    if len(ocultos) < 3:
        subs_html = f'<ul class="subs">{"".join(bloque_sub(d, s) for s in subs)}</ul>'
    else:
        subs_html = (f'<ul class="subs">{"".join(bloque_sub(d, s) for s in subs[:VISIBLES_SUB])}</ul>'
                     f'<details class="mas"><summary>Ver {len(ocultos)} subtemas más</summary><ul class="subs">{"".join(bloque_sub(d, s) for s in ocultos)}</ul></details>')
    items, vecinos = relacionado(d)
    html = chrome.head(f'{d["etiqueta"]} · Datos por tema · {chrome.NOMBRE}', f'{d["frase"]} {resumen}',
                       [raiz + 'temas/temas.css'], raiz, RAIZ_PUB)
    html += '\n' + chrome.cabecera('datos', chrome.SUB_DATOS, 'Temas', raiz)
    html += f'''
<main id="contenido" tabindex="-1">
  <div class="wrap">
    {chrome.migas([('Inicio', 'https://cochid.cl/'), ('Datos', 'https://datos.cochid.cl/'), ('Temas', raiz + 'temas/'), (d['etiqueta'], None)])}
    <header class="pagina-titulo pt">
      <span class="pt__ico">{T.icono_tema(d, 'ico ico--xl')}</span>
      <div><h1>{e(d["etiqueta"])}</h1><p>{e(d["frase"])}</p><p class="pt__n">{resumen}</p></div>
    </header>
    <section class="bloque" aria-labelledby="b-sub"><h2 id="b-sub">Qué incluye</h2>{subs_html}</section>
    <section class="bloque" aria-labelledby="b-rel"><h2 id="b-rel">Relacionado</h2>{lista_rel(items, vecinos, raiz)}</section>
    <details class="fuentes"><summary>Fuente y notas</summary>
      <p>Conteos del catálogo de <a href="https://datos.cochid.cl/api/catalog/">datos.cochid.cl</a>, consultado el {T.FECHA} a las {T.HORA}. La clasificación por tema se hizo a partir del nombre, la fuente y la descripción de cada conjunto.</p>
      <p>Un conjunto «en preparación» ya está en el catálogo como archivo original, pero todavía no se ordena en tablas que se puedan consultar.</p>
    </details>
  </div>
</main>
{chrome.pie()}
</body>
</html>
'''
    (AQUI / d['id']).mkdir(exist_ok=True)
    (AQUI / d['id'] / 'index.html').write_text(html)


def indice():
    raiz = '../'
    por_id = T.POR_ID
    primeros = [por_id[i] for i in T.DESTACADOS]
    resto = [d for d in T.DOM if d['id'] not in T.DESTACADOS]
    li = lambda ds: ''.join(T.tarjeta(d, url_tema(d['id'], raiz), 'h2') for d in ds)
    html = chrome.head(f'Datos por tema · {chrome.NOMBRE}',
                       f'{T.N_CONJ} conjuntos de datos públicos de Chile, ordenados en {T.N_TEMAS} temas.', [raiz + 'temas/temas.css'], raiz, RAIZ_PUB)
    html += '\n' + chrome.cabecera('datos', chrome.SUB_DATOS, 'Temas', raiz)
    html += f'''
<main id="contenido" tabindex="-1">
  <div class="wrap">
    {chrome.migas([('Inicio', 'https://cochid.cl/'), ('Datos', 'https://datos.cochid.cl/'), ('Temas', None)])}
    <header class="pagina-titulo">
      <h1>Datos por tema</h1>
      <p>{T.N_CONJ} conjuntos de datos en {T.N_TEMAS} temas. Elige uno para ver qué incluye.</p>
    </header>
    <section class="bloque" aria-label="Temas">
      <ul class="temas">{li(primeros)}</ul>
      <details class="mas"><summary>Ver todos los temas</summary><ul class="temas">{li(resto)}</ul></details>
    </section>
    <details class="fuentes"><summary>Fuente y notas</summary>
      <p>Conteos del catálogo de <a href="https://datos.cochid.cl/api/catalog/">datos.cochid.cl</a>, consultado el {T.FECHA} a las {T.HORA}. El catálogo tiene {T.N_CAT} registros; {T.N_AUX} son archivos auxiliares sin tema y no se cuentan. La clasificación por tema se hizo a partir del nombre, la fuente y la descripción de cada conjunto.</p>
      <p>«En preparación» significa que los conjuntos ya están en el catálogo como archivos originales y todavía no se ordenan en tablas que se puedan consultar.</p>
    </details>
  </div>
</main>
{chrome.pie()}
</body>
</html>
'''
    (AQUI / 'index.html').write_text(html)


for d in T.DOM:
    pagina_tema(d)
indice()
print('ok:', 1 + len(T.DOM), 'páginas;', T.N_CONJ, 'conjuntos,', T.N_IND, 'indicadores,', T.N_TEMAS, 'temas')

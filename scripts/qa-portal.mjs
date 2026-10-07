import {createRequire} from 'node:module';
import {mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const require = createRequire(process.env.COCHID_QA_REQUIRE_FROM || '/srv/projects/worktrees/cochid-datos-presupuesto-release-20260930/web/package.json');
const {chromium} = require(process.env.COCHID_QA_PLAYWRIGHT_MODULE || '@playwright/test');
const axePath = process.env.COCHID_QA_AXE_PATH;
const AxeBuilder = axePath ? null : require('@axe-core/playwright').default;

const base = process.env.COCHID_QA_BASE || 'http://127.0.0.1:18547';
const salida = process.env.COCHID_QA_OUT || '/srv/projects/tasks/cochid-portal-20261001/qa/apex-r2';
const rutasBase = [
  '/', '/sobre-nosotros/', '/buscar/', '/temas/', '/contacto/', '/servicios/', '/mapas/',
  '/herramientas/', '/investigaciones/', '/documentacion/', '/mapa-del-sitio/',
  '/cambio-de-hora/', '/concepciones/', '/blog/', '/novedades/',
  ...readdirSync(new URL('../content/blog/', import.meta.url))
    .filter(nombre => nombre.endsWith('.md'))
    .map(nombre => readFileSync(new URL(`../content/blog/${nombre}`, import.meta.url), 'utf8').match(/^ruta:\s*(\S+)$/m)[1]),
];
const vistasBase = [
  {nombre: '1440', width: 1440, height: 1000},
  {nombre: '1000', width: 1000, height: 1000},
  {nombre: '768', width: 768, height: 1000},
  {nombre: '390', width: 390, height: 844},
  {nombre: '320', width: 320, height: 844},
];
const temasBase = ['light', 'dark'];
const rutas = process.env.COCHID_QA_ROUTES ? process.env.COCHID_QA_ROUTES.split(',') : rutasBase;
const anchos = process.env.COCHID_QA_WIDTHS ? new Set(process.env.COCHID_QA_WIDTHS.split(',')) : null;
const vistas = anchos ? vistasBase.filter(vista => anchos.has(vista.nombre)) : vistasBase;
const temas = process.env.COCHID_QA_THEMES ? process.env.COCHID_QA_THEMES.split(',') : temasBase;
const slug = ruta => ruta === '/' ? 'inicio' : ruta.replace(/^\/|\/$/g, '').replaceAll('/', '--');
const fallos = [];
const casos = [];

mkdirSync(salida, {recursive: true});
const browser = await chromium.launch({headless: true, ...(process.env.COCHID_QA_CHROME ? {executablePath: process.env.COCHID_QA_CHROME} : {})});
try {
  for (const ruta of rutas) {
    for (const vista of vistas) {
      for (const tema of temas) {
        const context = await browser.newContext({
          viewport: {width: vista.width, height: vista.height},
          colorScheme: tema,
          reducedMotion: 'reduce',
        });
        const page = await context.newPage();
        const id = `${slug(ruta)}-${vista.nombre}-${tema}`;
        const erroresPagina = [];
        page.on('pageerror', error => erroresPagina.push(String(error)));
        const response = await page.goto(`${base}${ruta}`, {waitUntil: 'networkidle'});
        if (!response || response.status() !== 200) fallos.push(`${id}: HTTP ${response?.status()}`);
        await page.evaluate(valor => document.documentElement.dataset.theme = valor, tema);
        const birren = await page.evaluate(() => {
          const probe = document.createElement('span');
          probe.style.cssText = 'position:absolute;left:-10000px;visibility:hidden';
          document.body.append(probe);
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const ctx = canvas.getContext('2d', {willReadFrequently: true});
          const color = expression => {
            probe.style.color = expression;
            const resolved = getComputedStyle(probe).color;
            ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = resolved; ctx.fillRect(0, 0, 1, 1);
            return {css: resolved, rgba: [...ctx.getImageData(0, 0, 1, 1).data]};
          };
          const luminance = rgba => rgba.slice(0, 3).map(v => v / 255)
            .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
            .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
          const tokens = Object.fromEntries(['--n-fondo', '--n-superficie-1', '--n-superficie-2',
            '--n-superficie-3', '--n-texto', '--n-texto-2', '--n-texto-3', '--n-borde-control']
            .map(token => [token, color(`var(${token})`)]));
          const muro = color(getComputedStyle(document.body).backgroundColor);
          const fondos = {'muro servido': muro, ...Object.fromEntries(Object.entries(tokens)
            .filter(([nombre]) => nombre.includes('superficie') || nombre === '--n-fondo'))};
          const contrastes = [];
          for (const [texto, minimo] of [['--n-texto', 12], ['--n-texto-2', 7],
            ['--n-texto-3', 4.5], ['--n-borde-control', 3]]) {
            for (const [fondo, valor] of Object.entries(fondos)) {
              const a = luminance(tokens[texto].rgba), b = luminance(valor.rgba);
              contrastes.push({texto, fondo, minimo, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05)});
            }
          }
          probe.remove();
          const niveles = ['--n-fondo', '--n-superficie-1', '--n-superficie-2', '--n-superficie-3']
            .map(nombre => ({nombre, luminancia: luminance(tokens[nombre].rgba)}));
          return {ambiente: document.body.dataset.environment, marca: document.documentElement.dataset.brand,
            muro, tokens, contrastes, niveles};
        });
        for (const par of birren.contrastes) {
          if (par.ratio < par.minimo) fallos.push(`${id}: contraste ${par.texto}/${par.fondo} ${par.ratio.toFixed(2)} < ${par.minimo}`);
        }
        if (tema === 'dark' && birren.niveles.some((nivel, i, niveles) => i > 0 && nivel.luminancia <= niveles[i - 1].luminancia)) {
          fallos.push(`${id}: escalera oscura sin elevación por luminosidad`);
        }

        const desborde = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
          elementos: [...document.querySelectorAll('body *')]
            .filter(elemento => {
              const caja = elemento.getBoundingClientRect();
              return caja.right > document.documentElement.clientWidth + 1 || caja.left < -1
                || elemento.scrollWidth > elemento.clientWidth + 1;
            })
            .slice(0, 12).map(elemento => {
              const caja = elemento.getBoundingClientRect();
              return {selector: `${elemento.tagName.toLowerCase()}.${elemento.className}`, izquierda: caja.left,
                derecha: caja.right, ancho: caja.width, cliente: elemento.clientWidth, scroll: elemento.scrollWidth};
            }),
        }));
        if (desborde.scroll > desborde.viewport + 1) fallos.push(`${id}: desborde ${JSON.stringify(desborde)}`);
        const medirControlesBarra = () => page.evaluate(() => [...document.querySelectorAll(
          '.cx-nav__acciones button,.cx-nav__acciones .cx-pill,.cx-panel a,.cx-sub a,.cx-sub summary'
        )].filter(elemento => {
          const caja = elemento.getBoundingClientRect();
          return caja.width > 0 && caja.height > 0 && getComputedStyle(elemento).visibility !== 'hidden';
        }).map(elemento => {
          const caja = elemento.getBoundingClientRect();
          return {texto: elemento.textContent.trim(), ancho: caja.width, alto: caja.height};
        }));
        const controlesBarra = await medirControlesBarra();
        const comprobarControles = controles => {
          for (const control of controles) if (control.ancho < 43.5 || control.alto < 43.5) {
            fallos.push(`${id}: control de barra menor de 44px ${JSON.stringify(control)}`);
          }
        };
        comprobarControles(controlesBarra);

        /* Las capturas de revisión van sin foco de teclado ni hover: el foco se
           prueba aparte, después de capturar. */
        await page.mouse.move(0, 0);
        await page.evaluate(() => document.activeElement?.blur?.());
        const sinFoco = await page.evaluate(() => document.activeElement === document.body || document.activeElement === null);
        if (!sinFoco) fallos.push(`${id}: la captura tendría foco visible`);
        await page.screenshot({path: join(salida, `${id}.png`), fullPage: false});

        await page.locator('body').press('Tab');
        const foco = await page.evaluate(() => {
          const activo = document.activeElement;
          const estilo = getComputedStyle(activo);
          const caja = activo.getBoundingClientRect();
          return {
            tag: activo?.tagName,
            clase: activo?.className,
            visible: caja.width > 0 && caja.height > 0,
            outline: estilo.outlineStyle !== 'none' && estilo.outlineWidth !== '0px',
          };
        });
        if (foco.tag === 'BODY' || !foco.visible || !foco.outline) fallos.push(`${id}: foco inicial ${JSON.stringify(foco)}`);

        let menu = null;
        if (await page.locator('.cx-menu-btn').isVisible()) {
          const cerrarBuscador = page.locator('.bq__x');
          if (await cerrarBuscador.isVisible()) await cerrarBuscador.click();
          const boton = page.locator('.cx-menu-btn');
          await boton.click();
          const abierto = await boton.getAttribute('aria-expanded');
          const navegacionVisible = await page.locator('.cx-panel').isVisible();
          const controlesMenu = await medirControlesBarra();
          comprobarControles(controlesMenu);
          await page.screenshot({path: join(salida, `${id}-menu.png`), fullPage: false});
          await page.keyboard.press('Escape');
          menu = {
            abierto,
            navegacionVisible,
            cerrado: await boton.getAttribute('aria-expanded'),
            focoDevuelto: await boton.evaluate(elemento => document.activeElement === elemento),
            controles: controlesMenu,
          };
          if (menu.abierto !== 'true' || !menu.navegacionVisible || menu.cerrado !== 'false' || !menu.focoDevuelto) {
            fallos.push(`${id}: menú móvil ${JSON.stringify(menu)}`);
          }
        }

        let axe;
        if (axePath) {
          await page.addScriptTag({path: axePath});
          axe = await page.evaluate(async () => window.axe.run(document));
        } else {
          axe = await new AxeBuilder({page}).analyze();
        }
        const graves = axe.violations.filter(violacion => ['serious', 'critical'].includes(violacion.impact));
        if (graves.length) fallos.push(`${id}: Axe ${graves.map(v => `${v.id}:${v.impact}`).join(',')}`);
        if (erroresPagina.length) fallos.push(`${id}: errores JS ${erroresPagina.join(' | ')}`);

        const detalleAxe = graves.map(({id, impact, help, nodes}) => ({
          id, impact, help,
          nodes: nodes.map(({target, failureSummary}) => ({target, failureSummary})),
        }));
        casos.push({id, ruta, ancho: vista.width, tema, birren, controlesBarra, axeGraves: graves.length, detalleAxe, sinFocoEnCaptura: sinFoco, desborde, foco, menu, erroresPagina});
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

const recibo = {
  generado: new Date().toISOString(),
  base,
  rutas: rutas.length,
  casos: casos.length,
  capturas: casos.length + casos.filter(caso => caso.menu).length,
  axeSeriasOCriticas: casos.reduce((total, caso) => total + caso.axeGraves, 0),
  fallos,
  resultados: casos,
};
writeFileSync(join(salida, 'recibo.json'), `${JSON.stringify(recibo, null, 2)}\n`);
if (fallos.length) throw new Error(`QA falló (${fallos.length}):\n${fallos.join('\n')}`);
console.log(JSON.stringify({rutas: recibo.rutas, casos: recibo.casos, capturas: recibo.capturas, axeSeriasOCriticas: 0, sinFocoEnCaptura: casos.filter(caso => caso.sinFocoEnCaptura).length, fallos: 0}));

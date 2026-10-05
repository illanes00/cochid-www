import {createRequire} from 'node:module';
import {mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const require = createRequire(process.env.COCHID_QA_REQUIRE_FROM || '/srv/projects/worktrees/cochid-datos-presupuesto-release-20260930/web/package.json');
const {chromium} = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

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
        if (vista.width <= 390) {
          const cerrarBuscador = page.locator('.bq__x');
          if (await cerrarBuscador.isVisible()) await cerrarBuscador.click();
          const boton = page.locator('.cx-menu-btn');
          await boton.click();
          const abierto = await boton.getAttribute('aria-expanded');
          const navegacionVisible = await page.locator('.cx-panel').isVisible();
          await page.screenshot({path: join(salida, `${id}-menu.png`), fullPage: false});
          await page.keyboard.press('Escape');
          menu = {
            abierto,
            navegacionVisible,
            cerrado: await boton.getAttribute('aria-expanded'),
            focoDevuelto: await boton.evaluate(elemento => document.activeElement === elemento),
          };
          if (menu.abierto !== 'true' || !menu.navegacionVisible || menu.cerrado !== 'false' || !menu.focoDevuelto) {
            fallos.push(`${id}: menú móvil ${JSON.stringify(menu)}`);
          }
        }

        const axe = await new AxeBuilder({page}).analyze();
        const graves = axe.violations.filter(violacion => ['serious', 'critical'].includes(violacion.impact));
        if (graves.length) fallos.push(`${id}: Axe ${graves.map(v => `${v.id}:${v.impact}`).join(',')}`);
        if (erroresPagina.length) fallos.push(`${id}: errores JS ${erroresPagina.join(' | ')}`);

        casos.push({id, ruta, ancho: vista.width, tema, axeGraves: graves.length, sinFocoEnCaptura: sinFoco, desborde, foco, menu, erroresPagina});
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

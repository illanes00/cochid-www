import {createRequire} from 'node:module';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const require = createRequire('/srv/projects/worktrees/cochid-datos-presupuesto-release-20260930/web/package.json');
const {chromium} = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const base = process.env.COCHID_QA_BASE || 'http://127.0.0.1:18547';
const salida = process.env.COCHID_QA_OUT || '/srv/projects/tasks/cochid-portal-20261001/qa/apex';
const rutasBase = [
  '/', '/quienes-somos/', '/contacto/', '/servicios/', '/datos/', '/mapas/',
  '/herramientas/', '/investigaciones/', '/documentacion/', '/mapa-del-sitio/',
  '/cambio-de-hora/', '/concepciones/',
];
const vistasBase = [
  {nombre: '1440', width: 1440, height: 1000},
  {nombre: '768', width: 768, height: 900},
  {nombre: '320', width: 320, height: 800},
];
const temasBase = ['light', 'dark'];
const rutas = process.env.COCHID_QA_ROUTES ? process.env.COCHID_QA_ROUTES.split(',') : rutasBase;
const anchos = process.env.COCHID_QA_WIDTHS ? new Set(process.env.COCHID_QA_WIDTHS.split(',')) : null;
const vistas = anchos ? vistasBase.filter(vista => anchos.has(vista.nombre)) : vistasBase;
const temas = process.env.COCHID_QA_THEMES ? process.env.COCHID_QA_THEMES.split(',') : temasBase;
const slug = ruta => ruta === '/' ? 'inicio' : ruta.replaceAll('/', '');
const fallos = [];
const casos = [];

mkdirSync(salida, {recursive: true});
const browser = await chromium.launch({headless: true});
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
        if (vista.width === 320) {
          const boton = page.locator('.gr-nav__toggle');
          await boton.click();
          const abierto = await boton.getAttribute('aria-expanded');
          const navegacionVisible = await page.locator('.gr-nav__links').isVisible();
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

        await page.screenshot({path: join(salida, `${id}.png`), fullPage: false});
        casos.push({id, ruta, ancho: vista.width, tema, axeGraves: graves.length, desborde, foco, menu, erroresPagina});
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
  capturas: casos.length,
  axeSeriasOCriticas: casos.reduce((total, caso) => total + caso.axeGraves, 0),
  fallos,
  resultados: casos,
};
writeFileSync(join(salida, 'recibo.json'), `${JSON.stringify(recibo, null, 2)}\n`);
if (fallos.length) throw new Error(`QA falló (${fallos.length}):\n${fallos.join('\n')}`);
console.log(JSON.stringify({rutas: recibo.rutas, casos: recibo.casos, capturas: recibo.capturas, axeSeriasOCriticas: 0, fallos: 0}));

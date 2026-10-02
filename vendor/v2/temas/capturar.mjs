// Capturas y verificación del índice de temas y de la página de un tema. Uso (bajo flock): node capturar.mjs <puerto>
import { writeFile } from 'node:fs/promises'
import { chromium, AxeBuilder, abrirPagina, medir, geometria, RAIZ } from '../comun/captura.mjs'
const port = process.argv[2]
const out = `${RAIZ}/capturas/temas`
const url = `http://127.0.0.1:${port}/temas/index.html`
const urlTema = `http://127.0.0.1:${port}/temas/salud/index.html`
const browser = await chromium.launch()
const report = {}
const axe = async (page, nombre) => (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze()).violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes.slice(0, 3).map(n => n.target.join(' ') + ' :: ' + (n.any[0]?.message || n.failureSummary || '').slice(0, 200)) }))
for (const [name, w, h] of [['1440', 1440, 900], ['390', 390, 844]]) {
  for (const [tema, theme] of [['claro', 'light'], ['oscuro', 'dark']]) {
    const k = `${name}-${tema}`
    const { ctx, page, errs } = await abrirPagina(browser, url, w, h, theme)
    await page.screenshot({ path: `${out}/${k}-viewport.png` })
    await page.addStyleTag({ content: '.cx-nav{position:static!important}' })
    await page.screenshot({ path: `${out}/${k}-completa.png`, fullPage: true, timeout: 40000 })
    const m = await page.evaluate(medir)
    const g = await page.evaluate(geometria)
    const visibles = await page.evaluate(() => [...document.querySelectorAll('.temas > .tema')].filter(e => e.getBoundingClientRect().width > 0 && e.closest('details') === null).length)
    const ax = await axe(page)
    await writeFile(`${out}/axe-${k}.json`, JSON.stringify({ url, viewport: [w, h], tema: theme, violaciones: ax }, null, 1))
    // abrir «Ver todos los temas»: 7 más
    await page.click('details.mas > summary')
    const totales = await page.locator('.temas > .tema').count()
    // buscador
    const abrir = page.locator('.cx-buscar')
    let buscador = {}
    if (await abrir.isVisible()) {
      await abrir.click(); await page.waitForSelector('[role=dialog]', { timeout: 5000 })
      await page.keyboard.type('remedios', { delay: 15 }); await page.waitForTimeout(300)
      await page.screenshot({ path: `${out}/${k}-buscador.png` })
      buscador = { resultados: await page.locator('[role=option]').count(), primeraFila: await page.locator('[role=option]').first().innerText() }
      await page.keyboard.press('Escape'); await page.waitForTimeout(150)
      buscador.focoVuelve = await page.evaluate(() => document.activeElement?.className)
      await page.keyboard.press('Control+k'); await page.waitForTimeout(150)
      buscador.ctrlK = await page.locator('[role=dialog]').isVisible().catch(() => false)
      await page.keyboard.press('Escape')
    }
    let menu = {}
    if (w < 1100) {
      await page.click('.cx-menu-btn'); await page.waitForTimeout(200)
      await page.screenshot({ path: `${out}/${k}-menu.png` })
      menu = { items: await page.locator('#cx-panel a, #cx-panel button').allInnerTexts() }
    }
    report[k] = { ...m, nav: { alto: g.nav?.h, logo: g.logo, primerEnlaceX: g.enlaces[0]?.x, pill: g.pill && { w: g.pill.w, h: g.pill.h, bg: g.pill.backgroundColor } }, temasPrimeraVista: visibles, temasTotales: totales, buscador, menu, errs, axe: ax }
    await ctx.close()
    console.error('listo', k)
  }
}
// página de un tema (Salud) en claro y oscuro, escritorio y móvil
for (const [name, w, h] of [['1440', 1440, 900], ['390', 390, 844]]) {
  for (const [tema, theme] of [['claro', 'light'], ['oscuro', 'dark']]) {
    const k = `tema-salud-${name}-${tema}`
    const { ctx, page, errs } = await abrirPagina(browser, urlTema, w, h, theme)
    await page.addStyleTag({ content: '.cx-nav{position:static!important}' })
    await page.screenshot({ path: `${out}/${k}-completa.png`, fullPage: true, timeout: 40000 })
    const m = await page.evaluate(medir)
    report[k] = { alto: m.alto, upper: m.upper, coloredBorder: m.coloredBorder, mayus: m.mayus, marca: m.marca, overflow: m.overflow, palabras: m.palabras, enlaces: m.enlaces, tinyTargets: m.tinyTargets, errs, axe: await axe(page) }
    await ctx.close()
  }
}
await browser.close()
await writeFile(`${out}/informe.json`, JSON.stringify(report, null, 1))
console.log(JSON.stringify(Object.fromEntries(Object.entries(report).map(([k, v]) => [k, { alto: v.alto, palabras: v.palabras, enlaces: v.enlaces, upper: v.upper?.length, coloredBorder: v.coloredBorder?.length, tiny: v.tinyTargets?.length, axe: v.axe.map(a => a.id + ':' + a.n) }])), null, 1))

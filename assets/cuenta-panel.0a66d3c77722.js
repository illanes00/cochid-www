/* Panel común invocable desde la barra o la página de ajustes de cada sitio. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) { root.cisCuentaPanel = api; api.install(); }
})(typeof window === 'undefined' ? null : window, function (root) {
  'use strict';
  const ORIGIN = 'https://cuenta.innovacionsantiago.cl';
  const HOSTS = Object.freeze([
    'innovacionsantiago.cl', 'portal.innovacionsantiago.cl', 'cuenta.innovacionsantiago.cl',
    'drive.innovacionsantiago.cl', 'inbox.innovacionsantiago.cl',
    'circulodesantiago.cl', 'enciclopedia.circulodesantiago.cl',
    'cochid.cl', 'datos.cochid.cl', 'mapas.cochid.cl', 'tpte.cochid.cl',
    'lex.cochid.cl', 'congreso.cochid.cl', 'elecciones.cochid.cl', 'scribe.cochid.cl', 'thesis.cochid.cl',
    'usaia.cl', 'audio.usaia.cl', 'collage.usaia.cl', 'imagenes.usaia.cl', 'dibujos.usaia.cl', 'paint.usaia.cl', 'video.usaia.cl',
    'situacion.cl', 'periodismo2.cl', 'comentario.cl', 'firmasydocumentos.cl',
    'indieweb.cl', 'taller.indieweb.cl', 'collage.innovacionsantiago.cl', 'videos.illanes00.cl',
  ]);
  function allowedOrigin(origin) {
    try { const url = new URL(origin); return url.protocol === 'https:' && !url.username && !url.password && !url.port && HOSTS.includes(url.hostname) && url.origin === origin; }
    catch { return false; }
  }
  function embedUrl({ origin, view = 'app', section = '' } = {}) {
    if (!allowedOrigin(origin)) throw new RangeError('Sitio no autorizado para el panel');
    const url = new URL('/embed/shell/', ORIGIN);
    url.searchParams.set('parent_origin', origin);
    url.searchParams.set('view', view === 'settings' ? 'settings' : 'app');
    if (/^(?:perfil|acceso|vinculadas|sesiones|aplicaciones|accesibilidad|privacidad)$/.test(section)) url.hash = section;
    return url.href;
  }
  let container;
  let dialog;
  let iframe;
  let focusBefore;
  function close() { if (dialog && dialog.open) dialog.close(); if (iframe) iframe.removeAttribute('src'); if (focusBefore && focusBefore.isConnected) focusBefore.focus(); }
  function mount() {
    if (container) return;
    container = document.createElement('div');
    container.setAttribute('data-cis-cuenta-panel', 'v1');
    const shadow = container.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `:host{font-family:var(--font-sans,"IBM Plex Sans",sans-serif)}dialog{box-sizing:border-box;width:min(72rem,calc(100vw - 2rem));height:min(52rem,calc(100dvh - 2rem));max-width:none;max-height:none;padding:0;margin:auto;border:1px solid var(--line-control,#666);background:var(--paper,#fff);color:var(--ink,#222)}dialog[open]{display:grid;grid-template-rows:auto minmax(0,1fr)}dialog::backdrop{background:rgb(0 0 0 / .45)}header{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;padding:.75rem;border-bottom:1px solid var(--line,#ddd)}h2{margin:0 auto 0 0;font-size:1.125rem}button,a{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:44px;padding:.5rem .75rem;border:1px solid var(--line-control,#666);background:var(--paper,#fff);color:var(--ink,#222);font:inherit;text-decoration:none;cursor:pointer}button:focus-visible,a:focus-visible{outline:2px solid var(--accent,#164bc4);outline-offset:2px}iframe{display:block;width:100%;height:100%;min-height:0;border:0}nav{display:flex;gap:.5rem}@media(max-width:600px){dialog{width:100vw;height:100dvh;border:0}header{gap:.25rem;padding:.5rem}h2{width:calc(100% - 70px)}}`;
    dialog = document.createElement('dialog'); dialog.setAttribute('aria-labelledby', 'cuenta-panel-title');
    const header = document.createElement('header'); const title = document.createElement('h2');
    title.id = 'cuenta-panel-title'; title.textContent = 'Mi cuenta';
    const nav = document.createElement('nav'); nav.setAttribute('aria-label', 'Vistas de Mi cuenta');
    for (const [view, label] of [['app', 'Resumen'], ['settings', 'Ajustes']]) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
      button.addEventListener('click', () => { iframe.contentWindow.postMessage({ type: 'cis-cuenta-view', view }, ORIGIN); });
      nav.append(button);
    }
    const full = document.createElement('a'); full.href = ORIGIN + '/'; full.textContent = 'Abrir Cuenta';
    const exit = document.createElement('button'); exit.type = 'button'; exit.textContent = 'Cerrar'; exit.addEventListener('click', close);
    header.append(title, nav, full, exit);
    iframe = document.createElement('iframe'); iframe.title = 'Panel de Mi cuenta';
    iframe.referrerPolicy = 'strict-origin';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation');
    dialog.append(header, iframe); shadow.append(style, dialog); document.body.append(container);
    // Los controles del panel no deben cerrar los menús de la página anfitriona.
    dialog.addEventListener('click', (event) => { event.stopPropagation(); });
    dialog.addEventListener('keydown', (event) => { if (event.key === 'Escape') event.stopPropagation(); });
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
    root.addEventListener('message', (event) => {
      if (event.origin === ORIGIN && event.source === iframe.contentWindow && event.data && event.data.type === 'cis-cuenta-close') close();
    });
  }
  function open(options = {}) {
    const url = embedUrl({ ...options, origin: location.origin });
    mount(); focusBefore = document.activeElement; iframe.src = url;
    if (!dialog.open) dialog.showModal();
  }
  function install() {
    if (!root || !allowedOrigin(location.origin) || location.origin === ORIGIN) return;
    document.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const trigger = event.target.closest && event.target.closest('[data-cuenta-panel-open],a[data-cuenta-enlace],a[data-cuenta-item],a[href]');
      if (!trigger) return;
      let view = trigger.getAttribute('data-cuenta-panel-open'); let section = '';
      if (!view) {
        let url; try { url = new URL(trigger.href, location.href); } catch { return; }
        if (url.origin !== ORIGIN || !['/', '/app/', '/settings/'].includes(url.pathname)) return;
        view = url.pathname === '/settings/' ? 'settings' : 'app'; section = url.hash.slice(1);
      }
      event.preventDefault(); open({ view, section });
    });
  }
  return Object.freeze({ HOSTS, allowedOrigin, embedUrl, open, close, install });
});

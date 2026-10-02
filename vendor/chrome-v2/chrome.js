/* Comportamiento del componente común: menú del teléfono y menús «Más» y «Secciones» de la barra secundaria.
   El cambio de tema lo hace chrome.js del kit (data-theme-toggle); la búsqueda, buscador.min.js (data-buscar-abrir). */
(function () {
  var D = document, hdr = D.querySelector('.cx-nav'), btn = D.querySelector('.cx-menu-btn'), panel = D.getElementById('cx-panel');
  function menu(abrir, foco) {
    if (!hdr || !btn || !panel) return;
    hdr.classList.toggle('is-open', abrir);
    panel.hidden = !abrir;
    btn.setAttribute('aria-expanded', String(abrir));
    btn.setAttribute('aria-label', abrir ? 'Cerrar el menú' : 'Abrir el menú');
    if (!abrir && foco) btn.focus();
  }
  if (btn) btn.addEventListener('click', function () { menu(btn.getAttribute('aria-expanded') !== 'true'); });
  function cerrarDetalles(salvo, foco) {
    D.querySelectorAll('.cx-sub details[open]').forEach(function (d) {
      if (d === salvo) return;
      d.open = false;
      if (foco) d.querySelector('summary').focus();
    });
  }
  D.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (D.querySelector('.bq:not([hidden])')) return;           // el buscador ya maneja su Escape
    cerrarDetalles(null, true);
    if (hdr && hdr.classList.contains('is-open')) menu(false, true);
  });
  D.addEventListener('click', function (e) {
    var d = e.target.closest && e.target.closest('.cx-sub details');
    cerrarDetalles(d, false);
    if (hdr && hdr.classList.contains('is-open') && !e.target.closest('.cx-nav')) menu(false, false);
  });
  // estados para la hoja de cabecera (iframes) y las capturas: ?tema=oscuro, ?menu=abierto, ?mas=abierto, ?secciones=abierto
  var q = new URLSearchParams(location.search);
  if (q.get('tema')) D.documentElement.setAttribute('data-theme', q.get('tema') === 'oscuro' ? 'dark' : 'light');
  if (q.get('menu') === 'abierto') menu(true);
  if (q.get('mas') === 'abierto') { var m = D.querySelector('.cx-mas'); if (m) m.open = true; }
  if (q.get('secciones') === 'abierto') { var sc = D.querySelector('.cx-sub__movil'); if (sc) sc.open = true; }
  // al pasar a escritorio se cierra el menú del teléfono
  if (window.matchMedia) window.matchMedia('(min-width: 1180px)').addEventListener('change', function (m) { if (m.matches) menu(false, false); });
})();
/*! Buscador del portal de la Compañía Chilena de Inteligencia de Datos. Sin dependencias.
 *  Un archivo, dos usos: en Node exporta el núcleo puro (pruebas con node --test);
 *  en el navegador monta el diálogo (Ctrl/⌘+K, "/" o cualquier [data-buscar-abrir]).
 *  Índice: indice.json generado por generar_indice.py. */
(function (R, F) {
  var B = F(typeof document != 'undefined' && document.currentScript);
  if (typeof module == 'object' && module.exports) module.exports = B;
  else R.Buscador = B;
  if (typeof document != 'undefined') B.auto();
})(this, function (CS) {
  'use strict';
  // ---------------------------------------------------------------- núcleo (sin DOM)
  var fold = s => String(s == null ? '' : s).normalize('NFC').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  var words = s => fold(s).match(/[a-z0-9]+/g) || [];
  var STOP = ' a al con de del el en la las lo los para por que se sin su un una y o es sobre entre ';
  var TB = { sitio: 6, tema: 5, investigacion: 4.5, indicador: 2, pagina: 1.5, blog: 1, dataset: 0 };
  var ORD = ['sitio', 'tema', 'investigacion', 'dataset', 'indicador', 'blog', 'pagina'];
  var ETQ = { sitio: 'Sitios y herramientas', tema: 'Temas', investigacion: 'Investigaciones', dataset: 'Conjuntos de datos', indicador: 'Indicadores', blog: 'Blog', pagina: 'Páginas' };
  var SUG = ['medicamentos', 'presupuesto educación', 'delitos por región', 'elecciones 2025', 'empresas por región'];
  var MIN = 2;  // una letra devuelve media base de datos: se pide al menos dos caracteres

  function preparar(J) {
    var dm = {}, vocab = {};
    J.dominios.forEach(function (d) { dm[d.id] = d.e; });
    var its = J.items.map(function (it) {
      var n = words(it.n), k = words(it.k), d = words((it.d || '') + ' ' + (it.s || '') + ' ' + it.i + ' ' + (dm[it.g] || ''));
      n.concat(k).forEach(function (w) { if (w.length > 3) vocab[w] = 1; });
      it._f = [n, k, d].map(a => ' ' + a.join(' ') + ' ');
      return it;
    });
    return { sin: J.sinonimos || {}, frases: J.frases || {}, items: its, dom: dm, doms: J.dominios, vocab: Object.keys(vocab), meta: J.meta };
  }

  // puntaje de un término contra un ítem: título > etiquetas > descripción; palabra entera > prefijo
  function ts(it, t) {
    var W = [[10, 8], [6, 5], [2, 1.6]], m = 0, s = 0, v, i, f;
    for (i = 0; i < 3; i++) {
      if (i == 2 && it.t == 'tema') break;  // un tema se encuentra por su nombre y sus subtemas, no por una mención en su frase
      f = it._f[i];
      v = f.indexOf(' ' + t + ' ') >= 0 ? W[i][0] : f.indexOf(' ' + t) >= 0 ? W[i][1] : 0;
      s += v; if (v > m) m = v;
    }
    return m + .15 * (s - m);
  }

  // raíz tosca: plural y género (empresas/empresa, biotecnología/biotecnológicas); el prefijo hace el resto
  var stem = w => w.length > 5 ? w.replace(/(es|as|os|s|a|o|e)$/, '') : w.length > 3 ? w.replace(/s$/, '') : w;
  function lev(a, b) {  // distancia de edición, con corte en 2
    if (Math.abs(a.length - b.length) > 2) return 3;
    var p = [], i, j, c, q;
    for (j = 0; j <= b.length; j++) p[j] = j;
    for (i = 1; i <= a.length; i++) {
      q = [i];
      for (j = 1; j <= b.length; j++) { c = a[i - 1] == b[j - 1] ? 0 : 1; q[j] = Math.min(p[j] + 1, q[j - 1] + 1, p[j - 1] + c); }
      p = q;
    }
    return p[b.length];
  }

  // consulta -> grupos de términos. Año = señal blanda; frase conocida = sinónimo explícito.
  function analizar(idx, q) {
    var ws = words(q).filter(w => STOP.indexOf(' ' + w + ' ') < 0 && (w.length > 1 || /\d/.test(w)));
    if (!ws.length) ws = words(q).filter(w => w.length > 1 || /\d/.test(w));  // «a» sola no es una consulta
    var g = [], yr = [], corr = [], i, j, ph, w;
    for (i = 0; i < ws.length; i++) {
      w = ws[i];
      if (/^(19|20)\d\d$/.test(w)) { yr.push(+w); continue; }
      ph = ws[i + 1] && idx.frases[w + ' ' + ws[i + 1]];
      if (ph) { g.push({ p: [], a: ph.split(' '), aw: .9, t: w + ' ' + ws[i + 1], ph: w + ' ' + ws[i + 1] }); i++; continue; }
      var gr = { p: stem(w) == w ? [w] : [w, stem(w)], a: idx.sin[w] ? idx.sin[w].split(' ') : [], aw: .65, t: w };
      if (w.length > 3 && !idx.items.some(it => ts(it, w) > 0)) {  // sin ninguna coincidencia: ¿error de tecleo?
        var best = null, bd = 3;
        for (j = 0; j < idx.vocab.length; j++) { var dd = lev(w, idx.vocab[j]); if (dd < bd && idx.vocab[j][0] == w[0]) { bd = dd; best = idx.vocab[j]; } }
        if (best && bd <= (w.length > 6 ? 2 : 1)) { gr.a.push(best); gr.aw = .7; gr.fix = best; corr.push([w, best]); }
      }
      g.push(gr);
    }
    return { g: g, yr: yr, corr: corr };
  }

  function buscar(idx, q, o) {
    o = o || {};
    var A = analizar(idx, q), n = A.g.length, sc = [], mx = 0;
    if (!n && !A.yr.length) return { q: q, grupos: [], total: 0, vacio: true, faltan: [], terminos: [] };
    var cov = A.g.map(() => 0);  // cuántos ítems cubre cada término, por sí mismo o por sinónimo (no por corrección de tecleo)
    idx.items.forEach(function (it) {
      var tot = 0, c = 0, ti = 0, all = n > 0, yb = 0, hit = [];
      A.g.forEach(function (gr, k) {
        var s = 0;
        gr.p.forEach(function (t, j) { s = Math.max(s, ts(it, t) * (j ? .97 : 1)); });
        var sy = 0;
        gr.a.forEach(function (t) { var v = gr.aw * ts(it, t); s = Math.max(s, v); if (!gr.fix || t != gr.fix) sy = Math.max(sy, v); });
        if (gr.ph && it._f[1].indexOf(' ' + gr.ph + ' ') >= 0) { s = Math.max(s, 9); sy = s; }  // la frase tal cual en las etiquetas del ítem
        if (s > 0) { c++; tot += s; hit.push(k); }
        if (sy > 0 || (gr.p.length && s > 0 && !gr.fix)) cov[k]++;
        if (gr.p.length && it._f[0].indexOf(' ' + gr.p[0]) >= 0) ti++; else all = false;
      });
      A.yr.forEach(function (y) {
        if (it.a && y >= it.a && y <= (it.b || it.a)) yb += 3;
        if (it._f[0].indexOf(' ' + y + ' ') >= 0) yb += 4; else if (it._f[2].indexOf(' ' + y + ' ') >= 0) yb += 1;
      });
      if (!n && !yb) return;
      if (n && !c) return;
      var base = tot + yb + (all ? 6 : 0) + (n && it._f[0].indexOf(' ' + A.g[0].p[0]) == 0 ? 3 : 0);
      sc.push({ it: it, s: base + (TB[it.t] || 0) + (it.w || 0), c: c, h: hit });
      if (c > mx) mx = c;
    });
    var full = sc.filter(r => r.c == n), comp = full.length, parcial = n > 1 && !comp;
    if (n > 1 && comp < 8) {  // pocas completas: se añaden, por debajo, hasta 12 que cubren parte de la consulta
      // solo las que contienen la palabra más específica (la que menos ítems cubre): «iniciar sesión» no arrastra todo lo que dice «sesión»
      var rara = -1;
      cov.forEach(function (v, k) { if (v > 0 && (rara < 0 || v < cov[rara])) rara = k; });
      var par = sc.filter(r => r.c < n && r.c >= (parcial ? mx : 1) && (r.h.indexOf(rara) >= 0 || r.it.t == 'tema') && !(r.it.w < 0));
      par.forEach(function (r) { r.s *= r.c / n * .6; });
      sc = full.concat(par.sort(function (x, y) { return y.s - x.s; }).slice(0, 12));
    } else sc = full;
    sc.sort(function (a, b) { return (b.c == n) - (a.c == n) || b.s - a.s || ORD.indexOf(a.it.t) - ORD.indexOf(b.it.t) || a.it.n.length - b.it.n.length; });
    var gs = {}, out = [];
    sc.forEach(function (r) { (gs[r.it.t] = gs[r.it.t] || { t: r.it.t, etq: ETQ[r.it.t], items: [], top: r.s, pin: 0 }).items.push(r.it); if (r.it.t == 'tema' && n) gs.tema.pin = 1; });
    ORD.forEach(function (t) { if (gs[t]) out.push(gs[t]); });
    out.sort(function (a, b) { return (b.pin || 0) - (a.pin || 0) || b.top - a.top; });  // si la consulta coincide con un tema, el tema va primero
    return {
      q: q, grupos: out, total: sc.length, completos: n ? comp : sc.length, parcial: parcial, vacio: !sc.length,
      faltan: A.g.filter(function (_, k) { return !cov[k]; }).map(x => x.t),
      corregidos: A.corr,
      terminos: [].concat.apply([], A.g.map(x => x.p)).concat(A.yr.map(String)),
      años: A.yr
    };
  }

  var core = { fold: fold, words: words, preparar: preparar, buscar: buscar, analizar: analizar, SUG: SUG, ETQ: ETQ, ORD: ORD };

  // ---------------------------------------------------------------- interfaz (solo navegador)
  var P = {
    lupa: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    sitio: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    dataset: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
    indicador: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    investigacion: '<path d="M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z"/>',
    blog: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    pagina: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
    tema: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
  };
  var svg = function (k, raw) { return '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (raw || P[k]) + '</svg>'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function hl(t, ks) {  // resalta en el título los términos, ignorando tildes (fold conserva el largo)
    var f = fold(t), m = [], i, p, o = '', on = 0;
    if (f.length != t.length) return esc(t);
    ks.forEach(function (k) { p = 0; while (k && (p = f.indexOf(k, p)) >= 0) { for (i = p; i < p + k.length; i++) m[i] = 1; p += k.length; } });
    for (i = 0; i < t.length; i++) { if ((m[i] || 0) != on) { o += on ? '</mark>' : '<mark>'; on = m[i] || 0; } o += esc(t[i]); }
    return o + (on ? '</mark>' : '');
  }

  function montar(o) {
    var D = document, idx, R, act = -1, open = {}, prev, abierto = false, nodos = [], cargando;
    var src = CS && CS.src || '', base = o.indice || (CS && CS.getAttribute('data-indice')) || (src ? src.replace(/[^\/]*$/, '') + 'indice.json' : 'indice.json');
    var raiz = o.raiz != null ? o.raiz : (CS && CS.getAttribute('data-raiz')) || '';
    var U = function (u) { return u.indexOf('~/') == 0 ? raiz + u.slice(2) : u; };  // «~/» = raíz del sitio de datos
    var root = D.createElement('div');
    root.className = 'bq'; root.hidden = true;
    root.innerHTML = '<div class="bq__panel" role="dialog" aria-modal="true" aria-label="Buscar en el portal">' +
      '<div class="bq__campo">' + svg('lupa') + '<input class="bq__in" type="text" role="combobox" aria-expanded="false" aria-controls="bq-lista" aria-autocomplete="list" aria-label="Buscar" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Busca un dato o un tema">' +
      '<button type="button" class="bq__x" aria-label="Esc, cerrar el buscador">Esc</button></div>' +
      '<p class="bq__estado" role="status" aria-live="polite"></p><div class="bq__lista" id="bq-lista" role="listbox" aria-label="Resultados"></div>' +
      '<p class="bq__pie" aria-hidden="true">Flechas para moverte, Enter para abrir, Esc para cerrar</p></div>';
    D.body.appendChild(root);
    var inp = root.querySelector('input'), lista = root.querySelector('.bq__lista'), est = root.querySelector('.bq__estado'), x = root.querySelector('.bq__x');

    function cargar() {
      return idx ? Promise.resolve() : cargando || (cargando = fetch(base).then(r => r.json()).then(j => { idx = preparar(j); }).catch(() => { cargando = 0; est.textContent = 'No se pudo cargar el índice.'; }));
    }
    function opt(it, ks) {
      // la fila muestra título, descripción y fuente; no el dominio del sitio ni el tema
      var y = it.a ? it.a + (it.b && it.b != it.a ? ' a ' + it.b : '') : '';
      var m = [it.t == 'sitio' || it.t == 'pagina' || it.t == 'tema' ? '' : it.s, y].filter(Boolean).join(' · ');
      return '<a class="bq__o" role="option" id="bq-o' + (nodos.length) + '" href="' + esc(U(it.u)) + '" tabindex="-1">' + svg(it.t) + '<span class="bq__c"><span class="bq__t">' + hl(it.n, ks) + '</span>' + (it.d ? '<span class="bq__d">' + esc(it.d) + '</span>' : '') + (m ? '<span class="bq__m">' + esc(m) + '</span>' : '') + '</span></a>';
    }
    function bot(cls, ic, txt, attr) { return '<button type="button" role="option" id="bq-o' + nodos.length + '" tabindex="-1" class="bq__o ' + cls + '" ' + attr + '>' + svg(ic) + '<span class="bq__t">' + txt + '</span></button>'; }
    function pintar() {
      var q = inp.value.trim(), h = '', r;
      nodos = []; act = -1; inp.removeAttribute('aria-activedescendant');
      var enc = function (tit, id) { return '<div class="bq__g" role="presentation"' + (id ? ' id="' + id + '"' : '') + '>' + tit + '</div>'; };  // el listbox solo admite opciones y grupos
      var sug = function (tit) {
        var s = enc(tit);
        SUG.forEach(function (t) { s += bot('bq__sug', 'lupa', esc(t), 'data-q="' + esc(t) + '"'); nodos.push(1); });
        return s;
      };
      if (q.length < MIN || !idx) {
        h = sug('Prueba con');
        h += enc('Temas');
        if (idx) idx.doms.forEach(function (d) { if (d.u) { h += '<a class="bq__o" role="option" id="bq-o' + nodos.length + '" href="' + esc(U(d.u)) + '" tabindex="-1">' + svg(0, d.p) + '<span class="bq__t">' + esc(d.e) + '</span></a>'; nodos.push(1); } });
        est.textContent = q.length >= MIN ? 'Cargando el índice' : '';
      } else {
        r = buscar(idx, q);
        if (r.vacio) {
          est.textContent = 'Sin resultados para «' + q + '».';
          h = '<p class="bq__vacio">No encontramos «' + esc(q) + '». Prueba con menos palabras.</p>' + sug('Prueba con') + bot('', 'dataset', 'Buscar «' + esc(q) + '» en el catálogo completo', 'data-u="https://datos.cochid.cl/catalogo?q=' + encodeURIComponent(q) + '"');
          nodos.push(1);
        } else {
          var f = r.parcial && r.faltan.length ? r.faltan.join(' ') : '';  // sin palabras faltantes no hay aviso
          est.textContent = r.total + (r.total == 1 ? ' resultado' : ' resultados') + (f ? '. Sin coincidencias para ' + f + '; se muestran las de las otras palabras.' : '.');
          if (f) h += '<p class="bq__aviso">Sin coincidencias para «' + esc(f) + '». Estos resultados coinciden con el resto de la búsqueda.</p>';
          r.grupos.forEach(function (g, gi) {
            var lim = open[g.t] || g.items.length <= 4 ? 99 : 3, id = 'bq-g' + gi;  // nunca se esconde un solo ítem
            h += '<div role="group" aria-labelledby="' + id + '">' + enc(g.etq + ' <span>' + g.items.length + '</span>', id);
            g.items.slice(0, lim).forEach(function (it) { h += opt(it, r.terminos); nodos.push(1); });
            if (g.items.length > lim) { h += bot('bq__mas', 'tema', 'Ver todos en ' + g.etq.toLowerCase() + ' (' + g.items.length + ')', 'data-mas="' + g.t + '"'); nodos.push(1); }
            h += '</div>';
          });
        }
      }
      lista.innerHTML = h;
      nodos = [].slice.call(lista.querySelectorAll('[role=option]'));
      inp.setAttribute('aria-expanded', String(nodos.length > 0));
      lista.scrollTop = 0;
    }
    function marca(i) {
      if (!nodos.length) return;
      if (nodos[act]) nodos[act].removeAttribute('aria-selected'), nodos[act].classList.remove('on');
      act = (i + nodos.length) % nodos.length;
      var n = nodos[act]; n.setAttribute('aria-selected', 'true'); n.classList.add('on');
      inp.setAttribute('aria-activedescendant', n.id); act ? n.scrollIntoView({ block: 'nearest' }) : lista.scrollTop = 0;
    }
    function activar(n, ev) {
      if (!n) { if (nodos[0] && inp.value.trim().length >= MIN) n = nodos[0]; else return; }
      if (n.dataset.q) { inp.value = n.dataset.q; pintar(); inp.focus(); return; }
      if (n.dataset.mas) { open[n.dataset.mas] = 1; pintar(); return; }
      var u = n.dataset.u || n.getAttribute('href');
      if (ev && (ev.ctrlKey || ev.metaKey)) window.open(u, '_blank', 'noopener'); else location.href = u;
    }
    // con el diálogo abierto, el resto de la página queda inerte para el teclado y los lectores de pantalla
    function aislar(on) {
      [].forEach.call(D.body.children, function (el) { if (el !== root) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } });
    }
    function abrir() {
      if (abierto) return;
      abierto = true; prev = D.activeElement; root.hidden = false; D.documentElement.classList.add('bq-lock'); aislar(true);
      inp.focus(); pintar(); cargar().then(function () { if (abierto) pintar(); });
    }
    function cerrar() {
      if (!abierto) return;
      abierto = false; root.hidden = true; D.documentElement.classList.remove('bq-lock'); aislar(false);
      if (prev && prev.focus) prev.focus();
    }
    inp.addEventListener('input', function () { open = {}; pintar(); });
    root.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k == 'ArrowDown') { e.preventDefault(); marca(act + 1); }
      else if (k == 'ArrowUp') { e.preventDefault(); marca(act < 0 ? -1 : act - 1); }
      else if (k == 'Enter' && e.target == inp) { e.preventDefault(); activar(nodos[act], e); }
      else if (k == 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(); }  // un solo Escape cierra solo el buscador, no el menú que haya detrás
      else if (k == 'Tab') { e.preventDefault(); (e.target == inp ? x : inp).focus(); }
    });
    lista.addEventListener('click', function (e) { var n = e.target.closest('[role=option]'); if (n && !(n.tagName == 'A')) { e.preventDefault(); activar(n, e); } });
    lista.addEventListener('mousemove', function (e) { var n = e.target.closest('[role=option]'); if (n && nodos.indexOf(n) != act) marca(nodos.indexOf(n)); });
    lista.addEventListener('mousedown', function (e) { e.preventDefault(); });
    root.addEventListener('mousedown', function (e) { if (e.target == root) cerrar(); });
    x.addEventListener('click', cerrar);
    D.addEventListener('keydown', function (e) {
      var t = e.target, tipea = t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
      if ((e.key == 'k' || e.key == 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); abierto ? cerrar() : abrir(); }
      else if (e.key == '/' && !tipea && !abierto && !e.ctrlKey && !e.metaKey) { e.preventDefault(); abrir(); }
    });
    D.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('[data-buscar-abrir]'); if (a) { e.preventDefault(); abrir(); } });
    D.addEventListener('pointerover', function (e) { if (e.target.closest && e.target.closest('[data-buscar-abrir]')) cargar(); });
    return { abrir: abrir, cerrar: cerrar, cargar: cargar };
  }
  core.auto = function (o) { if (!core.ui) core.ui = montar(o || {}); return core.ui; };
  return core;
});
(function(){
  var host=location.hostname,path=location.pathname;
  var id=host==='datos.cochid.cl'?'datos':host==='mapas.cochid.cl'?'mapas':
    path.indexOf('/sobre-nosotros')===0?'sobre':path.indexOf('/investigaciones')===0?'investigaciones':
    path.indexOf('/blog')===0?'blog':path.indexOf('/contacto')===0?'contacto':location.hash==='#proyectos'?'proyectos':'';
  if(id)document.querySelectorAll('[data-nav-id="'+id+'"]').forEach(function(a){a.setAttribute('aria-current','page')});
})();

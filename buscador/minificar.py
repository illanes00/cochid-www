#!/usr/bin/env python3
"""Reduce buscador.js a buscador.min.js sin dependencias: quita comentarios de línea completa,
comentarios finales marcados con '  // ' (dos espacios) y la sangría. No toca cadenas ni cambia saltos de línea."""
import re, os
aqui = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(aqui, 'buscador.js'), encoding='utf-8').read()
src = re.sub(r'/\*(?!!).*?\*/', '', src, flags=re.S)
out = []
for l in src.split('\n'):
    t = l.strip()
    if not t or t.startswith('//'):
        continue
    t = re.sub(r'\s{2}//\s.*$', '', t)
    out.append(t)
open(os.path.join(aqui, 'buscador.min.js'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')

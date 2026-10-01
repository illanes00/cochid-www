# Desviaciones del kit

```yaml
- sitio: cochid.cl
  repo: cochid/cochid-www
  regla: kit
  que: >-
    index.html y cambio-de-hora/story.css conservan la composición editorial
    de la portada por tres tareas, tarjetas y disclosures nativos, y la
    visualización accesible del especial Cambio de hora. La portada utiliza
    los tokens publicados y no redefine clases gr-* del chrome.
  por_que: >-
    La composición editorial y la visualización del especial son funcionales
    al contenido; Style v10 aporta tokens, tipografía, tema y chrome mediante
    SRI. La fuente y la release servida no cargan fuentes externas ni contienen
    gradientes, desenfoque de fondo, sombras de elevación, transiciones globales,
    escalado en hover o colores Tailwind prohibidos por H28.
  quien: martin
  fecha: 2026-09-09
  revisar_en: 2026-12-01
  estado: justificada
```

```yaml
- sitio: cochid.cl/concepciones/
  repo: cochid/cochid-www
  regla: H29
  que: >-
    concepciones/story.css declara una capa propia sobre el kit v10 con trece
    tokens de dato (--conc, --conc-banda, --conc-suave, --parto, --parto-banda,
    --parto-crudo, --bloque, --empate, --variante, --verdad, --rayado, --nulo,
    --eje) y una escala divergente de ocho pasos (--div-b4 a --div-a4),
    declarados para tema claro y oscuro, más la composición de figura, leyenda,
    párrafo de lectura y tablas equivalentes.
  por_que: >-
    La paleta codifica el lado del dato, concepción contra parto, que es la
    distinción sobre la que descansa toda la página: no es chrome ni decoración
    y no puede salir del acento de marca, que es uno solo. La escala divergente
    del calendario necesita ocho pasos ordenados por luminancia, que el kit no
    provee. El resto del chrome, tipografía, tema, logos y pie sale del kit v10
    por digest con SRI. La capa no usa gradientes, desenfoque, sombras de
    elevación, transiciones sobre 200 ms, escalado en hover ni hexadecimales de
    Tailwind, y no carga fuentes externas.
  quien: martin
  fecha: 2026-09-19
  revisar_en: 2026-12-01
  estado: justificada
```

Verificado contra el commit `4276d21` y la release efectivamente servida por
`cochid.cl` el 9 de septiembre de 2026.

La entrada de `/concepciones/` está pendiente de replicar en el registro
central `cis/cis-style/registry/desviaciones.yaml`, que vive en otro repositorio.

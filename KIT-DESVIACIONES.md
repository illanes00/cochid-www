# Desviaciones del kit

```yaml
- sitio: cochid.cl
  repo: cochid/cochid-www
  regla: kit
  que: >-
    index.html y cambio-de-hora/story.css conservan CSS e inline CSS propios
    para la composición del hub institucional, tarjetas del catálogo y la
    visualización accesible del especial Cambio de hora.
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

Verificado contra el commit `4276d21` y la release efectivamente servida por
`cochid.cl` el 9 de septiembre de 2026.

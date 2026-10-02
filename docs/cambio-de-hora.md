# El reloj y el Sol

Especial de Compañía Chilena de Inteligencia de Datos basado en la conversación compartida por Martín:
https://chatgpt.com/share/6a9edcbe-8554-83e9-9fa9-24c342f9b617

## Alcance y argumento

Santiago 2026, horario vigente frente a UTC−4 fijo. La crítica prioriza luz
para comenzar la mañana: el adelanto posterga el amanecer una hora cuando
la primavera ya retrasa la puesta. El texto reconoce la preferencia por luz
al salir del trabajo y no infiere efectos netos sanitarios ni económicos.

Se conservan las decisiones del prototipo: fondo claro, promedios mensuales,
misma escala 00:00–24:00 en ambos calendarios, extremos salida/puesta,
línea de 12:00, duración mensual y variación, conteo de meses con la hora en
el eje vertical y gráfico adicional de salida/puesta. La edición añade
recorrido diario animado, crepúsculo civil, rutina, tablas y exportaciones.

## Reproducibilidad

`cambio-de-hora/solar.mjs` reproduce las ecuaciones simplificadas publicadas
por NOAA, con año fraccional al mediodía y cenit 90,833° para salida/puesta;
96° para crepúsculo civil. Coordenadas −33,4489°, −70,6693° y horizonte plano.
No son observaciones meteorológicas ni incorporan relieve.

El calendario civil de 2026 está fijado explícitamente; no depende del huso
del dispositivo. UTC−4 desde el amanecer del 5 de abril al 5 de septiembre;
UTC−3 durante el resto de 2026. SHOA/DIRECTEMAR y el decreto 224 de 2022
están enlazados en el especial. La página no generaliza a otras regiones.

La validación independiente del 6 septiembre usa 07:53 y 19:28 de
https://www.timeanddate.com/astronomy/chile/santiago (consultado 7 septiembre
2026). El modelo entrega 07:55 y 19:27; ambas diferencias quedan dentro de
3 minutos. No atribuir la precisión del algoritmo Meeus completo de NOAA a
esta aproximación de año fraccional. Las fechas de extremos solares pueden
diferir ligeramente de las efemérides exactas.

Los promedios son aritméticos de todos los días de cada mes; abril y
septiembre combinan husos. La variación mensual es último día menos primer
día del mismo mes, no diferencia entre promedios de meses consecutivos.
Los conteos de meses comparan el punto medio de la hora con intervalos
mensuales promedio: no son frecuencias diarias ni probabilidades.

El control de rutina cuenta días con salida posterior a la hora elegida.
Las cifras pueden variar cerca del umbral por el error del modelo. Antes
del amanecer puede existir crepúsculo: el indicador no mide oscuridad total.

## Operación

[Deploy y rollback](DEPLOY.md). La release pública incluye sólo los archivos
exportados, el manifiesto y los hashes. No publica la conversación descargada,
transcripts, herramientas de QA ni información operativa privada.

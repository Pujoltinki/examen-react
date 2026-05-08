# Dashboard Ejecutivo B2B SaaS

## Decisiones técnicas

El proyecto fue desarrollado con React + TypeScript, siguiendo el stack solicitado. La decisión principal fue organizar la solución de forma simple y clara, separando la definición de tipos, las funciones de cálculo y la interfaz principal. Esto permitió trabajar de mejor manera con el archivo `metrics.json`, que fue entregado como fuente de datos base para el examen.

El archivo `metrics.json` se ubicó en la carpeta `public` para poder cargarlo correctamente desde la aplicación, tanto en desarrollo local como en la versión publicada. La app consume ese único archivo y permite navegar entre los conjuntos de datos A, B, C y D, evitando que la solución funcione solamente con el primer dataset.

La interfaz fue pensada como un reporte ejecutivo, no como una tabla completa de métricas. El objetivo fue que el jefe de ventas pueda abrir la página y entender rápidamente dónde poner foco. Por eso se priorizaron tarjetas KPI, comparación contra el período anterior, embudo comercial, gráficos de tendencia, tiempo de respuesta, soporte y un bloque de prioridades.

También se consideró el campo `direction` incluido en la metadata, ya que algunas métricas son mejores cuando suben y otras cuando bajan. Con eso la aplicación puede indicar si un resultado mejora, empeora o se mantiene estable según el comportamiento esperado de cada métrica. Además, se manejaron valores `null` para evitar errores en métricas que no siempre tienen datos disponibles.

Se agregó un selector de períodos de 7, 30 y 90 días para facilitar distintos niveles de análisis. Como mejora adicional, y aprovechando que el desarrollo quedó dentro del tiempo disponible, se incorporó un selector de idioma Español/Inglés. Esta decisión se tomó para evitar mezclar términos en la interfaz y hacer que el dashboard sea más claro para distintos usuarios.

## Segunda iteración

Para una segunda iteración dejaría mejoras orientadas a mayor profundidad de análisis y a una mejor organización del código. Primero, separaría la aplicación en más componentes reutilizables, por ejemplo tarjetas KPI, panel de prioridades, gráficos, controles y resumen ejecutivo. Esto permitiría que el proyecto quede más ordenado y sea más fácil de mantener.

También agregaría una vista de detalle por métrica, donde el usuario pueda seleccionar un indicador específico y revisar su evolución con más información. La versión actual está pensada para una lectura ejecutiva rápida, pero una vista de detalle ayudaría a investigar mejor la causa de cada alerta.

Otra mejora sería permitir filtros por fechas personalizadas, además de los períodos fijos de 7, 30 y 90 días. Esto daría mayor flexibilidad para analizar semanas, meses o rangos concretos según la necesidad del jefe de ventas.

Finalmente, agregaría una tabla resumen descargable o exportable, junto con una explicación más detallada de las alertas generadas. Esto permitiría usar el dashboard no solo como visualización diaria, sino también como apoyo para reuniones o seguimiento comercial.
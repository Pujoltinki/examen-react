# Dashboard Ejecutivo B2B SaaS

## Decisiones técnicas

El proyecto fue desarrollado con React + TypeScript, siguiendo el stack solicitado. Como el enunciado indicaba que no existía una única solución correcta, la decisión principal fue construir la aplicación como un reporte ejecutivo y no como una tabla completa de datos. Esto se decidió porque el contexto de uso era un jefe de ventas que tiene pocos minutos antes de una reunión y necesita entender rápidamente dónde poner foco.

El archivo `metrics.json` fue usado como fuente única de datos entregada para el examen. La aplicación permite navegar entre los conjuntos A, B, C y D, ya que todos comparten estructura, pero tienen comportamientos distintos. Por eso los cálculos y gráficos no quedaron fijos a un solo dataset, sino que se actualizan según el conjunto seleccionado.

La interfaz se organizó en tres niveles de lectura. Primero, un resumen rápido con el conjunto activo, período analizado y rango de fechas. Segundo, tarjetas KPI con indicadores relevantes para ventas y soporte. Tercero, gráficos y embudo comercial para revisar tendencias y conversiones. Esta estructura busca que el usuario pueda entender primero lo urgente y después revisar más detalle si lo necesita.

También se incorporó una sección de prioridades de hoy. Esta fue una decisión de diseño importante, porque el objetivo no era solo mostrar métricas, sino ayudar al jefe de ventas a interpretar la información. Por eso la aplicación genera mensajes de foco cuando detecta señales como aumento del tiempo de respuesta, baja en la tasa de cierre, crecimiento de oportunidades estancadas o problemas en soporte.

Para interpretar correctamente los indicadores se utilizó el campo `direction` incluido en la metadata. Esto permite diferenciar métricas donde subir es positivo, como prospectos creados u oportunidades ganadas, de métricas donde subir es negativo, como tiempo de respuesta, oportunidades estancadas o tiempo de resolución de soporte. Además, se consideraron valores `null` para evitar errores en cálculos de promedios o métricas sin datos disponibles.

Se agregó selección de períodos de 7, 30 y 90 días para entregar una lectura rápida según el nivel de análisis requerido. Como mejora adicional, y aprovechando que el desarrollo quedó dentro del tiempo disponible, se incorporó un selector de idioma Español/Inglés. Esta decisión se tomó para evitar mezclar términos en la interfaz y hacer que el dashboard sea más claro para distintos usuarios.

## Segunda iteración

Para una segunda iteración dejaría mejoras orientadas a mayor profundidad de análisis y mejor mantenimiento del código. Primero, separaría la aplicación en más componentes reutilizables, por ejemplo tarjetas KPI, panel de prioridades, gráficos, controles y resumen ejecutivo. Esto permitiría que el proyecto quede más ordenado y sea más fácil de modificar.

También agregaría una vista de detalle por métrica, donde el usuario pueda seleccionar un indicador específico y revisar su evolución con mayor profundidad. La versión actual prioriza una lectura ejecutiva rápida, pero una vista de detalle ayudaría a investigar mejor la causa de cada alerta.

Otra mejora sería permitir filtros por fechas personalizadas, además de los períodos fijos de 7, 30 y 90 días. Esto daría mayor flexibilidad para analizar semanas, meses o rangos concretos según la necesidad del jefe de ventas.

Finalmente, agregaría una tabla resumen descargable o exportable, junto con una explicación más detallada de las alertas generadas. Esto permitiría usar el dashboard no solo como visualización diaria, sino también como apoyo para reuniones o seguimiento comercial.
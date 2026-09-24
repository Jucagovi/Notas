Se ha completado la refactorización e implementación integral del espacio de Temporización de Unidades de Trabajo de un módulo conforme al caso de uso 19, el esquema en ESQUEMA.sql y las convenciones del proyecto.
──────
### 1. Reorganización Estricta de Secciones en Pantalla

Siguiendo el orden exacto solicitado:
1. **Filtros de Cabecera y Barra de Acciones (`FiltrosTemporizacion.jsx`)**:
   - Fila superior: Selectores con ancho contenido (`Dropdown` de Año Académico con nombre completo tipo `2026/2027` y `SelectorClase` filtrado por dicho año).
   - Fila inferior: Botones estándar alineados a la derecha: `Propuesta` (asistente automático), `Actualizar`, `Restablecer` (orden curricular) y el nuevo botón `Borrar Temporización` (con confirmación modal para limpiar la planificación por completo).
2. **Resumen de Seguimiento (`ResumenTemporizacion.jsx`)**:
   - Tarjetas KPI con total de UTs, pendientes, en curso y completadas, más la barra de progreso global.
3. **Calendario Escolar Anual de 12 Meses (`SeccionCalendarioTemporizacion.jsx`)**:
   - Cuadrícula de septiembre a agosto con días lectivos y festivos escolares.
   - Si no existe temporización (o tras pulsar Borrar), se presenta sin fechas marcadas y con aviso orientativo.
   - Permite seleccionar cualquier UT y ajustar fechas mediante arrastre con ratón, clics en días o micro-ajustes (+/- 1 día), propagando los cambios en vivo al resto de la pantalla.
4. **Diagrama de Gantt del Curso Escolar (`DiagramaGanttTemporizacion.jsx`)**:
   - Cronograma visual organizado por columnas mensuales que posiciona las barras de las unidades planificadas con tooltips explicativos.
5. **Listado de Unidades de Trabajo de Planificación (`TablaTemporizacion.jsx`)**:
   - Exclusivamente dedicado a la planificación prevista (`fecha_ini_prevista` y `fecha_fin_prevista`), excluyendo la introducción de datos reales.
   - Formato estandarizado con ceros a la izquierda (`UT01`, `UT02`...).
   - Reordenación nativa por arrastre (`RowReorder`) y botón modal de observaciones por unidad.

──────
### 2. Sincronización e Interconexión Reactiva en Tiempo Real

- Todas las secciones se alimentan del estado centralizado de `useTemporizacion.js`.
- El callback `onCambioEnVivo` del calendario escolar interactivo actualiza instantáneamente las fechas en la tabla de UTs y en las barras del Diagrama de Gantt conforme el usuario arrastra o ajusta días, sin necesidad de recargar la página.

──────
### 3. Borrado Completo y Persistencia Segura

- El hook `useTemporizacion.js` incorpora la función `borrarTemporizacionCompleta()`, la cual reinicia las fechas previstas y reales a `null` y el estado a `'Pendiente'` en la base de datos a través de `useDatos.actualizar`, reflejando el vaciado de forma optimista en la UI.
- La acción está protegida por un diálogo de confirmación `confirmarBorrado` para evitar eliminaciones accidentales.
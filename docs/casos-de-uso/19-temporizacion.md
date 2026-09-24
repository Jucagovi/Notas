# Caso de uso 19: Temporización y Seguimiento de Unidades de Trabajo

## 1. Objetivo

Implementar un sistema interactivo para planificar y hacer el seguimiento temporal de las Unidades de Trabajo (UT) de un módulo durante una clase en el año académico correspondiente. El sistema permitirá al docente comparar la planificación prevista con la ejecución real, alterar el orden de impartición e introducir variaciones específicas para ese año (como nombres alternativos).

## 2. Interfaz de Usuario y Navegación (UI/UX)

* **Posición en Menú Principal:** crear un submenú denominado `Temporización`, que conducirá a la página `src/pages/planificacion/TemporizacionPagina.jsx`.
* **Organización y Orden Estricto de las Secciones en Pantalla:**
  1. **Filtros de Cabecera y Acciones (`FiltrosTemporizacion.jsx`):**
     * Fila superior de selectores con dimensiones contenidas:
       * **Selector de Año Académico:** `Dropdown` con el listado de años mostrando su denominación completa (ej. `2026/2027`).
       * **Selector de Clase:** `SelectorClase` que filtra exclusivamente las clases del año lectivo seleccionado.
     * Fila inferior con botones compactos alineados a la derecha:
       * **Propuesta:** Despliega el asistente modal de cálculo de fechas previsto según peso de los RAs.
       * **Actualizar:** Refresca los datos desde la base de datos.
       * **Restablecer:** Reordena la secuencia a la numeración curricular oficial (1, 2, 3...).
       * **Borrar Temporización:** Botón destructivo con modal de confirmación para limpiar íntegramente las fechas planificadas de la clase.
  2. **Resumen de Seguimiento (`ResumenTemporizacion.jsx`):**
     * Indicadores KPI de unidades totales, pendientes, en curso y completadas, junto con la barra de progreso de impartición.
  3. **Calendario Escolar Anual de Temporización Actual (`SeccionCalendarioTemporizacion.jsx`):**
     * Cuadrícula de 12 meses (septiembre a agosto) que muestra la distribución vigente de las unidades.
     * Si no existe temporización planificada (o tras ser borrada), se presenta el calendario limpio sin días marcados.
     * Permite la edición interactiva activando unidades y arrastrando o haciendo clic sobre días lectivos, con botones de ajuste fino (+/- 1 día).
     * Los cambios en vivo se propagan de inmediato al resto de secciones sin recargar la página.
  4. **Diagrama de Gantt del Curso Escolar (`DiagramaGanttTemporizacion.jsx`):**
     * Eje cronológico dividido en columnas mensuales que dibuja las barras proporcionales de cada unidad formativa, tooltips informativos y leyendas de apoyo.
  5. **Listado de Unidades de Trabajo de Planificación (`TablaTemporizacion.jsx`):**
     * Sección estrictamente dedicada a la planificación: únicamente expone las columnas de fechas previstas (`fecha_ini_prevista` y `fecha_fin_prevista`), excluyendo la introducción de fechas reales.
     * Las unidades de trabajo se formatean con cero a la izquierda para números menores de 10 (`UT01`, `UT02`, etc.).
     * Soporte de reordenación nativa `RowReorder`, selectores `Calendar` y botón de notas para abrir el diálogo modal de observaciones.

## 3. Modelo de Datos y Reglas de Negocio

* La tabla `Unidades_Trabajo` almacena el currículo base (`id_ut`, `numero`, `nombre`).
* La tabla `Temporizacion` registra la instancia temporal vinculando el `id_ut` con el `id_curso` (que representa la clase en la base de datos).
* **Sincronización:** Cuando el usuario reordene las filas mediante el *Drag & Drop* nativo de la tabla, el frontend debe recalcular el campo `orden` de todas las filas afectadas y enviar un `UPSERT` masivo o múltiples actualizaciones a la tabla `Temporizacion`.
* **Independencia de Edición:** La reordenación de filas no inhabilita ni bloquea los componentes `DatePicker` de selección de fechas.
* **Borrado Completo de Temporización:** Permite reiniciar la planificación de la clase estableciendo a `null` las fechas previstas y reales y volviendo el estado a 'Pendiente'.
* **Interconexión Reactiva:** Modificar o ajustar las fechas desde el calendario interactivo actualiza instantáneamente el Diagrama de Gantt y el listado de unidades en pantalla antes de guardar.

## 4. Obtención de Datos y Arquitectura

* **Custom Hooks:** La lógica de estado y llamadas a la API se aislará en Custom Hooks especializados:
  * `src/hooks/useAniosAcademicos.js` para consultar y formatear los años académicos completos desde Supabase.
  * `src/hooks/useClases.js` para estructurar y filtrar las clases según el año lectivo seleccionado.
  * `src/hooks/useTemporizacion.js` para orquestar la obtención, cálculo de estadísticas, mutaciones de las unidades temporizadas, reseteo completo y aplicación en bloque de propuestas.
  * `src/hooks/usePropuestaTemporizacion.js` para calcular la distribución de días lectivos y rangos de fechas a partir del horario, calendario y pesos de los RAs.
  * `src/hooks/useCalendarioEscolar.js` para obtener los días lectivos, días festivos y períodos oficiales de docencia de la clase.
* **Acceso a Datos:** Estos hooks consumirán el hook genérico `useDatos` para asegurar que las peticiones a Supabase pasen por la capa segura de la arquitectura.
* **Manejo de Errores Estricto:** Si falla la actualización de fechas, orden o estado, la función no debe usar un bloque `try/catch` vacío o silencioso. Debe devolver o propagar un objeto estructurado (`{ error: "Mensaje", status: 400 }`) para que la interfaz lance el `Toast` correspondiente.
* **Componentización y Estilo:**
  * El componente visual principal se nombrará `GestorTemporizacion.jsx` (formato *PascalCase*) y su `export default` se colocará en la última línea del archivo.
  * Los subcomponentes modulares se organizan en `src/components/temporizacion/`:
    * `FiltrosTemporizacion.jsx`: Selectores de año y clase en fila superior, y fila inferior con botones de acción alineados a la derecha.
    * `ResumenTemporizacion.jsx`: Tarjetas de resumen y métricas de avance de la clase.
    * `SeccionCalendarioTemporizacion.jsx`: Calendario escolar anual integrado en la página para edición visual directa y reactiva.
    * `DiagramaGanttTemporizacion.jsx`: Gráfico de Gantt cronológico a lo largo del curso escolar.
    * `TablaTemporizacion.jsx`: Tabla de planificación de fechas previstas con formateo `UT01` y botón de observaciones.
    * `CeldaFechaTemporizacion.jsx`: Selector de fechas con `Calendar` sin recortes de ancho ni deshabilitaciones espurias.
    * `DialogoObservaciones.jsx`: Modal con `InputTextarea` para visualización y edición rápida de notas docentes.
    * `DialogoTemporizacion.jsx`: Modal de edición detallada de la planificación de la unidad.
    * `DialogoPropuestaTemporizacion.jsx`: Modal de previsualización y edición interactiva de la propuesta asistida.
    * `CalendarioPropuesta.jsx`: Cuadrícula anual de 12 meses con selección cromática, interacción por clic/arrastre y tooltips.
    * `gestorPropuestaFechas.js`: Módulo de funciones puras para la partición matemática, desplazamiento de fronteras y ajuste continuo de días.
  * El código incluirá comentarios redactados en forma impersonal (ej. "Se actualizan las fechas previstas de la clase.") terminados siempre en un punto.

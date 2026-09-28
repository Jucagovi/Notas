# Caso de uso 21: Agenda Visual Curricular (Calendario Interactivo)

## 1. Objetivo

Transformar los datos tabulares de la planificación didáctica en un calendario interactivo visual. Permite al docente organizar el curso, ajustar las fechas de las Unidades de Trabajo (UT) y tener una visión global de los hitos temporales mediante interacciones intuitivas de arrastrar y soltar (Drag & Drop).

## 2. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** En el menú principal izquierdo añadir la entrada principal `Agenda escolar` que conducirá a la página `src/pages/AgendaCurricularPagina.jsx`.
* **Cambio de enfoque:** los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los textos de este caso de uso.
* **Filtros Contextuales:** componentes `Dropdown` (PrimeReact) para elegir `Año académico` (obtenida de la tabla cursos y mostrada coo 2026/2027 para el año 2026) que filtrará los Cursos/Clases de ese año académico (la clase ya lleva asociado un módulo). El Dropdown de `Año académico` seleccionará el año más reciente por defecto; el de Curso/Clase esperará la acción del usuario que filtarrá los discentes del curso.
  * *Nota de ordenación:* El Dropdown de Cursos debe listar los registros ordenados del más reciente al más antiguo.
  * Solo se habilitará el siguiente Dropdown cuando el usuario seleccione un valor en el anterior.
* **Panel Principal (Calendario):**
  * Se integrará la librería oficial `@fullcalendar/react` junto con sus plugins `@fullcalendar/daygrid` y `@fullcalendar/interaction`.
  * **Renderizado de Eventos:** Cada registro de la tabla `Temporizacion` se dibujará como un bloque horizontal que abarca desde la `fecha_ini_prevista` hasta la `fecha_fin_prevista`.
  * **Codificación de Color:** Los eventos tendrán un color de fondo (`backgroundColor`) determinado por su `estado` (ej. Gris para 'Pendiente', Azul para 'En Curso', Verde para 'Completada').
* **Interacción (Drag & Resize):**
  * **Mover:** El docente puede arrastrar un bloque completo a otra semana.
  * **Extender/Reducir:** El docente puede arrastrar el borde derecho o izquierdo del bloque para alargar o acortar los días asignados a esa UT.
  * Al hacer clic en un evento, se abrirá un pop-up (OverlayPanel o Dialog) con el detalle de la Unidad y accesos directos a sus prácticas.

## 3. Lógica de Base de Datos y Sincronización

* **Conversión de Entidades:** El frontend debe transformar los registros de `Temporizacion` al formato de evento requerido por FullCalendar (`{ id, title, start, end, backgroundColor }`).
* **Mutaciones en Tiempo Real:** Las acciones del usuario (arrastrar o redimensionar) disparan eventos nativos de FullCalendar (`eventDrop`, `eventResize`). En los *callbacks* de estos eventos, se capturarán las nuevas fechas.

## 4. Obtención de Datos y Arquitectura

* **Custom Hook:** La lógica se aislará en `src/hooks/useAgendaEscolar.js`, utilizando `useDatos`.
* **Operaciones:**
  * `obtenerEventosCalendario(idCurso, idModulo)`: Extraerá los registros de `Temporizacion` y los mapeará.
  * `actualizarFechasUT(idTemporizacion, nuevaFechaIni, nuevaFechaFin)`: Se lanzará de forma transparente (en segundo plano) tras cada interacción del usuario en el calendario para hacer un `UPDATE` en la tabla `Temporizacion`.
* **Manejo de Errores:** Si la petición a Supabase falla tras mover un evento en el calendario, el Custom Hook debe devolver el error y la UI (React) revertirá visualmente el evento a su posición original para garantizar que lo que el usuario ve es exactamente lo que hay en la base de datos.

## 5. Widget en Panel de control

* Crea un Widget en el panel de control con estas características.
* Elimina la página de agenda escolar con todos sus archivos pero mantén el widget del panel de control operativo. La
  entrada del menú `Agenda escolar` redirige ahora a `Planificación` -> `CAlendario escolar`. Además, el widget que se
  queda debe mostrar los eventos contenidos en el `Calendario escolar` y debe permitir añadir entradas (copiando el
  sistema de `Calendario escolar`

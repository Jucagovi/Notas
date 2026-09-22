# 📆 Caso de uso 21: Agenda Visual Curricular (Calendario Interactivo)

## 1. Objetivo
Transformar los datos tabulares de la planificación didáctica en un calendario interactivo visual. Permite al docente organizar el curso, ajustar las fechas de las Unidades de Trabajo (UT) y tener una visión global de los hitos temporales mediante interacciones intuitivas de arrastrar y soltar (Drag & Drop).

## 2. Interfaz de Usuario y Flujo (UI/UX)
* **Navegación:** En el menú principal izquierdo, dentro de la sección `Planificación`, añadir la entrada `Calendario` que conducirá a la página `src/pages/AgendaCurricularPagina.jsx`.
* **Filtros (Header):** Componentes `Dropdown` de PrimeReact para seleccionar el Curso y el Módulo.
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
* **Custom Hook:** La lógica se aislará en `src/hooks/useAgendaCurricular.js`, utilizando `useDatos`.
* **Operaciones:** 
  * `obtenerEventosCalendario(idCurso, idModulo)`: Extraerá los registros de `Temporizacion` y los mapeará.
  * `actualizarFechasUT(idTemporizacion, nuevaFechaIni, nuevaFechaFin)`: Se lanzará de forma transparente (en segundo plano) tras cada interacción del usuario en el calendario para hacer un `UPDATE` en la tabla `Temporizacion`.
* **Manejo de Errores:** Si la petición a Supabase falla tras mover un evento en el calendario, el Custom Hook debe devolver el error y la UI (React) revertirá visualmente el evento a su posición original para garantizar que lo que el usuario ve es exactamente lo que hay en la base de datos.

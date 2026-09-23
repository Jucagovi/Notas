## 1. Objetivo

Establecer el Master Planner del curso académico. Este calendario global sirve como "fuente de la verdad" para el motor de temporización (marcando festivos y vacaciones) y como agenda visual rápida para el docente (exámenes, evaluaciones y anotaciones generales).

## 2. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** Entrada en el menú `Planificación` denominada `Calendario Escolar` (`src/pages/CalendarioPagina.jsx`).
* **Layout Principal:**
  * **Panel Superior:** Selectores de fecha para acotar el "Inicio de Curso" y "Fin de Curso".
  * **Calendario Interactivo:** Componente `@fullcalendar/react` que ocupa el resto de la pantalla.
* **Interacción Ágil (OverlayPanel):**
  * Al hacer clic en un día (o arrastrar un rango de días), **NO** se abrirá un modal completo. Se desplegará un `OverlayPanel` (popover ligero) flotando junto al cursor.
  * Este panel contendrá una paleta de botones circulares con los colores estandarizados y un campo de texto opcional para detalles.
  * **Colores y Tipos:**
    * Rojo: Festivo Nacional (No lectivo)
    * Amarillo: Festivo Local (No lectivo)
    * Azul: Vacaciones (No lectivo)
    * Verde Claro: Evaluación (Lectivo)
    * Naranja: Examen (Lectivo)
    * Morado: Anotación / Excursión (Lectivo)
* **Impresión del calendario:** existirá un botón para poder imprimir en PDF el calendario en una sola página con la leyenda incluida en la parte inferior de la página.

## 3. Obtención de Datos y Arquitectura

* **Eventos en el calendario:**: en el calendario se mostrarán los eventos entre dos fechas (septiembre año de inicio de la clase/curso y agosto del año siguiente.
* **Gestión Global:** Se creará un `useCalendario.js` para gestionar la tabla `Calendario_Eventos`. Esta tabla almacenará `fecha_inicio`, `fecha_fin`, `tipo_evento`, `descripcion` y un booleano crítico: `es_lectivo`.
* **Sinergia con la Temporización:** El motor matemático del Caso 15 consultará esta tabla, pero **solo** filtrará y se saltará los días donde `es_lectivo === false` (rojo, amarillo, azul). Los exámenes y evaluaciones seguirán contando como sesiones consumidas dentro de la planificación.
* **Helper para el color del día:** se creará una utilidad `src/utils/coloreCalendario.js` encargado de pintar el fondo del día en el calendario de un color en función del tipo de evento (`tipo_evento` en tabla `Calendario_Eventos`) y con las especificaciones especificadas en la sección `Colores y tipos` de este documento.

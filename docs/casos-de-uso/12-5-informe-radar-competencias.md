# Caso de uso 12.5: Mapa de Competencias Individual (Gráfico de Radar)

## 1. Objetivo

Visualizar el rendimiento competencial de un discente mediante un gráfico de radar. Esto permite al docente identificar de un solo vistazo las fortalezas y debilidades del alumno en los distintos Resultados de Aprendizaje (RA) de un módulo.

## 2. Interfaz de Usuario y Componentización (UI/UX)

- **Cambio de enfoque:** los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los textos de este caso de uso.
- **Filtros Contextuales:** componentes `Dropdown` (PrimeReact) para elegir `Año académico` (obtenida de la tabla cursos y mostrada coo 2026/2027 para el año 2026) que filtrará los Cursos/Clases de ese año académico (la clase ya lleva asociado un módulo). El Dropdown de `Año académico` seleccionará el año más reciente por defecto; el de Curso/Clase esperará la acción del usuario que filtarrá los discentes del curso.
  - *Nota de ordenación:* El Dropdown de Cursos debe listar los registros ordenados del más reciente al más antiguo.
  - Solo se habilitará el siguiente Dropdown cuando el usuario seleccione un valor en el anterior.
- **Nueva entrada en el menú:** Habilitar un submenú en la sección `Informes` con el nombre `Competencia individual` que conducirá a la página `src/pages/informes/InformeCompetencia.jsx`.
- **Componente Reutilizable (Panel Visual):** Se creará el componente aislado `src/components/GraficoRadarCompetencias.jsx` para poder incrustarlo tanto en esta página como en la Ficha Completa del Discente (Caso de Uso 07).
  - Renderizará un componente `Chart` de PrimeReact configurado con el tipo `radar`.
  - **Etiquetas (Eje perimetral):** Los nombres cortos o números de los RA del módulo.
  - **Valores (Área poligonal):** La nota media ponderada obtenida por el discente en cada RA (escala de 0 a 100).
- **Tabla de Respaldo:** Debajo del gráfico, se incluirá un `DataTable` con el desglose numérico exacto de la nota de cada RA.
  - El fondo o el texto de cada celda de nota debe colorearse obligatoriamente usando el helper `getColorNota(nota)` (`src/utils/coloresNota.js`).

## 3. Lógica de Datos y Arquitectura

- **Custom Hook y Abstracción:** Se eliminará cualquier referencia a `informesService.js`. En su lugar, se creará el hook `src/hooks/useRadarCompetencias.js` consumiendo `useDatos`.
- **Cálculo de la Nota del RA:**
  - La obtención de la nota real de un RA requiere cruzar las calificaciones del alumno (`evaluan`), la actividad evaluada (`Versiones`), el mapeo de esa actividad a los criterios (`trabajan`), los propios Criterios de Evaluación (`CE`) y su pertenencia al Resultado de Aprendizaje (`RA`).
  - *Estrategia de Rendimiento:* Se recomienda encarecidamente delegar este cruce complejo a una Función RPC (Remote Procedure Call) o una Vista (`VIEW`) en PostgreSQL/Supabase llamada `calcular_notas_ra_discente(id_discente, id_modulo)`, para que el frontend solo reciba los datos listos para pintar.

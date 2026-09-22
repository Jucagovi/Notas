# Caso de uso: mapa de competencias individual (Radar)

## 1. Objetivo

Visualizar el rendimiento competencial de un discente mediante un gráfico de radar. Esto permite identificar rápidamente las fortalezas y debilidades del alumno en los distintos Resultados de Aprendizaje (RA) de un módulo.

## 2. Interfaz de Usuario (UI)

- **Nueva entrada en el menú:** habilita una nueva entrada en el menú `Informes` en forma de submenú con el nombre `Competencia individual` que conducirá a la página `src/pages/informes/InformeCompetencia.jsx`. Debes crear esa paǵina.
- **Filtros de Contexto:** `Dropdown` para seleccionar Curso, Módulo y Discente. Sólo el <DropDown> de Cursos tendrá selección al inicio y será el curso más reciente. El resto de <DropDown> esperarán la intervención del usuario.
- **Panel Visual:**
  - Un gráfico `Chart` de PrimeReact configurado con el tipo `radar`.
  - **Etiquetas (Eje perimetral):** Los nombres o números de los RA del módulo.
  - **Valores (Área poligonal):** La nota media ponderada obtenida por el discente en cada RA (escala de 0 a 100).
- **Tabla de Respaldo:** Un `DataTable` debajo del gráfico con el desglose numérico exacto de la nota de cada RA.
  - El color de cada nota debe coincidir con la escala de colores centralizada en `src/utils/gradeColors.js`.
- Añade este gráfico al informe detallado del apartado `Discentes`.

## 3. Lógica de Datos y Servicios

- Añadir `getRadarCompetencias(moduloId, discenteId)` en `src/services/informesService.js`.
- El cálculo requiere cruzar las notas del alumno en la tabla `evaluan` con los porcentajes de la tabla `trabajan` para obtener la nota real de cada RA.

## Propuesta

# 🕸️ Caso de uso 12.5: Mapa de Competencias Individual (Gráfico de Radar)

## 1. Objetivo

Visualizar el rendimiento competencial de un discente mediante un gráfico de radar. Esto permite al docente identificar de un solo vistazo las fortalezas y debilidades del alumno en los distintos Resultados de Aprendizaje (RA) de un módulo.

## 2. Interfaz de Usuario y Componentización (UI/UX)

* **Nueva entrada en el menú:** Habilitar un submenú en la sección `Informes` con el nombre `Competencia individual` que conducirá a la página `src/pages/informes/InformeCompetencia.jsx`.
- **Filtros Contextuales:** Componentes `Dropdown` en cascada para seleccionar Curso -> Módulo -> Discente. Solo el Dropdown de Cursos tendrá una selección inicial (el curso más reciente).
- **Componente Reutilizable (Panel Visual):** Se creará el componente aislado `src/components/GraficoRadarCompetencias.jsx` para poder incrustarlo tanto en esta página como en la Ficha Completa del Discente (Caso de Uso 07).
  - Renderizará un componente `Chart` de PrimeReact configurado con el tipo `radar`.
  - **Etiquetas (Eje perimetral):** Los nombres cortos o números de los RA del módulo.
  - **Valores (Área poligonal):** La nota media ponderada obtenida por el discente en cada RA (escala de 0 a 100).
- **Tabla de Respaldo:** Debajo del gráfico, se incluirá un `DataTable` con el desglose numérico exacto de la nota de cada RA.
  - El fondo o el texto de cada celda de nota debe colorearse obligatoriamente usando el helper `getColorNota(nota)` (`src/utils/coloresNota.js`).

## 3. Lógica de Datos y Arquitectura

* **Custom Hook y Abstracción:** Se eliminará cualquier referencia a `informesService.js`. En su lugar, se creará el hook `src/hooks/useRadarCompetencias.js` consumiendo `useDatos`.
- **Cálculo de la Nota del RA:**
  - La obtención de la nota real de un RA requiere cruzar las calificaciones del alumno (`evaluan`), la actividad evaluada (`Versiones`), el mapeo de esa actividad a los criterios (`trabajan`), los propios Criterios de Evaluación (`CE`) y su pertenencia al Resultado de Aprendizaje (`RA`).
  - *Estrategia de Rendimiento:* Se recomienda encarecidamente delegar este cruce complejo a una Función RPC (Remote Procedure Call) o una Vista (`VIEW`) en PostgreSQL/Supabase llamada `calcular_notas_ra_discente(id_discente, id_modulo)`, para que el frontend solo reciba los datos listos para pintar.

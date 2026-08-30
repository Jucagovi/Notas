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

## 3. Lógica de Datos y Servicios

- Añadir `getRadarCompetencias(moduloId, discenteId)` en `src/services/informesService.js`.
- El cálculo requiere cruzar las notas del alumno en la tabla `evaluan` con los porcentajes de la tabla `trabajan` para obtener la nota real de cada RA.

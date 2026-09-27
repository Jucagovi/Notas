Se ha completado la adaptación del Caso de Uso 12.6: Mapa de Calor Curricular (Heatmap de Puntos Ciegos) para centrar la matriz exclusivamente en los **Resultados de Aprendizaje (RA)**, eliminando la opción y el código asociado a la vista por Criterios de Evaluación (CE) y retirando el conmutador de nivel de detalle.

A continuación se detallan los ajustes realizados paso a paso:

---

### 1. Eliminación del Selector de Nivel de Detalle

* En el componente [`FiltrosMapaCalor.jsx`](file:///media/jucagovi/ALMAC%C3%89N/000C%C3%B3digo/Git/Notas/src/components/mapacalor/FiltrosMapaCalor.jsx):
  * Se ha eliminado el componente `SelectButton`, sus opciones (`OPCIONES_NIVEL_DETALLE`) y los botones de conmutación.
  * La cabecera presenta ahora una distribución más limpia y directa: selector de **Año académico** (`Dropdown`), selector de **Clase** ([`SelectorClase`](file:///media/jucagovi/ALMAC%C3%89N/000C%C3%B3digo/Git/Notas/src/components/common/SelectorClase.jsx)) y el botón de recarga sincronizada.

---

### 2. Simplificación de Custom Hooks

1. **`useFiltrosMapaCalor.js`**:
   * Se ha suprimido el estado `nivelDetalle` y su manejador `setNivelDetalle`.
   * El hook se centra exclusivamente en orquestar el flujo jerárquico en cascada: Año Académico $\rightarrow$ Clase (ordenada del registro más reciente al más antiguo).

2. **`useMapaCalor.js`**:
   * Se ha retirado el parámetro `nivelDetalle` y la función auxiliar `formatearCodigoCortoCE`.
   * En el cálculo alternativo en cliente (`calcularMatrizEnCliente`) se ha eliminado la bifurcación condicional de Criterios de Evaluación, computando de forma limpia y directa la nota ponderada de cada Resultado de Aprendizaje a partir de los criterios evaluados en las actividades (`Versiones`, `trabajan` y `evaluan`).

---

### 3. Ajuste en Subcomponentes y Página Orquestadora

1. **`PanelAlertasMapaCalor.jsx`**:
   * Se han retirado los condicionales de nivel de detalle, mostrando métricas referenciadas de forma unívoca a los **Resultados de Aprendizaje (RAs)** del módulo formativo.

2. **`TablaMapaCalor.jsx`**:
   * Se ha retirado el prop `nivelDetalle`.
   * El título institucional de la matriz se fija en `Matriz del Mapa de Calor (Resultados de Aprendizaje)`.

3. **`InformeMapaCalor.jsx`**:
   * Se han desvinculado las referencias a `nivelDetalle` tanto en las llamadas a los hooks como en el paso de props a los subcomponentes.

---

### 4. Optimización de la Función RPC en PostgreSQL ([`obtener_matriz_calor.sql`](file:///media/jucagovi/ALMAC%C3%89N/000C%C3%B3digo/Git/Notas/docs/sql/obtener_matriz_calor.sql))

* Se ha simplificado la función `obtener_matriz_calor` eliminando la rama condicional de Criterios de Evaluación y manteniendo únicamente el cálculo de columnas y filas agrupadas por Resultado de Aprendizaje (`RA`), lo que agiliza la ejecución en base de datos.

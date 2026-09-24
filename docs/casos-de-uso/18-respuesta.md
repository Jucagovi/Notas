Se ha revisado e implementado la actualización del Caso de Uso 18: Gestor de Unidades de Trabajo y Asignación de Actividades, respetando las reglas de CONVENCIONES.md, el esquema de ESQUEMA.sql y el principio estricto de componentización.

──────
### 1. Resumen de los Cambios Realizados

1. **Tabla de Unidades de Trabajo (`TablaUnidadesTrabajo.jsx`):**
    • Se ha fusionado la información de `Nº` y `Nombre de la unidad` en una sola columna denominada **`Unidad de trabajo`**, que concatena ambos valores (por ejemplo, `UT01 Entorno de trabajo`).
    • Se ha eliminado la columna `descripción`.
    • El cómputo de actividades se muestra como texto plano numérico simple (sin componente `<Tag>` y omitiendo la palabra `actividades`, mostrando únicamente el valor numérico como `0`, `1`, `2`...).
    • Todas las UTs se inician colapsadas (`filasExpandidas = null`) y únicamente se despliegan si el usuario interactúa pulsando sobre el icono de expansión o sobre el título de la unidad. Al desplegarse, la segunda fila muestra las prácticas asignadas a dicha UT con el botón explícito `Desvincular práctica`.

2. **Tabla de Versiones de Prácticas (`TablaVersiones.jsx`):**
    • En la cabecera, se muestra el título **`Versiones de las prácticas`** en la primera fila.
    • En la segunda fila por debajo del título, los botones de filtrado (`Todas`, `Sin asignar`, `Asignadas`) se presentan separados entre sí mediante espaciado visual independiente (`gap-2`) para que respiren y no queden pegados, acompañados por el buscador textual.
    • El nombre de la versión (ej. `V1`, `V2`...) se muestra estrictamente como texto formateado, sin utilizar el componente `<Tag>`.
    • Para cada práctica, los botones de asignación a UT (`UT01`, `UT02`...) se disponen en una fila inferior a la del nombre de la práctica y su versión.
    • Comportamiento conmutador (toggle): al pulsar una vez sobre el número de una UT la práctica se asigna a esa unidad de trabajo; si se vuelve a pulsar sobre la misma UT en la que ya está asignada, se desasigna automáticamente.

3. **Simplificación de la Barra Superior de Filtros (`FiltrosCurriculo.jsx`):**
    • Se ha retirado por completo el indicador redundante de `Módulo asignado`, ya que la clase seleccionada mediante [`SelectorClase.jsx`](src/components/common/SelectorClase.jsx) ya contiene implícitamente dicha información y muestra las siglas y nombre del módulo en el propio desplegable.

4. **Garantía de Espacio y Contención Visual (`unidades.css`):**
    • Se han ajustado las dimensiones y reglas de desbordamiento en la cuadrícula de dos columnas (`curriculo-dos-columnas`, `curriculo-columna`) para asegurar que todas las columnas y sus contenidos se muestren estrictamente dentro del espacio delimitado de la tabla sin desbordamientos horizontales indebidos.

5. **Terminología de Clase y Custom Hooks:**
    • Se consolida el enfoque de `Clase` mediante [`useClases.js`](src/hooks/useClases.js) y [`useGestorCurriculo.js`](src/hooks/useGestorCurriculo.js), cumpliendo con todas las normas de arquitectura sin Context Hell y con tipografía monoespaciada para códigos `UT01`.

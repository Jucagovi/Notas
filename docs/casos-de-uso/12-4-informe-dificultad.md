# Caso de uso 12.4: Análisis de Dificultad (Histograma de Frecuencias)

## 1. Objetivo

Analizar la distribución de las calificaciones de una actividad específica (`Versiones`) para evaluar su nivel de dificultad y detectar posibles anomalías pedagógicas o exámenes desproporcionados mediante un histograma de frecuencias.

## 2. Interfaz de Usuario y Flujo (UI/UX)

- **Cambio de enfoque:** los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los textos de este caso de uso.
- **Nueva entrada en el menú:** Habilitar un submenú en la sección `Informes` con el nombre `Análisis dificultad` que conducirá a la página `src/pages/informes/InformeDificultad.jsx`.
- **Filtros Contextuales:** componentes `Dropdown` (PrimeReact) para elegir `Año académico` (obtenida de la tabla cursos y mostrada coo 2026/2027 para el año 2026) que filtrará los Cursos/Clases de ese año académico (la clase ya lleva asociado un módulo). El Dropdown de `Año académico` seleccionará el año más reciente por defecto; el de Curso/Clase esperará la acción del usuario.
  - *Nota de ordenación:* El Dropdown de Cursos debe listar los registros ordenados del más reciente al más antiguo.
  - Solo se habilitará el siguiente Dropdown cuando el usuario seleccione un valor en el anterior.
  - las prácticas aparecerán como tarjetas (sin mostrar el enunciado) debajo de los <DropDOwn>
  - Solo el Dropdown de Cursos tendrá una selección por defecto al iniciar la página (el curso más reciente); el resto esperará la intervención del usuario.
- **Panel de Resumen (Grid Superior):** Tres componentes `Card` de PrimeReact:
  1. **Nota Media:** Mostrando la media aritmética de todas las notas entregadas (en escala 0-100).
  2. **Tasa de Aprobados:** Porcentaje de discentes con nota $\ge 50$.
  3. **Diagnóstico Automático:** Texto dinámico basado en la media global (Ej. "Muy Fácil" si media > 80, "Adecuada" si 50-79.99, "Difícil" si < 50).
- **Visualización Central (Gráfico):**
  - Componente `Chart` de PrimeReact configurado en modo tipo barra (`bar`).
  - **Eje X (Rangos de Nota):** Segmentado en deciles basados en la escala 0-100: '0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90' y '91-100'.
  - **Eje Y:** Número absoluto de alumnos que se sitúan en cada rango.
  - **Uso de Colores:** El color de cada barra del histograma debe extraerse o coincidir con la escala cromática centralizada en `src/utils/coloresNota.js`.

## 3. Lógica de Datos y Agrupación (Frontend)

- El frontend procesará las calificaciones obtenidas de la tabla `evaluan` para la versión de la actividad seleccionada (excluyendo los valores nulos o alumnos sin entregar).
- La lógica de React se encargará de iterar sobre las notas y contarlas (agruparlas mediante *bins* o intervalos) para alimentar las series del gráfico.

## 4. Obtención de Datos y Arquitectura

- **Custom Hook:** La lógica se aislará en el hook `src/hooks/useInformeDificultad.js`, consumiendo `useDatos` en lugar de servicios directos.
- **Consulta a Supabase:** El hook expondrá una función `obtenerDistribucionNotas(idVersion)` que extraerá un array con los valores numéricos del campo `nota` de la tabla `evaluan` donde el `id_version` coincida.

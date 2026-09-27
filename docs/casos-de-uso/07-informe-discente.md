# Caso de uso 07: Ficha Completa e Informe del Discente

## 1. Objetivo

Mostrar un informe integral (360º) del rendimiento de un estudiante. Permite visualizar su progreso histórico desglosado por cursos, módulos y evaluaciones, con capacidad para auditar y modificar sus calificaciones al vuelo.

## 2. Flujo de Navegación y UI Base

- **Entrada en el menú:** en el menú principal existe una entrada `Discentes` en auq deberás implementar toda la lógica de este caso de uso,
- **Vista Principal (Directorio):** Un `DataTable` de PrimeReact con el listado de `Discentes` (con buscador integrado). Al hacer clic en una fila, se navega al detalle del alumno.
- **Cabecera de Detalle:** Mostrar un componente `Card` o panel superior con la `imagen` (Avatar), nombre, apellidos, NIA y estado, extraídos de la tabla `Discentes`.
- **Selector de Contexto:** Un `Dropdown` de PrimeReact para elegir el "Curso Académico" (imprescindible para visualizar el historial correctamente, especialmente en alumnos repetidores).

## 3. Desglose de Datos y Edición (Tabs)

- **Navegación por Módulos:** Usar el componente `TabView` de PrimeReact. Cada pestaña representará un registro de la tabla `Modulos` en el que el alumno esté matriculado (`imparte`) para el curso seleccionado.
- **Tabla de Evaluaciones:** Dentro de cada pestaña, un `DataTable` agrupado por `Evaluaciones` (Row Grouping). Mostrará las actividades (`Versiones`) y la `nota` obtenida (tabla `evaluan`).
- **Visualización de Notas y Colores (Regla estricta):**
  - Las celdas de nota deben colorearse dinámicamente usando el helper `getColorNota(nota)` (`src/utils/coloresNota.js`).
  - Si el registro en `evaluan` no existe o la nota es nula, renderizar el carácter `?` (alineado al centro, sin color).
- **Edición en línea (In-cell Editing):** El `DataTable` debe permitir edición en la propia celda. Al introducir una nota (0-100) y pulsar "Enter" o perder el foco, se actualiza la nota en la base de datos automáticamente (mediante un *upsert* en `evaluan`).

## 4. Visualización Gráfica (Charts)

Incluir dos gráficos interactivos (componente `Chart` de PrimeReact) en la parte inferior o lateral, alimentados por la escala cromática oficial:
- **Gráfico de Líneas:** Evolución temporal de las notas del alumno en las distintas `Versiones` del módulo seleccionado.
- **Gráfico Circular (Doughnut/Pie):** Agrupación del volumen de calificaciones por categorías estrictas: Suspensos (<50), Suficientes (50-59), Bien (60-69), Notables (70-89) y Sobresalientes (90-100). Los colores de los segmentos deben extraerse obligatoriamente de `getColorNota`.

## 5. Obtención de Datos y Arquitectura de Estados

- **Custom Hook:** No se crearán servicios aislados. Se creará el hook `src/hooks/useFichaDiscente.js` que consumirá a `useDatos`.
- **Consultas:** El hook expondrá una función `obtenerHistorialDiscente(idDiscente, idCurso)` que orqueste los cruces (`JOINs`) necesarios entre `imparte`, `evaluan`, `Versiones`, `Evaluaciones` y `Modulos`.
- **Actualización:** Expondrá la función `actualizarNotaFicha(idVersion, idEvaluacion, idDiscente, nota)` para gestionar el guardado desde la edición en línea, lanzando un `Toast` global para notificar el éxito o error de la operación.

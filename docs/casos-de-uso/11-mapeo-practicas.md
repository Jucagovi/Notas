# Caso de uso 11: mapeo Jerárquico de Actividades a Criterios (RA y CE)

## 1. Objetivo

Permitir al docente vincular rápidamente una actividad programada en la clase (tabla `Versiones`) a múltiples Criterios de Evaluación (CE) y definir qué porcentaje del CE se cubre. Esta interfaz optimiza la asignación masiva (ej. un examen trimestral que evalúa un Resultado de Aprendizaje completo).

## 2. Interfaz de Usuario (UI)

- **Cambio de enfoque:** los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los textos de este caso de uso.
- **Enrutamiento:** Reutilizar la entrada de submenú `Cobertura CE` (dentro de `Evaluación`) y redirigir a la página `CriteriosPagina.jsx`. Su contenido será reescrito por completo siguiendo este flujo.
- **Filtros Contextuales:** Componentes `Dropdown` (PrimeReact) dependientes para elegir año académico y Clase (usa el componente ya creado en src/components/common)(ya está vinculada a un módulo). Las versiones (filtradas por módulo) se mostrará como cartas sobre las que pulsar para activar su asignación.
- un componente `ProgressBar` (PrimeReact) grueso y destacado en la parte superior que muetre el grado de asignación de los CE.
- **Tabla Jerárquica:** Al seleccionar la actividad, se cargará un componente `TreeTable` de PrimeReact.
  - **Nodos Padre:** Resultados de Aprendizaje (RA).
  - **Nodos Hijo:** Criterios de Evaluación (CE).
  - **Columnas:**
    1. Nombre/Descripción del RA o CE del siguente modo `RA1 Selecciona...` en una sola línea y truncado si el texto supera el ancho de la columna (en tal cso se usa title para mostrar el texto completo a modo de tooltip). No debe contener un input de porcentaje ya que sólo se asignarán a los CE que lo componen.
    2. `Checkbox` de selección (ubicado a la izquierda del nombre).
    3. `InputNumber` para mostrar el "Porcentaje de Cobertura" (0-100). Estará ubicado a la derecha y solo se habilitará si el `Checkbox` de esa fila está marcado.
    4. `Slider` para establecer el "Porcentaje de Cobertura" (0-100) en el InputNumer anterior. Sólo se habilitará si el `Checkbox` de esa fila está marcado.

## 3. Lógica de Interacción y Negocio

- **Selección en Cascada (Cascading):**
  - Si el docente marca el `Checkbox` de un RA (nodo padre), el sistema debe seleccionar automáticamente todos sus CE (hijos) y establecer el campo porcentaje de todos ellos a 100 por defecto.
  - Si desmarca el padre, se desmarcan los hijos y se limpia su porcentaje.
- **Edición Global:** Si el usuario modifica manualmente el porcentaje de un CE debe informar del porcentaje total de ese CE (un CE puede estar cubierto por varias prácticas). Debe avisar al usuario de que el porcentaje global de ese CE no es 100%.
- **Guardado Transaccional:** Un botón destacado "Guardar Mapeo" en la parte superior de la tabla. Al pulsarlo, se enviará a la base de datos únicamente la información de los CE (hijos) que estén marcados y tengan un porcentaje válido.

## 4. Obtención de Datos y Arquitectura de Estados

* **Estructura de Datos (Tree):** PrimeReact exige que los datos del `TreeTable` tengan una estructura JSON anidada con propiedades específicas (`key`, `data`, `children`).
- **Custom Hook:** Se creará el hook `src/hooks/useMapeoCriterios.js` que consumirá a `useDatos`. Evitar totalmente la creación de un `criteriosService.js`.
- **Funciones del Hook:**
  - `obtenerArbolCriterios(idModulo)`: Extraerá los RA y CE de la base de datos y los formateará en el árbol jerárquico que necesita el componente.
  - `guardarMapeo(idVersion, selecciones)`: Ejecutará la transacción en la base de datos. Primero hará un `DELETE` en la tabla `trabajan` de todas las asignaciones anteriores para esa `id_version` específica, y acto seguido un `INSERT` masivo de las nuevas asignaciones (`id_ce`, `id_version`, `porcentaje`).
- **Feedback:** Mostrar un `Toast` informando del éxito del guardado.

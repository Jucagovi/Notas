# Caso de uso: Mapeo de prácticas a resultados de aprendizaje (RA y CE)

## 1. Objetivo

Permitir al profesor vincular rápidamente una Práctica a múltiples Criterios de Evaluación (CE) y definir qué porcentaje del CE se cubre, optimizando la asignación masiva (ej. un examen que cubre todo un RA).

## 2. Interfaz de Usuario (UI)

- **Entrada en el menú principal:** reutiliza la entrada de submenú `Asignación CE` y crea la página a la que conduce `CriteriosPagina.jsx` y elimina todo su contenido y crea uno nuevo siguiendo los siguientes pasos.
- **Selector Principal:** Un `Dropdown` (PrimeReact) para elegir la `Practica`. Al seleccionarla, se carga la estructura de RA y CE del módulo asociado.
- **Tabla Jerárquica:** Utilizar el componente `TreeTable` de PrimeReact.
  - **Nodos Padre:** Resultados de Aprendizaje (RA).
  - **Nodos Hijo:** Criterios de Evaluación (CE).
  - **Columnas:**
    1. Nombre/Descripción del RA o CE.
    2. `Checkbox` de selección a la izquierda del nombre.
    3. `InputNumber` para el Porcentaje (0-100). Solo habilitado si el Checkbox está marcado a la derecha del checkbox.

## 3. Lógica de Interacción

- **Selección en Cascada:** Si el usuario marca el `Checkbox` de un RA (nodo padre), se deben seleccionar automáticamente todos sus CE (hijos) y su campo porcentaje debe establecerse por defecto en 100.
- **Edición de Porcentaje:** Si el usuario modifica el porcentaje, este se guarda temporalmente en el estado del componente.
- **Guardado:** Un botón inferior "Guardar peso". Al pulsarlo, se enviarán a la base de datos solo los CE que estén marcados.

## 4. Base de Datos y Servicios (Supabase)

- Las inserciones afectarán a la tabla `trabajan` guardando `id_ce`, `id_practica` y `porcentaje`.
- El servicio `src/services/criteriosService.js` debe incluir:
  - `getArbolCriterios(moduloId)`: Para obtener los RA y sus CE y darles el formato jerárquico que exige PrimeReact.
  - `savePesoCriterios(practicaId, selecciones)`: para borrar las asignaciones anteriores de esa práctica (`DELETE`) e insertar las nuevas (`INSERT`) en una sola transacción o bloque lógico.

## Propuesta

# ⚙️ Caso de uso 11: Mapeo Jerárquico de Actividades a Criterios (RA y CE)

## 1. Objetivo

Permitir al docente vincular rápidamente una actividad programada en el curso (tabla `Versiones`) a múltiples Criterios de Evaluación (CE) y definir qué porcentaje del CE se cubre. Esta interfaz optimiza la asignación masiva (ej. un examen trimestral que evalúa un Resultado de Aprendizaje completo) y sustituye a modelos de asignación más lentos como el Drag & Drop.

## 2. Interfaz de Usuario (UI)

* **Enrutamiento:** Reutilizar la entrada de submenú `Asignación CE` (dentro de `Evaluaciones`) y redirigir a la página `CriteriosPagina.jsx`. Su contenido será reescrito por completo siguiendo este flujo.
- **Filtros Contextuales:** Componentes `Dropdown` (PrimeReact) dependientes para elegir Curso -> Módulo -> Actividad (`Versiones`).
- **Tabla Jerárquica:** Al seleccionar la actividad, se cargará un componente `TreeTable` de PrimeReact.
  - **Nodos Padre:** Resultados de Aprendizaje (RA).
  - **Nodos Hijo:** Criterios de Evaluación (CE).
  - **Columnas:**
    1. Nombre/Descripción del RA o CE.
    2. `Checkbox` de selección (ubicado a la izquierda del nombre).
    3. `InputNumber` para establecer el "Porcentaje de Cobertura" (0-100). Estará ubicado a la derecha y solo se habilitará si el `Checkbox` de esa fila está marcado.

## 3. Lógica de Interacción y Negocio

* **Selección en Cascada (Cascading):**
  - Si el docente marca el `Checkbox` de un RA (nodo padre), el sistema debe seleccionar automáticamente todos sus CE (hijos) y establecer el campo porcentaje de todos ellos a 100 por defecto.
  - Si desmarca el padre, se desmarcan los hijos y se limpia su porcentaje.
- **Edición Temporal:** Si el usuario modifica manualmente el porcentaje de un hijo, este valor se actualiza en el estado local del componente React (sin llamadas a BD).
- **Guardado Transaccional:** Un botón destacado "Guardar Mapeo" en la parte inferior o superior. Al pulsarlo, se enviará a la base de datos únicamente la información de los CE (hijos) que estén marcados y tengan un porcentaje válido.

## 4. Obtención de Datos y Arquitectura de Estados

* **Estructura de Datos (Tree):** PrimeReact exige que los datos del `TreeTable` tengan una estructura JSON anidada con propiedades específicas (`key`, `data`, `children`).
- **Custom Hook:** Se creará el hook `src/hooks/useMapeoCriterios.js` que consumirá a `useDatos`. Evitar totalmente la creación de un `criteriosService.js`.
- **Funciones del Hook:**
  - `obtenerArbolCriterios(idModulo)`: Extraerá los RA y CE de la base de datos y los formateará en el árbol jerárquico que necesita el componente.
  - `guardarMapeo(idVersion, selecciones)`: Ejecutará la transacción en la base de datos. Primero hará un `DELETE` en la tabla `trabajan` de todas las asignaciones anteriores para esa `id_version` específica, y acto seguido un `INSERT` masivo de las nuevas asignaciones (`id_ce`, `id_version`, `porcentaje`).
- **Feedback:** Mostrar un `Toast` informando del éxito del guardado.

## Caso de uso 18: Gestor de Unidades de Trabajo y Asignación de Actividades

## 1. Objetivo

Proporcionar una interfaz visual e interactiva para que el docente defina el currículo de un módulo. Esto incluye el CRUD de Unidades de Trabajo (UT) asociadas a un curso académico específico, y la asignación ágil de las actividades planificadas (`Versiones`) a dichas unidades.

## 2. Modelo de Datos y Arquitectura

La funcionalidad se apoya en el patrón Maestro-Detalle consolidado:

* La tabla `Modulos` actúa como contenedor curricular genérico.
* La tabla `Unidades_Trabajo` almacena el desglose curricular por año lectivo (`numero`, `nombre`, `descripcion`) vinculado a un `id_modulo` y un `id_curso`. Esto permite que la temporalización y el número de unidades varíen de un año a otro sin alterar el histórico.
* La tabla `Versiones` (que representa las actividades instanciadas para ese curso) contiene el campo `id_ut`.
* El sistema aprovechará la base de datos para el borrado en cascada o la desvinculación: al eliminar una UT, el campo `id_ut` de sus versiones asociadas pasará a `NULL` (ON DELETE SET NULL), dejándolas "huérfanas".

## 3. Interfaz de Usuario (UI) y Flujos

Toda la interfaz se construirá utilizando los componentes de PrimeReact y sus iconos (`primeicons`).

* **Enrutamiento Principal:** En el menú principal izquierdo en su sección `Planificación`, crear la sección `Unidades de trabajo` que conducirá a la página `src/pages/UnidadesPagina.jsx`.
* **Layout de Gestión (Drag & Drop):** La vista se dividirá en dos áreas interactivas utilizando la librería `swapy`:
  * **Zona Curricular (UTs):** Un componente `DataView` o un diseño en Grid con tarjetas (`Card`) por cada Unidad de Trabajo del módulo seleccionado. Cada tarjeta actuará como una zona de destino (Drop Zone). Un botón principal permitirá abrir un `Dialog` para crear/editar una UT.
  * **Panel de Actividades Huérfanas:** Un panel lateral o inferior fijo que mostrará las `Versiones` cuyo campo `id_ut` sea nulo.
  * **Interacción:** El usuario arrastrará una actividad desde el panel de huérfanas y la soltará dentro de una UT. Esto disparará una actualización automática en la base de datos y refrescará la vista.
* **Eliminación:** Borrar una UT requerirá confirmación mediante un `ConfirmDialog` de PrimeReact, advirtiendo que las actividades contenidas quedarán huérfanas.
* Antes de la creación de algún componente, el agente **DEBE** reutilizar los ubicados en `src/components/common/` si es necesario (no se pueden modificar estos componentes).

## 4. Obtención de Datos y Custom Hooks

* **Evitar Hook Hell:** En lugar de crear `usePracticas.js` y `useUnidadesTrabajo.js` por separado (lo que complicaría el estado compartido del Drag & Drop), se creará un único hook orquestador `src/hooks/useGestorCurriculo.js`.
* **Consumo de Datos:** Este hook utilizará internamente `useDatos` para implementar el CRUD en `Unidades_Trabajo` y la función de actualización (`UPDATE`) del campo `id_ut` en la tabla `Versiones`.
* **Componentización:** Se creará el componente principal `src/components/GestorCurriculo.jsx` en formato `PascalCase`, exportando la función en la última línea y documentando con comentarios impersonales (ej. "Se actualiza el identificador de la unidad de trabajo."). Manejo de errores estricto a través de notificaciones `Toast`.

## 5. Tabla de Mantenimiento (CRUD Genérico)

Para cumplir con los estándares del panel de administración, se generará una vista técnica de mantenimiento:

* En el menú lateral, dentro de `Herramientas -> MANTENIMIENTO`, añadir una nueva entrada para `Unidades de Trabajo`.
* Conducirá a una página con un `DataTable` de PrimeReact estándar (con paginación, filtros y edición en celda/modal), idéntico al implementado para el resto de tablas maestras del sistema, permitiendo al administrador auditar o corregir registros directamente.

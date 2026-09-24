## Caso de uso 18: Gestor de Unidades de Trabajo y Asignación de Actividades

## 1. Objetivo

Proporcionar una interfaz visual e interactiva para que el docente defina el currículo de una clase (la cual encapsula su módulo profesional correspondiente). Esto incluye el CRUD de Unidades de Trabajo (UT) asociadas a dicha clase, y la asignación ágil de las actividades planificadas (`Versiones`) a dichas unidades.

## 2. Modelo de Datos y Arquitectura

La funcionalidad se apoya en el patrón Maestro-Detalle consolidado:

* La tabla `Modulos` actúa como contenedor curricular genérico vinculado a la clase seleccionada.
* La tabla `Unidades_Trabajo` almacena el desglose curricular (`numero`, `nombre`, `descripcion`) vinculado al `id_modulo` de la clase activa.
* La tabla `Versiones` (que representa las actividades instanciadas para esa clase) contiene el campo `id_ut`.
* El sistema aprovechará la base de datos para la desvinculación: al eliminar una UT, el campo `id_ut` de sus versiones asociadas pasará a `NULL`, dejándolas sin asignar.

## 3. Interfaz de Usuario (UI) y Flujos

Toda la interfaz se construirá utilizando los componentes de PrimeReact y sus iconos (`primeicons`).

* **Enrutamiento Principal:** En el menú principal izquierdo en su sección `Planificación`, la sección `Unidades de trabajo` conduce a la página `src/pages/UnidadesPagina.jsx`.
* **Layout de Gestión en Dos Columnas:** La vista se divide siempre en dos columnas paralelas y permanentes:
  * **Columna Curricular (UTs):** Un listado tabular (`TablaBase`) con las Unidades de Trabajo de la clase seleccionada. Muestra la numeración formateada con cero a la izquierda si es menor a 10 (ej. `UT01`, `UT02`), el nombre, descripción, conteo de actividades y botones homogéneos de edición y borrado. Un botón en la barra superior permite abrir el `Dialog` para dar de alta nuevas UTs (cuyo campo de número no incluye botones de incremento/decremento +/-).
  * **Columna de Versiones y Asignación:** Un listado tabular (`TablaBase`) con las actividades y versiones de la clase. En lugar de mostrar el contenido extenso de la versión, muestra la práctica, el número de versión, la UT a la que está asignada actualmente (con un botón dedicado para eliminar la versión de esa UT) y los números de las UTs disponibles (`UT01`, `UT02`...) para que, al pulsar cualquiera de ellos, se añada directamente a esa unidad de trabajo.
* **Eliminación de la dependencia Swapy:** La interacción se realiza de forma directa y accesible mediante pulsación sobre los números de UT y botones de eliminación, prescindiendo por completo de la librería Swapy.
* **Eliminación del selector de Módulo:** El filtro superior únicamente utiliza `<SelectorClase>`, ya que la clase seleccionada ya tiene asociado su módulo profesional correspondiente.
* **Eliminación de UT:** Borrar una UT requiere confirmación mediante `ModalConfirmacion`, advirtiendo de que las actividades asociadas quedarán sin asignar.
* Reutilización estricta de componentes ubicados en `src/components/common/` (sin modificarlos).

## 4. Obtención de Datos y Custom Hooks

* **Custom Hooks Especializados:**
  * `src/hooks/useClases.js`: Encapsula la consulta y estructuración de clases para el `<SelectorClase>`, consumiendo el hook genérico `useDatos`.
  * `src/hooks/useGestorCurriculo.js`: Orquesta de forma unificada el CRUD en `Unidades_Trabajo` y la asignación/desvinculación (`UPDATE`) del campo `id_ut` en la tabla `Versiones`.
* **Componentización:** Se utiliza el componente orquestador `src/components/GestorCurriculo.jsx` en formato `PascalCase`, dividiendo la vista en subcomponentes especializados dentro de `src/components/unidades/` (`FiltrosCurriculo.jsx`, `TablaUnidadesTrabajo.jsx`, `TablaVersiones.jsx`, `DialogoUnidadTrabajo.jsx`). Documentación redactada en estilo impersonal y manejo de notificaciones mediante notificaciones `Toast`.

## 5. Tabla de Mantenimiento (CRUD Genérico)

Para cumplir con los estándares del panel de administración, se mantiene la vista técnica de mantenimiento:

* En el menú lateral, dentro de `Herramientas -> MANTENIMIENTO`, entrada para `Unidades de Trabajo`.
* Conduce a una página con un `DataTable` de PrimeReact estándar con paginación superior, filtros y edición, permitiendo al administrador auditar registros directamente.

## 1. Objetivo

Implementar la interfaz estructural para que un docente pueda definir el currículo de un módulo. Esto incluye la creación, edición y borrado (CRUD) de Unidades de Trabajo (UT), así como la asignación intuitiva de las Prácticas existentes a dichas unidades.

## 2. Modelo de Datos

La funcionalidad se apoya en las siguientes estructuras:

* La tabla `Modulos` actúa como contenedor curricular de las materias.
* La tabla `Unidades_Trabajo` almacena el currículo específico por año lectivo (`numero`, `nombre`, `descripcion`) vinculado a un `id_modulo` y un `id_curso`. Esto permite que la programación y número de unidades varíe de un curso a otro sin afectar a los cursos históricos.
* La tabla `practicas_curso` enlaza las prácticas de cada curso a su respectiva Unidad de Trabajo (`id_ut`).
* La funcionalidad de duplicación permite copiar la estructura completa de UTs y asignaciones desde un curso previo.

## 3. Interfaz de Usuario (UI)

Toda la interfaz debe construirse con PrimeReact (tema Nano) y PrimeIcons.

* En **menú principal de la izquierda** crea la sección de `Unidades de trabajo` que conduzca al fichero src/pages/UnidadesPagina.jsx
* **Gestión de UT:** Un componente `DataTable` o `DataView` de PrimeReact mostrará las Unidades de Trabajo del módulo seleccionado. Un botón flotante o de cabecera abrirá un `Dialog` (modal) con un formulario (`InputText`, `InputTextarea`) para crear o editar una UT.
* **Panel de Prácticas Huérfanas:** Un panel lateral o inferior mostrará las Prácticas que aún tienen su campo `id_ut` en nulo.
* **Asignación (Drag & Drop):** Se utilizará estrictamente la librería `swapy` para arrastrar una práctica desde el "Panel de Prácticas Huérfanas" y soltarla dentro de una Unidad de Trabajo, actualizando automáticamente la base de datos.
* **Eliminación:** Borrar una UT debe mostrar un `ConfirmDialog` de PrimeReact. El borrado dejará las prácticas asociadas nuevamente "huérfanas" (esto dependerá del ON DELETE SET NULL configurado en BD, pero la UI debe refrescarlo).

## 4. Arquitectura y Lógica de Negocio

* Crea/modifica los archivos src/hooks/useUnidadesTrabajo.js y src/hooks/usePracticas.js. Utiliza el hook genérico useDatos para implementar el CRUD completo de la tabla Unidades_Trabajo (filtrando por id_modulo) y un método para actualizar el id_ut de un registro en la tabla Practicas. Aplica el manejo de errores estricto definido en las convenciones y redacta los comentarios en estilo impersonal.
* **Gestión de Estado:** Se crearán dos *Custom Hooks*: `useUnidadesTrabajo.js` y `usePracticas.js`.
* **Abstracción de Datos:** Ambos hooks utilizarán el hook genérico `useDatos` para interactuar con Supabase.
* **Componentes:** Se creará el componente principal `GestorCurriculo.jsx` en formato `PascalCase`, siendo un componente funcional con la función exportada en la última línea.

## 5. Tabla de mantenimiento

Genera una nueva entrada en la sección `herramientas` -> `MANTENIMIENTO` para mantener la tabla a través de un <DataTable> de igual modo que está hecho con el resto de tablas. (revisa alguna de ellas si tienes dudas).

## Propuesta

# 📚 Caso de uso 18: Gestor de Unidades de Trabajo y Asignación de Actividades

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

* **Enrutamiento Principal:** En el menú principal izquierdo, crear la sección `Unidades de trabajo` que conducirá a la página `src/pages/UnidadesPagina.jsx`.
* **Layout de Gestión (Drag & Drop):** La vista se dividirá en dos áreas interactivas utilizando la librería `swapy`:
  * **Zona Curricular (UTs):** Un componente `DataView` o un diseño en Grid con tarjetas (`Card`) por cada Unidad de Trabajo del módulo seleccionado. Cada tarjeta actuará como una zona de destino (Drop Zone). Un botón principal permitirá abrir un `Dialog` para crear/editar una UT.
  * **Panel de Actividades Huérfanas:** Un panel lateral o inferior fijo que mostrará las `Versiones` cuyo campo `id_ut` sea nulo.
  * **Interacción:** El usuario arrastrará una actividad desde el panel de huérfanas y la soltará dentro de una UT. Esto disparará una actualización automática en la base de datos y refrescará la vista.
* **Eliminación:** Borrar una UT requerirá confirmación mediante un `ConfirmDialog` de PrimeReact, advirtiendo que las actividades contenidas quedarán huérfanas.

## 4. Obtención de Datos y Custom Hooks

* **Evitar Hook Hell:** En lugar de crear `usePracticas.js` y `useUnidadesTrabajo.js` por separado (lo que complicaría el estado compartido del Drag & Drop), se creará un único hook orquestador `src/hooks/useGestorCurriculo.js`.
* **Consumo de Datos:** Este hook utilizará internamente `useDatos` para implementar el CRUD en `Unidades_Trabajo` y la función de actualización (`UPDATE`) del campo `id_ut` en la tabla `Versiones`.
* **Componentización:** Se creará el componente principal `src/components/GestorCurriculo.jsx` en formato `PascalCase`, exportando la función en la última línea y documentando con comentarios impersonales (ej. "Se actualiza el identificador de la unidad de trabajo."). Manejo de errores estricto a través de notificaciones `Toast`.

## 5. Tabla de Mantenimiento (CRUD Genérico)

Para cumplir con los estándares del panel de administración, se generará una vista técnica de mantenimiento:

* En el menú lateral, dentro de `Herramientas -> MANTENIMIENTO`, añadir una nueva entrada para `Unidades de Trabajo`.
* Conducirá a una página con un `DataTable` de PrimeReact estándar (con paginación, filtros y edición en celda/modal), idéntico al implementado para el resto de tablas maestras del sistema, permitiendo al administrador auditar o corregir registros directamente.

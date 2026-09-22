# Caso de uso 04: Asistente de configuración de Cursos y Evaluaciones

## 1. Objetivo

Permitir al profesor crear un Curso, asignar Módulos, matricular Discentes, auto-generar las Evaluaciones reglamentarias y clonar la programación de años anteriores. También debe haber la posibilidad de modificar esos cursos (gestionar matriculaciones) y de eliminarlos por completo.

## 2. Lógica de Interfaz y Flujo (UI/UX)

En el menú principal utiliza la entrada "Clases" se habilitarán varios submenús (utiliza los existentes o los creas nuevos):

- **"Crear clase"**: conducirá a una página con un componente `Stepper` de PrimeReact que contendrá un asistente de creación.
- **"Modificar clase"**: dará acceso a otra vista que permitirá matricular/desmatricular discentes de una clase ya existente.
- **"Eliminar clase"**: permitirá eliminar en cascada toda la información de la clase en todas las tablas afectadas de la base de datos.

La UI debe mostrar indicadores del proceso (`Toast` de PrimeReact) mientras se gestionan los datos asíncronos en la base de datos, y un mensaje de éxito al terminar.

## 3. Reglas de Negocio y Validación

- **Para "Crear clase":**
  - Utilizar el componente `Stepper` de PrimeReact para guiar al usuario.
  - **Paso 1 (Cursos):** seleccionar el curso disponible a través de un `Dropdown` de PrimeReact de la lista o permitir crear uno nuevo a través de un formulario para crear el registro en la tabla `Cursos`.
  - **Paso 2 (Módulos):** selección de un módulo (tabla `Modulos`) disponible en el ciclo actual. Añadir dos `Dropdown`: uno con ciclos que, al seleccionarlo, filtre el contenido del segundo con los módulos que pertenecen a ese ciclo.
  - **Paso 3 (Discentes):** aparecerá un listado de Discentes activos a los que se podrá hacer selección múltiple y pulsando un botón se añadirán al curso (tabla `imparte`).
  - **Paso 4 (Auto-Evaluaciones):** al llegar a este paso, el sistema debe preparar la creación silenciosa de 5 registros en la tabla `Evaluaciones` ('Primera', 'Segunda', 'Tercera', 'Final' y 'Extraordinaria') por cada módulo seleccionado, vinculados al curso.
  - **Paso 5 (Importar Programación):** se preguntará si se desea heredar la configuración de un curso anterior con dos opciones en pantalla. Si se acepta y selecciona uno, el sistema clonará los registros de `Versiones`, `Temporizacion`, `ra_curso` y `ce_curso` del curso antiguo, asignándoles el nuevo `id_curso`.
  - **Paso 6 (Confirmación):** al terminar la selección de la información y antes de crear nada en la base de datos, se mostrará un informe con las acciones que se van a realizar con la opción de `Aceptar y guardar` o `Cancelar`.

- **Para "Modificar Clase":**
  - Existirá un `Dropdown` con un listado de Clases (tabla `imparte` con el nombre formado por el binomio Curso/Módulo).
  - Para añadir o quitar alumnos a la clase se utilizará el componente **`PickList`** de PrimeReact. Mostrará a la izquierda los "Discentes Disponibles" y a la derecha los "Discentes Matriculados", permitiendo pasarlos de un lado a otro visualmente y actualizando la tabla `imparte`.

- **Para "Eliminar clase":**
  - Se elegirá una `Clase` determinada (con un `Dropdown`) y, tras su confirmación mediante un `ConfirmDialog`, se eliminarán en cascada todos los registros de la base de datos de ese curso.
  - El borrado debe abarcar las tablas: `imparte`, `Evaluaciones`, `evaluan`, `Versiones`, `Temporizacion`, `ra_curso` y `ce_curso`.

## 4. Datos y Arquitectura (React y Supabase)

- Para respetar la arquitectura del proyecto, **no se creará un servicio aislado**. En su lugar, crear el Custom Hook `src/hooks/useConfiguracionCurso.js`.
- Este hook debe utilizar internamente el hook genérico `useDatos` para aislar la comunicación con la base de datos Supabase.
- Crear una función expuesta por el hook llamada `generarCursoCompleto(...)` que orqueste las inserciones (curso, evaluaciones, matriculaciones y la clonación de la programación histórica si aplica).
- Crear una función expuesta por el hook `eliminarCurso(cursoId)` para eliminar el curso de todas las tablas afectadas.

# ⚙️ Caso de uso: asistente de configuración de Cursos y Evaluaciones

## 1. Objetivo

Permitir al profesor crear un Curso, asignar Módulos, matricular Discentes y auto-generar las Evaluaciones reglamentarias. También debe haber la posibilidad de modificar esos cursos y de eliminarlos.

## 2. Lógica de Interfaz y Flujo (UI/UX)

En el menú "Clases" se habilitarán varios submenús: "Crear clase", que conducirá a una página con un componente `Stteper` que contendrá un asistente de creación (especificado más abajo), "Modificar clase" que dará acceso a otra clase que premitirá matricular/desmatricular discentes (especificado más abajo) y "Eliminar clase" que permitirá eliminar en cascada toda la información de la clase en todas las tablas afectadas.

La UI debe mostrar un indicadores del proceso (`Toast` de PrimeReact) mientras se gestionan los datos en la base de datos, y un mensaje de éxito al terminar.

## 3. Reglas de Negocio y Validación

- Para la "Crear clase":
  - Utilizar el componente `Stepper` de PrimeReact para crear un asistente.
  - **Paso 1 (Cursos):** Seleccionar el curso disponible a través de un `<DropDown>` de PrimeReact de la lista o permitir crear uno muevo a través de un formulario para crear el registro en la tabla `Cursos`.
  - **Paso 2 (Módulos):** Selección de un módulo (tabla `Modulos`) disponible en el ciclo actual. Añadir dos <DropDown> : uno con ciclos que, al seleccionarlo, filtre el contenido del segundo con los módulos que pertenecen a ese ciclo.
  - **Paso 3 (Discentes):** Aparecerá un listado de Discentes activos a los que se podrá hacer selección múltiple y pulsando un botón se añadirán al curso.
  - **Paso 4 (Auto-Evaluaciones):** Al llegar a este paso, el sistema debe crear silenciosamente 4 registros en la tabla `Evaluaciones` ('Primera', 'Segunda', 'Final', 'Extraordinaria') por cada módulo seleccionado, vinculados al curso.
  - **Paso 5 (Confirmación):** al terminar la selección de la información y antes de crear nada en la base de datos, se mostrará un informe con las acciones que se van a realizar con la opción de `Aceptar y guardar` o `Cancelar`.

- Para  "Modificar Clase":
  - Existirá un <DropDown> con un listado de Clases (tabla `imparte` con el nombre formado con el binomin Curso/Módulo) donde al elegir uno de ellos se muestran los discentes matriculados en un listado que se podrán eliminar. También existe la posibilidad de añadir `Discentes` a la `Clase` (recomienda una forma de hacerlo ya que no lo tengo claro).

- Para "Eliminar clase":
  - se elegirá una `Clase` determinada (con un <DropDown>) y, tras su confirmación, se eliminarán en cascada todos los registros de la base de datos de ese curso (`imparte`, `Evaluaciones`, `evaluan`...)

## 4. Datos y Servicios (Supabase)

- Crear `src/services/cursoSetupService.js` con toda la lógica de la operación.
- Crear una función `generarEvaluaciones(cursoId, moduloId)` que inserte los cuatro periodos reglamentarios usando el cliente de Supabase.
- Crear una función `eliminarCurso(cursoId)` para eliminar el curso de todas las tablas afectadas.

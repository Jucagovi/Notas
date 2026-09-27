# Caso de uso 06: Pantalla de Calificación de Actividades (Data Entry)

## 1. Objetivo

Proporcionar al profesor una interfaz rápida y tabular para introducir las notas numéricas de los discentes en una actividad específica (tabla `Versiones`), agilizando el proceso de evaluación masiva.

## 2. Lógica de Interfaz y Flujo (UI/UX)

En el menú principal "Evaluaciones", se habilitará el submenú "Calificar Actividades", que conducirá al componente `CalificarPagina.jsx`.

La pantalla se dividirá en dos secciones principales:

- **Cambio de enfoque:** los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los textos de este caso de uso.
- **Filtros Contextuales (Header):**
  - Dos `Dropdown` de PrimeReact dependientes entre sí: Clase/Curso -> Prácticas (la clase ya tiene un módulo asignado).
  - Una vez seleccionada la Práctica, se muestra la `Versión` de esa práctica `Versiones` vinculadas a ese módulo y curso.
- **Zona de Calificación (Main):**
  - Al hacer clic en una `Version`, aparece un `DataTable` de PrimeReact con el listado de `Discentes` matriculados en ese curso (cruzando con la tabla `imparte`).
  - **Columnas de la tabla:** Nombre, Apellidos, y una columna editable (Cell Editing) llamada "Nota".
  - El campo de nota utilizará un `InputNumber` (PrimeReact) configurado con un mínimo de 0 y máximo de 100, sin decimales.
  - Por defecto, el campo de la nota debe tener el **signo de interrogación**, no a cero, para identificar claramente a los alumnos pendientes de calificar.
  - **Feedback Cromático:** Una vez introducida la nota, la celda o el texto debe colorearse utilizando obligatoriamente el helper `getColorNota(nota)` (`src/utils/coloresNota.js`).

## 3. Reglas de Negocio y Guardado Automático

- **Auto-save (Sin botón general de Guardar):** Cuando el profesor introduzca una nota y quite el foco del input (evento `onBlur` o al cerrar el editor de celda), el sistema debe guardar esa nota automáticamente en la base de datos.
- **Feedback visual:** Mostrar un `Toast` (PrimeReact) pequeño y silencioso confirmando el guardado (ej. "Nota guardada con éxito"). En caso de error, el Toast será de severidad 'error'.
- **Validación:** Validar que la nota esté siempre entre 0 y 100. Si se introduce un valor fuera de rango, el campo debe marcarse en rojo (clase `p-invalid`) y no disparar el guardado.

## 4. Obtención de Datos y Arquitectura de Estados

- **Custom Hook:** No se crearán servicios aislados. Se implementará el hook `src/hooks/useCalificador.js` que consumirá a `useDatos`.
- **Obtención de Alumnos:** El hook expondrá una función `obtenerDiscentesConNotas(idVersion, idEvaluacion, idCurso)` que devuelva la lista de alumnos cruzada con la tabla `evaluan` (para saber si ya tienen una nota asignada previamente y pintarla).
- **Función de Guardado (Upsert):** El hook expondrá `guardarNota(idVersion, idEvaluacion, idDiscente, nota)`. Esta función hará un *upsert* (insertar si no existe, actualizar si ya existe) en la tabla `evaluan`.

# ✍️ Caso de uso: pantalla de Calificación de Prácticas (Data Entry)

## 1. Objetivo

Proporcionar al profesor una interfaz rápida y tabular para introducir las notas numéricas de los discentes en una práctica específica, agilizando el proceso de evaluación masiva.

## 2. Lógica de Interfaz y Flujo (UI/UX)

En el menú "Calificar" conduce a `CalificarPagina.jsx` y allí es donde debes crear la interfaz de esta sección (si no existe, lo creas).

La pantalla se dividirá en dos secciones principales:

- **Filtros Contextuales (Header):**
  - Tres `Dropdown` de PrimeReact dependientes entre sí: Curso -> Módulo -> Evaluación.
  - Una vez seleccionada la evaluación, se muestra una lista (o botones/tarjetas) con las `Practicas` vinculadas a esa evaluación.
- **Zona de Calificación (Main):**
  - Al hacer clic en una Práctica, aparece un `DataTable` de PrimeReact con el listado de `Discentes` matriculados en ese curso.
  - **Columnas de la tabla:** Nombre, Apellidos, y una columna editable llamada "Nota".
  - El campo de nota utilizará un `InputNumber` (PrimeReact) configurado con un mínimo de 0 y máximo de 100.
  - Por defecto, el campo de la nota debe estar **vacío (null)**, no a cero, para identificar a los alumnos pendientes de calificar.

## 3. Reglas de Negocio y Guardado Automático

- **Auto-save:** No habrá un botón general de "Guardar". Cuando el profesor introduzca una nota y quite el foco del input (evento `onBlur`), el sistema debe guardar esa nota automáticamente.
- **Feedback visual:** Mostrar un `Toast` (PrimeReact) pequeño y silencioso confirmando el guardado (ej. "Nota guardada: 75").
- Validar que la nota esté siempre entre 0 y 100. Si se introduce un valor fuera de rango, el campo debe marcarse en rojo y no guardar.

## 4. Obtención de Datos y Servicios (Supabase)

- Necesitaremos una función `getDiscentesPorPractica(practicaId)` que devuelva la lista de alumnos cruzada con la tabla `evaluan` (para saber si ya tienen una nota asignada previamente).
- Necesitaremos una función `guardarNotaPractica(practicaId, discenteId, nota)` que actualice la tabla `evaluan` (haciendo un insert o un update según corresponda).

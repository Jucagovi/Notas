# Caso de uso: Sistema de Calificación Interactivo

## 1. Objetivo

Permitir al profesor asignar o modificar las notas de los alumnos para una asignatura específica de forma rápida y visual, usando una interfaz de arrastrar y soltar (Drag & Drop).

## 2. Lógica de Interfaz y Flujo (UI/UX)

* El usuario selecciona una "Asignatura" en un desplegable (Dropdown de PrimeReact).
* La pantalla mostrará columnas verticales que representan rangos de notas:
  * Columna 1: Sin calificar
  * Columna 2: Suspenso (0 - 49)
  * Columna 3: Aprobado (50 - 69)
  * Columna 4: Notable (70 - 90)
  * Columna 5: Sobresaliente (90 - 100)
* Cada alumno se representa como una Tarjeta (Card).
* **Interacción (Swapy):** El profesor puede arrastrar la tarjeta de un alumno de una columna a otra.

## 3. Reglas de Negocio y Validación

* Al soltar a un alumno en una nueva columna, el sistema debe abrir un pequeño modal (`Dialog` de PrimeReact) pidiendo la nota exacta (ya que la columna solo define el rango).
* El campo de entrada (`InputNumber`) debe validar automáticamente que la nota tecleada pertenezca al rango de la columna destino.
* Si el profesor cierra el modal sin guardar, la tarjeta del alumno debe volver a su columna original.

## 4. Impacto en Datos (Services)

* Al confirmar la nota, se debe llamar al servicio `actualizarNota(estudianteId, asignaturaId, nota)`.
* La UI debe mostrar un indicador de carga (`Toast` de PrimeReact) mientras se guarda en la base de datos, y un mensaje de éxito al terminar.

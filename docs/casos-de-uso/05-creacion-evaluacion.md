# Caso de uso: asistente de asignación de evaluaciones

## 1. Objetivo

Permitir al profesor mapear las Prácticas a los Resultados de Aprendizaje (RA) y Criterios de Evaluación (CE) de forma visual y añadirlas a las evaluaciones creadas con anterioridad.

## 2. Lógica de Interfaz y Flujo (UI/UX)

En el menú `Calificar` (que hay que cambiar el nombre a `Evaluaciones`) conducirá a la página `CalificarPage.jsx` (que también debe renombrarse a `EvaluacionesPage.jsx` en su fichero, función interna, export y los imports que la utilicen). En esta página habrá un <DropDown> para la selección de la evaluación (filtrada por curso de alguna manera) y se utilizará `Swapy` para la gestión del drag&drop.

La UI debe mostrar un indicadores del proceso (`Toast` de PrimeReact) mientras se gestionan los datos en la base de datos, y un mensaje de éxito al terminar.

## 3. Reglas de Negocio y Validación

- En la vista de configuración del módulo, habrá una interfaz Drag & Drop usando `swapy`.
- **Columna Izquierda:** lista de tarjetas representando registros de la tabla `Practicas` que se puedan filtrar por `Módulos` a través de un <DropDown>.
- **Área Derecha:** acordeones o Paneles (PrimeReact) por cada `RA`. Dentro, zonas para soltar en cada `CE`.
- **Lógica de inserción:** al soltar una Práctica en un CE (una práctica puede contener varios CE), abrir un `Dialog` preguntando el "Porcentaje de cobertura". Al guardar, insertar en la tabla `trabajan` (id_ce, id_practica, porcentaje).

## 4. Datos y Servicios (Supabase)

- Crear un contexto para la unidad de datos de `Evaluación` (con las tablas `evaluan`, `Discentes`, `Evaluaciones` y `Prácticas`). Valorar si es mejor idea reutilizar los contextos existentes o crear uno específico para esta tarea.
- Crear un hook personalizado para el consumo de ese contexto.

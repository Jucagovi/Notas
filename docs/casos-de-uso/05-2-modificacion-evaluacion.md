# Caso de uso: modificación del asistente de asignación de evaluaciones

## 1. Objetivo

Permitir al profesor mapear las Prácticas a los Resultados de Aprendizaje (RA) y Criterios de Evaluación (CE) de forma visual y añadirlas a las evaluaciones creadas con anterioridad. Ya se han implementado esta funcionalidad, pero se nos ha olvidado una así que este caso se uso es para modificar esta y añadir la nueva.

## 2. Lógica de Interfaz y Flujo (UI/UX)

En el menú Calificar, habilita un submenú con dos opciones: la primera será `Asignación prácticas` que conducirá a `PracticasPage.jsx` (hay que eliminar la entrada en el menú `Prácticas` que conduce a esta página ya que no se utilizará), la segunda será `Asignación CE` que conducirá a la actual `EvaluacionesPage.jsx`. No generes ni menú horizontal ni sección `Panel Principal` esta vez (no será necesario).

La UI debe mostrar un indicadores del proceso (`Toast` de PrimeReact) mientras se gestionan los datos en la base de datos, y un mensaje de éxito al terminar.

## 3. Reglas de Negocio y Validación

- La sección `Asignación CE` (que es la que ya está creada y aarecerá en segundo lugar) se mantendrá igual.
- La sección `Asignación prácticas` sera completamente nueva (y aparecerá en primer lugar) y contendrá:
  - se utilizará para asignar las prácticas a la evaluación (paso previo para poder asignarles criterios de evaluación),
  - se dispondrá de un <DropDown> para elegir la evaluación y un listado de las prácticas disponibles,
  - se seleccionarán las prácticas que entran en esa evaluación (cada vez que se selecciona/deselecciona una práctica automaticamente se añade/elimina de la base de datos informando del resultado de la operación a través de un <Toast>).

## 4. Datos y Servicios (Supabase)

- Se reutilizan los datos y servicios que ya existen modificando (si es necesario) su contenido.

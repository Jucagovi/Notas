# Caos de uso: evaluaciones y asignación de RA

## 1. Objetivo

Definir los periodos de evaluación (1ª, 2ª y 3ª) de un curso y asignar qué Resultados de Aprendizaje (RA) se evaluarán en cada uno de ellos, permitiendo calcular una nota trimestral normalizada para los requerimientos administrativos.

## 2. Interfaz de Usuario (UI) - Configuración

- En el asistente `Crear clase` en su cuarto paso `Auto-Evaluaciones` hay que modificar las evaluaciones que se introducen en la tabla `Evaluaciones` de forma automática para incluir una. Hay que incluir ahora: Primera, Segunda, Tercera, Final Ordinaria y Extraordinaria.
- En los <DropDown> en donde se muestren las evaluaciones de una clase/módulo sólo aparecerán las evaluaciones Primera, segunda y tercera (en ese orden y seguidas de la palabra `evaluación` por ejemplo `Primera evaluación`).
- La evaluación final se calculará de forma automática de igual modo que en el apartado `Acta evaluación RA` (no se le podrán asignar RA ya que los contiene todos de forma automática).
- **Gestor de Evaluaciones:** Un <DropDown> para seleccionar las evaluaciones vinculadas al curso a la tabla `Evaluaciones` (sólo debe mostrar Primera, Segunda,  y Tercera (en este orden) ya que la Final se calcula sola y para la Extraordinaria se generará una herramienta especial.
- **Asignación de RA:** Al expandir una evaluación (Row Expansion) o abrir un modal, mostrar un componente `PickList` o `Checkbox` de PrimeReact con todos los RA del módulo. El profesor seleccionará qué RA se cierran o evalúan en ese trimestre.

## 3. Lógica de Cálculo (Informe Trimestral)

- Se modificará el informe mostrado en el apartado `Informes` -> `Evaluación módulo` para que muestre las evaluaciones calculando la nota ahora a través de las prácticas que conforman un RA y ponderandolas al peso de cada RA incluido en la evaluación. aplica el siguiente **Algoritmo de Normalización:**
  1. Obtener los RA asignados a la evaluación seleccionada mediante la tabla `ra_evaluacion`.
  2. Rescatar el peso de cada RA para ese curso desde `ra_curso`.
  3. Sumar los pesos de los RA asignados.
  4. Calcular la nota de la evaluación re-escalando al 100%: Multiplicar la nota de cada RA por su peso y dividirlo entre la suma total de los pesos asignados.
- **Evaluación Final:** No requiere normalización. Es la suma ponderada global de todos los RA del módulo que se han conseguido hasta la fecha indicando.
- **CAmbio de nombre:** se debe actualizar el nombre de `Evaluación módulo` por el de `Acta por trimestres` tanto en la sección `Informes` como en la `Evaluación`.
- se debe cambiar el nombre al fichero @src/pages/PracticasPagina.jsx por el de AsignacionPagina.jsx y cambir el nombre en la función que declara el componente, su export y en todos los imports que lo necesiten.

## 4. Servicios (Supabase)

- Actualizar `evaluacionesService.js` para gestionar el CRUD en `ra_evaluacion`.
- Añadir `getNotasTrimestrales(cursoId, moduloId, evaluacionId)` en el servicio de reportes implementando la lógica matemática de normalización.

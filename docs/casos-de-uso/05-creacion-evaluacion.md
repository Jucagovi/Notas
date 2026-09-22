# Caso de uso 05: Planificación, Asignación y Mapeo de Evaluaciones

## 1. Objetivo

Unificar el flujo de trabajo del docente para preparar las evaluaciones de un curso lectivo. Esto implica: definir qué Resultados de Aprendizaje (RA) se evalúan en cada trimestre, asignar qué actividades (`Versiones`) entran en cada evaluación, y mapear visualmente el peso de dichas actividades sobre los Criterios de Evaluación [CE].

## 2. Lógica de Interfaz y Enrutamiento (UI/UX)

El menú principal `Calificar` se renombrará definitivamente a `Evaluaciones`. Este menú desplegará tres sub-secciones lógicas que guiarán al profesor de lo más general a lo más específico:

### 2.1. Asignación de RA a Evaluaciones

- **Interfaz:** Un modal o panel expansible donde, tras seleccionar un Módulo y una Evaluación en un `<Dropdown>`, se mostrará un componente `PickList` o `Checkbox` de PrimeReact.
- **Acción:** El profesor seleccionará qué RA se cierran o evalúan en ese trimestre. Los cambios se guardarán en la tabla `ra_evaluacion`.

### 2.2. Asignación de Actividades (Versiones)

- **Ruta:** Conducirá al componente `AsignacionPagina.jsx` (antiguo `PracticasPage.jsx`, asegurando cambiar su nombre, función, export e imports).
- **Interfaz:** Un `<Dropdown>` para elegir la Evaluación. A continuación, un componente `PickList` de PrimeReact (o un listado seleccionable) con las `Versiones` (actividades) programadas para ese curso.
- **Acción:** Al seleccionar/deseleccionar una actividad, se asignará a dicha evaluación actualizando automáticamente la base de datos (añadiendo el `id_evaluacion` al registro de la tabla `Versiones`) e informando mediante el `<Toast>` global.

### 2.3. Mapeo Curricular (Versiones a CE)

- **Ruta:** Conducirá a la página `EvaluacionesPage.jsx`.
- **Interfaz Drag & Drop:** No habrá panel principal. Se dividirá la pantalla en dos:
  - **Columna Izquierda:** Tarjetas con las `Versiones` filtradas previamente para ese Módulo/Curso.
  - **Área Derecha:** Componente `Accordion` de PrimeReact por cada RA. Al expandirse, mostrará zonas de soltar (Drop Zones) para cada CE.
- **Acción:** Al soltar una tarjeta (`swapy`) en un CE, se abrirá un `Dialog` pidiendo el "Porcentaje de cobertura". Al guardar, se insertará el registro en la tabla `trabajan` (cruzando `id_version`, `id_ce` y `porcentaje`).

## 3. Reglas de Negocio y Algoritmos de Cálculo

- **Filtros de Interfaz:** Los `<Dropdown>` de selección de evaluación para mapeo o calificación **solo** mostrarán "Primera evaluación", "Segunda evaluación" y "Tercera evaluación" [en ese orden]. La "Final Ordinaria" se calcula sola, y la "Extraordinaria" tendrá su propio flujo.
- **Algoritmo de Normalización (Acta por Trimestres):**
  El antiguo informe `Evaluación módulo` pasará a llamarse `Acta por trimestres`. Para calcular la nota trimestral de un alumno sobre 100, se aplicará esta lógica matemática:
  1. Obtener los RA asignados a la evaluación seleccionada (`ra_evaluacion`).
  2. Rescatar el peso de cada RA para ese curso (`ra_curso`).
  3. Sumar los pesos de los RA implicados.
  4. Multiplicar la nota obtenida por el alumno en cada RA por el peso del RA, sumar los resultados, y dividir entre la suma total de los pesos [reescalado al 100%].
- **Evaluación Final:** No requiere normalización, es la suma ponderada global de todos los RA del módulo que se calcula de forma automática cuando todos las prácticas tengan nota.
- **Evaluación Extraordinaria:** Se activara si la `Evaluación Final` tiene nota y si es menor a 50 (suspendida).

## 4. Arquitectura de Datos y Hooks

- **Fricción arquitectónica resuelta:** **No** se crearán Contextos globales para gestionar el flujo de datos de estas tablas, ya que penalizaría el rendimiento de los drag & drop.
- **Custom Hooks:** Se crearán hooks específicos (ej. `useAsignacionEvaluaciones` y `useMapeoCurricular`) que consumirán al hook base `useDatos` para interactuar con las tablas implicadas (`Versiones`, `ra_evaluacion`, `trabajan`, etc.).
- **Servicios de Reportes:** Se creará una función pura (fuera del ciclo de vida de React) llamada `calcularNotaTrimestralNormalizada(datosAlumno, pesosRA)` para encapsular la lógica matemática del punto 3.

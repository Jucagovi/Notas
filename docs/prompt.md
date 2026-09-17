# Prompts para la creación de una aplicación compleja com IA y Antigravity CLI 2.0

## Prompt maestro de incialización

¡Hola! Vamos a inicializar la arquitectura base para nuestro proyecto de Control de Notas.
Por favor, lee detenidamente los archivos @docs/CONVENCIONES.md y @docs/LAYOUT.md, y ten en cuenta que nuestra base de datos (docs/@esquema.sql) estará alojada en Supabase.
Actúa como un Tech Lead especialista en cliente y React y ejecuta, paso a paso, lo siguiente:

- Inicialización: crea un nuevo proyecto de React con Vite en este mismo directorio (sin borrar mis archivos ni carpetas).
- Dependencias: instala las librerías core que definimos: react-router-dom, swapy, primereact, primeicons, @primereact/themes y también el cliente @supabase/supabase-js.
- Estructura base: crea la estructura de carpetas en src/ (components, pages, hooks, services, utils) tal como indica el archivo de convenciones.
- Configuración UI: configura el PrimeReactProvider en main.jsx (o main.tsx) inyectando estrictamente el tema Nano de @primereact/themes.
- App Shell (Layout): genera el componente layout principal (Layout.jsx) basándote estrictamente en las instrucciones de @LAYOUT.md (Cabecera, Menú lateral, Pie de página). Usa componentes de PrimeReact.
- Enrutamiento: configura react-router-dom con el layout principal y crea componentes "esqueleto" (vacíos, solo con un título) para las rutas principales (especificadasd en @docs/LAYOUT.md)
- Entorno: crea un archivo .env.example preparado para Vite con las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY, y un archivo src/services/supabaseClient.js configurado con esas variables.

Importante: Aún NO implementes la lógica de negocio de las páginas ni los casos de uso. Limítate a construir el esqueleto, la navegación y la configuración visual. Confírmame cuando hayas terminado para que pueda probar que el proyecto levanta correctamente.

## Prompt específico (genérico) para un caso de uso (tras limpiar el contexto)

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir el [XXX]. Lee detalladamente el caso de uso en @docs/casos-de-uso/[XXX].md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/[XXX].jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para el dashboard (sin archivo de casos de uso)

¡Hola! Vamos a desarrollar la pantalla del Dashboard de nuestra aplicación.
Por favor, lee nuestras reglas en @CONVENCIONES.md y revisa la estructura de datos en @esquema.sql.
Actúa como un desarrollador Frontend Experto y ejecuta estos pasos:

- Dependencias: Instala chart.js si no está instalado, ya que lo necesitaremos para los componentes de PrimeReact.
- Mock de Datos / Servicio: Crea un archivo src/services/dashboardService.js (o actualiza si existe) con una función que obtenga los datos de Supabase. Si prefieres empezar rápido, puedes usar datos mockeados temporalmente que simulen alumnos, asignaturas y calificaciones.
- Componente Dashboard: Edita el archivo src/pages/Dashboard.jsx (o el que corresponda a la ruta /) y construye la siguiente interfaz usando los componentes de PrimeReact:
  - Una cabecera con el título 'Panel de Control'.
  - Un grid superior con 3 Tarjetas (Card): 'Total Alumnos', 'Nota Media Global' y 'Tasa de Aprobados'.
  - Un grid central con dos gráficos (Chart): Un gráfico de barras mostrando la 'Nota media por asignatura' y un gráfico de tipo doughnut mostrando la 'Distribución de calificaciones' (Suspensos, Aprobados, Notables, Sobresalientes).
  - Una sección inferior con un DataTable titulado 'Alumnos en Riesgo' (alumnos con media inferior a 5 o más de 1 suspenso).
  - Estilos: Utiliza las clases utilitarias de PrimeFlex o estilos en línea que respeten el tema Nano que configuramos en la inicialización.

Escribe el código, muéstrame los archivos generados y avísame cuando pueda revisar la pantalla en mi navegador.

## Prompt para mantenimiento de tablas

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir el sitio en donde se pueda realizar el mantenmiento de las tablas de la aplicación sin necidad de entrar en el panel de control de Supabase. Lee detalladamente el caso de uso en @docs/casos-de-uso/02-herramientas-mantenimiento.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/HerramientasPage.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar en castellano el código que consideres complejo redactado tal y como se pide en el fichero @docs/CONVENCIONES.md.

## Prompt para el inicio de sesión

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir el sistema de inicio de sesión. Lee detalladamente el caso de uso en @docs/casos-de-uso/03-sesion-de-usuario.md. Antes de escribir código, inspecciona la estructura actual para ver cómo está estructurado este apartado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. recuerda comentar el código que consideres complejo en castellano.

## Prompt para la creación de clases (asistente)

Continuamos con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir el sistema de creación de clases para poder hacer la evaluación de los discentes. Lee detalladamente el caso de uso en @docs/casos-de-uso/04-creacion-cursos.md. Antes de escribir código, inspecciona la estructura actual para ver cómo está estructurado este apartado (`src/pages/ClasesPage.jsx`) y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase (sino existen). Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano.

## Prompt para la creación de evaluaciones

Seguimos con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir el sistema de evaluación de los discentes. Lee detalladamente el caso de uso en @docs/casos-de-uso/05-creacion-evaluacion.md. Antes de escribir código, inspecciona la estructura actual para ver cómo está estructurado este apartado (`src/pages/CalificarPage.jsx`) y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase (sino existen). Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano.

## Prompt para modificar la creación de evaluaciones

Seguimos con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es modificar el sistema de evaluación de los discentes. Lee detalladamente el caso de uso en @docs/casos-de-uso/05-2-modificacion-evaluacion.md. Antes de escribir código, inspecciona la estructura actual para ver cómo está estructurado este apartado (`src/pages/PracticasPage.jsx`) y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase (sino existen). Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano.

## Prompt para crear el sistema de calificación de prácticas

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir el sistema de calificación para poner nota a la prácticas tras asignarlas a una evaluación. Lee detalladamente el caso de uso en @docs/casos-de-uso/06-calificar-practicas.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/CalificarPaginas.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para crear la sección Discente

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir el informe interactivo completo para doscentes. Lee detalladamente el caso de uso en @docs/casos-de-uso/07-informe-discente.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/DiscentesPagina.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para refactorizar colores de notas

¡Hola! Vamos a hacer una refactorización de código para centralizar los colores de las calificaciones.

Acabo de añadir la regla de colores en @docs/CONVENCIONES.md y he creado la función de utilidad en @src/utils/coloreNotas.js.

Tu tarea como Tech Lead es la siguiente:

- Analiza los archivos .jsx dentro de src/pages/ y src/components/ (especialmente el Dashboard y las vistas de calificación).
- Identifica dónde se están mostrando notas numéricas o renderizando gráficos.
- Modifica esos archivos para importar getColorNota.
- Sustituye cualquier color estático o lógica condicional antigua por el uso de las propiedades de este helper (.text para textos, .bg para fondos de badges, y .hex para los gráficos de PrimeReact).

Trabaja archivo por archivo y explícame brevemente qué líneas has cambiado en cada uno.

## Prompt para refactorizar comas en decimales

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir una nueva herramienta para hacer copias de seguridad de la base de datos. Lee detalladamente el caso de uso en @docs/casos-de-uso/08-copias-seguridad.md. Antes de escribir código, crea el archivo de la página src/pages/CopiasSeguridad.jsx. y creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt de importación de datos

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir una nueva herramienta para la importación masiva de datos. Lee detalladamente el caso de uso en @docs/casos-de-uso/09-importacion-csv.md. Antes de escribir código, crea el archivo de la página src/pages/ImportacionPagina.jsx. y creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para asignación de pesos

Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir una aplicación para asignar pesos a las prácticas de una evaluación. Lee detalladamente el caso de uso en @docs/casos-de-uso/10-evaluacion-pesos.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/PesosPagina.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompot para creación de asignación de peso a criterios

Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir una aplicación para asignar pesos y prácticas a los resultados de aprendizaje (a través de sus criterios de evaluación). Lee detalladamente el caso de uso en @docs/casos-de-uso/11-mapeo-practicas.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/CriteriosPagina.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para creación de infromes 1: cobertura CE

¡Hola! Vamos a desarrollar un informe de nuestra aplicación: la Auditoría de Cobertura Curricular.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Presta especial atención a cómo se relacionan Modulos, RA, CE, Practicas y la tabla intermedia trabajan (que contiene el campo porcentaje).

Nuestra tarea de hoy es construir un informe de cobertura de los RA y CE por la prácticas que forman las evaluaciones de un curso. Lee detalladamente el caso de uso en @docs/casos-de-uso/11-mapeo-practicas.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/informes/InformeCoberturaCE.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para creación de informes 3: calificaciones pendientes

¡Hola! Vamos a desarrollar un informe de nuestra aplicación: el Control de calificaciones pendientes.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Presta especial atención a las tablas y relacinoes de imparte, Discentes, Practicas, Evaluaciones y el campo nota de evaluan.

Nuestra tarea de hoy es construir un informe de control de calificaciones. Lee detalladamente el caso de uso en @docs/casos-de-uso/12-3-informe-calificaciones-pendientes.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/informes/InformePendientes.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para creación de informes 4: análisi de dificultad

¡Hola! Vamos a desarrollar un informe de nuestra aplicación: el análisis de la dificultad de prácticas.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Asegúrate de comprender cómo se almacena la nota en la tabla evaluan.

Nuestra tarea de hoy es construir un informe de dificultad de prácticas. Lee detalladamente el caso de uso en @docs/casos-de-uso/12-4-informe-dificultad.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/informes/InformeDificultad.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para creación de informes 2: acta evaluación

¡Hola! Vamos a desarrollar un informe de nuestra aplicación: acta de evaluación de un módulo.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Fíjate bien en cómo se relacionan Discentes, Evaluaciones y los campos nota y peso de la tabla evaluan.

Nuestra tarea de hoy es construir un informe de dificultad de prácticas. Lee detalladamente el caso de uso en @docs/casos-de-uso/12-2-informe-actas.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/informes/InformeEvaluacion.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para creación de informes 5: competencias individuales

¡Hola! Vamos a desarrollar un informe de nuestra aplicación: competencias individuales.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Fíjate muy bien en cómo se relacionan Discentes, evaluan, trabajan y RA-

Nuestra tarea de hoy es construir un informe que indique en qué compotencias es más fuerte un discente. Lee detalladamente el caso de uso en @docs/casos-de-uso/12-5-informe-radar-competencias.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/informes/InformeCompetencias.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.


## Prompt para creación nueva herramienta: clonado de cursos

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir una herramienta para poder clonar cursos y ahorrar el trabajo de una año para otro. Lee detalladamente el caso de uso en @docs/casos-de-uso/13-clonador-cursos.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/ClonadoCurso.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para creación de asignación de pesos a RA y CE

¡Hola! Hemos dado un giro pedagógico a la aplicación y vamos a implementar un sistema de evaluación basado en Resultados de Aprendizaje (RA) por curso.

Por favor, lee nuestras @docs/CONVENCIONES.md y revisa detenidamente el nuevo esquema en @docs/ESQUEMA.sql. Fíjate específicamente en las nuevas tablas ra_curso y ce_curso, que vinculan los campos id_ra, id_ce, id_curso y su peso.

Nuestra tarea de hoy es construir una herramienta para poder asignar pesos a esos RA y CE. Lee detalladamente el caso de uso en @docs/casos-de-uso/16-pesos-ra-ce.md. Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para cración de informe 6: acta de evaluación por RA

¡Hola! Vamos a desarrollar el informe más importante de nuestro sistema: el Acta de evaluación por Resultados de Aprendizaje (RA).

Lee las @docs/CONVENCIONES.md y revisa el esquema en @docs/ESQUEMA.sql. Presta atención a las tablas ra_curso, ce_curso, evaluan y trabajan para entender cómo se relacionan los pesos y las notas.

Nuestra tarea de hoy es construir informe con el acta de evaluación antual de un módulo. Lee detalladamente el caso de uso en @docs/casos-de-uso/17-acta-evaluacion-ra.md. Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt para modificar evaluación por trimestres y RA

¡Hola! Vamos a dar un salto arquitectónico: pasamos de asignar prácticas a las evaluaciones, a asignar Resultados de Aprendizaje (RA) a las evaluaciones para calcular notas trimestrales normalizadas.

Lee las @docs/CONVENCIONES.md y el @docs/ESQUEMA.sql. Ten en cuenta que he creado una nueva tabla intermedia ra_evaluacion(id_ra, id_evaluacion) que conecta RA con Evaluaciones. Luego, lee las especificaciones en @docs/features/05-3-evaluacion-ra.md.

Actúa como un Tech Lead Frontend y ejecuta lo siguiente paso a paso:

- actualiza el servicio evaluacionesService.js para permitir asignar RA a una evaluación insertando en la tabla ra_evaluacion.
- modifica la interfaz de configuración en @src/pages/PracticasPagina.jsx usando PrimeReact, donde el profesor pueda vincular fácilmente varios RA a las evaluaciones Primera, Segunda, Tercera y Extraordinaria (es un caso aparte y no contará para la nota final).
- en el servicio de informes (informesService.js), implementa la función matemática de normalización: debe calcular la nota sumando (Nota_RA * Peso_RA) / Suma_Pesos_RA_Trimestre.
- en la sección `Evaluación` -> `Evaluación módulo` revisa el <DataTable> de los discente ya que no muestra la paginación (y debería mostrarla).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt de revisión

### 1

¡Hola! Vamos a corregir algunas cosas de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql antes de continuar con este propmt.

En el fichero @src/paginas/DashboardPagina.jsx se ha implementado datos ficticios para cuando no existan en la base de datos, por favor, quita esa funcionalidad del todo y, si no hay datos, informas al usuario en cada uno de los gráficos/tarjetas que hay en la página.

Modifica o genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

### 2

En el fichero @src/paginas/HerramientasPagina.jsx , en la herramienta `Mantenimiento de módulos profesionales` en el <DataTable> que muestra los módulos quita la columna `fecha creación` y en la columna `Ciclo formativo` pon sólo las siglas del ciclo.

### 3

En el la herramienta de `Importar datos` el tamaño del archivo al subirlo se miestra con un punto en decimales, por favor, cambia el punto por una coma y muestra sólo un decimal.

### 4

En el asistente para crear clase contenido en el fichero @src/pages/ClasesPagina.jsx, en el ultimo paso `Resumen y confirmación` muestra la información una encima de la otra, una tarjeta por fila y con las mismas tarjetas que existen. En el caso de la tarjeta `Discentes a matriculas` utiliza una lista para mostrar los datos en texto blanco (sin <Tag> no nada así).

### 5

En la sección `Clases` subsección `Eliminar clase` quita el botón (y todo el código relacionado con su acción) `Eliminar todo el curso` ya que no será utilizado. Manten intacto el botón `Eliminar esta clase` que sí se utilizará.

### 6

En la sección `Evaluación` -> `Asignación prácticas` haz los cambios en el <DataTable> que muestra la información: la columna `Nº` muestra el número con texto y sin adornos como <Tag> o cosas así. En la columna `Nombre de la práctica` no muestre en enunciado de la práctica debajo del nombre, sólo muestra el nombre y el enunciado lo miestras como un tooltipo al pasar el ratón por encima del nombre de la práctica. Quita las columnas `Unidad` y `Tipo` e intenta que el texto de la columna `Estado` se muestre en una sola línea.

### 7

En el informa de `Auditoría de cobertura` en el <DataTable> que muestra la información, en la columna `Prácticas asociadas...` muestra las prácticas una encima de otra para que se puedan leer. En toda la tabla, si un texto es truncado, se colocará el texto íntegro en un tooltip para que sepueda leer al pasar el ratón por encima.

### 8

Al borrar una clase en la sección `Eliminar clase` se eliminan los datos de todas las evaluaciones (que pertenezcan a ese curso), además también debería eliminar l asociación entre prácticas y CE en la tabla `trabajan` de todas las prácticas que pertenezcan a alguna evaluación del curso eliminado. Además, advierte esta información como una línea extra en el apartado `Advertencia de Borrado en Casacada` en esa página.

### 9

En la sección de `Evlauación` -> `Asignación de CE` en el componente donde se muestran los RA y los CE se deberíamostrar el color del texto en colores en función de si un CE ya ha sido asignado a una práctica (color gris) o no (color blanco), además, si ya tiene asignado un porcentaje en otra práctica se debe mostrar a modo de placeholder para indicar si está totalmente asignado o no. El color de los RA también cambiará de color: blanco si no hay ningún CE de los suyos asignado, naranja si hay alguno asignado pero su cobertura no es total y verde si la cobertura del RA es total.

### 10

En la sección `Calificar`, el <DataTable> que muestra la información de los discentes y las notas, crea dos botones y sitúalos justo encima de del componente <DataTable> para que se pueda ordenar a los discentes por `Nombre` y por apellidos `Apellidos`. Sigue manteniendo los datos de la tabla tal cual los tienes.

### 11

En la sección `Discentes` -> `Ficha e informe del discente` en el <DataTable> donde aparecen las prácticas, quita el enuncido de la tabla y deja solo el nombre de la práctica.

### 12 (revisión informes)

¡Hola! Vamos a revisar nuestra aplicación para cambiar algunas cosas que no funcionan como deben. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es revisar algunos informes. En la carpeta @docs/casos-de-uso econtrarás los casos de uso para genera los informes de la aplicación (son los que empiezan por 12). Revísalos para saber qué se ha hecho.
Algunos informes no fucnionan de forma correcta y quiero que los corrijas:

- el informe `Acta por trimestres` no diferencia entre cursos y siempre me muestra el mismo listado de discentes,
- el informa `Auditoría cobertura CE` tampoco diferencia por cursos y simepre muestra los mismos datos entre cursos,
- el informe `Análisis de dificultad` es interesante que el <DropDown> de las prácticas muestre sólo las prácticas del curso seleccionado y no todas.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

### 13 (revisión informes)

Por favor, si no lo has hecho ya, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Seguimos revisando informes y quiero cambiar el informe `Calificaciones pendientes` para que muestre la información de manera más rápida. En lugar de tres <DropDown> sólo existirá el de `Curso académico`. Al seleccionarlo se mostrarán los módulos que forman parte del curso en un sistema de pestañas en donde se genera una pestaña por módulo. Dentro de cada pestaña se muestran las prácticas pendientes de calificar agrupadas por evaluación.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 14 (ampliación de tablas en mantenimiento)

Por favor, si no lo has hecho ya, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Ahora vamos a la sección de matenimiento (revisa el caso de uso en la carpeta @docs/casos-de-uso/02-herramientas-mantenimiento.md). Quiero crear una nueva sección en el menú de `Herramientas` justo debajo de `MANTENIMIENTO` para realizar el mismo mantenimiento que el resto de tablas pero esta vez con las tablas "sensibles" y con las que hay que tener especial cuidado: imparte, evalua, trabajan, ce_curso y ra_curso. Da un nombre significativo a esta nueva sección (a mí no se me ocurre ninguno).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 15 (cambio de panel de control)

¡Hola! Vamos a revisar nuestra aplicación para cambiar algunas cosas que no funcionan como deben. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Quiero que revises el panel de control de la aplicación para revisarla. Las estadísticas que salen son correctas, pero hay cosas que hay que calcularlas sólo del año en curso (el más reciente por defecto). Eso sí, quiero que existe una forma de cambiar las estadísticas por curso con un <DropDown> con los cursos.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 16 (filtrado discentes por curso)

Por favor, si no lo has hecho ya, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestro trabajo es aplicar el filtro por curso en el apartado `Discentes` de la aplicación. De momento sólo existe un filtro en función del estado del discente, pero quiero que aparezcan los listados asociados a los cursos (como en el caso anterior). Aparecerá un <DropDown> junto al botón de `Actualizar` que permitirá elegir el curso y sólo se mostrarán los discented matriculados en ese curso (manteniendo los filtros de activo o inactivos por si alguno se da de baja durante el curso). Además, quiero que revises el informe que se muestra de cada alumno para que consulte sus datos referidos al año seleccionado.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 17 (informe discente)

En el informe detallado del discente en el apartado `Discentes`, quiero que añadas el gráfico de `Mapa de competencias (Radar)` del informe `Competencias individual` justo encima del listado de sus prácticas para tener un vistazo rápido a las competencias adquiridas. Cuando se pulse sobre un botón con el texto `Ver informe de competecias completo` que se mostrará debajo a la derecha de forma discreta, conducirá al informe completo de `Competencias individual` de ese discente.

## Para el proyecto nuevo

## Prompt para la creación del Taller de prácticas

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql y presta atención a las tablas `Practicas` y `Versiones`.

Nuestra tarea de hoy es construir una herramienta para poder gestionar las prácticas y sus versiones. Lee detalladamente el caso de uso en @docs/casos-de-uso/14-creacion-taller-practicas.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en src/pages/TallerPracticas.jsx o similar) para ver cómo está estructurado y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## REFACTORING (VERSIONES) Prompt para asignación de evaluación

¡Hola! Hemos actualizado nuestro modelo de base de datos para incluir un sistema de versiones y necesitamos refactorizar el caso de uso de Creación de Evaluaciones.

Por favor, lee atentamente el nuevo esquema en @ESQUEMA.sql. Presta especial atención a cómo la tabla `evaluan` ahora se relaciona con `Versiones` mediante `id_version` en lugar de `Practicas` directamente. A continuación, lee las instrucciones de refactorización en @docs/features/05-3-modificación-versiones.md.

Actúa como un Tech Lead Frontend y ejecuta lo siguiente:

    Modifica el servicio de evaluaciones para que, al obtener las prácticas disponibles de un módulo, haga un JOIN con la tabla Versiones y filtre únicamente aquellas versiones donde `activa` = `true` (sólo debe haber una versión a `true` por práctica).

    Actualiza la vista de asignación para que la lista visualice correctamente los datos combinados (Nombre de la práctica + datos de su versión activa).

    Refactoriza la función de guardado (inserción en la tabla evaluan) para que inserte el id_version y no el de la práctica.

Asegúrate de revisar que ninguna parte del componente intente usar un id_practica para escribir en la tabla evaluan.

 - Crer prácticas y un curso para ir comprobando que todo funciona bien
 - para continuar la sesión: agy -c o (mejor opción) agy --conversation=b164902b-f429-4e5a-a81e-e1679def5f8a

## REFACTORING (VERSIONES) Prompt para creación de prácticas Herramientas


# Prompts para la creación de una aplicación compleja com IA y Antigravity CLI 2.0

## Prompt Genérico

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir [XXX]. Lee detalladamente el caso de uso en @docs/casos-de-uso/[XXX].md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en `src/pages/[XXX].jsx` o similar) y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## Prompt maestro de incialización

¡Hola! Vamos a inicializar la arquitectura base para nuestro proyecto de Administración de cursos.
Por favor, lee detenidamente los archivos @docs/CONVENCIONES.md y @docs/LAYOUT.md, y ten en cuenta que nuestra base de datos (@docs/ESQUEMA.sql) estará alojada en Supabase.
Actúa como un Tech Lead especialista en cliente y React y ejecuta, paso a paso, lo siguiente:

- Inicialización: crea un nuevo proyecto de React con Vite en este mismo directorio (sin borrar mis archivos ni carpetas).
- Dependencias: instala las librerías core que definimos: react-router-dom, swapy, primereact, primeicons, @primereact/themes y también el cliente @supabase/supabase-js.
- Estructura base: crea la estructura de carpetas en src/ (components, pages, hooks, services, utils) tal como indica el archivo de convenciones.
- Configuración UI: configura el PrimeReactProvider en main.jsx (o main.tsx) inyectando estrictamente el tema Nano de @primereact/themes.
- App Shell (Layout): genera el componente layout principal (LayoutPrincipal.jsx) basándote estrictamente en las instrucciones de @docs/LAYOUT.md (Cabecera, Menú lateral, Pie de página). Usa componentes de PrimeReact.
- Enrutamiento: configura react-router-dom con el layout principal y crea componentes "esqueleto" (vacíos, solo con un título) para las rutas principales (especificadasd en @docs/LAYOUT.md)
- Entorno: utiliza el archivo .env.local preparado para Vite con las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY, y un archivo src/services/supabaseClient.js configurado con esas variables.

Importante: Aún NO implementes la lógica de negocio de las páginas ni los casos de uso. Limítate a construir el esqueleto, la navegación y la configuración visual. Confírmame cuando hayas terminado para que pueda probar que el proyecto levanta correctamente.

## 01 Panel de control

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir el panel de control inicial. Lee detalladamente el caso de uso en @docs/casos-de-uso/01-dashboard.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en `src/pages/PanelControl.jsx` o similar) la creas o renombras la página Dashboard.jxs a PanelControl.jsx tanto en su fichero, función que crea el componente, el exports y los imports de otros componentes que lo useny si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso. Tambien cambia el enlace de la ruta en la entrada en el menú principal.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta /components separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 02 Mantenimiento CRUD

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir las tablas de mantenimiento de las tablas tanto principales como las de relación.

En el menú principal `Herramientas` tienes entradas de submenú para cada tabla que conducen a paǵinas para cada tabla. Utilízalas para contener el contenido y crea las que no existen.

Lee detalladamente el caso de uso en @docs/casos-de-uso/02-herramientas-mantenimiento.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en `src/pages/HerramientasPagina.jsx` o similar) y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página (si no existe, la creas). Divide la vista creando subcomponentes en la carpeta `/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Antes de crear un componente, revisa su existe en `src/components` y si es posible lo reutilizas.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 03 Inicio de sesión

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir construir un sistema para poder inciar sesión. Lee detalladamente el caso de uso en @docs/casos-de-uso/03-sesion-de-ususario.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página (si no existe, la creas). Divide la vista creando subcomponentes en la carpeta /components separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Antes de crear un componente, revisa su existe en `src/components` y si es posible lo reutilizas.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 04 Clases adminstración

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir un sistema para la administración de clases (creación, modificación y borrado). Lee detalladamente el caso de uso en @docs/casos-de-uso/04-creacion-cursos.md. Antes de escribir código, inspecciona el archivo de la página actual (seguramente en `src/pages/ClasesPagina.jsx` o similar) y si no existe la creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Antes de crear un componente, revisa su existe en `src/components` y si es posible lo reutilizas.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 04 revisión

Se ha cambiado el concepto de la tabla `Cursos` aunque no la estructura: ahora los cursos académicos serán tratados como clases (aunque la tabla sea Cursos). La idea es que se pueda repetir un módulo en el mismo curso (por ejemplo impartir SOM a 1SMR A y a 1 SMR B). No hay que hacer cambios tñecnicos pero sí metodológicos:

- en todos los pasos del <Stepper> cambia las referencias curso académico, curso o cosas así por la de `Clase`.
- en el paso 1, ya no existe la posibilidad de selccionar un curso/clase existente: hay que crearla siempre desde cero, por lo que muestra siempre el formulario para su creación,
- en ese formulario sugiere los valores a los siguientes inputs: el año actual en `Año lectivo` (por ejemplo 2026 para este año), el texto `IES Poeta PAco Mollà (Petrer)` en el input `Centro Educativo`. Las fechas de inicio y fin ya no son opcionales.

### Revisión 04

Hay que cambiar cosas:

- en los <DropDown> de selección de curso no utilices <Tag> para mostrar el año del curso (elimina esos tags allí y en todos los <DropDown> de los seis pasos (si existen))
- en el paso 1 muestra las dos opciones en pantalla `Creación de un curso nuevo` o `Selección de un curso existente`: si se selecciona la primera aparece el formulario de creación de curso integrado en la página y si se elige la otra paarece el <DropDown> para seleccionar el curso.
- en todos los **<DataTable>** con paginación siempre se mostrará la selección de elementos a visualizar con **5, 10, 15, 20 y 25 elementos**. Además la paginación siempre se mostrará en la **parte superior** de la tabla.
- en el listado de Discentes (apartado 3) debe aparecer un filtro para filtra por activo/inactivo que filtraá si los discentes están o no activos.
- en el apartado 5, muestra las opciones de `Empezar desde cero` y `Heredar programación de...` es dos opciones con un radio una encima de la otra y con una breve descripción de lo que implica cada elección. Si se selecciona la de `Heredar` aparece el listado de cursos en un <DropDown> (sin <Tags>).
- en el apartado 6 no uses <Tag> para mostar la información de Año, Siglas y utiliza texto. Además en el listado de `Discentes seleccionados` debe aparecer en un listado vertical sin <Tag> sólo el texto.

## 00 Creación de componentes base

Rol y Contexto: eres un desarrollador Senior en React y PrimeReact. Tu tarea es crear la librería de componentes UI base para evitar la duplicación de código en nuestro ERP educativo.

Tarea: crea los componentes especificados en el caso de uso `docs/casos-de-uso/00-componentes-base.md` para crear los componentes reutilizabñles que se utilizarán en el resto de la aplicación. Genera esos componentes asegurando que cumplen el Principio de Responsabilidad Única.

## 00 Revisión del código hecho (casos de uso del 01 al 04)

Rol y Contexto:eres un desarrollador Senior en React. Hemos implementado un sistema de componentes base en src/components/common/.

Tarea: refactoriza el código de las páginas creadas en los Casos de Uso 1 al 4 (como la gestión de Cursos, Módulos y Ciclos).

Instrucciones estrictas:

- analiza los archivos de la carpeta src/pages/.
- localiza cualquier título <h1> o <h2> que vaya seguido de un divisor y sustitúyelo por el componente <HeaderPagina titulo="..."/>.
- localiza los <Dropdown> de PrimeReact utilizados para seleccionar Ciclos,Cursos,Clases, Discentes, Evaluación o Módulos y sustitúyelos por su selector. Asegúrate de pasar las props correctas y comprueba su funcionamiento.
- reemplaza los botones sueltos de Guardar, Cancelar o Eliminar por <BotonAccion> asegurándote que reciben los parámetros correctos,
- **No modifiques la lógica de los Custom Hooks** (useDatos), céntrate exclusivamente en limpiar y unificar el JSX de las vistas importando los nuevos componentes.

Ejecuta los cambios y asegúrate de que no se rompe ninguna importación.

## 09 Importación CSV

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir una nueva herramienta para la importación masiva de datos. Lee detalladamente el caso de uso en @docs/casos-de-uso/09-importacion-csv.md. Antes de escribir código, crea el archivo de la página src/pages/ImportacionPagina.jsx. y creas de forma adecuada para contener las funcionalidades especificadas en el caso de uso.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks o Servicios necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 09 Revisión

Hay cosas que cambiar:

- en la sección `Copias de seguridad`, los datos deben exportarse en CSV. Añade un boton junto al de exportar en JSON pero que exporte los datos a CSV separado por el cacater punto y coma (;) (no se usa las comas ya que algunos campos de texto las utiliza, si existe una manera de evitar que los datos no se exposrten de forma correcta al contener comas, impleméntalo y cambia el punto y coma (;) por la coma (,) para separar las columnas).
- en la sección `Importación masiva de datos`, incluye también las tablas `Practicas` y `Versiones` para importar.
- en la sección `Clonado curso`, utiliza el componente <SelectorClase> de la carpeta `src/components/common` y quita el <DropDown> que existe para seleccionar la clase a clonar. Además, el contenido de esta sección no se ajusta al ancho de la página como lo hace el resto. Arreglalo.

## 29 Calendario escolar

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir crear un espacion en la aplicación para definir la estructura temporal de la clase. Lee detalladamente el caso de uso en @docs/casos-de-uso/29-calendario-escolar.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 29 revisión

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es revisar el caso de uso en @docs/casos-de-uso/29-calendario-escolar.md. Se han aplicado cambios en la tabla `Festivos` que ha sido renombrada a `Calendario_Eventos`, presta atención a esa tabla y a sus nuevas columnas.

Lee atentamente el caso de uso @docs/casos-de-uso/29-revision-calendario.md y haz los cambios necesarios para implementar las nuevas fucionalidades pero respetando las partes del caso de uso anterior que no han sido modificadas por el nuevo (29-revisión-calendario.md).

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 29 revisión 2

En el calendario hay un error de base: todos los eventos deben ser únicos y no pertenecer a un curso determinado, sino que si hay un evento en el calendario afecta a todos los cursos/clases por igual, por lo que no es necesario la distinción entre cursos/clases. El calendario debe comportarse como un ente único que afecta a todos los cursos/clases por igual.

La fecha de inicio espefificada en cada curso/clase no se utiliza en esta característica. Por lo tanto, no debes guardar id_curso en los eventos (será null). En la sección incial (donde se elige el curso/clase) quita todos los elementos con la excepción de los botones `Imprimir en PDF` y `Añadir periodo`.

Además, añade un <DrpDown> nuevo para filtrar los eventos que aparecen en el calendario por años (será una consulta que muestre los años únicos en la columna `anyo` de `Cursos` que servirá para filtrar los eventos desde el 1 de septiembre del año seleccionado hasta el 31 de agosto del año siguiente al seleccionado.

## 29 revisión 3

Hay cosas que cambiar:

- en el cálculo de `días lectivos` y `semanas estimadas` hay que descontar el mes de agosto que es el periodo de vacaciones legal (debería marcarse con el color del fin de semana), pero no cuentan como días no lectivos para el curso.
- El <DropDown> que muestra los años debería mostrar sus valores como `2026/2027` para el año 2026 (aunque su valor real sea 2026, es por formato visual nada más). Además, debe estar en la misma fila que el texto `Año académico` y el resto de botones.
- en la impresión en PDF la página debe estar colocada en vertical y conotro color de texto ya que el fondo de la página es blanco y no se puede leer.
- la leyenda dbe estar encima del calendario,
- la sección de ayuda del final debe desaparecer (ya no es necesaria).

## 30 Gestión de horarios

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir crear un espacion en la aplicación para definir el horario semanal del docente. Lee detalladamente el caso de uso en @docs/casos-de-uso/30-gestion-horarios.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 30 revisión horarios

Hay que revisar algunas cosas:

- elimina el selector de curso general que está a la derecha del título de la sección `Gestor de horarios...`. En su lugar muestra un <DropDown> que mostrará los años en los que existen cursos (columna `anyo` de la tabla `Cursos`) y que se mostrá del mismo modo que en la sección `Calendario escolar`. Este <DropDown> filtrará los cursos por año que se mostrarán en el resto de pestañas de esta sección.
- en la pestaña `Horario por curso` hay que hacer dos cosas:
  - elimina el selector de curso general y
  - se van a mostrar los cursos disponibles filtrado por el <DropDown> de año creado (en una fila y como botones como se muestran ahora mismo) pero filtrados a los del curso actual (columna `anyo` de la tabla `Cursos`), que son los que van desde el mes de septiembre del año del curso actual hasta el mes de agosto del año siguiente.
  - Cuando se muestra un horario existe un carcter "+" para añadir una clase que debería estar cebtrado en la celda tanto vertical como horizaontalmente.
  - en el popup que se muestra al hacer clic y desmarcar el tick `Es mi clase...` cambia el input de `Nombre de la Asignatura...` por el mismo <DropDown> que has utilizado a la hora de elegir módulo si es mi clase.
  - cuando muestres mi horario docente no muestres el texto `No lectiva` en las celdas con horas no lectivas (deja ese espcion para la descripción de la hora)

  ## 30 revisión  horarios 2

  Hay un problemilla: al cambiar el año académico las tareas que se añaden en la sección `Mi horario docente(blobal)` se
  mantienen entre años escolares y ni deberías ya que los horarios son diferentes entre años académicos. Al cambiar de año
  académico no se debería mostrar las horas marcadas en esta sección. Además, es posible que algunas de las tareas
  incluidas en esta sección `Mi horario docente...` sean lectivas para el cálculo de horas lectivas del horario pero no
  para los módulos. Añade una opción de indicar si es lectiva o no al introducirla en la ventana popup que se abre.

1.41M in | 50.8k out | 34.8k thinking
● Bash(git diff src/components/horarios/DialogoTareaNoLectiva.jsx src/hooks/useHorarios.js src/pages/Ho...) (ctrl+o to
expand)

  Se han resuelto los dos puntos solicitados:
  
  1. Aislamiento de tareas de Mi horario docente (global) por año académico:
      • En HorarioPagina.jsx, anteriormente se devolvía if (!h.id_curso) return true;, lo que hacía que las tareas
      personales sin curso directo se mostraran en todos los años académicos.
      • Ahora se comprueba el curso al que pertenece la sesión horaria de la tarea (mapaSesiones.get(h.id_sesion)?.
      id_curso) contra la lista de cursos del año escolar seleccionado (idsCursosValidos). Al cambiar de año académico,  
      las horas y tareas añadidas en otros cursos escolares quedan totalmente filtradas y no se mezclan.
  2. Opción de indicar si la tarea es lectiva o no en la ventana emergente:
      • En DialogoTareaNoLectiva.jsx, se ha añadido un <Checkbox> interactivo con texto explicativo: «Es hora lectiva
      (computa en el total de horas lectivas)», permitiendo clasificar actividades como tutorías lectivas, coordinaciones
      o jefaturas que computan como lectivas para el docente sin pertenecer a un módulo escolar de alumnos.
      • Las sugerencias de tareas frecuentes ahora preconfiguran automáticamente esta opción (por ejemplo, Tutoría de
      alumnos, Coordinación docente y Jefatura de Departamento como lectivas; Guardias y Reuniones como no lectivas).
      • En useHorarios.js y HorarioPagina.jsx, se ha actualizado el cómputo de horas semanales para que las tareas
      marcadas como lectivas sumen a Horas Lectivas y las no marcadas sumen a Horas No Lectivas.
      • En CuadriculaMiHorario.jsx, las tareas docentes lectivas se diferencian visualmente con borde y fondo azul junto
      a una insignia distintiva Lectiva, manteniendo el estilo anaranjado para las actividades complementarias o no
      lectivas.
  
## 30 revisión horarios 3

Hay que hacer cambios:

- cambio de enfoque: los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los texto de este caso de uso,
- en la pestaña `Horarios por cursos` (o clases si ya has cambiado el texto) deben aparecer siempre las clases independientemente si se han establecido sus tramos o no. De hecho, al pulsar sobre el botón `Configurar tramos` aparecerá el popup para generar los tramos de igual modo que aparece al pulsar en el botón `Generar tramos predeterminados`. Una vez generados los tramos aparecerá el horario para ese grupo,
- añade un botoón para eliminar todos los tramos y el botón `Añadir manualmente` en la pestaña `Horarios por cursos/claes`,
- elimina la pestaña `Configuración de tramos` ya que no se utilizará a partir de ahora.

## 18 Gestión de unidades de trabajo

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es crear un espacio para asignar prácticas (versiones) a las unidades de trabajo. Lee detalladamente el caso de uso en @docs/casos-de-uso/18-gestion-unidades-trabajo.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 18 revisión (se hizo en Asus y esta revisión en Ryzen)

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es revisar el estado de un espacio para estimar la temporización de los contenidos de un módulo. Lee detalladamente el caso de uso en @docs/casos-de-uso/18-gestor-unidades-trabajo.md. ya está construido pero hay que revisar algunas cosas.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Hay que revisar:

- cambio de enfoque: los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los texto de este caso de uso,
- elimina el <DropDown> de `Modulo` ya que la clase elegida ya está asiganda a un módulo y será a es módulo al que se le asignen las UT,
- asigna el mismo margin a los botones de la derecha ya que algunos están pegados,
- en el popup para la creación de unidade de trabajo: quita los botones + y - para modificar el valor del input,
- cuando se muestra unidad de trabajo como UT1 hay que incluir un cero para delante si el valor de la unidad es menor a 10 (por ejemplo UT01),
- de esta sección, elimina el uso de la biblioteca Swapy y, en lugar de mostrar el contenido de la versión, añadel el número de la UT para que, al pulsarla, se añada a esa unidad de trabajo (así se ahorra el uso de Swapy),
- hay que rediseñar este apartado para que se muesntren siempre dos columnas: una con el listado tabular de UT y otro con el de las versiones que se añadirán pulsando sobre el número de la UT. Para eliminar una verisón de una UT existirá un botón que relizará esa tarea.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 19 Temporización

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es crear un espacio para estimar la temporización de los contenidos de un módulo. Lee detalladamente el caso de uso en @docs/casos-de-uso/19-temporizacion.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 19 revisión (se hizo en Asus y esta revisión en Ryzen)

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es revisar el estado de un espacio para estimar la temporización de los contenidos de un módulo. Lee detalladamente el caso de uso en @docs/casos-de-uso/19-temporizacion.md. Ya está construido pero hay que revisar algunas cosas.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Hay que revisar:

- cambio de enfoque: los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los texto de este caso de uso,
- crea un <DropDown> delante del que ya existe con el listado de  los años académicos para poder filtrar las clases. Se deben mostrar los años con el nombre completo (por ejemplo, para el año 2026 debe mostrar `2026/2027`),
- sustituye el <DropDown> `Módulo formativo` por `Clase` y filtra los cursos que sólo pertenezcan al curso actual (seleccionado en el anterior <DropDown>),

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 19 revisión de la revisión

Hay que cambiar algunas cosas:

- el <DropDown> de `Clase` muestra un listado erróneo: debe mostrar las clases del año académico seleccinado,
- al cambiar de orden una UT se desactiva la opción de cambiar de fecha (<DatePicker> desactivado) y no debería suceder,
- en el listado de UT elimina las columnas de `Nombre de la Clase`, `Estado` y `Observaciones` (que será mostrado como un <TextArea> al pulsar un botón en la columna acciones),
- ajusta el andho de las columnas para que se vea toda la información en el espacio de la tabla,
- los input para las fechas no muestran las fechas elegidas (por el problema de las columnas),
- debería existir un botón parab realizar una propuesta de temporización (que aparecerá en una ventana popup) teniendo en cuenta el peso de los RA (si un RA estña asociado a una UT y es RA pesa el 20 % de la nota, el 20% de las horas denen ser para esta UT. Su temporización se calculará en función del calendario de año académico y del horario del discente). Si se acepta la propuesta, las fechas pasarán a los inputs de fechas previstas (en esa venta popup parecerá un calendario escolar de doce meses (de septiembre a agosto) con los dias lectivos y los días marcados para cada unidad en diferente colores para cada una. Al pasar el rató por encima aparecerá el nombre de la UT q¡a la que atañe),
- los botones de `Prouesta` y siguinetes deben estar en un fial debajo de los <DroopDown> de `Año académico` y `Clase` (alineado a la derecha tal y como están),
- se debe implementar alguna manera para poder editar la propuesta que se realiza (moviendo fechas en el calendario con el ratón, por ejemplo (plantea una forma de
  hacerlo)).
- las unidade de trabajo deben mostrarse con un cero delante para los número menores de 10 (UT01 en lugar de UT1). Existe una funcinonalidad programada en el caso de uso 18-gestion-unidades-trabajo.md. Usa la misma función.
- los elementos de las dos filas superiores (<DropDown> y botones) ocupan todo el ancho de la columna y deberían tener un tamaño normal como en el resto de elemntos de la app. Revisa esos tamaños,
- debe existir, debajo del listado de las UT un diagram de Grant con la temporización del curso escolar dibujando las diferentes unidades. Debajo de ese gráfico existirá el calendario que se ha mostrado en el popup con la configuración final de la temporización con la posibilidad de modificarla (de igual modo que en  el popup de `Propuesta`).

## 14 Taller de prácticas

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es crear un espacio para estimar la temporización de los contenidos de un módulo. Lee detalladamente el caso de uso en @docs/casos-de-uso/14-creacion-taller-practicas.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 14 revisión (se hizo en Asus y esta revisión en Ryzen)

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es revisar el estado de un espacio para estimar la temporización de los contenidos de un módulo. Lee detalladamente el caso de uso en @docs/casos-de-uso/14-creacion-taller-practicas.md. ya está construido pero hay que revisar algunas cosas.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Hay que revisar:

- cambio de enfoque: los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los texto de este caso de uso,
- crea un <DropDown> delante del que ya existe con el listado de  los años académicos para poder filtrar las clases. Se deben mostrar los años con el nombre completo (por ejemplo, para el año 2026 debe mostrar `2026/2027`),
- sustituye el <DropDown> `Módulo formativo` por `Clase` y filtra los cursos que sólo pertenezcan al curso actual (seleccionado en el anterior <DropDown>),
- en la parte inferior en un espacio que ocupe todo el ancho de la página, debería existir un pequeño manual de cómo utilizar esta herramienta,
- al crear una nueva práctica (popup de creación) el módulo ya se conoce puesto que cada curso está asociado a un módulo.

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 14 revisión de la revisión en Ryzen

Hay que hacer algunos cambios:

- al crear una nueva versión no se debe preguntar a qué módulo pertenece ya que está asociada a una clase y esta a un módulo,
- la columna `Tipo` se debe mostrar a través de un icono y no con un <Tag>. Elige los iconos que mejor represneten a cada tipo de práctica,
- el taller de prácticas está concebido para la creación de las prácticas, por lo que su modificación no debe ponerse aquí (en el popup de creación de versión) y mostrar tan sólo esos datos de solo lectura (si existen). Por tanto convierte los <DropDown> en texto informativo (sin usar <Tag)>)
- en ese mismo popup, en el input `Número / Código de versión` recomienda siempre el nombre del año académico al que pertenece la clase,
- no debe preguntar la clase ya que está seleccionada de antemano antes de llegar a este paso,
- en la tabla que lista las versiones, muesta la versión como texto

## 31 Centro de ayuda

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es proporcionar al usuario un manual integrado en la aplicación que explique el flujo exacto de configuración inicial. Lee detalladamente el caso de uso en @docs/casos-de-uso/31-centro-ayuda.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 16 Pesos RA y CE

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es crear un espacio para ponderar los pesos de los RA y CE que intervendrán en la evaluación. Lee detalladamente el caso de uso en @docs/casos-de-uso/16-pesos-ra-ce.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 16 revisión

Hay que implementar algunos cambios:

- cambio de enfoque: los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los texto de este caso de uso,
- los botones de la primera sección se muestran enormes (ocupan la mitad del espacio disponible y en columnas). Muestra esos botones de un tamaño acorde al estilo de la app y en una sola fila a la redecha del <DropDown> para seleccionar la clase,
- el selector de clase no funciona de forma adecuada: debe mostrar sólo los módulos que tienen alguna clase creada durante el curso académico actual (en este caso los creados entre en septiembre de 2026 y agosto de 2027),
- los desplegables deben aparecer por defecto plegados para ver el listado de RA disponibles,
- Cada RA y CE debe mostrar los campos `Enunciado` y `Descripción` truncando el texto para que se vea en una sola línea (si se trunca, aparecerá el texto completo a modo de tooltip al dejar el ratón un tiempo encima),
- en el listado de RA y CE quita la columna `Nivel`: no aporta nada
- los botones para modificar el porcentaje de los inputs deben tener un margen para que respiren y, además, deben tener la misma altura que el input que acompañan,

## 11 Mapeo de prácticas (asignación a los CE)

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es permitir al docente vincular rápidamente una practicas a Criterios de Evaluación (CE) y definir qué porcentaje del CE se cubre. Lee detalladamente el caso de uso en @docs/casos-de-uso/11-mapeo-practicas.md.

Recuerda que se ha producido un cambio de enfoque: los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los texto de este caso de uso.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 11 revisión

Hay que cambiar cosas:

- al cambiar de clase los datos se ven en la pantalla hasta que se cargan los nuevos sin una ventana de carga. Lo ideal es que al cambiar de clase apareciera una forma de espera hasta que estñen los datos cargados en pantalla,
- en las tarjetas de las prácticas no muestres el enunciado (no tiene sentido)
- en la tabla de los RA y CE:
  - el acordeón debe mostrarse colapsado desde el inicio,
  - añade un código de colores a la columna `Cobertura Global CE` blanco si es 0, naranja si su valor está entre 1 y 99, verde si es 100 y rojo si es mayor a 100.
  - ni los RA ni los CE se muestran adecuadamente: se debe mostrar el nombre + descripción (por ejemplo "RA1 Selecciona...") truncando el texto si no cabe en la cilumna y utilizanod `title` para mostrar el texto entero (como un tooltip),
  - si un CE ya tiene su cobertura al 100%, se debe desactivar en el resto de CE para evitar la sobrecobertura,
  - no me terminan de convencer los spiners para la modificación de los porcentajes ¿podrías intentar algo que no sean spinners ni botones para incrementar los valores?

Más cambios:

- conecta el slider con los Input que tienen al lado (using two-way binding) añadiendo pasos de 5 en 5 al slider,
- los RA y los CE siguen si verse de forma adecuada: tanto el icono como el texto deben verse en una sola línea,
- quita las líneas entre el nombre y descripción de los nombres de los RA y CE. Por ejemplo, cambia `RA1 -- Selecciona...` por `RA1 Selecciona...`,
- cuando todos los CE de un RA están asignados desactiva el check para que no se pueda volver a asignar,
- el código de colores no funciona de forma correcta: todos los textos están en blanco, además no hay que aplicar esos colores al fondo, sino al texto y al borde que lo rodea.
- en la barra de `Grado de asignación...` el texto debe mostrarse siempre en el centro de la barra.

Un par de cosas:

- cambia el color de fondo de todos los indicadores de la columna `Cobertura Global CE` a transparente (o el mismo color que el fondo de la celda en el que está teniendo en cuenta si está con el tema claro/oscuro),
- quiero que cambies los slider y los Input para establecer los porcentajes por un <Slider> unido a un <InputText> situándose el slider debajo del input.

## 06 Calificador

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es proporcionar una interfaz rápida y tabular para introducir las notas numéricas. Lee detalladamente el caso de uso en @docs/casos-de-uso/06-calificar-practicas.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 05 Creación de evaluación

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es proporcionar flujo de trabajo del docente para preparar las evaluaciones de un curso lectivo. Lee detalladamente el caso de uso en @docs/casos-de-uso/05-creacion-evaluacion.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 05 reedición

Actúa como un desarrollador experto en React, PrimeReact y Supabase.
Necesitamos refactorizar completamente el Caso de Uso 05 (Gestión de Evaluaciones) porque hemos cambiado el paradigma para usar un sistema manual de "Bandeja de Pendientes" (Inbox).

TAREA 1: LIMPIEZA DE CÓDIGO ANTIGUO

1. Localiza los archivos actuales relacionados con la gestión de evaluaciones relacionada con el caso de uso anterior (@docs/casos-de-uso/05-creacion-evaluacion.md).
2. Elimina estrictamente cualquier lógica que intente asignar Resultados de Aprendizaje (RAs) a una Evaluación de forma directa. Elimina dependencias de fechas para la asignación de prácticas.

TAREA 2: NUEVA IMPLEMENTACIÓN (Manual por Bandeja de Pendientes)
Basándote en el documento @docs/casos-de-uso/05-evaluacion-nueva.md , implementa el nuevo flujo:

1. Interfaz Principal: Renderiza el componente `<SelectorCurso>`. Debajo, muestra un `DataTable` listando las evaluaciones de la clase seleccionada.
2. Dialog de Creación/Edición:
   - `InputText` para el nombre de la evaluación.
   - Selector de Prácticas Huérfanas: Usa un `PickList` (o un `DataTable` con selección por checkbox) de PrimeReact.
3. Lógica de Selección: El hook debe consultar en Supabase todas las `Versiones` de ese curso que NO estén ya vinculadas a otra evaluación en la tabla `evalua`. Muestra estas prácticas disponibles para que el docente las asigne.
4. Resumen Curricular: Crea un helper que analice los RAs/CEs de las versiones movidas a la lista de "Seleccionadas", mostrando al usuario un resumen visual (ej. "RA1: 100%").
5. Guardado: Al confirmar, el sistema debe insertar/actualizar la tabla `Evaluaciones` y hacer una operación batch en la tabla `evalua` para vincular los IDs.

Mantén el patrón contenedor-presentacional y el uso de PrimeFlex así como todas las normas y restricciones del caso anterior.

## 05 reedición revisión

Hay que hacer cambios:

- no se pueden crear más evaluaciones de las establecidas durante el proeceso de creación del curso, asíq eu elimina esa funcionalidad de esta sección,
- el botñon de actualizar datos (junto al botón `Nueva Evaluación` debe ser un poco más grande y centrar horizontal y verticalmente el icono de la flecha),
- en la columna acciones elimina el botón de eliminar evaluaciones ya que no es posible hacer eso desde aquí,
- en la columna acciones, elimina el botón como todo el código que lo acomapaña (vamos a asugnar prácticas de otro modo)
- el orden de las evaluaciones simpre debe ser Primera, Segunda, Tercera, Final/Ordinaria y Extraordinaria,
- implementa un nuevo sistema de asignación de proácticas a evaluaciones:
  - al seleccionar una clase aparecen las versiones que todavía no tienen evaluación (en un área nueva justo encima  de <DataTable> de las evaluaciones</DataTable>),
  - se mostrarán como tarjetas con su nombre y versión y debajo las evaluaciones a las que pueden asignarse (todas),
  - al pulsar sobre una de ellas pasa a pertenecer a la evaluación y aparece en una nueva columna "Pŕacticas asignadas" dentro del <DataTable> de la evaluación seleccionada (desaparece de la sección donde estaba),
  - al aparecer en el <DataTable> dispondrá de un boton para desasignar esa práctica de la tabla,
- el <DataTable> de las evaluaciones no debe mostrar la paginación (nunca será necesaria).

## 17 Acta de evaluación por RA

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar el informe oficial definitivo que detalla la calificación competencial de cada discente. Lee detalladamente el caso de uso en @docs/casos-de-uso/17-acta-evaluacion-ra.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 12.2 Acta de evaluación por trimestres

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar el informe tradicional de evaluación por trimestres de cada discente. Lee detalladamente el caso de uso en @docs/casos-de-uso/12-2-informe-actas.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 01 dashboard (revisión del existente)

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar el panel de control inicial para el docente. Lee detalladamente el caso de uso en @docs/casos-de-uso/01-dashboard.md. Esta funcionalidad ya existe, así que hay que eliminar todas las funcionalildades implementadas (código incluido) e implementar estas nuevas.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 07 Discentes

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar un informe integral (360º) del rendimiento de un estudiante. Lee detalladamente el caso de uso en @docs/casos-de-uso/07-informe-discente.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 07 revisión

Hay que revisar cosas:

- en el <DataTable> de Discentes inicial, añade los filtros de activado/desactivado y un <DropDown> para elegir la clase (las más recientes arriba del selector).
- elimina la columna `Acciones` al pulsar sobre la fila se abrirá el informe del discente,
- la columna `Activo` debe mostrar un <InputSwitch> que permita activar o desactivar al discente,
- al entrar en el informe personalizado, el <DropDown> de cursos/clase no debe existir y en su lugar (en su misma posición), un botón por cada `Año académico` (obtenido de la tabla `Cursos`) mostrando para el año 2026 el texto `2026/2027`,
- se debe generar un sistema de pestañas en las que cada una será las clases matriculadas en cada año académico

Más cosas:

- cambia el <DropDown> que filtra los `Estados` por tres botones: Todos, Activos e Inactivos (en la misma posición),
- amplía un 50% el ancho del <Input> de búsqueda,
- quita el texto `Haz click en una filapara...` situado a la derecha del indicador de total discentes,
- en el listado de Discentes, en la columna `Activo` elimina el texto `Activo` situado a la derecha de cada Input en las columnas,

## 12.1 Informe de cobertura CE

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar un informe de coberturas de CE para un curso/clase. Lee detalladamente el caso de uso en @docs/casos-de-uso/12-1-informe-coberturaCE.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 12.1 revisión

Hay que cambiar cosas:

- sustituye el <DropDown> de `Cursos` por uno que muestre `Año académico` que se obtiene de la tabla `Cursos` y que mostrá los datos como `2026/2027` para el año 2026,
- al seleccioar el año académico, los curso/clases se mostrarán como botones en lugar del <DropDown> `Módulo formativo` (se mantiene el botón `Actualizar`,
- los RA y los CE debe mostrarse como un acordeón incialmente colapsado, mantén los indicadores en los CE y añade otro para los RA del mismo modo.
- el porcentaje de las `Actividades asociadas` se mostrará como un <Tag> de igual forma que se muestra al final de la línea de cada CE,
- los RA y CE deben mostrarse del siguiente modo `nombre + despricpción` por ejemplo `RA1 Selecciona...`,
- las prácticas/versiones deben mostrarse como tarjetas.

Más cosas:

- en las tarjetas de las versiones, no muestres en enunciado de la versión y quita la ponderación mostrada con un <Tag> junto al nombre. La ponderación ed la fila de abajo (junto al nombre de la versión) debe tener como color de texto verde si es 100, naranja si está entre 1 y 99 (incluidos) y rojo si es 0.
- las tarjetas de las versiones se deben mostrar en una columna junto con el nombre del CE que cubren (el nombre aparecerá truncado y mostrado en tal caso desde title) sin necesidad de un doble acordeón (los CE no lo tienen, solo los RA),
- el esilo del acordeón no se ajusta al estilo general de la app. Revísalo,
- no es necesaria la vista tabulas, elimínala junto con los botones para seccionar vista (siempe de mostrará la vista de acordeón),
- en el menú principal: la entrada `Informes` no tiene iconos y los iconos de `Evaluación` y `Planificación` son iguales. Cambia el de `Evaluación` por otro (¿una pizarra, calculadora...?).

## 12.3 Calificaciónes pendientes

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar un informe de calificaciones pendientes. Lee detalladamente el caso de uso en @docs/casos-de-uso/12-3-informe-calificaciones-pendientes.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

Hay que cambiar cosas:

- el infome debe mostrar las prácticas que no tengan nota en cualquier evaluación,
- de los tres <DropDown> deja sólo el de año académico que filtrará las clases (desaparece el selector de evaluación),
- se mostrará la infromación de dos maneras (de puee elegir con dos botones situados a la derecha sobre el listado):
  - agrupados por prácticas y al desplegar la práctica (acordeón incialmente colapsado) un listado de discentes que todavía no tienen nota. Al final del listado enlace al calificador de esa práctica,
  - agrupados por discentes pero ahora al desplegar salen las prácticas pendientes pare ese discente,

Más cambios:

- los acordeones no se adaptan al estilo general de la app. Revísalo,
- en las prácticas no muestres en enunciado y, si no tiene evaluación asigada enviará a la sección adecuada para asignarla,
- el tamaño de los <DporDown> es diferentes al resto de la app. Revisa su tamaño y ponlo igual al resto,
- acorta los textos de los <Tag> a `Sin evaluación`, `Calificar`, `Discentes` y `Prácticas`,
- no muestres la información de pendientes en `Desglose pendientes:` con un <Tag>, solo en texto destacado,
- en los <Tag> por en fondo transparente.

De nuevo, más cambios:

- en los <Tag>  que muestran la información en los acordeones, por en fondo transparente,
- el tamaño de los <DporDown> es diferentes al resto de la app. Revisa su tamaño y ponlo igual al resto,
- quiero que añadas un botón al lado de este como el de `Asignar evaluación` pero con `Calificar` que conducirá al calificador,

## 12.4 Dificultad en prácticas

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar un informe de calificaciones pendientes. Lee detalladamente el caso de uso en @docs/casos-de-uso/12-4-informe-dificultad.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 12.5 Radar competencial

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar un informe. Lee detalladamente el caso de uso en @docs/casos-de-uso/12-5-informe-radar-competencias.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

Hay que hacer ccambios:

- no necesito el desglose numérico de competencias. Elimínalo del informe,
- el nombre de los RA no es correcto (en a leyenda y el los atributos title), se muestra el nombre de este modo `RA1: RA1` cuando debería mostrar el nombre del RA más su descripción del siguiente modo `RA1: Sececciona las arquitecturas...`
- el texto de la leyenda y los rótulos de los gráficos no se ve bien en el modo oscuro,

## 12.6 Mapa de calor

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar un informe. Lee detalladamente el caso de uso en @docs/casos-de-uso/12-5-informe-mapa-de-calor.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 12.7 RA-Modulo

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar un informe. Lee detalladamente el caso de uso en @docs/casos-de-uso/12-7-informe-ra-modulo.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

Hay que hacer cambios:

- elimina la vista `Árbol` y muestra siempre la vista `Acordeon`, así que puedes eliminar los botones de selcción,
- elimina el texto `Descarga` de encima del botón `Exportar PDF`,
- por cierto, el PDS no se genera aparece el error `columns is not defined`,
- los RA ni los CE se muestra de forma correcta, deben mostrarse `nombre: descripción` por ejemplo `RA1: Seleccionalas arquitecturas...` en lugar de `RA1: RA1` como lo hace ahora. Se debe mostrar en una sola línea y truncado (si se trunca se muestra el tecto completo en title como un tooltip),
- el estilo del acordeón no se ajusta al del resto de la app, revísalo,
- no muestres los <Tag> con el número de CE en la barra del acordeón,
- en el desplegable del acordeón, elimina la descripción del resultado de aprendizaje y muestra el contenido sin nombre de columnas, ta śolo el texto con el número ed CE asociados,

## 27 agenda semanal

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar una agenda semanal previsualizada en el `Panel de control`. Lee detalladamente el caso de uso en @docs/casos-de-uso/27-agenda-semanal.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 21 agenda curricular

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar una agenda curricular. Lee detalladamente el caso de uso en @docs/casos-de-uso/21-agenda-curricular.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

Hay que cambiar cosas:

- el widget de agenda semanal que se encuentra en el panel de control es muy parecido a la agenda que se acaba de crear, por lo que transforma este caso de uso en un widget que sustituya al de `Agenda semanal` del panel de control que se estructurará así: una primera fila con dos columnas (manten el ancho actual de cada columna): a la izquierda la `Agenda de hoy` y a la derecha `Agenda escolar` mostrando la semana con las tareas pendientes (se mantendrán todas las acaraterísticas de la `Agenda escolar` esto sólo es una reubicación). En la segunda fila se colocará el widget `Accesos rápidos` mostrando las tarjetas en una sola línea.

## 24 informe de temporización

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es generar un informe para comprobar la temporización de los cursos. Lee detalladamente el caso de uso en @docs/casos-de-uso/24-informe-temporizacion.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

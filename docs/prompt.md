# Prompts para la creación de una aplicación compleja com IA y Antigravity CLI 2.0

## Prompt Genérico

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

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

## 30 Gestión de horarios

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es construir crear un espacion en la aplicación para definir el horario semanal del docente. Lee detalladamente el caso de uso en @docs/casos-de-uso/30-gestion-horarios.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

## 18 Gestión de unidades de trabajo

¡Hola! Vamos a continuar con el desarrollo de nuestra aplicación. El proyecto ya está inicializado con Vite, PrimeReact y React-Router.

Por favor, lee las reglas globales en @docs/CONVENCIONES.md y el esquema de la base de datos en @docs/ESQUEMA.sql.

Nuestra tarea de hoy es crear un espacio para asignar prácticas (versiones) a las unidades de trabajo. Lee detalladamente el caso de uso en @docs/casos-de-uso/18-gestion-unidades-trabajo.md.

Regla estricta de Componentización: no escribas toda la interfaz en el archivo de la página. Divide la vista creando subcomponentes en la carpeta `src/components` separándolos en carpetas según su fucnionalidad (por ejemplo, separa el DataTable en un componente y el Dialog del formulario en otro) y únelos en la página principal pasándoles las props necesarias. Recuerda qua debes utilizar los componentes de la carpeta `src/components/common` cada vez que necesites un componente que se ajuste a uno de ellos (NUNCA se modificarán estos componentes).

Genera el código necesario implementando los componentes de PrimeReact solicitados y creando los Custom Hooks necesarios para Supabase. Hazlo paso a paso y explícame los cambios. Recuerda comentar el código que consideres complejo en castellano, redactado en impersonal y terminando las frases con un punto.

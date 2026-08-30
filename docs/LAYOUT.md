# Disposición de la interfaz (UI Layout) y navegación

Este documento describe la estructura visual principal (App Shell) de la aplicación web y el mapa de navegación. Todo el diseño debe ser *responsive*.

## 1. Estructura principal (App Shell)

La aplicación utilizará un layout clásico de panel de administración. La pantalla se divide en las siguientes áreas:

* **Cabecera (Header / Topbar):**
  * Fija en la parte superior.
  * Debe contener el logo/título de la aplicación a la izquierda (de momento coloca un placeholder).
  * A la derecha, información del usuario logueado (avatar) y botón de cierre de sesión.
  * *Componente sugerido:* `Toolbar` o `Menubar` de PrimeReact.

* **Menú Lateral (Sidebar / Navbar):**
  * Ubicado a la izquierda, debajo de la cabecera.
  * En escritorio debe estar siempre visible. En móviles, debe ser un menú hamburguesa desplegable.
  * Contiene los enlaces de navegación principales.
  * *Componente sugerido:* `Menu` o `PanelMenu` de PrimeReact (o un `Sidebar` para la versión móvil).

* **Área de Contenido (Main Content):**
  * Ocupa el resto de la pantalla (centro-derecha).
  * Aquí es donde `react-router-dom` inyectará los componentes de las distintas páginas usando `<Outlet />`.
  * Debe tener un *padding* adecuado para que el contenido respire.

* **Pie de Página (Footer):**
  * Fijo al final del área de contenido.
  * Información simple: "Control de Notas v1.0 - [Año]".

## 2. Mapa de rutas (react-router-dom)

El menú de navegación debe apuntar a las siguientes rutas principales:

* `/` (Dashboard): Resumen general (total de alumnos, notas medias destacadas).
* `/discentes`: listado completo de estudiantes (usando `DataTable` de PrimeReact).
* `/modulos`: gestión de las materias.
* `/clases` : gestión de las clases.
* `/calificar`: vista interactiva (donde usaremos `swapy`) para asignar notas rápidamente a los alumnos por asignatura.
* `/practicas` : adminitrar prácticas y asignarlas a CE y RA.
* `/informes` : un listado de los informes a realizar con la posibilidad de exportarlos a PDF.
* `/herramientas` : menu desplegable que cuenta con varias herramientas para la aplicación:
* `/acercaDe` : versión y características de la aplicación.

## 3. Disposición interna de las páginas

* Todas las páginas deben comenzar con un título grande (Header de página) y un divisor (`Divider` de PrimeReact).
* Para la disposición de elementos internos (formularios, tarjetas), se recomienda usar una cuadrícula (CSS Grid / Flexbox) que mantenga el estilo limpio del tema Nano de PrimeReact.

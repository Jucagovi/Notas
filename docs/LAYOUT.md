# Disposición de la interfaz (UI Layout) y navegación

Este documento describe la estructura visual principal (App Shell) de la aplicación web y el mapa de navegación. Todo el diseño debe ser *responsive* y construirse exclusivamente con los estilos de PrimeReact, PrimeFlex y CSS nativo (sin Tailwind).

## 1. Estructura principal (App Shell)

La aplicación utilizará un layout clásico de panel de administración. La pantalla se divide en las siguientes áreas:

* **Cabecera (Header / Topbar):**
  * Fija en la parte superior.
  * Debe contener el logo/título de la aplicación a la izquierda.
  * A la derecha, información del usuario logueado (avatar) y botón de configuración.
  * *Componente sugerido:* `Toolbar` o `Menubar` de PrimeReact.

* **Menú Lateral (Sidebar / Navbar):**
  * Ubicado a la izquierda, debajo de la cabecera.
  * En escritorio debe estar siempre visible incluso si el scroll de la página intenta desplazarla se mantendrá fija en pantalla. En móviles, debe ser un menú hamburguesa desplegable.
  * *Componente sugerido:* `PanelMenu` (para soportar submenús anidados) o `TieredMenu` de PrimeReact.

* **Área de Contenido (Main Content):**
  * Ocupa el resto de la pantalla (centro-derecha).
  * Aquí es donde `react-router-dom` inyectará los componentes de las distintas páginas usando `<Outlet />`.
  * Debe tener un *padding* adecuado (usando clases de PrimeFlex como `p-4`) para que el contenido respire.

* **Pie de Página (Footer):**
  * Fijo al final del área de contenido.
  * Información simple: "Administración docente v1.0 - [Año]".

## 2. Mapa de rutas (react-router-dom)

El menú de navegación debe ser jerárquico para soportar todas las funcionalidades del ERP:

* **`/` (Dashboard):** Panel de control principal con widgets (Termómetro curricular, Agenda semanal, Alertas de discentes en riesgo).
* **`/planificacion` (Planificación Académica):**
  * `/planificacion/temporizacion`: Gestor visual y asistente mágico de fechas.
  * `/planificacion/programacion`: Ensamblador de la Programación Didáctica.
* **`/evaluacion` (Ejecución y Calificación):**
  * `/evaluacion/cuaderno`: Cuaderno del profesor (calificaciones masivas y rúbricas).
  * `/evaluacion/diario`: Diario de Aula (cuaderno de bitácora).
  * `/evaluacion/practicas`: Repositorio y asignación de prácticas a CE/RA.
* **`/informes` (Información Oficial):**
  * `/informes/memoria`: Generador de Memoria Anual.
  * `/informes/seguimiento`: Seguimiento trimestral de programaciones.
  * `/informes/progreso`: Diagrama de Gantt de progreso curricular.
* **`/herramientas` (Configuración y Mantenimiento):**
  * `/herramientas/exportador`: Exportación de CSV para ITACA y Aules.
  * `/herramientas/calendario`: Gestor de días lectivos y festivos.
  * `/herramientas/horarios`: Cuadrícula de tramos horarios y disponibilidad.
  * `/herramientas/mantenimiento`: Submenú para el CRUD de las tablas maestras (Ciclos, Cursos, Módulos, Discentes).
* **`/ayuda` (Documentación de ayuda):** con una pequeña guia de onboarding y algunas cuestiones más cmoplicadas.

## 3. Disposición interna de las páginas

* Todas las páginas deben comenzar con un título grande (Header de página) y un divisor (`Divider` de PrimeReact).
* Para la disposición de elementos internos (formularios, tarjetas), se prohíbe el uso de Tailwind CSS. En su lugar, se utilizará **PrimeFlex** (ej. `flex`, `flex-column`, `grid`, `col-12 md:col-6`) o, en su defecto, CSS Grid / Flexbox nativo en archivos `.css` modulares.

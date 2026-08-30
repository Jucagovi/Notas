# Reglas de Desarrollo y Convenciones del Proyecto

Este documento define el stack tecnológico, la arquitectura y las reglas de código para el desarrollo de la aplicación web de Control de Notas. Todas las respuestas y código generado deben adherirse estrictamente a estas normas.

## 1. Stack Tecnológico y Librerías Core

* **Entorno y Build Tool:** **Vite** con el plugin de React.
* **Frontend Framework:** React (Functional Components y Hooks).
* **Enrutamiento:** `react-router-dom` para toda la navegación y protección de rutas.
* **Interacciones Avanzadas (Drag & Drop):** Utilizar la librería **`swapy`** para cualquier interfaz que requiera arrastrar y soltar.
* **Para la generación de gráficos:**: Se usará `Chart.js` para cuando tengas que crear cualquier gráfico.
* **Para exportar los informes a ficheros PDF:** Utilizarás la biblioteca jspdf.

## 2. Sistema de Diseño y UI (¡Importante!)

* **Ecosistema UI:** Toda la interfaz debe construirse utilizando **PrimeReact** y **PrimeIcons**. 
* **Regla de Componentes:** Antes de crear un componente visual desde cero (tablas, modales, botones, formularios), el agente debe verificar si existe un componente equivalente en PrimeReact y utilizarlo.
* **Theming:** La aplicación utilizará la nueva API de Theming de PrimeReact. Se debe configurar estrictamente utilizando el tema **Nano**. El agente debe asegurarse de inyectar este tema en la configuración del proveedor principal de la app.

## 3. Arquitectura del Proyecto

* **Separación de responsabilidades:**
  * Los componentes de React deben centrarse en la vista.
  * La lógica de obtención de datos y estados complejos debe separarse en *Custom Hooks* (ej. `useDiscentes`, `useNotas`). Estos hooks utilizarán uno genérico (`useDatos`) que los aisalará del servicio de base de datos. useDatos ofrecerá al resto de hooks las herramientas necesarias para hacer el CRUD completo a la base de datos de Supabase, así como información del estado de la comunicación.
  * Los servicios externos (llamadas a API) deben estar en una carpeta `services/`.
  * Utiliza `contextos` para evitar el `props drilling`.

## 4. Convenciones de Nomenclatura (Naming Conventions)

* **Archivos y Carpetas:** Utilizar minúsculas siempre (ej. `misdocumentos`).
* **Variables y Funciones:** Utilizar `camelCase` (ej. `calcularNotaMedia`).
* **Componentes:** Utilizar `PascalCase` (ej. `EstudianteComponente`) y crearlos siempre componentes funcionales con funciones flecha y el export en la última línea del archivo.
* **Extensiones de ficheros:** Para componentes que contengan código JSX utilizar siempre `.jsx` y para ficheros de JavaScript `.js` (incluidos los hooks que sólo tengan código de JavaScript).
* **Constantes Globales:** Utilizar `UPPER_SNAKE_CASE` (ej. `NOTA_MAXIMA`).
* **Idioma del Código:** Todo el código (variables, funciones, comentarios) debe escribirse en **castellano**.

## 5. Reglas Específicas y Buenas Prácticas

* **Imports y nombres de los ficheros:** colocar siempre la extensión de los ficheros en su importación y en cualquier refrencia a ellos (ya sean componentes, css, javascript o de cualquier otro tipo).
* **Manejo de Errores:** Evitar los `try/catch` vacíos. Todo error debe registrarse en la consola (o logger) y devolver una respuesta HTTP estructurada al frontend (ej. `{ "error": "Mensaje", "status": 400 }`).
* **Comentarios:** Comentar bloques de código complejos y la lógica de negocio; el código debe ser auto-explicativo, pero se deben añadir comentarios que expliquen qué se está haciendo. Estos comentarios deben ser redactados en impersonal (Ejemplo: "se descargan" en lugar de "descargo" o "se traen" en lugar de "traigo"). Recuerda que las frases terminan con un punto (que deberás poner) y que después del signo de puntuación dos puntos (:) no se escribe con mayúscula.
* **Gestión Visual de Calificaciones (Colores)**: existe una escala cromática estandarizada basada en la nota (0-100): Suspenso (<50, Rojo), Suficiente (50-59, Naranja), Bien (60-69, Amarillo), Notable (70-89, Verde), Sobresaliente (90-100, Azul). Está estrictamente prohibido "quemar" (hardcodear) colores condicionales en los componentes. El agente debe crear (o importar si existe) la utilidad getColorNota(nota) en src/utils/coloresNota.js que devolverá las clases de color de PrimeReact y los códigos hexadecimales para los gráficos. Todo componente que muestre una nota debe usar este helper.

## 6. Lógica de Negocio Principal (Contexto)

* Integración visual: Las vistas principales usarán componentes de PrimeReact (como `DataTable` para listados) y `swapy` para interacciones fluidas, por ejemplo, arrastrar un alumno a una columna de "Aprobados" o "Suspensos".
* **Roles:** El sistema sirve para que los docentes gestionen alumnos, asignaturas y sus calificaciones (no hay vista de discentes).
* **Sistema de Calificación:** Las notas son siempre numéricas, no admiten decimales, y su valor estricto es de 0 a 100.
* **Eliminación:** Los borrados de alumnos o asignaturas deben ser en cascada (eliminar un alumno borra sus notas).
* **Detalle de módulos:** La lógica específica de cada pantalla se encuentra en la carpeta `/docs/casos_de_uso/`.

# Reglas de Desarrollo y Convenciones del Proyecto

Este documento define el stack tecnológico, la arquitectura y las reglas de código para el desarrollo de la aplicación web de Control de Notas. Todas las respuestas y código generado deben adherirse estrictamente a estas normas.

## 1. Stack Tecnológico y Librerías Core

* **Entorno y Build Tool:** **Vite** con el plugin de React.
* **Frontend Framework:** React (Functional Components y Hooks).
* **Estilos y Utilidades:** PrimeFlex CSS para la maquetación y espaciados.
* **Enrutamiento:** `react-router-dom` para toda la navegación y protección de rutas.
* **Interacciones Avanzadas (Drag & Drop):** Utilizar la librería **`swapy`** para interfaces de tarjetas o elementos sueltos. Para reordenar filas dentro de tablas, usar estrictamente la función nativa `RowReorder` de PrimeReact.
* **Gráficos e Informes:**
  * `Chart.js` para la generación de gráficos visuales.
  * `jspdf` para exportar informes inmutables a PDF.
  * `docx` para generar documentos editables (Memorias, Programaciones, Seguimiento).
* **Calendarios:** `@fullcalendar/react` (con plugins daygrid/interaction) para las agendas curriculares visuales.

## 2. Sistema de Diseño y UI (¡Importante!)

* **Ecosistema UI:** toda la interfaz debe construirse utilizando **PrimeReact** y **PrimeIcons**.
* **Regla de Componentes:** antes de crear un componente visual desde cero (tablas, modales, botones, formularios), el agente debe verificar si existe un componente equivalente en PrimeReact y utilizarlo. Además, comprobará si existe un componente que encaje en el código previo para evitar duplicidades (por ejemplo: si existe un <DropDown> para el listado de `Cursos` no crear uno nuevo y reutilizarlo en otros lugares de la página).
* **Theming:** la aplicación utilizará la nueva API de Theming de PrimeReact configurada estrictamente con el tema **Nano**. El agente debe inyectar este tema en el proveedor principal.
* Todas la tablas deben ajustar su tamaño de las columnas para que se vean todos los datos.
* En las tablas que se generen, la información debe mostrarse siempre en una sola línea (salvo componentes) y, si se produce desbordamiento, se trunca el texto y se utiliza tooltip para mostrar el texto completo al mantener el ratón por encima.
* Para fechas y moneda (si guese necesario) utiliza las fechas y moneda de España donde la semana empieza el lunes.
* En los componentes **<DropDown>** **NUNCA** utilces <Tag> o similares para resaltar la información (a menos que se pida explicitamente).
* En todos los **<DataTable>** con paginación siempre se mostrará la selección de elementos a visualizar con **5, 10, 15, 20 y 25 elementos**. Además la paginación siempre se mostrará en la **parte superior** de la tabla.

## 3. Arquitectura del Proyecto

* **Separación de responsabilidades:**
  * Los componentes de React deben centrarse exclusivamente en la vista.
  * La lógica de obtención de datos y estados complejos debe separarse en *Custom Hooks* (ej. `useDiscentes`, `useNotas`).
  * Estos hooks utilizarán uno genérico (`useDatos`) que los aislará del servicio de Supabase. `useDatos` ofrecerá las herramientas para el CRUD y gestionará el estado de la comunicación (loading, error).
  * Los servicios externos puros (generadores de archivos) deben estar en `src/utils/` o `src/services/`.
* **Gestión de Estado (Sin Context Hell):** utiliza Context API **ÚNICAMENTE** para estados globales de UI (ej. AuthContext, ToastContext). Queda **estrictamente prohibido** usar Contextos para almacenar o cachear datos de tablas de la base de datos para evitar re-renderizados masivos.

## 4. Convenciones de Nomenclatura (Naming Conventions)

* **Archivos y Carpetas:** utilizar minúsculas siempre (ej. `misdocumentos`).
* **Variables y Funciones:** utilizar `camelCase` (ej. `calcularNotaMedia`).
* **Componentes:** utilizar `PascalCase` (ej. `EstudianteComponente`) y crearlos siempre componentes funcionales con funciones flecha y el export en la última línea del archivo.
* **Extensiones de ficheros:** para componentes que contengan código JSX utilizar siempre `.jsx` y para ficheros de JavaScript `.js` (incluidos los hooks que sólo tengan código de JavaScript).
* **Constantes Globales:** utilizar `UPPER_SNAKE_CASE` (ej. `NOTA_MAXIMA`).
* **Idioma del Código:** todo el código (variables, funciones, comentarios) debe escribirse en **castellano**.

## 5. Reglas Específicas y Buenas Prácticas

* **Imports y nombres de los ficheros:** colocar siempre la extensión de los ficheros en su importación y en cualquier referencia a ellos (ya sean componentes, css, javascript o de cualquier otro tipo).
* **Manejo de Errores:** evitar los `try/catch` vacíos. Todo error debe registrarse en la consola (o logger) y devolver una respuesta HTTP estructurada al frontend (ej. `{ "error": "Mensaje", "status": 400 }`).
* **Comentarios:** comentar bloques complejos y la lógica de negocio en estilo impersonal (Ejemplo: "se descargan" en lugar de "descargo"). Las frases terminan con un punto, y después de dos puntos (:) no se escribe con mayúscula.
* **Gestión Visual de Calificaciones (Colores)**: existe una escala cromática estandarizada (0-100): Suspenso (<50, Rojo), Suficiente (50-59, Naranja), Bien (60-69, Amarillo), Notable (70-89, Verde), Sobresaliente (90-100, Azul). Prohibido hardcodear colores condicionales. El agente debe crear `getColorNota(nota)` en `src/utils/coloresNota.js` que devolverá las clases o hexadecimales. Todo componente que muestre una nota debe usar este helper.

## 6. Lógica de Negocio Principal (Contexto)

* **Roles:** El sistema sirve para que los docentes gestionen alumnos, asignaturas y sus calificaciones. Los discentes no tienen acceso al sistema, a excepción de las vistas públicas de solo lectura generadas mediante Enlaces Mágicos (Visor del Discente).
* **Sistema de Calificación:** Las notas son siempre numéricas, no admiten decimales, y su valor estricto es de 0 a 100.
* **Eliminación:** Los borrados de alumnos o asignaturas deben ser en cascada.
* **Detalle de módulos:** La lógica específica de cada pantalla se encuentra en la carpeta `/docs/casos_de_uso/`.

## 7. Componentización y Principio de Responsabilidad Única (SRP)

* **Prohibido crear componentes monolíticos:** ningún archivo debe gestionar múltiples áreas complejas de la interfaz. Si una vista tiene filtros, una tabla de datos y un modal de edición, el agente **DEBE** dividir el código en múltiples archivos (ej. `MantenimientoPagina.jsx` importará a `<FiltrosMantenimiento />`, `<TablaDatos />` y `<ModalEdicion />`).
* **Patrón Contenedor-Presentacional:** las páginas (`src/pages/`) actúan como "Orquestadores" o contenedores. Son los únicos que llaman a los Custom Hooks para obtener los datos. Estos orquestadores deben pasar los datos mediante `props` a componentes presentacionales "tontos" ubicados en `src/components/`, los cuales solo se encargarán de renderizar la UI de PrimeReact.
* **Granularidad:** si un componente supera razonablemente las 150-200 líneas de código, es un indicador estricto de que el agente debe extraer partes de su interfaz a subcomponentes independientes.
* **Selectores de Dominio (Obligatorio):** Para seleccionar entidades, el agente **DEBE** utilizar los selectores especializados ubicados en `src/components/common/`:
  * `<SelectorCurso>`
  * `<SelectorModulo>`
  * `<SelectorDiscente>`
  * `<SelectorCiclo>`
* **Componentes Base (Obligatorio):** Antes de programar elementos estructurales, se **DEBEN** utilizar los siguientes componentes genéricos de `src/components/common/`:
  * `<HeaderPagina>` (Para títulos y cabeceras de página).
  * `<TablaBase>` (Wrapper para el DataTable de PrimeReact con paginación y loading estandarizado).
  * `<BotonAccion>` (Para acciones CRUD estándar).
  * `<BadgeNota>` y `<BadgeEstado>` (Para etiquetas visuales).
  * `<EstadoVacio>` (Para listados sin datos).
  * `<ModalConfirmacion>` (Para diálogos de borrado/advertencia).
* **IMPORTANTE** Si durante la generación de código detectas que se debe crear un componente de estas características, informa al usuario con la posibilidad de generar ese componente y añadirlo a la carpeta `src/components/common`.

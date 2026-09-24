# Caso de uso Taller de prácticas (Gestión y versiones)

## 1. Objetivo

Proporcionar un entorno de autoría donde el profesor pueda gestionar el catálogo de prácticas (CRUD básico) y, para cada práctica, crear, editar y consultar su historial de versiones, incluyendo la exportación del enunciado a PDF.

## 2. Interfaz de Usuario (UI) - Estructura Maestro-Detalle

- En **menú principal de la izquierda** habilita una nueva entrada denominada `Taller de prácticas` que conduzca al fichero src/pages/TallerPracticas.jsx.
- **Barra Superior de Filtros:**
  - Desplegable (`<Dropdown>`) con el listado de años académicos mostrando el nombre completo del período (ej. `2026/2027`).
  - Selector de `Clase` (`<SelectorClase>`) que sustituye al selector de módulo anterior y filtra las clases pertenecientes al año académico seleccionado.
- **Layout Principal:** Diseño de dos columnas utilizando el grid de PrimeReact.
- **Columna Izquierda (Catálogo de Prácticas):**
  - Un `DataTable` o `Listbox` con la lista de `Practicas`.
  - Botón superior para "Nueva Práctica" (abre un `Dialog` sencillo donde el módulo ya se conoce automáticamente al estar asociado a la clase activa).
  - Al hacer clic en una práctica, se carga su panel de versiones en la columna derecha.
- **Columna Derecha (Panel de Versiones):**
  - Cabecera con el nombre de la práctica seleccionada.
  - Un `DataTable` listando las `Versiones` asociadas a esa práctica (mostrando el número, clase, unidad y fecha).
  - Botones de acción por cada versión: "Editar", "Clonar" (crea una nueva versión copiando los datos de la actual) y "Exportar a PDF" (genera un documento limpio con el enunciado para imprimir o entregar).
  - Botón principal "Crear Nueva Versión".
- **Pie de Página (Manual de Usuario):**
  - En la parte inferior, ocupando todo el ancho de la página, un manual estructurado sobre el flujo de uso de la herramienta.

## 3. Editor de Versiones (UI Modal)

- Al crear o editar una versión, se abrirá un `Dialog` ancho.
- **Campos:** `numero`, `clase`, `unidad`, `id_tipopractica` (Dropdown).
- **Enunciado:** Utilizar el componente `Editor` (Rich Text Editor basado en Quill) de PrimeReact para que el profesor pueda aplicar negritas, listas o formatos al enunciado.

## 4. Obtención de Datos y Servicios

- La lógica de datos se encapsula en `src/hooks/useTallerPracticas.js`, que consume `useDatos`.
- Operaciones CRUD completas para `Practicas` y para `Versiones` (filtradas por `id_practica`).
- Integrar la exportación a PDF para capturar el contenido HTML del `Editor` y convertirlo en un PDF con formato de examen.

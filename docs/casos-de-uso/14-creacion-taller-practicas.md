# Caso de uso Taller de prácticas (Gestión y versiones)

## 1. Objetivo
Proporcionar un entorno de autoría donde el profesor pueda gestionar el catálogo de prácticas (CRUD básico) y, para cada práctica, crear, editar y consultar su historial de versiones, incluyendo la exportación del enunciado a PDF.

## 2. Interfaz de Usuario (UI) - Estructura Maestro-Detalle

- En **menú principal de la izquierda** habilita una nueva entrada denominada `Taller de prácticas` que conduzca al fichero src/pages/TallerPracticas.jsx.
- **Layout Principal:** Diseño de dos columnas utilizando el grid de PrimeReact.
- **Columna Izquierda (Catálogo de Prácticas):**
  - Un `DataTable` o `Listbox` con la lista de `Practicas`.
  - Botón superior para "Nueva Práctica" (abre un `Dialog` sencillo para el nombre y descripción).
  - Al hacer clic en una práctica, se carga su panel de versiones en la columna derecha.
- **Columna Derecha (Panel de Versiones):**
  - Cabecera con el nombre de la práctica seleccionada.
  - Un `DataTable` listando las `Versiones` asociadas a esa práctica (mostrando el número, unidad y fecha).
  - Botones de acción por cada versión: "Editar", "Clonar" (crea una nueva versión copiando los datos de la actual) y "Exportar a PDF" (genera un documento limpio con el enunciado para imprimir o entregar).
  - Botón principal "Crear Nueva Versión".

## 3. Editor de Versiones (UI Modal)

- Al crear o editar una versión, se abrirá un `Dialog` ancho.
- **Campos:** `numero`, `unidad`, `id_tipopractica` (Dropdown).
- **Enunciado:** Utilizar el componente `Editor` (Rich Text Editor basado en Quill) de PrimeReact para que el profesor pueda aplicar negritas, listas o formatos al enunciado.

## 4. Obtención de Datos y Servicios

- Crear `src/services/tallerPracticasService.js`.
- Necesitará operaciones CRUD completas para `Practicas` y para `Versiones` (filtradas por `id_practica`).
- Integrar la librería `jspdf` para capturar el contenido HTML del `Editor` y convertirlo en un PDF con formato de examen.

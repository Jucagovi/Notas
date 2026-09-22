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

## Practicas

# 🛠️ Caso de uso 14: Taller de Prácticas (Gestión de Catálogo y Versiones)

## 1. Objetivo

Proporcionar un entorno de autoría donde el profesor pueda gestionar su repositorio histórico (catálogo de `Practicas` base) y, para cada práctica, crear, editar y consultar su historial de ediciones (`Versiones`). Incluye la capacidad de maquetar el enunciado con texto enriquecido y exportarlo a PDF para su entrega a los discentes.

## 2. Interfaz de Usuario (UI) - Estructura Maestro-Detalle

- **Navegación:** En el menú principal izquierdo, habilitar la entrada `Taller de prácticas` que conducirá al componente `src/pages/TallerPracticas.jsx`.

- **Layout Principal:** Diseño de dos columnas utilizando el Grid de PrimeReact.
- **Columna Izquierda (Repositorio Maestro):**
  - Un `DataTable` o `Listbox` con la lista de `Practicas` genéricas.
  - Botón superior "Nueva Práctica" que abrirá un `Dialog` sencillo (solicitando solo Título y Descripción breve).
  - Al hacer clic en una práctica de la lista, se carga dinámicamente su historial en la columna derecha.
- **Columna Derecha (Panel de Versiones/Detalle):**
  - Cabecera dinámica con el nombre de la práctica seleccionada.
  - Un `DataTable` listando las `Versiones` asociadas a esa práctica (mostrando el número de versión, la unidad de trabajo y la fecha de creación/modificación).
  - Botones de acción por cada fila (versión):
    - "Editar" (abre el editor).
    - "Clonar" (crea instantáneamente una nueva versión copiando el enunciado y los datos de la actual, ideal para reciclar exámenes de años anteriores).
    - "Exportar a PDF" (genera un documento limpio con el enunciado maquetado listo para imprimir).
  - Botón principal superior "Crear Nueva Versión".

## 3. Editor de Versiones (UI Modal)

- Al crear o editar una versión, se abrirá un componente `Dialog` de PrimeReact (con un ancho generoso, ej. `70vw`).

- **Campos de metadatos:** `numero` (versión o año), `unidad` (InputText o Dropdown apuntando a `Unidades_Trabajo`), e `id_tipopractica` (Dropdown).
- **Enunciado (Maquetación):** Utilizar el componente `Editor` (Rich Text Editor basado en Quill) de PrimeReact. Permitirá al profesor aplicar negritas, listas, subrayados y formatos básicos al cuerpo de la práctica.

## 4. Obtención de Datos y Arquitectura

- **Custom Hook:** No se creará `tallerPracticasService.js`. La lógica de datos se encapsulará en `src/hooks/useTallerPracticas.js`, que consumirá `useDatos`.

- **Operaciones (CRUD):** El hook expondrá las funciones necesarias para gestionar tanto la tabla maestra (`Practicas`) como la tabla esclava (`Versiones`), asegurando que las consultas de versiones se filtren siempre por el `id_practica` activo en el estado.
- **Generación de PDF:** Se integrará la librería `html2pdf.js` (o similar que interprete DOM/HTML). Esta librería capturará visualmente el contenido renderizado del texto enriquecido del `Editor` y lo convertirá en un PDF respetando la maquetación original del profesor.

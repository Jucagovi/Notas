# Caso de uso 09: Importación Masiva por CSV

## 1. Objetivo

Permitir la carga masiva de registros en tablas clave (especialmente `Discentes` y `Cursos`) mediante archivos CSV o pegado directo de texto, proporcionando plantillas y validación visual previa a la inserción en la base de datos.

## 2. Lógica de Interfaz y Flujo (UI/UX)

* **Reestructuración del Menú:** En la barra lateral, se creará una nueva categoría/sección denominada `SEGURIDAD` (al mismo nivel que `MANTENIMIENTO`). Esta sección agrupará la entrada de `Copia de seguridad` (Caso 08) y una nueva entrada `Importación de datos` que conducirá a `src/pages/ImportacionPagina.jsx`.

* **Filtros Contextuales:** Un `Dropdown` de PrimeReact para elegir la tabla destino de la importación.
- **Zona de Plantilla:** Un `Button` "Descargar Plantilla CSV" que genere automáticamente un archivo vacío con las cabeceras exactas que requiere la tabla seleccionada (omitiendo campos autogenerados como el ID).
- **Zona de Carga:**
  - Un componente `FileUpload` de PrimeReact (modo avanzado, aceptando solo `.csv`).
  - Un componente `InputTextarea` opcional para que el usuario pueda "Copiar y Pegar" directamente desde su hoja de cálculo (Excel/Calc).
- **Vista Previa (Preview):** Un `DataTable` dinámico que muestre los datos leídos en crudo antes de insertarlos. Si la validación detecta un error (ej. texto en un campo de fecha o un correo mal formateado), la fila entera o la celda debe marcarse con un fondo rojo de advertencia.

## 3. Lógica de Procesamiento y Validación

* **Biblioteca de Parseo:** Utilizar `papaparse` para convertir el texto CSV o el texto pegado en un array de objetos JavaScript.
- **Limpieza (Sanitización):** El sistema debe aplicar `.trim()` para limpiar espacios en blanco iniciales/finales, y formatear las fechas al estándar de PostgreSQL (`YYYY-MM-DD`).
- **Prevención de Errores:** No se deben pedir ni enviar campos auto-generados por la base de datos (como el `id_discente` o `created_at`).

## 4. Obtención de Datos y Arquitectura

* **Evitar llamadas directas:** No se utilizará la sintaxis directa del cliente de Supabase en el componente. Toda la lógica se aislará en el Custom Hook `src/hooks/useImportacionCSV.js`.
- **Uso de `useDatos`:** El hook importará y utilizará el genérico `useDatos` para realizar las inserciones.
- **Bulk Insert:** Se aprovechará la capacidad de Supabase de recibir un array de objetos en su método de inserción (`insert(arrayDatos)`).
- **Feedback Global:** Al finalizar la operación masiva, se lanzará un `Toast` global informando de cuántos registros se han insertado correctamente o detallando el error si falló la transacción.

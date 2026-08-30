# 📥 Casos de uso: importación masiva por CSV

## 1. Objetivo

Permitir la carga masiva de registros en tablas clave (`Discentes`, `Modulos`, `Practicas`) mediante archivos CSV, proporcionando plantillas y validación previa a la inserción.

## 2. Lógica de Interfaz y Flujo (UI/UX)

- **Generar entrada en el menú**: en la sección de `Herramientas` crea una nueva sección denominada `Importación de datos` que conducirá a nueva página en `src/pages/ImportacionPagina.jsx` que debes crear (si todavía no existe). Crea una nueva sección en el menú (de igual modo que `MANTENIMIENTO` que se llame `SEGUIDAD` y que contenga esta nueva entrada y la de `Copia de seguridad`)-
- **Selector de Tabla:** Un `Dropdown` de PrimeReact para elegir el destino de la importación.
- **Zona de Plantilla:** Un botón "Descargar Plantilla CSV" que genere un archivo con las cabeceras exactas que requiere la tabla seleccionada.
- **Zona de Carga:** Usar el componente `FileUpload` de PrimeReact (modo avanzado) y un área de texto opcional por si el usuario prefiere "Copiar y Pegar" directamente desde la hoja de cálculo.
- **Vista Previa (Preview):** Un `DataTable` que muestre los datos leídos del CSV antes de insertarlos. Si hay un error de tipo de dato (ej. texto en un campo numérico), la fila debe marcarse en rojo.

## 3. Lógica de Procesamiento y Base de Datos

- *Biblioteca:** Utilizar `papaparse` para convertir el texto CSV en un array de objetos JavaScript.
- **Formateo:** La aplicación debe limpiar espacios en blanco y adaptar las fechas al formato de Postgres. No se deben pedir campos auto-generados como el `id_discente` de la tabla `Discentes`.
- **Inserción Masiva (Bulk Insert):** Supabase permite insertar arrays directamente (`supabase.from('tabla').insert(arrayDatos)`). Mostrar un `Toast` de éxito o error detallado al finalizar.

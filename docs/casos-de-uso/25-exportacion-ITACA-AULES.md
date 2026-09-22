### 📤 Caso de Uso 25: Exportador Oficial (ITACA y Aules)

**1. Objetivo**
Generar archivos CSV con el formato exacto requerido por las plataformas oficiales de la Generalitat Valenciana. Permite volcar las notas finales de evaluación directamente en ITACA y las calificaciones de actividades individuales (Prácticas/Versiones) en el libro de calificaciones de Aules (Moodle), eliminando el trabajo manual.

**2. Interfaz de Usuario y Flujo (UI/UX)**

* **Navegación:** Nueva entrada en el submenú de `Herramientas` denominada `Exportador Oficial`, que conducirá a `src/pages/ExportadorPagina.jsx`.
* **Layout Principal:** Un componente `Card` de PrimeReact dividido en dos pestañas (`TabView`): "Exportar a ITACA" y "Exportar a Aules".
* **Pestaña ITACA:**
* `Dropdown` para seleccionar Curso, Módulo y Evaluación.
* Botón: "Descargar CSV ITACA".


* **Pestaña Aules:**
* `Dropdown` para seleccionar Curso y Módulo.
* Un `MultiSelect` o `Listbox` de PrimeReact para seleccionar una o varias Actividades (`Versiones`) evaluadas.
* Botón: "Descargar CSV Aules".


* **Mensajes de Validación:** Si algún alumno carece de NIA o email, se mostrará un `Message` de PrimeReact advirtiendo de que el archivo generado dará error en la plataforma oficial, listando los alumnos afectados.

**3. Reglas de Formato (Mapeo de Datos)**

* **Formato ITACA:** Requiere un CSV delimitado por punto y coma (`;`). Las columnas imprescindibles suelen ser el NIA del alumno y la calificación entera (dependiendo del formato de importación masiva de la versión actual de ITACA). El sistema redondeará las notas de 0-100 a la escala oficial de 1-10 antes de exportar.
* **Formato Aules (Moodle):** Requiere un CSV delimitado por comas (`,`). Las columnas obligatorias son `Dirección de correo` (o `Número de ID` / NIA) y una columna por cada actividad seleccionada (ej. `Práctica 1: API REST`). La nota se mantiene en escala 0-100.

**4. Obtención de Datos y Arquitectura**

* **Custom Hook:** Se creará `useExportadorOficial.js` consumiendo `useDatos`. Obtendrá las notas de la tabla `evaluan` cruzadas con los datos del `Discente` (especialmente NIA y email).
* **Generación del Archivo:** Se programará una función utilitaria pura en JavaScript (`src/utils/generadorCSV.js`) que reciba los datos JSON, los convierta al string CSV con los delimitadores correctos, y utilice la API del navegador (`Blob` y `URL.createObjectURL`) para forzar la descarga del archivo sin necesidad de un backend adicional.

---

### 🤖 Prompt para la IA generadora de código

Copia y pega este texto cuando quieras implementar esta funcionalidad:

> **Rol y Contexto:**
> Eres un desarrollador Senior en React, PrimeReact y Supabase. Trabajamos con el patrón Maestro-Detalle, Custom Hooks (`useDatos`) y TailwindCSS.
> **Tarea:**
> Implementa el "Caso de Uso 25: Exportador Oficial (ITACA y Aules)". Es una herramienta para generar archivos CSV con formatos estrictos para la importación masiva de calificaciones.
> **Requisitos Técnicos:**
> 1. **Componente de Interfaz (`src/pages/ExportadorPagina.jsx`):** Crea una vista con un `TabView` de PrimeReact con dos pestañas. En la pestaña de ITACA, incluye selectores para Curso, Módulo y Evaluación. En la pestaña de Aules, selectores de Curso, Módulo y un `MultiSelect` para las actividades (`Versiones`). Incluye botones de descarga en ambas pestañas.
> 2. **Custom Hook (`src/hooks/useExportadorOficial.js`):** Crea las funciones para obtener los datos. Para ITACA, debes obtener la nota global de la evaluación cruzada con el NIA del discente. Para Aules, obtén las notas de las `Versiones` seleccionadas cruzadas con el email institucional del discente.
> 3. **Generador CSV (`src/utils/generadorCSV.js`):** Escribe dos funciones. `generarCsvItaca(datos)` debe devolver un CSV delimitado por punto y coma (`;`) con las columnas NIA y Nota (escalada de 1 a 10). `generarCsvAules(datos, nombresActividades)` debe devolver un CSV delimitado por comas (`,`) con la columna `Dirección de correo` y una columna extra por cada actividad seleccionada con su nota de 0 a 100. Ambas funciones deben instanciar un `Blob` y disparar la descarga automática en el navegador.
> 
> 
> Entrégame el código completo del hook, el componente visual y el archivo de utilidades CSV.

### 📝 Caso de Uso 22: Informe de Seguimiento de Programaciones

**1. Objetivo**

Automatizar la generación del informe trimestral de cumplimiento curricular, cruzando las fechas de la planificación con el estado real de las Unidades de Trabajo, y permitiendo al docente incluir observaciones cualitativas. El documento final debe ser descargable en formato editable (Word/DOCX).

**2. Interfaz de Usuario y Flujo (UI/UX)**

* **Navegación:** Nueva entrada en el submenú de `Informes` denominada `Seguimiento Programación`, apuntando a `src/pages/informes/InformeSeguimiento.jsx`.
* **Filtros (Header):** Componentes `Dropdown` (PrimeReact) para seleccionar Curso, Módulo y Evaluación (1ª, 2ª o 3ª).
* **Editor Cualitativo:**
* Un componente `InputTextarea` grande (PrimeReact) etiquetado como "Observaciones e Incidencias" para que el profesor redacte el texto formal (ej. "El curso avanza de forma correcta y sin incidentes").

* Un `Calendar` o `InputText` para definir la fecha de corte (ej. "Hasta 30/09/2025").

* **Vista Previa de Datos:** Un pequeño `DataTable` de solo lectura que muestre las UTs programadas para ese trimestre frente a las impartidas realmente, extrayendo la información del módulo y grupo.

* **Exportación:** Un botón destacado "Descargar Informe Editable (.docx)".

**3. Lógica de Base de Datos y Arquitectura**

* **Cálculo de Rango:** El sistema debe buscar en la tabla `Temporizacion` todas las Unidades de Trabajo cuya `fecha_fin_prevista` caiga dentro de los meses correspondientes a la evaluación seleccionada (ej. Septiembre-Diciembre para la 1ª).
* **Contraste:** Separar visualmente las UTs en "Contenidos Programados" y "Contenidos Impartidos" dependiendo de si su `estado` en la tabla `Temporizacion` es "Completada".

* **Custom Hook:** La lógica se aislará en `src/hooks/useInformeSeguimiento.js`, consumiendo `useDatos`.
* **Generación Documental:** Se utilizará la librería `docx` para construir la estructura del documento inyectando el Profesor, Grupo, Asignatura y Evaluación, y generando el archivo para su descarga directa en el navegador.

---

### 🤖 Prompt para la IA generadora de código

Copia y pega este texto cuando quieras que una IA te construya esta funcionalidad concreta:

> **Rol y Contexto:**
> Eres un desarrollador experto en React, PrimeReact y Supabase. Estamos construyendo una plataforma educativa basada en el patrón Maestro-Detalle utilizando Custom Hooks (`useDatos.js` como base) y sin Context API para datos.
> **Tarea:**
> Implementa el "Caso de Uso 22: Informe de Seguimiento de Programaciones". Este es un informe trimestral que certifica si los contenidos planificados se han impartido.
> **Requisitos Técnicos:**
> 1. **Componente de Interfaz (`src/pages/informes/InformeSeguimiento.jsx`):** Crea una vista con filtros (Curso, Módulo, Evaluación) usando los Dropdown de PrimeReact. Incluye un `InputTextarea` para las observaciones del profesor y un botón para exportar.
> 2. **Custom Hook (`src/hooks/useInformeSeguimiento.js`):** Crea el hook que obtenga los datos. Debe consultar la tabla `Temporizacion` cruzada con `Unidades_Trabajo`, `Modulos` y `Cursos`. La lógica debe separar las UTs cuya fecha prevista cae en ese trimestre en dos arrays: `programadas` e `impartidas` (basándose en si el estado es completado o no).
> 3. **Generación de Documento:** Integra la librería `docx` (crea una función de utilidad en `src/utils/generadorDocx.js`). Esta función debe recibir los datos del hook y el texto del textarea, y generar un documento `.docx` estructurado con la siguiente información: Profesor, Grupo, Asignatura, Evaluación, Fecha de corte, Lista de Contenidos Programados, Lista de Contenidos Impartidos, y el bloque de texto de Observaciones.
> 
> 
> Entrégame el código completo del Custom Hook, el componente visual y la función generadora del documento DOCX. Respeta las convenciones de código limpio y el uso exclusivo de PrimeReact para la UI.

¿Te parece bien este enfoque? Podemos diseñar la segunda funcionalidad que mencionabas cuando estés listo.
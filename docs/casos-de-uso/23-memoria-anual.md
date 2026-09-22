### 📝 Caso de Uso 23: Memoria Anual del Módulo

**1. Objetivo**
Automatizar la generación de la Memoria Anual final, consolidando los objetivos alcanzados, la temporalización real y el análisis estadístico de las calificaciones, combinados con las valoraciones cualitativas del docente. El resultado será un documento `.docx` editable con el formato oficial.

**2. Interfaz de Usuario y Flujo (UI/UX)**

* **Navegación:** Nueva entrada en el submenú de `Informes` denominada `Memoria Anual`, apuntando a `src/pages/informes/InformeMemoria.jsx`.
* **Filtros Iniciales:** `Dropdown` para seleccionar Curso y Módulo. El año en curso se autocompletará.


* **Layout por Pestañas (TabView de PrimeReact):**
* **Pestaña 1: Datos Curriculares (Solo Lectura).** Mostrará los Resultados de Aprendizaje (RA) como objetivos cumplidos y la tabla de "Estructura de Contenidos Programados" con las columnas: Unidad de trabajo, Sesiones, Fechas y Evaluación.


* **Pestaña 2: Textos Estándar (Editables).** Dos editores de texto (Quill/Editor de PrimeReact) precargados con tus textos habituales para "Metodología" y "Recursos".


* **Pestaña 3: Estadísticas.** Una tabla generada automáticamente con el "Análisis y evaluación de los resultados", agrupando las notas finales en las categorías oficiales (Insuficiente, Suficiente, Bien, Notable, Sobresaliente) indicando el número de alumnos y el porcentaje.


* **Pestaña 4: Valoración Docente.** Dos editores de texto vacíos para redactar las "Conclusiones" y la "Autoevaluación de la actividad docente".




* **Exportación:** Botón inferior flotante "Generar Memoria DOCX".

**3. Lógica de Negocio y Base de Datos**

* **Mapeo de Calificaciones:** Como el sistema usa notas de 0-100, el Custom Hook deberá agrupar automáticamente la nota final de cada alumno en las categorías clásicas: Insuficiente (<50), Suficiente (50-59), Bien (60-69), Notable (70-89) y Sobresaliente (90-100).


* **Extracción Temporal:** Las fechas de la tabla de contenidos se extraerán de los campos `fecha_ini_real` y `fecha_fin_real` de la tabla `Temporizacion`.


* **Custom Hook:** Se creará `useMemoriaAnual.js` para consultar las tablas de notas (`evaluan`), currículo (`RA`, `Unidades_Trabajo`) y temporalización, devolviendo los objetos procesados.

---

### 🤖 Prompt para la IA generadora de código

Copia y pega este texto cuando quieras implementar esta funcionalidad:

> **Rol y Contexto:**
> Eres un desarrollador Senior en React, PrimeReact y Supabase. Estamos construyendo una plataforma educativa basada en el patrón Maestro-Detalle, utilizando Custom Hooks genéricos (`useDatos`) y sin Context API para la gestión de datos.
> **Tarea:**
> Implementa el "Caso de Uso 23: Generador de Memoria Anual". Es una vista que recopila estadísticas y textos del docente para exportar el informe final del curso.
> **Requisitos Técnicos de Interfaz (`src/pages/informes/InformeMemoria.jsx`):**
> 1. Utiliza un `TabView` de PrimeReact para dividir la información.
> 2. Implementa componentes `Editor` (Quill) para los campos cualitativos: Metodología, Recursos, Conclusiones y Autoevaluación.
> 3. Precarga en los estados de Metodología y Recursos un texto por defecto estándar de un ciclo formativo de informática (ej. uso de VS Code, Git, React, Supabase).
> 
> 
> **Requisitos del Custom Hook (`src/hooks/useMemoriaAnual.js`):**
> 1. Obtén los Resultados de Aprendizaje (RA) del módulo seleccionado.
> 2. Obtén la temporalización real (Unidades de trabajo, fechas de inicio/fin y evaluación a la que pertenecen).
> 3. Calcula las estadísticas de la nota final del módulo para todos los alumnos matriculados. Debes agruparlos en: Insuficiente (<50), Suficiente (50-59), Bien (60-69), Notable (70-89) y Sobresaliente (90-100). Calcula el número total y el porcentaje de cada grupo sobre el total de discentes.
> 
> 
> **Generación del Documento DOCX (`src/utils/generadorMemoriaDocx.js`):**
> 1. Utiliza la librería `docx` para generar un documento estructurado.
> 2. Debe contener un Índice y las siguientes 7 secciones enumeradas: 1. Objetivos Generales (Listado de RAs), 2. Estructura Contenidos (Tabla con UTs y fechas), 3. Metodología, 4. Recursos, 5. Conclusiones, 6. Análisis y evaluación (Tabla con las estadísticas calculadas) y 7. Autoevaluación actividad docente.
> 3. Proporciona el código completo de la vista, el hook y el generador de Word.
> 
> 

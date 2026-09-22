¡Es la guinda del pastel perfecta! La **Programación Didáctica** es el documento maestro que todo docente debe entregar a principio de curso (normalmente en octubre). Suele ser un documento de 50 o 60 páginas que da mucha pereza redactar porque implica copiar y pegar currículos oficiales, tablas, porcentajes y temporalizaciones.

¿Sabes cuál es la magia de lo que hemos construido hasta ahora? **¡Que tu base de datos ya tiene el 80% de esa programación!**

En lugar de crear un procesador de textos en blanco, mi propuesta es crear un **"Ensamblador de Programaciones"**. La aplicación extraerá automáticamente las tablas de Resultados de Aprendizaje (RA), Criterios de Evaluación (CE), los pesos que configuraste (Caso 16), y la temporalización de las Unidades de Trabajo (Caso 19). Tú solo tendrás que redactar los apartados cualitativos (Contexto, Atención a la diversidad, etc.).

Aquí tienes la especificación para que la IA te construya esta maravilla:

### 📘 Caso de Uso 28: Ensamblador de Programación Didáctica

**1. Objetivo**
Automatizar la creación del documento oficial de la Programación Didáctica del módulo. El sistema actuará como un compilador que fusiona los datos curriculares vivos de la base de datos (RAs, CEs, Unidades, Temporalización, Porcentajes de evaluación) con textos cualitativos redactados por el docente, exportando el resultado a un documento DOCX listo para entregar.

**2. Interfaz de Usuario y Flujo (UI/UX)**

* **Navegación:** Nueva entrada en el submenú de `Herramientas` o `Informes` denominada `Programación Didáctica` (`src/pages/ProgramacionPagina.jsx`).
* **Layout Asistente (Stepper):** Utilizar el componente `Stepper` de PrimeReact para guiar al docente paso a paso:
* **Paso 1: Datos Base.** Selección de Curso y Módulo. Vista previa de los datos extraídos automáticamente (Lista de UTs, RAs, y tabla de pesos de evaluación).
* **Paso 2: Contextualización.** Editor de texto (Quill) para redactar el contexto del centro y del grupo de alumnos.
* **Paso 3: Metodología y Recursos.** Editores de texto (puede recuperar los textos por defecto que definimos en el Caso 23 de la Memoria Anual).
* **Paso 4: Atención a la Diversidad.** Editor para detallar las adaptaciones curriculares o medidas específicas.
* **Paso 5: Bibliografía.** Editor de texto sencillo.


* **Acción Final:** Un botón grande "Generar Documento DOCX".

**3. Lógica de Base de Datos y Arquitectura**

* **Extracción Masiva:** El Custom Hook debe hacer una consulta global para recopilar:
* El módulo y curso actual.
* La estructura completa de `Unidades_Trabajo` y su `Temporizacion`.
* Los `RA` y `CE` con sus respectivos pesos (`ra_curso`, `ce_curso`).


* **Generación Documental:** Similar al Caso 22 y 23, se utilizará la librería `docx` para maquetar un documento con un índice automático, insertando las tablas de datos generadas dinámicamente y los bloques de texto enriquecido.

---

### 🤖 Prompt para la IA generadora de código

Copia y pega este texto cuando quieras implementar esta funcionalidad:

> **Rol y Contexto:**
> Eres un desarrollador Senior en React, PrimeReact y Supabase. Trabajamos con el patrón Maestro-Detalle, Custom Hooks (`useDatos`) y TailwindCSS.
> **Tarea:**
> Implementa el "Caso de Uso 28: Ensamblador de Programación Didáctica". Es un generador documental que mezcla datos de la BD con textos del profesor para crear el plan de estudios anual en formato Word.
> **Requisitos Técnicos:**
> 1. **Componente de UI (`src/pages/ProgramacionPagina.jsx`):** Implementa el componente `Stepper` de PrimeReact con 4 pasos: 1. Confirmación de Datos (Filtro Curso/Módulo y resumen de tablas), 2. Contexto (Editor Quill), 3. Metodología y Diversidad (Editores Quill), 4. Exportación.
> 2. **Custom Hook (`src/hooks/useProgramacionDidactica.js`):** Crea una función que obtenga el "paquete curricular completo". Esto implica cruzar: Módulo, Unidades de Trabajo, Temporización, y la jerarquía de RAs y CEs con sus pesos asignados en las tablas `ra_curso` y `ce_curso`.
> 3. **Generador DOCX (`src/utils/generadorProgramacionDocx.js`):** Utilizando la librería `docx`, crea una función que reciba el paquete curricular y los textos del estado de React. Debe generar un documento formal con: Portada, Índice, 1. Contexto, 2. Objetivos (Tabla de RAs), 3. Contenidos y Temporalización (Tabla de UTs), 4. Criterios de Calificación (Tabla jerárquica de RAs, CEs y sus pesos %), 5. Metodología, 6. Atención a la Diversidad. Devuelve el Blob para su descarga.
> 
> 
> Entrégame el código del Hook, el componente visual con el Stepper y la función generadora del DOCX.


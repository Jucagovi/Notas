Me parece una idea excelente y muy práctica. A menudo, cuando estás diseñando una actividad, evaluando a un alumno o respondiendo a una duda de inspección, necesitas consultar rápidamente la "leyenda" del currículo oficial sin tener que navegar por las pantallas de configuración o abrir el PDF oficial del BOE/DOGV.

Tener un **Visor Curricular** de solo lectura, estructurado jerárquicamente y exportable, es un recurso de consulta imprescindible.

Dado que tu base de datos ya tiene la relación exacta (`Ciclos` $\rightarrow$ `Modulos` $\rightarrow$ `RA` $\rightarrow$ `CE`), implementarlo es muy sencillo. Para la interfaz, el componente ideal de PrimeReact sería un `TreeTable` (una tabla desplegable en árbol) o un `Accordion`, que permite ver el módulo, desplegar sus RAs y, dentro de cada RA, desplegar sus CEs asociados.

Aquí tienes la especificación formal y el prompt con la nueva regla de componentización estricta incorporada:

### 📖 Caso de Uso 32: Visor del Currículo Oficial (RA y CE)

**1. Objetivo**
Proporcionar un catálogo de consulta rápida de solo lectura donde el docente pueda visualizar la jerarquía curricular oficial (Resultados de Aprendizaje y Criterios de Evaluación) filtrando por Ciclo Formativo y Módulo.

**2. Interfaz de Usuario y Flujo (UI/UX)**

* **Navegación:** Nueva entrada en el menú `Informes` o `Herramientas` denominada `Visor Curricular` (`src/pages/VisorCurricularPagina.jsx`).
* **Filtros (Header):**
* `Dropdown` para seleccionar el Ciclo.
* `Dropdown` para seleccionar el Módulo (se habilita y filtra automáticamente según el Ciclo seleccionado).


* **Visualización (Body):**
* Un componente `TreeTable` o `Accordion` de PrimeReact.
* El primer nivel mostrará el nombre y número del RA.
* Al expandir un RA, se listarán los CE asociados (número y descripción).


* **Exportación:** Botón flotante o en la cabecera para exportar la vista actual a un documento PDF (utilizando la librería `jspdf`).

**3. Arquitectura y Obtención de Datos**

* **Custom Hook:** Se creará `useVisorCurricular.js` consumiendo `useDatos`. Debe realizar una consulta encadenada para traer los RAs y sus CEs correspondientes basándose en el `id_modulo` seleccionado.
* **Transformación de Datos:** El hook deberá formatear los datos planos de la base de datos en la estructura de nodos jerárquicos (nodos padre e hijos) que exige el componente `TreeTable` de PrimeReact.

---

### 🤖 Prompt para la IA generadora de código

Copia y pega este texto cuando quieras implementar esta funcionalidad:

> **Rol y Contexto:**
> Eres un desarrollador Senior en React y PrimeReact. Trabajamos con el patrón Maestro-Detalle, Custom Hooks (`useDatos`) y PrimeFlex (CERO Tailwind).
> **Tarea:**
> Implementa el "Caso de Uso 32: Visor Curricular". Es un informe de solo lectura para consultar los RAs y CEs de un módulo específico.
> **Requisitos Técnicos:**
> 1. **Custom Hook (`src/hooks/useVisorCurricular.js`):** Crea el hook que obtenga los `Ciclos` y `Modulos` para los filtros. Crea la función que, dado un `id_modulo`, extraiga sus `RA` y los `CE` anidados. Debe mapear la respuesta al formato de nodos requerido por el `TreeTable` de PrimeReact (clave `data` y `children`).
> 2. **Vista Principal (`src/pages/VisorCurricularPagina.jsx`):** Contendrá el estado de los filtros seleccionados y orquestará los subcomponentes.
> 3. **Exportación a PDF:** Utiliza `jspdf` para incluir un botón que genere un documento con el listado de RAs y CEs del módulo visible en pantalla.
> 
> 
> **Regla estricta de Componentización (SRP):** No escribas toda la interfaz en el archivo de la página. Debes crear obligatoriamente los siguientes subcomponentes presentacionales "tontos" en `src/components/visorCurricular/`:
> * `<FiltrosCurriculo/>`: Manejará los `Dropdowns` de Ciclo y Módulo.
> * `<TablaArbolCurricular/>`: Recibirá los nodos por props y renderizará el `TreeTable` de PrimeReact.
> 
> 
> Entrégame el hook, la página orquestadora y los subcomponentes.

Con este caso de uso añadido, tienes una herramienta de consulta excelente que además sirve como campo de pruebas perfecto para comprobar que tu IA aplica correctamente la regla de Responsabilidad Única.
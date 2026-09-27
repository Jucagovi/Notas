
### Caso de Uso 12.6: Visor del Currículo Oficial (RA y CE)

**1. Objetivo**
Proporcionar un catálogo de consulta rápida de solo lectura donde el docente pueda visualizar la jerarquía curricular oficial (Resultados de Aprendizaje y Criterios de Evaluación) filtrando por Ciclo Formativo y Módulo.

**2. Interfaz de Usuario y Flujo (UI/UX)**

* **Cambio de enfoque:** los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los textos de este caso de uso.
* **Navegación:** Nueva entrada en el menú `Informes` denominada `Visor Curricular` (`src/pages/VisorCurricularPagina.jsx`).
* **Filtros Contextuales:** componentes `Dropdown` (PrimeReact) anidados para elegir `Ciclos` -> `Modulos`

* **Visualización (Body):**
* Un componente `TreeTable` o `Accordion` de PrimeReact.
* El primer nivel mostrará el nombre y número del RA.
* Al expandir un RA, se listarán los CE asociados (número y descripción).

* **Exportación:** Botón flotante o en la cabecera para exportar la vista actual a un documento PDF (utilizando la librería `jspdf`).

**3. Arquitectura y Obtención de Datos**

* **Custom Hook:** Se creará `useVisorCurricular.js` consumiendo `useDatos`. Debe realizar una consulta encadenada para traer los RAs y sus CEs correspondientes basándose en el `id_modulo` seleccionado.
* **Transformación de Datos:** El hook deberá formatear los datos planos de la base de datos en la estructura de nodos jerárquicos (nodos padre e hijos) que exige el componente `TreeTable` de PrimeReact.

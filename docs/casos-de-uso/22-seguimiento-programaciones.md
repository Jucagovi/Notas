### 📝 Caso de Uso 22: Informe de Seguimiento de Programaciones

**1. Objetivo**

Automatizar la generación del informe mensual de cumplimiento curricular, cruzando las fechas de la planificación con el estado real de las Unidades de Trabajo, y permitiendo al docente incluir observaciones cualitativas. El documento final debe ser descargable en formato editable (ODT) y PDF.

**2. Interfaz de Usuario y Flujo (UI/UX)**

* **Navegación:** Nueva entrada en el submenú de `Informes` denominada `Seguimiento Programación`, apuntando a `src/pages/informes/InformeSeguimiento.jsx`.
* **Filtros (Header):** Componentes `Dropdown` (PrimeReact) para seleccionar año académico (se obtiene de la tabla `Curso` y los años se muetran como `2026/2027` para el año 2026, por ejemplo) y Curso.

* **Editor Cualitativo:**
* Un componente `InputTextarea` grande (PrimeReact) etiquetado como "Observaciones e Incidencias" para que el profesor redacte el texto formal (ej. "El curso avanza de forma correcta y sin incidentes").

* Un `Calendar` o `InputText` para definir la fecha de corte (ej. "Hasta 30/09/2025").

* **Vista Previa de Datos:** Un pequeño `DataTable` de solo lectura que muestre las UTs programadas para ese trimestre frente a las impartidas realmente, extrayendo la información del módulo y grupo.

* **Exportación:** Un botón destacado "Descargar informe editable (.odt)" y otro "Descargar informe en PDF"

* **Recordatorio:** me gustaría que apareciera un aviso en el `Panel de control` de la aplicación cada inicio de mes para recordarme que se debe entregar este informe.

**3. Lógica de Base de Datos y Arquitectura**

* **Cálculo de Rango:** El sistema debe buscar en la tabla `Temporizacion` todas las Unidades de Trabajo cuya `fecha_fin_prevista` caiga dentro de los meses correspondientes a la evaluación seleccionada (ej. Septiembre-Diciembre para la 1ª).
* **Contraste:** Separar visualmente las UTs en "Contenidos Programados" y "Contenidos Impartidos" dependiendo de si su `estado` en la tabla `Temporizacion` es "Completada".
* **Visualización de los datos:** los datos mostrados en la tabla deben tener la misma apariencia que los expresados en el documento `@docs/ejemplos/seguimiento.pdf`. Intenta replicar el estilo y los comentarios y omite los contenidos de los que no se disponga en la aplicación. Puedes sugerir la inclusión de información relevante si así lo estimas oportuno.

* **Custom Hook:** La lógica se aislará en `src/hooks/useInformeSeguimiento.js`, consumiendo `useDatos`.
* **Generación Documental:** Se utilizará la librería `docx` para construir la estructura del documento inyectando el Profesor, Grupo, Asignatura y Evaluación, y generando el archivo para su descarga directa en el navegador.

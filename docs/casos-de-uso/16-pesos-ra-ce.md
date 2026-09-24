# Caso de uso 16: Configuración de Pesos Curriculares (RA y CE)

## 1. Objetivo

Proporcionar una interfaz jerárquica para definir la ponderación (peso) que tendrá cada Resultado de Aprendizaje (RA) en la nota final del módulo, así como el peso individual de cada Criterio de Evaluación (CE) dentro de su respectivo RA, instanciando estos valores para una calase específica.

## 2. Interfaz de Usuario y Flujo (UI/UX)

- **Navegación:** Crear un nuevo submenú en la sección principal `Evaluaciones` denominado `Pesos RA y CE`, que dirija a la página `src/pages/PesosRAPagina.jsx`.
- **Filtros Contextuales (Header):**
  - Un componente `Dropdown` (PrimeReact) dependientes para seleccionar el Curso/Clase (el módulo ya está asociado a un curso/clase por lo que se deberá listar los RA y CE de ese módulo). Utiliza el componente diseñado para ello en `src/components/common`
- **Editor Jerárquico (Main):** Un componente `TreeTable` de PrimeReact.
  - **Nodos Padre (RA):** Mostrarán el nombre/enunciado del Resultado de Aprendizaje y un componente `InputNumber` para establecer su porcentaje de impacto en el módulo completo.
  - **Nodos Hijo (CE):** Mostrarán el enunciado del Criterio de Evaluación y un `InputNumber` para establecer su porcentaje de impacto **respecto a su RA padre**.
- **Panel de Validación y Feedback Visual:**
  - **Indicador Global (Módulo):** En la cabecera o pie de la tabla, mostrar la suma total de los pesos de los RA. Debe renderizarse en verde (ej. mediante un `Tag` o texto destacado) si es exactamente 100%, y en rojo si es distinto.
  - **Indicador Local (Por RA):** En la propia fila de cada RA, mostrar un indicador con la suma de los pesos de sus CE hijos (verde si es 100%, rojo en caso contrario).
  - **Automatismo**: debe existir un botñon que permita la asignación automática de pesos de forma equitativa.

## 3. Reglas de Negocio

- **Respaldo de tarea:** se debe permitir guardar los datos incompletos para poder retomar esta asignación con posterioridad.

- **Interactividad:** Los cambios en los `InputNumber` deben actualizar el estado local de React en tiempo real para proporcionar retroalimentación visual instantánea en los indicadores de suma.

## 4. Obtención de Datos y Arquitectura

* **Custom Hook:** No se creará un archivo de servicio clásico. Toda la lógica de obtención y mutación de datos se aislará en el hook `src/hooks/usePesosCurriculares.js`, consumiendo `useDatos`.
- **Lectura (Pivote de Datos):** La consulta del hook obtendrá la estructura maestra de RA y CE del módulo y la cruzará (mediante *JOINs*) con las tablas de detalle `ra_curso` y `ce_curso` para inyectar los pesos previamente guardados para el curso seleccionado.
- **Guardado Transaccional (Upsert):** Al pulsar "Guardar Ponderación", el hook ejecutará una transacción o un `UPSERT` masivo. Insertará o actualizará los registros en las tablas `ra_curso` y `ce_curso`, vinculando el `peso` introducido con el `id_curso` actual y los correspondientes `id_ra` o `id_ce`.

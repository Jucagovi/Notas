# Caso de uso: configuración de pesos de evaluación (RA y CE)

## 1. Objetivo

Proporcionar una interfaz para definir la ponderación (peso) que tendrá cada Resultado de Aprendizaje (RA) en la nota final del módulo, así como el peso de cada Criterio de Evaluación (CE) dentro de su respectivo RA, para un curso académico específico.

## 2. Interfaz de Usuario (UI)

- **Menú lateral:** crea un nuevo submenú en la sección `Evaluación` que dirija a la página `src/pages/PesosRAPagina.jsx` (si no existe debes crearla).
- **Filtros Globales:** Dos `Dropdown` (PrimeReact) para seleccionar el Curso y el Módulo. Se seleccionará por defecto en curso más actual de froma automática aunque ningun módulo (que deberá ser el usuario el que lo seleccione).
- **Editor Jerárquico:** Un componente `TreeTable` de PrimeReact.
  - **Nodos Padre (RA):** Muestran el nombre del RA y un `InputNumber` para establecer su porcentaje en el módulo.
  - **Nodos Hijo (CE):** Muestran el nombre del CE y un `InputNumber` para establecer su porcentaje respecto a su RA padre.
- **Panel de Validación (Feedback Visual):**
  - Indicador global: Suma de los pesos de todos los RA (debe mostrarse en verde si es 100%, rojo en caso contrario).
  - Indicador por RA: En la fila de cada RA, mostrar la suma de los pesos de sus CE hijos (verde si es 100%, rojo en caso contrario).

## 3. Lógica de Base de Datos y Servicios

- Crear `src/services/pesosEvaluacionService.js`.
- **Lectura:** La consulta debe obtener los RA y CE del módulo y cruzarlos con las tablas `ra_curso` y `ce_curso` para mostrar los pesos previamente guardados para el curso seleccionado.
- **Guardado:** Un botón "Guardar Ponderación". Al pulsarlo, realizará un `UPSERT` (o borrará y volverá a insertar) los registros en las tablas `ra_curso` y `ce_curso` vinculando el `peso`, el `id_curso` y los correspondientes `id_ra` o `id_ce`.

## propuesta

# ⚖️ Caso de uso 16: Configuración de Pesos Curriculares (RA y CE)

## 1. Objetivo

Proporcionar una interfaz jerárquica para definir la ponderación (peso) que tendrá cada Resultado de Aprendizaje (RA) en la nota final del módulo, así como el peso individual de cada Criterio de Evaluación (CE) dentro de su respectivo RA, instanciando estos valores para un curso académico específico.

## 2. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** Crear un nuevo submenú en la sección principal `Evaluaciones` denominado `Pesos Curriculares`, que dirija a la página `src/pages/PesosRAPagina.jsx`.
- **Filtros Contextuales (Header):**
  - Dos componentes `Dropdown` (PrimeReact) dependientes para seleccionar el Curso y el Módulo.
  - *UX Tip:* El Dropdown de Cursos se autoseleccionará con el curso más reciente por defecto al cargar la vista. El Dropdown de Módulos requerirá la intervención manual del usuario.
- **Editor Jerárquico (Main):** Un componente `TreeTable` de PrimeReact.
  - **Nodos Padre (RA):** Mostrarán el nombre/enunciado del Resultado de Aprendizaje y un componente `InputNumber` para establecer su porcentaje de impacto en el módulo completo.
  - **Nodos Hijo (CE):** Mostrarán el enunciado del Criterio de Evaluación y un `InputNumber` para establecer su porcentaje de impacto **respecto a su RA padre**.
- **Panel de Validación y Feedback Visual:**
  - **Indicador Global (Módulo):** En la cabecera o pie de la tabla, mostrar la suma total de los pesos de los RA. Debe renderizarse en verde (ej. mediante un `Tag` o texto destacado) si es exactamente 100%, y en rojo si es distinto.
  - **Indicador Local (Por RA):** En la propia fila de cada RA, mostrar un indicador con la suma de los pesos de sus CE hijos (verde si es 100%, rojo en caso contrario).

## 3. Reglas de Negocio

* **Bloqueo de Seguridad:** El botón principal de "Guardar Ponderación" debe permanecer deshabilitado (`disabled`) hasta que tanto el indicador global (Suma de RA) como todos los indicadores locales (Suma de CE por RA) estén rigurosamente al 100%.
- **Interactividad:** Los cambios en los `InputNumber` deben actualizar el estado local de React en tiempo real para proporcionar retroalimentación visual instantánea en los indicadores de suma.

## 4. Obtención de Datos y Arquitectura

* **Custom Hook:** No se creará un archivo de servicio clásico. Toda la lógica de obtención y mutación de datos se aislará en el hook `src/hooks/usePesosCurriculares.js`, consumiendo `useDatos`.
- **Lectura (Pivote de Datos):** La consulta del hook obtendrá la estructura maestra de RA y CE del módulo y la cruzará (mediante *JOINs*) con las tablas de detalle `ra_curso` y `ce_curso` para inyectar los pesos previamente guardados para el curso seleccionado.
- **Guardado Transaccional (Upsert):** Al pulsar "Guardar Ponderación", el hook ejecutará una transacción o un `UPSERT` masivo. Insertará o actualizará los registros en las tablas `ra_curso` y `ce_curso`, vinculando el `peso` introducido con el `id_curso` actual y los correspondientes `id_ra` o `id_ce`.

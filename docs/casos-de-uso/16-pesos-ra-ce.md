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

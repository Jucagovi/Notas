# Caso de uso 12.1: Informe de Auditoría de Cobertura Curricular (CE)

## 1. Objetivo

Crear un informe de auditoría visual para validar que todos los Criterios de Evaluación (CE) de un Módulo tengan asignadas actividades (`Versiones`) cuyo porcentaje de cobertura sume exactamente el 100%. Permite al docente detectar rápidamente vacíos curriculares (criterios no evaluados) o excesos de ponderación en el diseño de su curso.

## 2. Interfaz de Usuario y Flujo (UI/UX)

- **Navegación:** Crear una nueva entrada de submenú en el menú `Informes` que conducirá a una nueva página en `src/pages/informes/InformeCoberturaCE.jsx`.

- **Filtros Contextuales:** Componentes `Dropdown` (PrimeReact) dependientes para seleccionar el Curso y posteriormente el Módulo.
- **Visualización de Datos:** Un componente `DataTable` de PrimeReact.
- **Agrupación Jerárquica (Row Grouping):** La tabla debe agrupar visualmente las filas por "Resultado de Aprendizaje (RA)" utilizando la funcionalidad *Row Grouping* de PrimeReact (modo `subheader`).
- **Columnas de la Tabla:**
  - **CE:** Número y Nombre del Criterio.
  - **Actividades Asociadas:** Lista separada por comas de las actividades (`Versiones`) que trabajan ese criterio.
  - **Porcentaje Total:** La suma acumulada de los porcentajes asignados.

## 3. Lógica Visual y Alertas (UX)

La columna "Porcentaje Total" debe utilizar una plantilla personalizada (`body` template) devolviendo un componente `Badge` o `Tag` de PrimeReact para proporcionar feedback inmediato:

- **100% (Éxito):** Si la suma es exactamente 100, mostrar el Tag en color verde (`severity="success"`).
- **0% o null (Sin cubrir):** Si la suma es 0 o no hay datos, mostrar el Tag en color gris (`severity="secondary"` o `info`) con el texto "0% (Sin cubrir)".
- **Error de diseño (< 100% o > 100%):** Mostrar el Tag en color rojo (`severity="danger"`) para alertar al profesor de que la ponderación de ese CE está desbalanceada.

## 4. Obtención de Datos y Arquitectura

- **Evitar Servicios Directos:** No se creará un archivo `informesService.js`. La lógica de obtención se encapsulará en el Custom Hook `src/hooks/useInformeCobertura.js`.

- **Uso de `useDatos`:** El hook consumirá `useDatos` para realizar una consulta a Supabase que obtenga todos los `RA` del módulo seleccionado, anide sus `CE` y, para cada `CE`, busque sus registros en la tabla `trabajan` cruzándolos con la tabla `Versiones` (para obtener el porcentaje y el enunciado/nombre de la actividad vinculada).
- **Procesamiento de Datos:** El cálculo de la suma total del porcentaje por CE y la agrupación por RA se realizará en el frontend (estado de React), transformando el JSON en crudo recibido de Supabase en el formato estructurado que exige el `DataTable` con *Row Grouping*.

# Caso de uso: Informe de auditoría de cobertura curricular (CE)

## 1. Objetivo

Crea un infrome para validar que todos los Criterios de Evaluación (CE) de un Módulo tengan asignadas prácticas cuyo porcentaje de cobertura sume exactamente el 100%. Permite detectar vacíos curriculares o excesos de ponderación.

## 2. Interfaz de Usuario (UI)

- crea una nueva entrada de submenu en el menú `Informes` que conducirá a una nueva página `src/pages/informes/InformeCoberturaCE.jsx`,
- **Filtros Superiores:** `Dropdown` para seleccionar el Curso y otro dependiente para seleccionar el Módulo.
- **Visualización de Datos:** Un `DataTable` de PrimeReact.
- **Agrupación (Row Grouping):** La tabla debe agrupar visualmente las filas por "Resultado de Aprendizaje (RA)".
- **Columnas de la Tabla:**
  - CE (Número y Nombre).
  - Prácticas Asociadas (Lista separada por comas de las prácticas que lo trabajan).
  - Porcentaje Total (La suma acumulada).

## 3. Lógica Visual y Alertas (UX)

La columna "Porcentaje Total" debe usar una plantilla personalizada (Template) con un `Badge` o `Tag` de PrimeReact:

- Si la suma es **exactamente 100%**: Mostrar en color verde (éxito).
- Si la suma es **0% o nula**: Mostrar en color gris indicando "Sin cubrir".
- Si la suma es **< 100% o > 100%**: Mostrar en color rojo (peligro) para alertar del error de diseño.

## 4. Obtención de Datos y Servicios

- crear o modifica `src/services/informesService.js`.
- la consulta debe obtener todos los `RA` del módulo seleccionado, anidar sus `CE` y, para cada `CE`, buscar sus registros en la tabla `trabajan` para obtener el `porcentaje` y el nombre de la `Practica` vinculada.
- el cálculo de la suma total del porcentaje por CE se hará en el frontend transformando los datos recibo de Supabase.

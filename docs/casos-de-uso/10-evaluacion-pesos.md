# Caso de uso: asignación de pesos a las prácticas de una evaluación

## 1. Objetivo

Proporcionar una interfaz interactiva para que el profesor asigne el peso (porcentaje) que cada práctica tendrá sobre la nota final de una Evaluación concreta, garantizando que la suma total sea exactamente el 100%.

## 2. Interfaz de Usuario (UI)

- **Menú lateral:** crea un nuevo submenú en la sección `Evaluación` que dirija a la página `src/pages/PesosPagina.jsx` (si no existe debes crearla).
- **Filtros Superiores:** `Dropdown` (PrimeReact) para seleccionar Curso, Módulo y Evaluación.
- **Indicador de Total (Visual):** Un componente `ProgressBar` (PrimeReact) grueso en la parte superior.
  - Si la suma de pesos es < 100, la barra es naranja.
  - Si es exactamente 100, la barra es verde.
  - Si se pasa de 100, la barra es roja (y bloquea el guardado).
- **Lista de Prácticas:** Un `DataTable` con las prácticas asignadas a esa evaluación.
- **Columna de Peso:** Un `InputNumber` con botones de incremento/decremento (spinner) para cada práctica.

## 3. Lógica de Negocio

- La suma total de los `InputNumber` se calcula en tiempo real (estado de React).
- Al pulsar "Guardar Balanceo" (botón solo habilitado si la suma es 100%), se realiza una actualización masiva.


# 4. Servicios y base de datos

- **Nota Técnica sobre la BD:** Como el `peso` está en la tabla `evaluan` (junto al `id_discente`), el servicio backend debe hacer un `UPDATE` masivo del campo `peso` para todos los discentes que tengan esa práctica en esa evaluación.
- crea el servicio `src/services/pesosService.js` con las llamadas a Supabase necesarias para obtener las prácticas de una evaluación y para hacer el update masivo del campo peso en la tabla `evaluan`.

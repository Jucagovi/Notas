# Caso de uso: Mapeo de prácticas a resultados de aprendizaje (RA y CE)

## 1. Objetivo

Permitir al profesor vincular rápidamente una Práctica a múltiples Criterios de Evaluación (CE) y definir qué porcentaje del CE se cubre, optimizando la asignación masiva (ej. un examen que cubre todo un RA).

## 2. Interfaz de Usuario (UI)

- **Entrada en el menú principal:** reutiliza la entrada de submenú `Asignación CE` y crea la página a la que conduce `CriteriosPagina.jsx` y elimina todo su contenido y crea uno nuevo siguiendo los siguientes pasos.
- **Selector Principal:** Un `Dropdown` (PrimeReact) para elegir la `Practica`. Al seleccionarla, se carga la estructura de RA y CE del módulo asociado.
- **Tabla Jerárquica:** Utilizar el componente `TreeTable` de PrimeReact.
  - **Nodos Padre:** Resultados de Aprendizaje (RA).
  - **Nodos Hijo:** Criterios de Evaluación (CE).
  - **Columnas:**
    1. Nombre/Descripción del RA o CE.
    2. `Checkbox` de selección a la izquierda del nombre.
    3. `InputNumber` para el Porcentaje (0-100). Solo habilitado si el Checkbox está marcado a la derecha del checkbox.

## 3. Lógica de Interacción

- **Selección en Cascada:** Si el usuario marca el `Checkbox` de un RA (nodo padre), se deben seleccionar automáticamente todos sus CE (hijos) y su campo porcentaje debe establecerse por defecto en 100.
- **Edición de Porcentaje:** Si el usuario modifica el porcentaje, este se guarda temporalmente en el estado del componente.
- **Guardado:** Un botón inferior "Guardar peso". Al pulsarlo, se enviarán a la base de datos solo los CE que estén marcados.

## 4. Base de Datos y Servicios (Supabase)

- Las inserciones afectarán a la tabla `trabajan` guardando `id_ce`, `id_practica` y `porcentaje`.
- El servicio `src/services/criteriosService.js` debe incluir:
  - `getArbolCriterios(moduloId)`: Para obtener los RA y sus CE y darles el formato jerárquico que exige PrimeReact.
  - `savePesoCriterios(practicaId, selecciones)`: para borrar las asignaciones anteriores de esa práctica (`DELETE`) e insertar las nuevas (`INSERT`) en una sola transacción o bloque lógico.

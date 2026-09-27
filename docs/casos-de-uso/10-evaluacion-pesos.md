# Caso de uso 10: Asignación de Pesos a las Actividades (Versiones)

## 1. Objetivo

Proporcionar una interfaz interactiva para que el docente asigne el peso (porcentaje) que cada actividad (`Versiones`) tendrá sobre la nota final de una Evaluación concreta, garantizando de forma visual y estricta que la suma total sea exactamente el 100%.

## 2. Interfaz de Usuario y Flujo (UI/UX)

- **Menú de navegación:** Crear un nuevo submenú en la sección `Evaluaciones` (antiguo `Calificar`) denominado `Pesos de Evaluación`, que dirija a la página `src/pages/PesosPagina.jsx`.
- **Filtros Contextuales (Header):** Componentes `Dropdown` (PrimeReact) dependientes para seleccionar Curso -> Módulo -> Evaluación. (Recordar que la evaluación final se calcula sola, por lo que solo se listan 1ª, 2ª o 3ª).
- **Indicador de Balanceo (Visual):**
  - Un componente `ProgressBar` (PrimeReact) grueso y destacado en la parte superior.
  - **Comportamiento Reactivo:**
    - Si la suma de pesos es < 100%, la barra mostrará un color de advertencia (Naranja/Amarillo).
    - Si es exactamente 100%, la barra se pintará de Verde (éxito).
    - Si se pasa de 100%, la barra se pintará de Rojo (error) y se deshabilitará el botón de guardado.
- **Zona de Asignación (Main):**
  - Un `DataTable` con las `Versiones` (actividades) asignadas a esa evaluación.
  - **Columna de Peso:** Un `InputNumber` (PrimeReact) con botones de incremento/decremento (`showButtons`) para cada actividad, con un valor mínimo de 0 y máximo de 100.

## 3. Reglas de Negocio

- **Cálculo en Tiempo Real:** La suma total de los valores de los `InputNumber` se calcula en tiempo real aprovechando el estado local de React, retroalimentando inmediatamente a la `ProgressBar`.
- **Bloqueo de Seguridad:** El botón de "Guardar Balanceo" debe estar condicionado (`disabled={suma !== 100}`).
- **Confirmación:** Al guardar con éxito, se mostrará un `Toast` (PrimeReact) informando de la actualización.

## 4. Obtención de Datos y Arquitectura

- **Fricción arquitectónica resuelta:** NO se crearán servicios aislados (como `pesosService.js`) ni se realizarán `UPDATES` masivos en la tabla de los discentes (`evaluan`).
- **Normalización de Base de Datos:** Los pesos se guardarán directamente en la columna `peso_evaluacion` de la tabla `Versiones`.
- **Custom Hook:** Se implementará el hook `src/hooks/useAsignacionPesos.js` que consumirá a `useDatos`.
- **Transacción de Guardado:** El hook expondrá una función `guardarPesosEvaluacion(arrayVersionesConPesos)` que realizará las llamadas correspondientes para hacer un `UPDATE` únicamente en los registros modificados de la tabla `Versiones`.

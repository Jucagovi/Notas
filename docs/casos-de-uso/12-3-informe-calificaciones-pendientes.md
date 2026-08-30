# Caso de uso: Informe de control de calificaciones pendientes

## 1. Objetivo

Detectar de un solo vistazo qué discentes no tienen calificación en alguna de las prácticas asignadas a una evaluación específica, previniendo el cierre de actas con notas vacías.

## 2. Interfaz de Usuario (UI)

- **Nueva entrada en el menú:** habilita una nueva entrada en el menú `Informes` en forma de submenú con el nombre `Calificaciónes pendientes` que conducirá a la página `src/pages/informes/InformePendientes.jsx`. Debes crear esa paǵina.
- **Filtros Contextuales:** tres `Dropdown` (PrimeReact) en cascada para seleccionar: Curso -> Módulo -> Evaluación que deben estar enlazados y solo se habilitarán cuando el usuario seleccione el priomero (NOTA: los cursos deben estar ordenados de más reciente a más antiguo).
- **Mensaje de Éxito:** si tras aplicar los filtros no hay ninguna nota pendiente, mostrar un componente `Message` (PrimeReact) grande de color verde indicando: "¡Todo al día! No hay calificaciones pendientes para esta evaluación."
- **Visualización de Datos:** si hay pendientes, mostrar un `DataTable` con los resultados. Se podrá ordenar por práctica, discente y evaluación.
- **Columnas de la Tabla:**
  - Discente (Nombre y Apellidos del Discente).
  - Práctica (Número y Nombre de la práctica sin evaluar).
  - Evaluación (nombre de la evaluación a la que pertence la práctica).
  - Acción: Un `Button` (icono de lápiz) que diga "Calificar".
- **Resumen en el Dashboard.jsx:** genera una nueva tarjeta con un resumen de este informe y colócala en la pantalla principal de la aplicación justo encima del <DataTable> de los discentes en riesgo.

## 3. Lógica de Negocio y Navegación

- Al pulsar el botón "Calificar" en una fila, la aplicación debe redirigir al usuario (usando `useNavigate` de `react-router-dom`) a la pantalla de Calificar (caso de uso 06), pre-seleccionando idealmente esa evaluación y práctica para agilizar el trabajo.

## 4. Obtención de Datos y Servicios

- Añadir la función `getPendientesPorEvaluacion(evaluacionId)` en `src/services/informesService.js`.
- **Lógica de la consulta:** Debe cruzar los alumnos matriculados en el módulo asociado a la evaluación, listar las prácticas de dicha evaluación, y filtrar devolviendo solo aquellas combinaciones donde en la tabla `evaluan` el valor de `nota` sea `null` (o donde no exista el registro, si la inserción es diferida).

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

## Propuesta

# 🚨 Caso de uso 12.3: Informe de Control de Calificaciones Pendientes

## 1. Objetivo

Detectar de un solo vistazo qué discentes no tienen calificación en alguna de las actividades (`Versiones`) asignadas a una evaluación específica, previniendo el cierre de actas con notas vacías.

## 2. Interfaz de Usuario y Flujo (UI/UX)

* **Nueva entrada en el menú:** Habilitar un submenú en la sección `Informes` con el nombre `Calificaciones pendientes` que conducirá a la página `src/pages/informes/InformePendientes.jsx`.
- **Filtros Contextuales:** Tres componentes `Dropdown` (PrimeReact) en cascada para seleccionar: Curso -> Módulo -> Evaluación.
  - *Nota de ordenación:* El Dropdown de Cursos debe listar los registros ordenados del más reciente al más antiguo.
  - Solo se habilitará el siguiente Dropdown cuando el usuario seleccione un valor en el anterior.
- **Mensaje de Éxito (Empty State):** Si tras aplicar los filtros no hay ninguna nota pendiente, mostrar un componente `Message` (PrimeReact) de tamaño grande y color verde indicando: "¡Todo al día! No hay calificaciones pendientes para esta evaluación."
- **Visualización de Datos:** Si hay registros pendientes, mostrar un `DataTable` con capacidad de ordenación por actividad, discente y evaluación.
- **Columnas de la Tabla:**
  - **Discente:** Nombre y Apellidos del alumno.
  - **Actividad:** Número y Enunciado de la actividad (`Versiones`) sin evaluar.
  - **Evaluación:** Nombre de la evaluación correspondiente.
  - **Acción:** Un `Button` de PrimeReact (con icono de lápiz `pi-pencil`) que diga "Calificar".
- **Resumen en el Dashboard (Impacto en Caso 01):** Generar una nueva tarjeta KPI (o etiqueta de alerta) con el conteo global de calificaciones pendientes y colocarla en la pantalla principal (`Dashboard.jsx`), en la Sección Superior (KPIs) o justo encima de la tabla de alertas tempranas.

## 3. Lógica de Negocio y Navegación

* Al pulsar el botón "Calificar" en una fila, la aplicación debe redirigir al usuario utilizando el hook `useNavigate` de `react-router-dom` hacia la pantalla de Calificar Actividades (Caso de uso 06, `/evaluaciones/calificar`).
- **Paso de Estado:** En la redirección, se debe pasar por estado (propiedad `state` del navigate) los identificadores correspondientes (`id_curso`, `id_modulo`, `id_evaluacion`, `id_version`) para que la pantalla de destino pre-seleccione automáticamente los Dropdowns y abra directamente la tabla del ejercicio pendiente.

## 4. Obtención de Datos y Arquitectura

* **Custom Hook:** La lógica se aislará en `src/hooks/useInformePendientes.js`, consumiendo `useDatos`.
- **Lógica de la Consulta (Cross-Check):** El hook expondrá una función `obtenerPendientesPorEvaluacion(idEvaluacion, idModulo)`.
  - La consulta debe cruzar la tabla `imparte` (para obtener a todos los alumnos matriculados en ese módulo/curso) con la tabla `Versiones` (para obtener las actividades asignadas a esa evaluación).
  - El resultado debe filtrarse devolviendo *únicamente* aquellas combinaciones de Alumno + Actividad donde en la tabla `evaluan` el valor de `nota` sea `null` (o donde directamente no exista el registro, dado que la inserción de la nota se realiza al calificar).
  
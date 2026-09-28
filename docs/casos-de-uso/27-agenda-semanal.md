### Caso de Uso 27: Agenda Semanal Curricular (Widget Dashboard)

**1. Objetivo**
Proporcionar al docente un recordatorio rápido y claro en la pantalla principal con los contenidos (Unidades de Trabajo) que deben impartirse durante la semana en curso, basándose en la planificación establecida.

**2. Interfaz de Usuario y Flujo (UI/UX)**

* **Widget en el Dashboard:** Un componente `Card` de PrimeReact titulado "Agenda Semanal".
* **Visualización:** Una lista sencilla (usando `DataView`) que agrupe la información por Módulos.
* Por cada módulo mostrará el nombre o número de la Unidad de Trabajo que toca impartir.
* Se puede acompañar de un pequeño icono de calendario o reloj.
* **Interactividad:** La tarjeta de cada módulo actuará como un enlace interactivo (cursor *pointer* con efecto *hover*). Al hacer clic sobre un módulo concreto, el sistema utilizará `useNavigate` para redirigir al usuario al informe visual de temporización (o al gestor de temporización, Caso 19), prefiltrando automáticamente ese módulo.

**3. Lógica de Base de Datos y Arquitectura**

* **Cálculo de la Semana en Curso:** El frontend (o la consulta RPC en Supabase) debe extraer aquellas Unidades de Trabajo de la tabla `Temporizacion` cuyo intervalo de fechas (`fecha_ini_prevista` a `fecha_fin_prevista`, o las reales si ya han comenzado) se solape con la semana actual (de lunes a domingo respecto a la fecha de hoy).
* **Custom Hook:** Esta lógica puede integrarse en un hook específico para el dashboard (ej. `useDashboardAgenda.js`) o reciclar el hook de temporización añadiéndole un método `obtenerAgendaSemanal(idCurso)`.
* **Custom Hook (`src/hooks/useDashboardAgenda.js`):** Crea una función que obtenga los datos del curso actual. Debe cruzar `Temporizacion`, `Unidades_Trabajo` y `Modulos`. La lógica clave es filtrar solo aquellos registros donde la fecha actual (`new Date()`) se encuentre dentro de la semana que definen `fecha_ini_prevista` y `fecha_fin_prevista` (o las fechas reales si existen).
* **Componente de UI (`src/components/WidgetAgendaSemanal.jsx`):** Construye un componente `Card` de PrimeReact. En su interior, renderiza una lista de los módulos activos. Por cada módulo, muestra la UT correspondiente.
* **Navegación:** Haz que el contenedor de cada módulo tenga estilos interactivos (usando Tailwind: `hover:bg-gray-100 cursor-pointer transition-colors`). Añade un evento `onClick` que utilice `useNavigate` de `react-router-dom` para redirigir a `/planificacion/temporizacion`, pasando el ID del módulo en el `state` de la navegación para que la vista de destino pueda preseleccionarlo.

# Caso de Uso 01: Dashboard Principal (Centro de Mando Analítico)

## 1. Objetivo

Proporcionar al docente un panel de control avanzado al iniciar sesión. El Dashboard no es para insertar datos, sino para **consumir, cruzar y predecir**. Además de mostrar la agenda inminente y el estado de la temporización, actúa como un estratega: detecta desequilibrios en la carga de trabajo futura, avisa de vacíos legales en la planificación curricular y guía el siguiente paso táctico en el aula.

## 2. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** Ruta raíz (`/`) una vez autenticado (`src/pages/DashboardPagina.jsx`).
* **Layout Principal:** Sistema de cuadrícula de PrimeFlex (`grid`, `col-12 md:col-6 lg:col-4`) para una visualización responsiva estilo *bento box*.
* **Widgets Presentacionales (Ubicados en `src/components/dashboard/`):**

  1. **`<WidgetAgendaHoy>` (Operativa Diaria):**
     * Línea temporal vertical (`Timeline` de PrimeReact) con las clases y eventos del día.
     * Cruza el horario semanal con el `Calendario_Eventos`. Muestra exámenes con un `<BadgeEstado>` naranja o cancela las clases visualmente si es festivo. Acceso directo al Diario de Aula.

  2. **`<WidgetMapaTactico>` (El Siguiente Paso):**
     * Lista compacta de los módulos activos.
     * Muestra la posición exacta actual: **2º DAW - UT 4 (Quedan 2 sesiones) → Próxima: UT 5 (Despliegues)**. Evita tener que abrir la programación para saber qué toca mañana.

  3. **`<WidgetRadarCobertura>` (Auditoría Legal):**
     * Gráfico radial (`Chart.js` / `Chart` de PrimeReact) por módulo.
     * Muestra el porcentaje de Resultados de Aprendizaje (RA) o Criterios de Evaluación (CE) que ya han sido asignados a prácticas. Alerta visualmente si un módulo tiene áreas curriculares "huérfanas".

  4. **`<WidgetDetectorSobrecarga>` (Workload Balancer):**
     * Escáner predictivo que analiza los próximos 15 días.
     * Cruza los exámenes del calendario con las fechas de entrega del Taller de Prácticas. Si detecta una acumulación crítica (ej. >3 pruebas/entregas en la misma semana), lanza una alerta amarilla/roja para permitir la reprogramación antes del colapso de los alumnos.

  5. **`<WidgetAlertas>` (Atención Inmediata):**
     * Panel de avisos de anomalías: prácticas sin calificar, diarios de aula vacíos en días pasados, o alumnos con más de un 15% de faltas.

  6. **`<WidgetProgresoCurricular>` (Visión Global):**
     * Barras de progreso (`ProgressBar` de PrimeReact) que comparan el avance real (Unidades de Trabajo terminadas) frente al progreso teórico calculado por el motor de temporización.

  7. **`<WidgetAccesosRapidos>`:**
     * Botones grandes iconográficos para saltar a las vistas de uso intensivo: Cuaderno del Profesor, Taller de Prácticas, y Master Planner.

## 3. Obtención de Datos y Arquitectura

* **Custom Hook Agregador:** Se creará `src/hooks/useDashboard.js`. Este hook orquestará llamadas masivas a `useHorarios`, `useCalendario`, `useEvaluaciones` y `useTemporizacion`.
* **Rendimiento (Promise.all):** Obligatorio disparar las peticiones a Supabase en paralelo. Para cálculos pesados (como el radar de cobertura), se delegará la lógica a funciones *helper* puras para no saturar el renderizado del componente.
* **Componentización:** `DashboardPagina.jsx` será un orquestador 100% "tonto" en su vista. Pasará los fragmentos de datos (`eventosHoy`, `alertasCurriculares`, `estadoUTs`) por `props` a cada widget presentacional independiente.
* **Fase de Implementación:** Se ejecutará en la **Fase 6**, ya que requiere que los módulos de temporización, calendario, prácticas y matriculación existan para tener datos reales que procesar.

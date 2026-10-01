### Caso de Uso 24: Monitor de Desviación Curricular (Dashboard y Gantt)

**1. Objetivo**

Proporcionar al docente un panel de control rápido para monitorizar el ritmo de impartición de las clases respecto a lo planificado. Incluye un widget de alertas de desviación en el Dashboard principal y un informe visual (Línea de tiempo/Gantt) para analizar el progreso global del módulo.

**2. Interfaz de Usuario y Flujo (UI/UX)**

* **Widget en el Dashboard (Panel de Control):**
* Un componente `Card` denominado "Termómetro Curricular".
* Listará los módulos que el docente imparte en el curso actual.
* Por cada módulo, mostrará la Unidad de Trabajo (UT) activa (basado en la fecha actual).
* **Indicador de Desviación:** Un `Badge` o texto con iconos:
* 🟢 "En tiempo" (Fecha actual $\le$ `fecha_fin_prevista`).
* 🔴 "Retraso de X días" (Si la UT sigue 'En Curso' pero la `fecha_fin_prevista` ya pasó).
* Un botón (icono de engranaje) que redirija directamente a la página de edición del **Caso de Uso 19** para hacer ajustes rápidos.
* **Informe Visual Completo (`src/pages/informes/InformeProgreso.jsx`):**
* Nueva entrada en el menú `Informes` llamada `Progreso Curricular`.
* Filtros de Curso y Módulo.
* Un componente `Timeline` de PrimeReact (o la integración de una librería ligera como `frappe-gantt` o Google Charts Gantt).
* Mostrará visualmente el solapamiento entre el periodo previsto (transparente/gris) y el ejecutado real (color sólido, usando verde si se terminó a tiempo, rojo si hubo retraso).

**3. Lógica de Base de Datos y Arquitectura**

* **Cálculo de Desviación:** El algoritmo del frontend restará la `fecha_fin_prevista` de la fecha actual (`CURRENT_DATE`). Si el resultado es positivo y la UT no tiene el estado 'Completada' en la tabla `Temporizacion`, se genera la alerta de retraso.
* **Custom Hook:** Se creará `useMonitorCurricular.js` consumiendo `useDatos` para extraer exclusivamente los registros de la tabla `Temporizacion` cruzados con el nombre de las `Unidades_Trabajo` del curso activo.

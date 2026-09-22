### ⏱️ Caso de Uso 24: Monitor de Desviación Curricular (Dashboard y Gantt)

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

---

### 🤖 Prompt para la IA generadora de código

Copia y pega este texto cuando quieras implementar esta funcionalidad:

> **Rol y Contexto:**
> Eres un desarrollador Senior en React, PrimeReact y Supabase. Trabajamos con el patrón Maestro-Detalle, Custom Hooks (`useDatos`) y TailwindCSS.
> **Tarea:**
> Implementa el "Caso de Uso 24: Monitor de Desviación Curricular". Consta de dos partes: un Widget para el Dashboard y una página de informe visual.
> **Requisitos Técnicos:**
> 1. **Custom Hook (`src/hooks/useMonitorCurricular.js`):** Crea una función que obtenga la tabla `Temporizacion` (con las fechas y estados) cruzada con `Unidades_Trabajo` y `Modulos` para el curso actual. Crea una función utilitaria en JavaScript que calcule los días de desviación comparando la `fecha_fin_prevista` con `new Date()` si el estado no es "Completada".
> 2. **Widget de Dashboard (`src/components/WidgetTermometroCurricular.jsx`):** Crea un componente UI con un `DataView` o lista. Por cada módulo activo, muestra la UT actual y un `Tag` de PrimeReact que indique si va "En tiempo" (verde) o con "X días de retraso" (rojo). Añade un botón "Ajustar" que use `useNavigate` para redirigir a `/planificacion/temporizacion`.
> 3. **Informe Visual (`src/pages/informes/InformeProgreso.jsx`):** Crea una vista con filtros (Curso, Módulo). Implementa un componente `Timeline` de PrimeReact (layout horizontal o vertical) que represente el currículo del módulo. Cada nodo del timeline mostrará el nombre de la UT, las fechas previstas vs reales, y pintará el icono de color rojo si la UT se cerró con retraso o verde si se cumplió el plazo.
> 
> 
> Entrégame el código completo del hook, el componente del widget y la vista del informe.

Con este último añadido, el control que tienes sobre la asignatura (tanto sobre los alumnos como sobre tu propio trabajo docente) es absoluto y milimétrico.

Creo que ya no nos queda ningún rincón oscuro en la aplicación. ¿Te apetece que empecemos a **escribir el código base** del proyecto?
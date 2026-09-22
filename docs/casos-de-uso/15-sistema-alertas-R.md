# ⚙️ Caso de uso 15: Sistema de Alertas Tempranas (Early Warning System)

## 1. Objetivo
Proporcionar al docente una herramienta analítica proactiva que identifique automáticamente a los discentes en riesgo de suspender o abandonar el módulo. El sistema cruzará el progreso temporal del curso (Unidades de Trabajo finalizadas o en curso) con las calificaciones obtenidas en las actividades programadas para generar alertas visuales tempranas cuando un alumno no alcance los mínimos exigidos.

## 2. Lógica de Interfaz y Flujo (UI/UX)
Esta funcionalidad se integrará como un panel destacado dentro del Dashboard principal del docente y tendrá una vista detallada propia ("Alertas Tempranas").

* **Panel Resumen (Dashboard - Impacto en Caso 01):** 
  * Un componente `Card` de PrimeReact que mostrará un indicador numérico crítico (ej. "⚠️ 4 Alumnos en Riesgo").
  * Un componente `Chart` de PrimeReact (tipo *doughnut* o *pie*) agrupando las alertas por Unidad de Trabajo (UT) o Resultado de Aprendizaje (RA).
* **Vista Detallada de Alertas:** 
  * Utilizará un componente `DataTable` de PrimeReact con capacidad de expansión de filas (Row Expansion) y filtrado.
  * **Columnas principales:** Discente (con su avatar/imagen), Unidad de Trabajo, RA afectado, y Nota Media Ponderada Actual.
  * **Uso estricto de colores:** La columna de la nota y el estado de la alerta deben renderizarse utilizando obligatoriamente el helper `getColorNota(nota)` importado de `src/utils/coloresNota.js`. Las notas en riesgo estarán invariablemente en la franja "Suspenso" (<50, tonos rojizos).
  * **Detalle (Row Expansion):** Al expandir la fila de un alumno, se mostrará el detalle exacto de qué actividades (`Versiones`) ha suspendido o no ha entregado dentro de esa UT.

## 3. Reglas de Negocio y Validación
* **Condición de Disparo (Trigger Automático):** 
  * Una alerta se genera si la `fecha_fin_prevista` (o `fecha_fin_real` si existe) de un registro en la tabla `Temporizacion` es anterior o igual a la fecha actual (`CURRENT_DATE`).
  * Y simultáneamente, la nota calculada del alumno para los CE trabajados en esa UT (cruzando `evaluan`, `trabajan`, `Versiones` y `ce_curso`) es **menor estricto a 50**.
* **Ausencia de calificación:** Si una UT ya ha terminado y el discente no tiene registro en `evaluan` para sus actividades, el sistema lo computará como un 0 automático para disparar la alerta clasificada como "Falta de entregas".
* **Estados de la Alerta:** Las alertas se calcularán dinámicamente al vuelo. En el futuro se valorará añadir una tabla extra para gestionar los estados ("Revisada", "Ignorada").

## 4. Obtención de Datos y Arquitectura
* **Delegación de Carga (Base de Datos):** Dado que calcular esto en el frontend para 30 alumnos requiere cruzar al menos 6 tablas complejas, la lógica matemática pesada se ejecutará en Supabase. Se deberá crear una **Vista (View)** o un procedimiento almacenado (RPC) en PostgreSQL llamado `vista_alertas_tempranas` que devuelva un JSON estructurado únicamente con los alumnos en riesgo.
* **Custom Hook:** La lógica de React residirá en el archivo `src/hooks/useAlertasTempranas.js`.
  * Utilizará el hook base `useDatos` para consultar la vista/RPC de Supabase de forma segura.
  * Se respetará el estándar de nombrado con *camelCase* para las funciones (ej. `obtenerAlertasPorCurso(idCurso)`).
  * **Manejo de Errores Estricto:** Si la petición falla, el hook debe devolver un objeto estructurado para su captura en la interfaz: `{ "error": "Mensaje de error detallado", "status": 400 }`.
* **Componentización:** 
  * Crear el componente visual en `src/components/PanelAlertasTempranas.jsx` (utilizando convención *PascalCase*).
  * Mantener el estándar del proyecto de exportar el componente en la última línea del archivo (`export default PanelAlertasTempranas;`).
  * Incluir comentarios explicativos impersonales terminados en punto para guiar al futuro desarrollador (ej. "Se extraen los alumnos con nota inferior a cincuenta.").
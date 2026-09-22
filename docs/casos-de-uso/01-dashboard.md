# Caso de uso 01: Dashboard de Estadísticas y Resumen Global

## 1. Objetivo

Proporcionar al docente una vista principal (Home) al iniciar sesión, donde pueda ver de un vistazo el rendimiento general del centro/clase, identificar rápidamente a los alumnos que necesitan ayuda (mediante el Sistema de Alertas Tempranas) y revisar las métricas globales.

## 2. Lógica de Interfaz y Flujo (UI/UX)

El Panel de control se compondrá de tres secciones principales dispuestas en un grid (cuadrícula) utilizando PrimeReact:

* **Sección Superior (KPIs - Key Performance Indicators):**
  * Tarjetas (`Card` de PrimeReact) mostrando métricas rápidas:
    * Total de Discentes matriculados (activos).
    * Total de Cursos/Módulos activos.
    * Nota Media Global (escala 0-100).
    * Porcentaje total de aprobados vs suspensos.

* **Sección Central (Gráficos):**
  * **Gráfico de Barras:** Evolución o comparativa de la "Nota Media por Módulo". (Utilizar el componente `Chart` de PrimeReact).
  * **Gráfico Circular (Doughnut):** Distribución global de notas (Suspensos, Suficientes, Bien, Notables, Sobresalientes). **Obligatorio:** Los colores del gráfico deben extraerse del helper `getColorNota` (`src/utils/coloresNota.js`).

* **Sección Inferior (Alertas Tempranas):**
  * Integración de la tabla "Alumnos en Riesgo" definida en el Caso de Uso 20 (Sistema de Alertas Tempranas).
  * Un `DataTable` que muestre a los discentes cuya nota media ponderada en Unidades de Trabajo ya finalizadas sea inferior a 50.

## 3. Reglas de Negocio y Algoritmos de Cálculo

* **Nota Media Global:** Se calcula promediando las calificaciones de la tabla `evaluan` (ignorando a los alumnos sin calificar). Aunque las notas base son enteros (0-100), las *medias* mostradas en el dashboard pueden redondearse a 2 decimales para mayor precisión estadística.
* **Umbral de Aprobado:** El corte estricto es 50. Cualquier media menor a 50 se considera "Suspenso".

## 4. Obtención de Datos y Arquitectura

Actúa como un desarrollador Frontend Experto y ejecuta estos pasos:

* Dependencias: Instala chart.js si no está instalado, ya que lo necesitaremos para los componentes de PrimeReact.
* No se usarán servicios directos. Al montar el componente, se debe llamar al *Custom Hook* `useDashboardStats` (que utilizará internamente `useDatos` para interactuar con Supabase).
* Para la sección inferior, se consumirá el hook `useAlertasTempranas`.
* Manejo de estado visual: Mientras se obtienen los datos, mostrar el componente `Skeleton` o `ProgressSpinner` de PrimeReact.
* Estado vacío: Si no hay datos, mostrar un componente `Message` amigable: *"Aún no hay datos suficientes para mostrar estadísticas. Comienza configurando un curso y añadiendo calificaciones."*

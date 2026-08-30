# Caso de uso: Dashboard de Estadísticas y Resumen Global

## 1. Objetivo

Proporcionar al docente una vista principal (Home) al iniciar sesión, donde pueda ver de un vistazo el rendimiento general del centro/clase, identificar rápidamente a los alumnos que necesitan ayuda y revisar las métricas globales.

## 2. Lógica de Interfaz y Flujo (UI/UX)

El Dashboard se compondrá de tres secciones principales dispuestas en un grid (cuadrícula):

* **Sección Superior (KPIs - Key Performance Indicators):**
  * Tres o cuatro tarjetas (`Card` de PrimeReact) mostrando métricas rápidas:
    * Total de Alumnos matriculados.
    * Total de Asignaturas activas.
    * Nota Media Global (de todas las notas del sistema).
    * Porcentaje total de aprobados vs suspensos.

* **Sección Central (Gráficos):**
  * **Gráfico de Barras:** Evolución o comparativa de la "Nota Media por Asignatura". (Utilizar el componente `Chart` de PrimeReact).
  * **Gráfico Circular (Doughnut):** Distribución global de notas (Porcentaje de Suspensos, Aprobados, Notables, Sobresalientes).

* **Sección Inferior (Alertas/Tablas):**
  * Una tabla pequeña (`DataTable` de PrimeReact) titulada "Alumnos en Riesgo".
  * Debe mostrar solo los alumnos que tengan 2 o más asignaturas suspensas (nota menor a 5.00).

## 3. Reglas de Negocio y Algoritmos de Cálculo

* **Nota Media Global:** Se calcula sumando absolutamente todas las calificaciones de la base de datos y dividiéndolas por el número total de calificaciones (ignorar alumnos no calificados para no alterar la media a la baja).
* **Alumnos en Riesgo:**
  * Iterar sobre el listado de alumnos y sus notas.
  * Si `contador_notas_menores_a_5 >= 2`, el alumno entra en esta lista.
* **Redondeo:** Todas las medias calculadas para el dashboard deben redondearse a 2 decimales.

## 4. Obtención de Datos (Services) y Estados

* Al montar el componente, se debe llamar al servicio `getDashboardStats()` que idealmente debería devolver todas estas métricas ya procesadas (o procesarlas en un *Custom Hook* `useDashboardStats` si el backend devuelve los datos en bruto).
* Mientras se calculan u obtienen los datos, mostrar el componente `Skeleton` o `ProgressSpinner` de PrimeReact para indicar que la página está cargando.
* Si no hay alumnos o notas en el sistema, mostrar un `Message` (PrimeReact) amigable indicando: *"Aún no hay datos suficientes para mostrar estadísticas. Comienza añadiendo alumnos y calificaciones."*

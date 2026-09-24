# Caso de uso 30: Gestor de horarios y disponibilidad de aula

## 1. Objetivo

Registrar la plantilla horaria semanal (lunes a viernes) del docente y de sus clases (grupos de alumnos). Esta herramienta alimenta el widget de la Agenda Semanal con horas exactas, permite calcular las "sesiones reales" para la temporización automática, y visualiza el horario completo del grupo/clase para facilitar la coordinación de exámenes o actividades con otros profesores.

## 2. Enfoque Conceptual

Los registros de cursos académicos se tratan conceptualmente como **Clases** en la interfaz y en los flujos del usuario (sin requerir cambios estructurales en la base de datos). Cada clase representa un grupo físico de alumnos en un año académico determinado y dispone de su propia configuración de tramos horarios semanales.

## 3. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** Entrada en el menú `Planificación` denominada `Horario` (`src/pages/HorarioPagina.jsx`).
* **Selector de Año Académico:** Cabecera con selector desplegable (`<Dropdown>`) que agrupa y filtra por año escolar (ej. "2026/2027"), mostrando las clases correspondientes a dicho período lectivo.
* **Layout Principal (`TabView` de 2 pestañas):**

### Pestaña 1: Mi Horario Docente (Global)
* Cuadrícula visual que consolida automáticamente todas las celdas donde figuras como docente titular a partir de las clases asignadas en la Pestaña 2.
* **Resumen de Carga Docente:** Tarjetas informativas con horas lectivas, horas no lectivas, horas totales y clases atendidas.
* **Tareas Docentes Personales (horas sueltas):** Al hacer clic en una celda vacía o de recreo, se abre un diálogo modal para añadir o editar tareas personales del docente sin clase asociada (ej. "Guardia de recreo", "Reunión de Departamento", "Tutoría de padres", "Coordinación").
* **Interruptor de Carga Lectiva:** El diálogo incluye un *checkbox* denominado "Es hora lectiva para el cómputo docente" (`es_lectiva`), permitiendo computar tareas docentes específicas dentro del cómputo lectivo semanal sin asociarlas a un módulo curricular.

### Pestaña 2: Horario por Clases
* **Barra de selección de clases:** Se muestran permanentemente como botones todas las clases disponibles del año académico activo, independientemente de si ya cuentan con tramos horarios definidos o no.
* **Gestión integrada de tramos:**
  * Si la clase no tiene tramos configurados, se muestra un estado vacío con opciones para:
    * **Configurar Tramos:** Abre el diálogo para generar tramos predeterminados o por franja horaria y recreos.
    * **Añadir Manualmente:** Abre el diálogo para registrar un tramo individual especificando orden, hora de inicio y fin.
    * **Clonar de Otra Clase:** Permite replicar los tramos horarios de otra clase registrada.
  * Si la clase ya tiene tramos configurados, sobre la cuadrícula semanal se ofrece una barra de herramientas con:
    * **Añadir Manualmente:** Añade un nuevo tramo horario a la clase.
    * **Configurar Tramos:** Regenera o recalcula los tramos horarios.
    * **Clonar Tramos:** Sobrescribe los tramos clonando la estructura de otra clase.
    * **Eliminar todos los tramos:** Botón con diálogo de confirmación para vaciar la plantilla horaria de la clase actual.
* **Asignación de sesiones en la cuadrícula:**
  * Al pulsar en una celda vacía (botón `+` centrado vertical y horizontalmente), se abre un diálogo modal.
  * El desplegable de `Módulo curricular` filtra y muestra exclusivamente los módulos pertenecientes al ciclo formativo al que pertenece el módulo vinculado a la clase seleccionada. Por defecto, aparece preseleccionado el módulo curricular asociado a dicha clase.
  * Si se activa la casilla "Es mi clase", se asigna como docente titular.
  * Si no es clase propia, se desmarca dicha casilla y se utiliza el mismo selector de módulos del ciclo (con el mismo módulo preseleccionado por defecto), permitiendo indicar además el nombre del docente que la imparte y el aula.
  * Las celdas de recreo se muestran bloqueadas (sin permitir asignación de clases ni tareas), resaltadas con un fondo gris acorde al estilo visual de la aplicación y con la palabra `Recreo` en texto normal sin elementos tipo badge o tag.

## 4. Obtención de Datos y Arquitectura

* **Custom Hook (`src/hooks/useHorarios.js`):** Gestiona la carga, reactividad y persistencia de las tablas `Tramos_Horarios` y `Horarios` en Supabase.
* **Cálculo de Carga Lectiva:** Se computan como horas lectivas tanto las sesiones de módulos curriculares asignados como las tareas personales que tengan marcado `es_lectiva = true`.
* **Sinergia con la Temporización Inteligente y Agenda:** El motor de temporización utiliza estrictamente los registros con `id_curso` e `id_modulo` válidos para la distribución de sesiones reales, manteniendo intacta la coherencia curricular.

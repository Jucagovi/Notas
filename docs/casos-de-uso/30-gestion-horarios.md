# Caso de uso 30: gestor de horarios y disponibilidad de aula

## 1. Objetivo

Registrar la plantilla horaria semanal (lunes a viernes) del docente y de sus grupos. Esta herramienta alimenta el widget de la Agenda Semanal con horas exactas, permite calcular las "sesiones reales" para la temporización automática, y visualiza el horario completo del grupo para facilitar la coordinación de exámenes o actividades con otros profesores.

## 2. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** Entrada en el menú `Planificación` denominada `Horario` (`src/pages/HorarioPagina.jsx`).
* **Layout Principal (`TabView`):**
* **Pestaña 1: Mi Horario Docente (Global):**
  * Un grid visual que consolida automáticamente todas las celdas donde figuras como profesor en la Pestaña 2.
  * **Edición de horas no lectivas:** Al hacer clic en una celda vacía de esta pestaña, se abre un `Dialog` simple para añadir tareas que no pertenecen a un curso (ej. "Guardia", "Reunión de Departamento", "Tutoría"). Estas se guardarán en la base de datos sin vincularse a ningún `id_curso` ni `id_modulo`.
* **Pestaña 2: Horario por Cursos:**
  * Uso estricto del componente `<SelectorCurso>` para seleccionar el curso (que representa al grupo físico real).
  * Un grid visual donde las columnas son los días (Lunes - Viernes) y las filas son los Tramos. Sirve para ver la semana completa de los alumnos.
  * Al hacer clic en una celda vacía, se abre un `Dialog`. Si marcas el *checkbox* "Es mi clase", seleccionas el módulo desde el `<SelectorModulo>`. Si no lo marcas, escribes manualmente la asignatura y el compañero.
* **Pestaña 3: Configuración de Tramos:** Un `DataTable` editable con edición en celda (`cellEdit`) para definir los números, horas de inicio/fin y descripciones de cada hora lectiva o recreo.

## 3. Obtención de Datos y Arquitectura

* **Custom Hook:** Se creará `src/hooks/useHorarios.js`, consumiendo `useDatos` para gestionar `Tramos_Horarios` y `Horario`. Las inserciones desde la Pestaña 3 enviarán `id_curso` e `id_modulo` como `null`.
* **Sinergia con el Dashboard (Agenda Semanal):** El hook del widget del Dashboard cruzará el día actual con tu horario personal, mostrando tanto las clases lectivas como las horas de guardia/reuniones.
* **Sinergia con la Temporización Inteligente:** El motor matemático consultará estrictamente los registros de esta tabla que tengan un `id_curso` válido para calcular las horas de clase a la semana, ignorando las tareas generales (guardias, reuniones).


## 2. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** Entrada en el menú `Planificación` denominada `Horario` (`src/pages/HorarioPagina.jsx`).
* **Layout Principal (`TabView`):**
* **Pestaña 1: Mi Horario Docente (Global):**
  * Un grid visual que consolida todas las celdas donde figuras como profesor.
  * **Edición de horas sueltas:** Al hacer clic en una celda vacía, se abre un `Dialog` para añadir tareas sin curso asociado (ej. "Guardia", "Seminario").
  * **Interruptor de Carga Lectiva:** Este `Dialog` incluirá un `InputSwitch` o *checkbox* denominado "Es hora lectiva". Permite registrar horas sueltas que sí deben contar para tu cómputo de carga lectiva semanal.
* **Pestaña 2: Horario por Cursos:**
  * Uso estricto del componente `<SelectorCurso>` para seleccionar el curso.
  * Un grid visual donde las columnas son los días (Lunes - Viernes) y las filas son los Tramos.
  * Al hacer clic en una celda vacía, se abre un `Dialog`. Si marcas el *checkbox* "Es mi clase", seleccionas el módulo desde el `<SelectorModulo>`. Las clases creadas aquí son automáticamente lectivas. Si no lo marcas, escribes manualmente la asignatura y el compañero.
* **Pestaña 3: Configuración de Tramos:** Un `DataTable` editable para definir los números, horas de inicio/fin y descripciones de cada hora lectiva o recreo.

## 3. Obtención de Datos y Arquitectura

* **Custom Hook:** Se creará `src/hooks/useHorarios.js`, gestionando `Tramos_Horarios` y `Horario`. La tabla `Horarios` debe incluir el campo booleano `es_lectiva`.
* **Sinergia Analítica y Dashboard:** Para sumar tus horas lectivas semanales, los informes simplemente filtrarán por `es_lectiva = true`, independientemente de si tienen módulo o no.
* **Sinergia con la Temporización Inteligente:** El motor matemático seguirá cruzando únicamente los registros que tengan un `id_curso` e `id_modulo` válidos. Ignorará las horas sueltas (sean lectivas o no), manteniendo la precisión del reparto de sesiones intacta.

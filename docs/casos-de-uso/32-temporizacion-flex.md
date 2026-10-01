# Caso de uso 32: Flexibilización de Módulos (Creación y Temporización)

## 1. Objetivo

Permitir al docente configurar la flexibilización temporal de dos módulos durante la creación de un nuevo curso académico. El sistema automatizará la creación de las entidades necesarias vinculándolas mediante el campo `id_modulo_flexibilizado`, replicará las matriculaciones de los discentes para ambos módulos y fusionará sus cargas lectivas en una única bolsa de horas para el cálculo unificado en la pantalla de Temporización, manteniendo siempre separadas sus evaluaciones y contenidos curriculares.

## 2. Interfaz de Usuario y Navegación (UI/UX)

* **Modificación en "Crear clase" (`Stepper` de Asistente):**
* En el Paso 2 (Módulos) del `Stepper`, se añadirá un componente `Checkbox` o `InputSwitch` de PrimeReact con la etiqueta "¿Flexibilizar con otro módulo?".

* Si el usuario activa este control, se desplegará dinámicamente un segundo `Dropdown` (reutilizando el componente existente para módulos) que permitirá seleccionar el módulo secundario a flexibilizar.

* El componente `Dropdown` secundario filtrará automáticamente sus opciones para ocultar el módulo principal previamente seleccionado, evitando que un módulo se flexibilice consigo mismo. Además, en ese `DropDown` sólo paraecerán los módulos pertencientes al ciclo al que pertenece ese módulo (no se pueden flexibilizar módulos de ciclos distintos).

* **Modificación en "Temporización":**
* En la cabecera de la página (`FiltrosTemporizacion.jsx`), si se selecciona una clase que tiene el campo `id_modulo_flexibilizado` con datos, se mostrará un componente `<BadgeEstado>` o `Tag` informativo indicando visualmente: *"Módulo flexibilizado con [Nombre del módulo secundario]"*.

* Las secciones del Calendario Escolar, Diagrama de Gantt y listado de Unidades de Trabajo mostrarán las unidades del módulo actual, pero su distribución visual abarcará los huecos horarios de ambos módulos fusionados.

## 3. Reglas de Negocio y Validación

* **Lógica de Creación Dual en el Asistente:**
* Al llegar al Paso 6 y pulsar en "Aceptar y guardar", si el curso es flexibilizado, el sistema no creará uno, sino **dos** registros distintos en la tabla `Cursos`.

* **Cruce de identificadores:** El curso del módulo principal guardará en su columna `id_modulo_flexibilizado` el UUID del módulo secundario, y el curso del módulo secundario guardará el UUID del módulo principal, creando una relación bidireccional para ese año académico.

* **Matriculación de Discentes (`imparte`):**
* Los alumnos seleccionados en el Paso 3 mediante el listado de selección múltiple serán matriculados automáticamente en ambos cursos creados. Se insertarán registros en la tabla `imparte` tanto para el `id_curso` principal como para el secundario con los mismos discentes.

* **Auto-Evaluaciones Separadas:**
* Durante el Paso 4, el sistema respetará la arquitectura generando 5 registros ('Primera', 'Segunda', 'Tercera', 'Final', 'Extraordinaria') en la tabla `Evaluaciones` para el módulo principal, y **otros 5 registros independientes** para el módulo secundario.

* **Cálculo de la Temporización Flexibilizada:**
* Al pulsar el botón "Propuesta" en la pantalla de Temporización, el asistente de cálculo verificará si la clase tiene un `id_modulo_flexibilizado`.

* Si lo tiene, el motor extraerá los días y horas de la tabla `Horarios` correspondientes al módulo actual y también los correspondientes al módulo flexibilizado, combinándolos en un solo calendario lectivo.
* Las `fecha_ini_prevista` y `fecha_fin_prevista` de las Unidades de Trabajo se calcularán consumiendo las horas totales de esa bolsa conjunta.

## 4. Datos y Arquitectura (React y Supabase)

* **Modificación de Custom Hooks de Configuración:**
* El hook `src/hooks/useConfiguracionCurso.js` modificará su función `generarCursoCompleto(...)` para orquestar una transacción múltiple que inserte ambos cursos, sus evaluaciones independientes y las matriculaciones (`imparte`) cruzadas de forma secuencial.

* **Modificación de Custom Hooks de Temporización:**
* El hook `src/hooks/usePropuestaTemporizacion.js` encargado de calcular la distribución de días lectivos, se actualizará. Al consultar los `Horarios` mediante el hook genérico `useDatos`, incluirá un filtro condicional (ej. `or(id_modulo.eq.MODULO_A, id_modulo.eq.MODULO_B)`) para obtener las sesiones conjuntas.

* **Manejo de Errores y Transacciones:**
* Dado que la creación flexibilizada implica múltiples inserciones en `Cursos`, `imparte` y `Evaluaciones`, la función debe validar que todas las operaciones devuelvan un estado correcto. Si falla alguna, se debe propagar un objeto de error estructurado (`{ error: "Mensaje", status: 400 }`) y el frontend lanzará un `Toast` de error en el componente `Stepper`, abortando la operación para mantener la integridad referencial.

* Todo el código, variables y comentarios en la modificación de estos hooks y componentes se redactarán en castellano, respetando el estilo impersonal y las normas de *camelCase* y *PascalCase* definidas en el proyecto.

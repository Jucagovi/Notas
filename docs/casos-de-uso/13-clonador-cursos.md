# Caso de uso : herramienta de rollover (clonado de cursos)

## 1. Objetivo

Automatizar la creación de un nuevo año académico basándose en la configuración de un curso anterior (permitirá seleccionar el curso que va a ser copiado). Se creará el nuevo curso y se replicará su estructura de evaluaciones y módulos asociados, dejándolo listo para la importación de los nuevos discentes.

## 2. Interfaz de Usuario (UI)

- En **menú principal de la izquierda** en la sección de `Herramientas` (dentro del subapartado `SEGURIDAD`) habilita una nueva entrada denominada `Clonado curso` que conduzca al fichero src/pages/ClonadoCurso.jsx.
- **Layout:** Un componente `Card` centrado con un formulario paso a paso o distribuido en secciones claras.
- **Sección Origen (Qué copiamos):**
  - `Dropdown` (PrimeReact) para seleccionar el "Curso Origen" (ej. 2025/2026).
  - Al seleccionarlo, mostrar una lista de solo lectura (`Chip` o `Listbox` de PrimeReact) con los Módulos que se impartieron en ese curso.
- **Sección Destino (Nuevo Curso):**
  - Campos de texto (`InputText`) para el Nombre, Centro y Año del nuevo curso (pre-rellenados inteligentemente, ej. sumando 1 al año del curso origen).
- **Acción:** Un botón grande "Clonar Curso y Preparar Evaluaciones".

## 3. Lógica de Base de Datos y Transacción

- **Paso 1:** Insertar el nuevo registro en la tabla `Cursos`.
- **Paso 2:** Por cada módulo asociado al curso original (identificados a través de la tabla `imparte` o `Evaluaciones`), crear los 4 nuevos registros en la tabla `Evaluaciones` vinculados al nuevo `id_curso` y a los `id_modulo` correspondientes.
- **Prevención de errores:** Todo el proceso debe ejecutarse de forma secuencial. Si falla la creación de las evaluaciones, debe avisarse al usuario.

## 4. Servicios (Supabase)

- Crear `src/services/clonadoService.js`.
- Añadir la función `clonarCurso(cursoOrigenId, datosNuevoCurso)` que orqueste las llamadas a la API de Supabase para leer la estructura antigua e insertar la nueva.

## Propuesta

# 🔄 Caso de uso 13: Herramienta de Rollover (Clonado de Cursos)

## 1. Objetivo

Automatizar la creación de un nuevo año académico basándose en la configuración de un curso anterior. Se creará el nuevo curso y se replicará íntegramente su estructura base (Módulos, Evaluaciones, Ponderaciones curriculares y Actividades planificadas), dejándolo virgen y listo para la matriculación de los nuevos discentes.

## 2. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** En el menú principal izquierdo, dentro de la sección `Herramientas` (subapartado `SEGURIDAD`), se habilitará una nueva entrada denominada `Clonado curso` que conducirá al componente `src/pages/ClonadoCurso.jsx`.
- **Layout:** Un componente `Card` de PrimeReact centrado, dividido en dos secciones claras.
- **Sección Origen (Qué copiamos):**
  - `Dropdown` para seleccionar el "Curso Académico Origen" (ej. 2024/2025).
  - Al seleccionarlo, se mostrará un componente `Chip` o `Listbox` de PrimeReact (solo lectura) listando los Módulos que se impartieron en ese curso para dar *feedback* visual de lo que se va a clonar.
- **Sección Destino (Nuevo Curso):**
  - Campos `InputText` para el Nombre, Centro y Año del nuevo curso.
  - *UX Tip:* El campo Año debe autocompletarse inteligentemente (ej. extrayendo el año del curso origen y sumándole 1).
- **Acción:** Un `Button` grande y destacado: "Clonar Curso y Estructura". Mientras procesa, debe mostrar un indicador de carga (`loading`).

## 3. Lógica de Base de Datos y Transacción

Para garantizar la integridad referencial y evitar datos huérfanos por cortes de conexión, el proceso se ejecutará en bloque (Transacción) en el servidor de base de datos. El clonado abarcará:
- **Paso 1:** Inserción del nuevo registro maestro en la tabla `Cursos`.
- **Paso 2:** Clonación de los registros de `Evaluaciones` para los módulos asociados, vinculándolos al nuevo `id_curso`.
- **Paso 3:** Clonación de la programación didáctica vinculada a ese curso: pesos curriculares (`ra_curso`, `ce_curso`), planificación (`Temporizacion`) y el esqueleto de actividades (`Versiones`).
- **Exclusión:** No se clonarán los registros de `Discentes`, `imparte` (matrículas) ni `evaluan` (notas).

## 4. Obtención de Datos y Arquitectura

* **Custom Hook:** Se prescindirá del servicio aislado. La lógica residirá en el hook `src/hooks/useClonadoCurso.js`, utilizando `useDatos`.
- **Uso de RPC (Remote Procedure Call):** El hook invocará una función nativa de Supabase (ej. `supabase.rpc('clonar_curso_academico', { id_origen, datos_destino })`). Esta función PL/pgSQL encapsulará los `INSERT` masivos dentro de una transacción segura.
- **Feedback:** Mostrar un `Toast` de éxito al terminar o un mensaje de error si la transacción fue revertida (Rollback).

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

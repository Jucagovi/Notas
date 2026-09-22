# Caso de uso: acta de evaluación por RA

## 1. Objetivo

Generar un informe oficial que detalle la calificación obtenida por cada discente en cada Resultado de Aprendizaje (RA), calculando automáticamente la nota final del módulo en base a los pesos configurados para ese curso escolar.

## 2. Interfaz de Usuario (UI)

- **Nueva entrada en el menú:** habilita una nueva entrada en el menú `Informes` en forma de submenú con el nombre `Acta evaluación RA` que conducirá a la página `src/pages/informes/InformeEvaluacionRa.jsx`. Debes crear esa paǵina.
- **Selectores de Contexto:** `Dropdown` (PrimeReact) para elegir Curso y Módulo. Se seleccionará por defecto en curso más actual de froma automática aunque ningun módulo (que deberá ser el usuario el que lo seleccione).
- **Tabla Dinámica (Pivot):** Un `DataTable` donde:
  - La primera columna (fija) muestra los Apellidos y Nombre del discente.
  - Las columnas intermedias se generan dinámicamente, una por cada RA del módulo (ej. "RA 1", "RA 2").
  - La última columna muestra la "Nota Final" del módulo.
- **Exportación:** Botones en el encabezado de la tabla para exportar a PDF (formato oficial) y CSV.
- Para compatibilizar con el sistema tradicional de tres evaluaciones: crea el botón `calcular nota para evaluación` con el que se obtenga la nota actual de la evaluación tan sólo con los RA que están completos (todos sus CE han sido cubiertos con una nota en sus prácticas). Esa nota será la que aparezca en el boletín de cada evaluación (como nota temporal)-
- Evaluación contínua: nota actual de la evaluación con todos los RA completos y totalizada a 100.

## 3. Lógica de Cálculo (Frontend)

- El servicio debe extraer las calificaciones de las prácticas (`evaluan`) y los porcentajes de cobertura (`trabajan`).
- La nota de cada RA se calcula sumando las notas de sus CE correspondientes, aplicando el peso definido en `ce_curso`.
- La Nota Final del módulo se calcula ponderando la nota de cada RA con su peso definido en `ra_curso`.

## 4. Servicios (Supabase)

- Crear la función `getActaPorRA(cursoId, moduloId)` en el servicio correspondiente.
- Utilizar transformaciones en JavaScript para procesar los datos crudos devueltos por Supabase y construir el array plano requerido por el `DataTable`.

## Practica

# 📑 Caso de uso 17: Acta de Evaluación por Resultados de Aprendizaje (RA)

## 1. Objetivo

Generar el informe oficial definitivo que detalla la calificación competencial de cada discente en cada Resultado de Aprendizaje (RA) de un módulo. Permite calcular tanto la Nota Final oficial (ponderada según el diseño del curso) como notas de Evaluación Continua (reescalando el progreso actual para los boletines trimestrales).

## 2. Interfaz de Usuario y Flujo (UI/UX)

- **Navegación:** Habilitar un submenú en la sección `Informes` con el nombre `Acta evaluación RA`, que conducirá a la página `src/pages/informes/InformeEvaluacionRa.jsx`.

- **Filtros Contextuales (Header):** Componentes `Dropdown` (PrimeReact) para elegir Curso y Módulo. El Dropdown de Cursos seleccionará el curso más reciente por defecto; el de Módulos esperará la acción del usuario.
- **Barra de Herramientas (Toolbar):**
  - Botones de exportación: "Exportar a PDF" (formato de acta oficial) y "Exportar CSV".
  - **Modos de Cálculo (Toggles/Botones):** Un selector (ej. `SelectButton` de PrimeReact) para alternar entre "Evaluación Continua" (calcula la nota trimestral reescalando a 100 solo con los RA completados hasta la fecha) y "Evaluación Final" (asume como 0 lo no evaluado y calcula sobre el currículo total).
- **Tabla Dinámica (Pivot Table):** Un `DataTable` de PrimeReact.
  - **Columna Fija:** Apellidos y Nombre del discente (fijada a la izquierda, `frozen`).
  - **Columnas Dinámicas (RA):** Una columna por cada RA del módulo (ej. "RA 1", "RA 2"). Renderizarán la nota obtenida (0-100) y aplicarán estrictamente el color de fondo usando `getColorNota(nota)` (`src/utils/coloresNota.js`).
  - **Columna Final:** "Nota Módulo". Mostrará el cálculo global dependiendo del modo seleccionado en la barra de herramientas.

## 3. Lógica de Cálculo (Continua vs Final)

- **Nota del CE y RA (Base):** Se obtiene de sumar las notas de las actividades (`Versiones`) multiplicadas por su cobertura (`trabajan`), aplicando el peso del CE (`ce_curso`).

- **Modo Evaluación Continua (Nota Temporal):** Extrae solo los RA que ya están "completos" (cuyos CE han sido evaluados totalmente). Suma las notas obtenidas en esos RA y divide el resultado entre la suma de los pesos de *esos específicos RA* (reescalado temporal al 100%).
- **Modo Evaluación Final (Acta Oficial):** Pondera la nota de cada RA con su peso definido en `ra_curso` frente al total del 100% del currículo.

## 4. Obtención de Datos y Arquitectura

- **Delegación de Carga Computacional:** El cruce completo de datos (`evaluan` -> `Versiones` -> `trabajan` -> `ce_curso` -> `ra_curso`) para toda una clase colapsaría el rendimiento de React. Esta operación debe encapsularse en una función RPC (Remote Procedure Call) en Supabase (ej. `calcular_acta_ra(id_curso, id_modulo)`), la cual devolverá las notas base de los RA por cada alumno.

- **Custom Hook:** Se prescindirá del servicio aislado. Se creará el hook `src/hooks/useInformeActaRA.js` consumiendo `useDatos`.
- **Procesamiento de UI (Frontend):** El hook llamará a la función RPC y recibirá un JSON estructurado. React se encargará únicamente del pivote final (darle forma al `DataTable`) y de aplicar la lógica matemática de reescalado (Continua vs Final) basándose en la selección del usuario.

# Caso de uso 17: Acta de Evaluación por Resultados de Aprendizaje (RA)

## 1. Objetivo

Generar el informe oficial definitivo que detalla la calificación competencial de cada discente en cada Resultado de Aprendizaje (RA) de un módulo. Permite calcular tanto la Nota Final oficial (ponderada según el diseño del curso) como notas de Evaluación Continua (reescalando el progreso actual para los boletines trimestrales).

## 2. Interfaz de Usuario y Flujo (UI/UX)

- **Navegación:** Habilitar un submenú en la sección `Evaluación` con el nombre `Acta evaluación RA`, que conducirá a la página `src/pages/informes/InformeEvaluacionRa.jsx`.

- **Filtros Contextuales (Header):** Componentes `Dropdown` (PrimeReact) para elegir `Año académico` (obtenida de la tabla cursos y mostrada coo 2026/2027 para el año 2026) que filtrará los Cursos/Clases de ese año académico (la clase ya lleva asociado un módulo). El Dropdown de `Año académico` seleccionará el año más reciente por defecto; el de Curso/Clase esperará la acción del usuario.
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

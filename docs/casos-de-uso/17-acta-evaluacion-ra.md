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

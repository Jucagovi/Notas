# Caso de uso: informe Acta de Evaluación Oficial (Boletín)

## 1. Objetivo

Generar el acta oficial de un módulo, calculando la nota final ponderada de cada evaluación para todos los discentes matriculados. Se debe permitir la exportación a CSV y PDF para entregar a Jefatura de Estudios.

## 2. Interfaz de Usuario (UI)

- **Nueva entrada en el menú:** habilita una nueva entrada en el menú `Informes` en forma de submenú con el nombre `Evaluación módulo` que conducirá a la página `src/pages/informes/InformeEvaluacion.jsx`. Debes crear esa paǵina.
- **Filtros Superiores:** `Dropdown` (PrimeReact) para seleccionar Curso y Módulo.  Sólo el <DropDown> de Cursos tendrá selección al inicio y será el curso más reciente. El resto de <DropDown> esperarán la intervención del usuario.
- **Barra de Herramientas (Toolbar):** Dos botones a la derecha: "Exportar CSV" y "Exportar PDF".
- **Visualización (Pivot Table):** Un `DataTable` de PrimeReact donde:
  - Cada fila es un registro de la tabla `Discentes`.
  - La primera columna es el Nombre y Apellidos (fija a la izquierda).
  - Las siguientes columnas corresponden a las `Evaluaciones` generadas para ese módulo (ej. '1ª Evaluación', '2ª Evaluación', 'Final', 'Extraordinaria').
  - **Formato de Nota:** Las notas deben mostrarse usando nuestro helper centralizado (`getGradeColor` y `formatNota`). Si un alumno no tiene notas en una evaluación, mostrar '?'.

## 3. Algoritmo de Cálculo (Pivote de Datos)

El frontend debe recibir todas las calificaciones del módulo procedentes de la tabla `evaluan` y agruparlas por discente y evaluación.
Para calcular la nota final de una evaluación, se debe aplicar la suma ponderada: multiplicar cada `nota` por su `peso` y dividirlo entre 100 (asumiendo que los pesos suman 100).

## 4. Obtención de Datos y Servicios

- **Dependencias Adicionales:** Se requiere instalar `jspdf` y `jspdf-autotable` para la generación del PDF.
- Añadir la función `getDatosActa(moduloId)` en `src/services/informesService.js`. Esta función hará un `select` cruzando `imparte` (para obtener todos los alumnos), `Evaluaciones`, `Practicas` y `evaluan`. Sólo se mostrarán los alumnos que estén matriculados en el curso y módulo especificados en los <DropDown>.
- Crear una función `transformarDatosActa(datosCrudos)` que devuelva un array plano estructurado para el `DataTable`, por ejemplo: `[{ id_discente, nombre, notas: { id_evaluacion_1: 7.5, id_evaluacion_2: 6.0 } }]`.

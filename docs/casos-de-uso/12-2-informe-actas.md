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

## Propuesta

# 📄 Caso de uso 12.2: Informe Acta por Trimestres (Boletín Oficial)

## 1. Objetivo

Generar el acta oficial de un módulo, calculando la nota final ponderada de cada evaluación para todos los discentes matriculados en el curso. Se debe permitir la exportación a CSV y PDF para su entrega a Jefatura de Estudios.

## 2. Interfaz de Usuario (UI)

* **Nueva entrada en el menú:** Habilitar un submenú en la sección `Informes` con el nombre `Acta por trimestres`, que conducirá a la página `src/pages/informes/InformeActaTrimestres.jsx`.
- **Filtros Contextuales:** Componentes `Dropdown` (PrimeReact) para seleccionar Curso y Módulo. El Dropdown de Cursos debe autoseleccionar el curso más reciente al cargar la vista; el resto esperará la intervención del usuario.
- **Barra de Herramientas (Toolbar):** Dos botones ubicados a la derecha de la tabla: "Exportar CSV" y "Exportar PDF".
- **Visualización (Pivot Table):** Un `DataTable` de PrimeReact donde:
  - Cada fila es un registro de la tabla `Discentes`.
  - La primera columna es "Nombre y Apellidos" (columna fijada a la izquierda mediante `frozen`).
  - Las siguientes columnas se generan dinámicamente según las `Evaluaciones` vinculadas (ej. '1ª Evaluación', '2ª Evaluación', 'Final Ordinaria', 'Extraordinaria').
  - **Formato de Nota (Regla estricta):** Las notas son números enteros (0-100). El fondo o el texto de la celda debe colorearse utilizando obligatoriamente el helper `getColorNota(nota)` (`src/utils/coloresNota.js`). Si un alumno no tiene notas computables, mostrar el carácter `?`.

## 3. Algoritmo de Cálculo (Pivote de Datos)

El frontend recibirá las calificaciones del módulo y las agrupará por discente y evaluación.
Para calcular la nota de cada evaluación se aplicará la lógica matemática definida en el **Caso de Uso 05 (Algoritmo de Normalización)**:

1. Rescatar los pesos de los RA asignados a esa evaluación (`ra_evaluacion` y `ra_curso`).
2. Sumar los pesos de los RA implicados.
3. Multiplicar la nota obtenida en las actividades (`Versiones`) vinculadas a cada RA por su peso, sumar los resultados y dividir entre la suma total de los pesos (reescalado al 100%).

## 4. Obtención de Datos y Arquitectura

* **Dependencias Adicionales:** Se requiere instalar `jspdf` y `jspdf-autotable` para la generación del documento PDF con formato de tabla.
- **Custom Hook:** No se creará un servicio aislado. Toda la lógica residirá en `src/hooks/useInformeActa.js`, que consumirá a `useDatos`.
- **Funciones del Hook:**
  - `obtenerDatosActa(idCurso, idModulo)`: Realizará el cruce (`JOIN`) entre `imparte` (para obtener solo a los alumnos matriculados), `Evaluaciones`, `Versiones`, `evaluan`, y las tablas de RA para los pesos.
  - `transformarDatosActa(datosCrudos)`: Función de utilidad que transformará el JSON relacional en un array plano estructurado para facilitar el renderizado del `DataTable`. Estructura esperada: `[{ id_discente, nombre, notas: { id_evaluacion_1: 75, id_evaluacion_2: 60 } }]`.

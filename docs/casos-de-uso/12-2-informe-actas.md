# Caso de uso 12.2: Informe Acta por Trimestres (Boletín Oficial)

## 1. Objetivo

Generar el acta oficial de un módulo, calculando la nota final ponderada de cada evaluación para todos los discentes matriculados en el curso. Se debe permitir la exportación a CSV y PDF para su entrega a Jefatura de Estudios.

## 2. Interfaz de Usuario (UI)

- **Nueva entrada en el menú:** Habilitar un submenú en la sección `Evaluación` con el nombre `Acta por trimestres`, que conducirá a la página `src/pages/informes/InformeActaTrimestres.jsx`.
- **Filtros Contextuales (Header):** componentes `Dropdown` (PrimeReact) para elegir `Año académico` (obtenida de la tabla cursos y mostrada coo 2026/2027 para el año 2026). El Dropdown de `Año académico` seleccionará el año más reciente por defecto; el de Curso/Clase esperará la acción del usuario.
- **Barra de Herramientas (Toolbar):** Dos botones ubicados a la derecha de la tabla: "Exportar CSV" y "Exportar PDF".
- **Visualización (Pivot Table):** Un `DataTable` de PrimeReact donde:
  - Cada fila es un registro de la tabla `Discentes`.
  - La primera columna es "Discente" (mostrará Nombre y Apellidos) (columna fijada a la izquierda mediante `frozen` y ordenable).
  - Las siguientes columnas se generan dinámicamente según las `Evaluaciones` vinculadas (ej. 'Primera', 'Segunda', 'Tercera', 'Final Ordinaria' y 'Extraordinaria').
  - **Formato de Nota (Regla estricta):** Las notas son números enteros (0-100). El texto de la celda debe colorearse utilizando obligatoriamente el helper `getColorNota(nota)` (`src/utils/coloresNota.js`). Si un alumno no tiene notas computables, mostrar el carácter `?`.

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

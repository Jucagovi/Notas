# Caso de Uso 12.2: Informe Acta por Trimestres (Boletín Oficial) - Implementación

Se ha implementado el **Caso de Uso 12.2: Informe Acta por Trimestres** siguiendo estrictamente las directrices definidas en `@docs/CONVENCIONES.md`, el esquema relacional en `@docs/ESQUEMA.sql` y el principio de responsabilidad única (SRP) con alta granularidad y componentización.

---

### Resumen de los Cambios Implementados

#### 1. Custom Hook Especializado
* **Archivo generado:** `src/hooks/useInformeActa.js`
* Consume el hook base `useDatos` para aislar el acceso a Supabase sin crear contextos globales.
* **Funciones del Hook:**
  * `obtenerDatosActa(idCurso, idModulo)`: Realiza concurrentemente la consulta y cruce (`JOIN`) de las tablas `imparte`, `Discentes`, `Evaluaciones`, `RA`, `ra_curso`, `ra_evaluacion`, `CE`, `ce_curso`, `Versiones`, `trabajan` y `evaluan`.
  * `transformarDatosActa(datosCrudos)`: Transforma la matriz relacional en un array plano estructurado con la forma `[{ id_discente, nombre, apellidos, nombreCompleto, nia, notas: { [id_evaluacion]: nota } }]`.
* **Algoritmo de Cálculo y Normalización (Caso de uso 05 y 12.2):**
  1. Identifica los RAs vinculados a cada evaluación en `ra_evaluacion`.
  2. Rescata las ponderaciones de cada RA para el curso en `ra_curso`.
  3. Suma los pesos de los RAs implicados.
  4. Calcula la nota obtenida por el discente en cada RA a través de las actividades evaluadas y cobertura de criterios, multiplica por su peso y normaliza al 100%.
  5. Para la evaluación Final Ordinaria, pondera globalmente todos los RAs del módulo.
  6. Para la evaluación Extraordinaria, computa las actividades asignadas a dicha convocatoria.
  7. Formatea las calificaciones en números enteros de 0 a 100, asignando `null` (representado con `?`) a evaluaciones sin notas computables.

#### 2. Componentización y Arquitectura Presentacional
Se ha creado la carpeta `src/components/actatrimestres/` dividiendo la interfaz en componentes desacoplados:

1. **`FiltrosActaTrimestres.jsx`:**
   * Desplegable `Dropdown` de PrimeReact para seleccionar el Año Académico (obtenido de `useAniosAcademicos` y formateado como `2026/2027`, seleccionando el más reciente por defecto).
   * Desplegable `SelectorClase` de `src/components/common/` para seleccionar Curso/Módulo (espera la acción del usuario).
   * Botón de refresco para recargar datos.
2. **`BarraHerramientasTrimestres.jsx`:**
   * Barra de herramientas (`Toolbar`) con los botones alineados a la derecha:
     * Botón **"Exportar CSV"** (icono `pi pi-file-excel`).
     * Botón **"Exportar PDF"** (icono `pi pi-file-pdf`).
3. **`ResumenActaTrimestres.jsx`:**
   * Tarjetas resumen con indicadores rápidos: Matriculados, Evaluaciones vinculadas, Aprobados vs Suspensos y Calificación media del grupo.
4. **`TablaActaTrimestres.jsx`:**
   * Componente `DataTable` (Pivot Table) de PrimeReact:
     * Paginación en la **parte superior** con opciones `[5, 10, 15, 20, 25]` elementos.
     * Columna fija a la izquierda (`frozen`) y ordenable (`sortable`) para el Discente (Apellidos, Nombre y NIA), con truncado y tooltip.
     * Columnas dinámicas ordenables por cada una de las evaluaciones normativas vinculadas.
     * Calificaciones coloreadas estrictamente con el helper `getColorNota(nota)` (`src/utils/coloresNota.js`).
     * Muestra el carácter `?` cuando un alumno no tiene calificaciones computables.
5. **`index.js`:**
   * Exportación centralizada de todos los subcomponentes del módulo.

#### 3. Utilidades de Exportación Oficial
* **`src/utils/exportadorActaTrimestresPdf.js`:**
  * Genera el boletín/acta oficial en formato PDF apaisado (A4 landscape) utilizando `jsPDF` y `jspdf-autotable`.
  * Incluye membrete institucional, metadatos de la clase, tabla de calificaciones con coloreado semántico condicional por calificación, resumen estadístico del grupo y diligencia de firmas del profesorado y jefatura de estudios.
* **`src/utils/exportadorActaTrimestresCsv.js`:**
  * Genera el archivo CSV con delimitador estándar `;` y marca de orden de bytes (`\uFEFF` BOM) para compatibilidad directa con Microsoft Excel en español.

#### 4. Página Orquestadora y Enrutamiento
* **Página principal:** `src/pages/informes/InformeActaTrimestres.jsx`
  * Actúa como orquestador consumiendo `HeaderPagina`, `EstadoVacio`, `useAniosAcademicos`, `useClases`, `useInformeActa` y los subcomponentes creados.
* **Menú de navegación:** En `src/components/layout/menuConfiguracion.js`, se ha añadido la entrada `Acta por trimestres` tanto en el submenú `Evaluación` como en `Informes` apuntando a `/evaluacion/acta-trimestres`.
* **Enrutador:** En `src/App.jsx`, se han configurado las rutas protegidas `/evaluacion/acta-trimestres`, `/acta-trimestres` e `/informes/acta-trimestres`.

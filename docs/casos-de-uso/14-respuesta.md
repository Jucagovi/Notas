# Implementación del Caso de Uso 14: Taller de Prácticas (Gestión de Catálogo y Versiones)

Se ha implementado el **Caso de Uso 14: Taller de Prácticas (Gestión de Catálogo y Versiones)**, respetando las directrices de `docs/CONVENCIONES.md`, el esquema relacional de `docs/ESQUEMA.sql` y el principio estricto de componentización.

---

### 1. Resumen de los Cambios Realizados

1. **Custom Hook Orquestador (`src/hooks/useTallerPracticas.js`):**
   * Consume `useDatos.js` para aislar el acceso a Supabase sobre las tablas `Practicas` (maestra) y `Versiones` (esclava).
   * Consulta las Unidades de Trabajo asociadas al módulo activo para alimentar el selector de UT del editor.
   * Filtra reactivamente las versiones en función de la práctica seleccionada en el estado (`practicaSeleccionada`).
   * Implementa las operaciones CRUD completas para prácticas y versiones, incluyendo la funcionalidad de **clonación instantánea** (`clonarVersion`) que duplica los datos de la versión y su enunciado enriquecido.
   * Retorna respuestas estructuradas `{ error: "Mensaje", status: 400 }` en caso de fallos y registra los errores en consola.

2. **Componentes Especializados por Funcionalidad (`src/components/taller/`):**
   * `FiltrosTaller.jsx`: Barra superior con el `<SelectorModulo>`, caja de búsqueda de prácticas en tiempo real e indicadores estadísticos del volumen de prácticas y versiones.
   * `CatalogoPracticas.jsx`: Panel izquierdo con la tabla de prácticas maestras sobre `<TablaBase>`, paginación superior (5, 10, 15, 20 y 25 elementos), textos en una sola línea con `Tooltip` para evitar desbordamientos, selección de fila activa y acciones rápidas de edición y borrado.
   * `DialogoPractica.jsx`: Diálogo modal (`Dialog`) para crear y editar prácticas base (solicitando nombre requerido, módulo formativo, modalidad/tipo y descripción breve).
   * `PanelVersiones.jsx`: Panel derecho con cabecera dinámica de la práctica activa, tabla de versiones asociadas sobre `<TablaBase>` y acciones por cada versión:
     * **Editar:** Abre el modal de edición de versión y enunciado.
     * **Clonar:** Duplica la versión inmediatamente con su enunciado y configuración.
     * **Exportar a PDF:** Genera un documento PDF limpio y maquetado con el examen o actividad.
     * **Eliminar:** Solicita confirmación y borra la versión.
   * `DialogoVersion.jsx`: Modal generoso (`Dialog` de 75vw) con metadatos (código/número, curso académico con `<SelectorCurso>`, unidad de trabajo, período de evaluación con `<SelectorEvaluacion>` y peso porcentual) y el componente `<Editor>` de PrimeReact (Rich Text Editor basado en Quill) para redactar el enunciado con formatos enriquecidos.
   * `taller.css`: Hoja de estilos con las reglas visuales para tarjetas, textos truncados, badges y el contenedor del editor Quill.

3. **Utilidad de Exportación a PDF (`src/utils/exportadorPracticaPdf.js`):**
   * Utiliza `html2canvas` y `jsPDF` para maquetar un documento A4 limpio con membrete oficial, datos curriculares, casilla para nombre del discente y el enunciado renderizado, soportando paginación automática para contenidos extensos.

4. **Página Contenedora (`src/pages/TallerPracticas.jsx`):**
   * Sigue el patrón Contenedor-Presentacional: orquesta los estados, conecta `useGlobalToast` para notificaciones y organiza el layout en dos columnas utilizando el grid de PrimeFlex.
   * Utiliza los componentes comunes obligatorios `<HeaderPagina>` y `<ModalConfirmacion>`.

5. **Enrutamiento y Menú de Navegación:**
   * Se ha registrado la ruta `/taller-practicas` (y alias `/taller`) en `src/App.jsx`.
   * Se ha habilitado la entrada `Taller de prácticas` tanto en la barra lateral principal (`NAV_ITEMS`) como en el submenú de Evaluación (`ELEMENTOS_EVALUACION`) en `src/components/layout/menuConfiguracion.js`.


   ## Respuesta miércoles por la tarde

   Se ha implementado el Caso de uso 14: Taller de Prácticas (Gestión de Catálogo y Versiones)
  siguiendo estrictamente las especificaciones de CONVENCIONES.md, ESQUEMA.sql y
  14-creacion-taller-practicas.md.
  ──────
  ### 1. Resumen de los Cambios Realizados

  #### A. Custom Hook Orquestador

  • useTallerPracticas.js:
      • Consume useDatos.js para aislar la capa de persistencia en Supabase sobre las tablas
      Practicas (repositorio maestro) y Versiones (panel esclavo).
      • Filtra de forma reactiva las versiones según la práctica seleccionada en el estado
      (practicaSeleccionada).
      • Consulta las Unidades de Trabajo del módulo activo para alimentar el selector de UTs en el
      modal de versión.
      • Proporciona operaciones CRUD completas y la acción de clonación instantánea (clonarVersion),
      la cual duplica los metadatos y el enunciado de la versión con el sufijo identificativo
      (Copia).
      • Registra errores en consola y devuelve respuestas estructuradas { error: "Mensaje", status:
      400 }.


  #### B. Componentización Especializada ()

  Siguiendo la regla estricta de componentización y el principio de responsabilidad única, la vista
  se ha dividido en los siguientes subcomponentes:

  1. FiltrosTaller.jsx:
      • Barra superior con el selector especializado <SelectorModulo>.
      • Caja de búsqueda de prácticas en tiempo real por nombre, descripción o modalidad.
      • Contadores con el número de prácticas y versiones activas.
  2. CatalogoPracticas.jsx (Columna Izquierda - Maestro):
      • Construido sobre <TablaBase> con paginación en la parte superior (5, 10, 15, 20, 25
      elementos).
      • Textos en una sola línea truncados con Tooltip flotante.
      • Botón de cabecera «Nueva Práctica» y acciones directas por fila para editar o eliminar.
      • Resaltado visual de la fila de la práctica activa seleccionada.
  3. DialogoPractica.jsx:
      • Modal Dialog de PrimeReact para la creación y edición de prácticas base (Nombre requerido,
      Módulo formativo, Tipo: Individual, Grupal, Examen, Proyecto y Descripción breve).
      • Botones de acción integrados mediante <BotonAccion>.
  4. PanelVersiones.jsx (Columna Derecha - Detalle):
      • Cabecera dinámica que muestra el título, descripción e insignias de la práctica
      seleccionada.
      • Estado instructivo mediante <EstadoVacio> cuando no hay práctica seleccionada o no existen
      versiones creadas.
      • Tabla sobre <TablaBase> con paginación superior (5, 10, 15, 20, 25 elementos) mostrando
      versión, curso escolar, unidad de trabajo y peso porcentual.
      • Botón superior «Crear Nueva Versión» y botones de acción por fila:
          • Editar: Abre el modal de modificación de metadatos y enunciado.
          • Clonar: Duplica la versión inmediatamente con su enunciado y configuración.
          • Exportar a PDF: Genera y descarga el documento maquetado para imprimir.
          • Eliminar: Solicita confirmación y elimina la versión.

  5. DialogoVersion.jsx:
      • Diálogo modal ancho (75vw) con los selectores de metadatos:
          • Código de versión (InputText).
          • Curso académico mediante <SelectorCurso>.
          • Unidad de trabajo (Dropdown alimentado con las UTs del módulo).
          • Período de evaluación mediante <SelectorEvaluacion>.
          • Peso en evaluación (InputNumber de 0 a 100%).
      • Editor de texto enriquecido <Editor> de PrimeReact (basado en Quill) para redactar el
      cuerpo y las instrucciones de la práctica con formato de texto, listas, enlaces y bloques de
      código.
  6. taller.css:
      • Estilos específicos para tarjetas, filas seleccionadas, badges tipológicos e integración
      visual del editor Quill.


  #### C. Utilidad de Exportación a PDF

  • exportadorPracticaPdf.js:
      • Utiliza html2canvas y jsPDF para maquetar un documento A4 limpio con membrete oficial,
      datos curriculares, casilla para nombre del discente y el enunciado renderizado, soportando
      paginación automática para contenidos extensos.


  #### D. Página Orquestadora y Enrutamiento

  • TallerPracticas.jsx:
      • Sigue el patrón Contenedor-Presentacional: centraliza los estados y llamadas a los hooks,
      conecta useGlobalToast para notificaciones y ensambla la interfaz en dos columnas mediante el
      grid de PrimeFlex.
      • Integra <HeaderPagina> y <ModalConfirmacion>.
  • menuConfiguracion.js:
      • Se ha añadido la entrada «Taller de prácticas» en la barra de navegación lateral principal
      (NAV_ITEMS) y en el submenú de Evaluación (ELEMENTOS_EVALUACION).
  • App.jsx:
      • Se han registrado las rutas /taller-practicas y /taller.

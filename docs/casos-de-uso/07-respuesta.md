 Se ha implementado el Caso de Uso 07: Ficha Completa e Informe Integral (360º) del Discente, siguiendo las             
  especificaciones de arquitectura, desacoplamiento y componentización definidas en las convenciones del proyecto.       
  ──────
  ### Resumen de los cambios implementados
  
  #### 1. Custom Hook de Datos: useFichaDiscente
  
  Se ha creado el hook en useFichaDiscente.js que consume el servicio unificado useDatos para aislar Supabase:           
  
  • **obtenerHistorialDiscente**: orquesta las consultas y cruces relacionales entre las tablas Discentes, Cursos,       
  imparte, Modulos, Evaluaciones, Versiones y evaluan. Detecta automáticamente el historial de cursos del alumno y       
  desglosa las actividades por módulo con sus estadísticas agregadas (media, total, calificadas y distribución oficial). 
  • **actualizarNotaFicha**: gestiona la edición al vuelo mediante un upsert atómico sobre la tabla evaluan. Si la nota  
  está vacía o nula, elimina el registro; si tiene valor (0 a 100 entero), lo actualiza o inserta, actualizando de forma 
  reactiva el estado local y disparando notificaciones con useGlobalToast.
  ──────
  #### 2. Subcomponentes especializados en src/components/discentes/
  
  Siguiendo la regla estricta de componentización y el principio de responsabilidad única (SRP), la interfaz se ha       
  dividido en subcomponentes modulares:
  
  • **DirectorioDiscentes**:
      • Directorio principal basado en TablaBase con paginación superior (5, 10, 15, 20 y 25 elementos).
      • Buscador reactivo integrado por nombre, apellidos, NIA o correo.
      • Avatar con imagen real o iniciales generadas, etiquetas de estado y navegación al informe 360º al hacer clic en  
      cualquier fila o en el botón de acción.
  • **CabeceraFichaDiscente**:
      • Panel superior con Card y Avatar ampliado con foto o iniciales.
      • Datos identificativos del estudiante: NIA, correo, localidad y estado activo/inactivo.
      • Selector de contexto mediante SelectorCurso para auditar cursos previos en alumnos repetidores y botón de retorno
      al directorio general.
  • **TablaEvaluacionesDiscente**:
      • Tabla de actividades agrupada por evaluaciones con Row Grouping (rowGroupMode="subheader").
      • Coloreado estricto de notas mediante getColorNota.
      • Si no existe calificación, renderiza el carácter ? centrado y sin color.
      • Edición en celda (In-cell Editing): permite introducir una nota numérica de 0 a 100 con guardado automático al   
      pulsar "Enter" o al perder el foco (onBlur).
  • **GraficosRendimientoDiscente**:
      • Gráfico de líneas (type="line"): progresión temporal de las calificaciones en las actividades del módulo.        
      • Gráfico circular (type="doughnut"): distribución por categorías oficiales (Suspensos <50, Suficientes 50-59, Bien
      60-69, Notables 70-89 y Sobresalientes 90-100), extrayendo los colores estrictamente de getColorNota.              
  • **DesgloseModulosDiscente**:
      • Organiza los módulos en los que el alumno está matriculado mediante TabView y TabPanel.
      • Incluye métricas resumen (total de actividades, calificadas y nota media mediante BadgeNota) y orquesta la tabla 
      de evaluaciones y los gráficos.
      • Renderiza EstadoVacio si no hay matrícula en el curso seleccionado.
  • **index.js**:
      • Barril de exportación limpia de todos los subcomponentes.
  
  ──────
  #### 3. Página Contenedora y Enrutamiento
  
  • **DiscentesPagina**:
      • Actúa como orquestador único.
      • Detecta si existe un parámetro :idDiscente en la URL para renderizar el directorio o la ficha integral 360º.     
      • Utiliza CargadorSeccion durante los estados de carga.
  • **App**:
      • Se ha añadido la ruta anidada <Route path='discentes/:idDiscente' element={<DiscentesPagina />} /> para soportar 
      tanto enlaces directos como la navegación del directorio.
  
  ──────
  │ Note
  │ Aviso de Componente Común: En la sección 7 de las convenciones se menciona el componente <BadgeEstado>. Se ha        
  │ verificado que actualmente no existe en , por lo que se ha empleado el componente estándar <Tag> de PrimeReact sin   
  │ alterar los componentes existentes de common. Si deseas que generemos <BadgeEstado> y lo incorporemos a la biblioteca
  │ de componentes comunes, indícalo y lo implementaremos de inmediato.

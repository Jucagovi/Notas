 ### Resumen de los cambios implementados paso a paso                                                                   
                                                                                                                         
  #### 1. Capa de Servicios Supabase (informesService.js)                                                                
                                                                                                                         
  Se han añadido las siguientes funciones especializadas:                                                                
                                                                                                                         
  • informesService.js:2416: consulta los datos del módulo, curso, Resultados de Aprendizaje (RA), Criterios de          
  Evaluación (CE), ponderaciones en ESQUEMA.sql:135 y ESQUEMA.sql:148, asignaciones de cobertura en ESQUEMA.sql:123,     
  discentes matriculados en ESQUEMA.sql:83 y calificaciones registradas en ESQUEMA.sql:70.
  • informesService.js:2648:
      • Calcula la nota de cada CE normalizada según el porcentaje de cobertura de sus prácticas evaluadas en trabajan.  
      • Determina si cada RA está completo (cuando todos sus CE han sido cubiertos con nota en sus prácticas).           
      • Pondera la nota de cada RA aplicando los pesos de sus CE definidos en ce_curso.
      • Calcula la Nota Final Anual ponderando cada RA según su peso en ra_curso.
      • Soporta el modo Evaluación Continua / Nota para evaluación reescalando a 100 la suma ponderada de únicamente los 
      RA completos.
      • Genera las estadísticas globales y por RA (medias, aprobados, suspensos y tasa de éxito).
  • informesService.js:2916: genera y descarga el archivo CSV con cabeceras dinámicas por RA y BOM UTF-8 para            
  compatibilidad con hojas de cálculo.
  • informesService.js:2972: genera el documento PDF oficial mediante jsPDF y jspdf-autotable con formato vertical u     
  horizontal según el número de RA, encabezado institucional, colores condicionales según coloresNota.js y resumen       
  estadístico al pie.
  
  #### 2. Custom Hook (useInformeEvaluacionRa.js)
  
  • Gestiona la selección en cascada de Curso Académico (con preselección automática del curso más reciente) y Módulo    
  Profesional.
  • Controla la conmutación entre la Ponderación Anual Oficial y el modo Calcular nota para evaluación (evaluación       
  continua con RA completos totalizada a 100).
  • Permite el filtrado de discentes en tiempo real mediante terminoBusqueda.
  • Controla el estado del diálogo modal para inspeccionar el desglose pormenorizado de CE y prácticas de cada RA.       
  • Gestiona las notificaciones tipo Toast y los estados de carga y exportación.
  
  #### 3. Componentes Visuales de PrimeReact
  
  • InformeEvaluacionRaFiltros.jsx: barra superior con Dropdown de Curso y Módulo, buscador de discentes, botón          
  interactivo para Calcular nota para evaluación, y botones de exportación a CSV y PDF.
  • InformeEvaluacionRaResumen.jsx: tarjetas Card con los indicadores clave (KPI) del módulo (Total Discentes, Total RA, 
  Nota Media Global y Tasa de Aprobados).
  • InformeEvaluacionRaTabla.jsx: DataTable dinámico con columna fija para los datos del discente (Avatar, Apellidos,    
  Nombre y NIA), columnas intermedias dinámicas por cada RA con insignias de peso y estado de completitud, columna de    
  Nota Final y ColumnGroup de pie de tabla con medias del grupo y porcentajes de aprobados. Al hacer clic en cualquier   
  celda de RA, abre el diálogo de desglose.
  • DialogoDetalleDiscenteRA.jsx: modal Dialog que desglosa los Criterios de Evaluación del RA seleccionado, sus pesos en
  ce_curso, porcentajes de cobertura y calificaciones individuales en las prácticas asociadas.
  
  #### 4. Página Principal y Enrutamiento
  
  • InformeEvaluacionRa.jsx: integra todos los componentes con estados condicionales para selección pendiente, carga y   
  ausencia de datos.
  • Layout.jsx:40: se ha habilitado la entrada Acta evaluación RA dentro del submenú Informes.
  • InformesPagina.jsx:13: se ha añadido la tarjeta de acceso directo al nuevo informe en el catálogo general.           
  • App.jsx:99: se han configurado las rutas protegidas /informes/acta-evaluacion-ra y sus alias correspondientes.       

 How's the CLI experience so far? Help us improve:

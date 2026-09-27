Se ha implementado el Informe de Control de Calificaciones Pendientes (Caso de uso 12.3) siguiendo estrictamente las   
  convenciones del proyecto y el principio de responsabilidad única (SRP).
  ──────
  ### 1. Custom Hook de Datos (useInformePendientes.js)
  
  Se ha creado el hook useInformePendientes consumiendo el hook base useDatos:
  
  • Cruce relacional (Cross-Check): la función obtenerPendientesPorEvaluacion cruza la tabla imparte (discentes          
  matriculados en la clase), la tabla Versiones (actividades asociadas a la evaluación) y la tabla evaluan.              
  • Filtro estricto: devuelve únicamente las combinaciones alumno + actividad donde no existe registro en evaluan o el   
  campo nota es null.
  • Soporte de evaluaciones: expone obtenerEvaluacionesPorClase para alimentar el selector de evaluaciones.              
  ──────
  ### 2. Componentización de la Interfaz (src/components/pendientes/)
  
  Se ha dividido la interfaz en submódulos especializados reutilizando los componentes comunes de common:
  
  • FiltrosPendientes.jsx: selectores jerárquicos en cascada (Año académico → Clase → Evaluación). Utiliza SelectorClase 
  y SelectorEvaluacion, habilitando cada nivel únicamente cuando el anterior está seleccionado. Las clases se ordenan de 
  más reciente a más antigua.
  • TablaPendientes.jsx: tabla construida sobre TablaBase con paginación superior (5, 10, 15, 20, 25 elementos),         
  ordenación por discente, actividad y evaluación, y textos en una sola línea con Tooltip flotante en desbordamiento.    
  • MensajeSinPendientes.jsx: componente Message de PrimeReact destacado en color verde con el texto: "¡Todo al día! No  
  hay calificaciones pendientes para esta evaluación."
  • ResumenPendientes.jsx: tarjetas KPI de resumen con notas pendientes totales, alumnos afectados y actividades         
  implicadas.
  • index.js: barril de exportación para los subcomponentes.
  ──────
  ### 3. Página Orquestadora (InformePendientes.jsx)
  
  Ubicada en src/pages/informes/InformePendientes.jsx:
  
  • Integra HeaderPagina, EstadoVacio y CargadorSeccion.
  • Consume useAniosAcademicos, useClases y useInformePendientes.
  • Navegación con paso de estado: al pulsar "Calificar", redirige mediante navigate('/evaluaciones/calificar', { state: 
  { id_curso, id_modulo, id_evaluacion, id_version } }).
  ──────
  ### 4. Recepción de Estado en Calificador (CalificarPagina.jsx)
  
  Se ha actualizado CalificarPagina para leer location.state. Al recibir la navegación desde el informe, preselecciona   
  automáticamente la clase y la actividad indicada abriendo directamente la tabla para calificar.
  ──────
  ### 5. Resumen KPI en Dashboard
  
  • En calculosDashboard.js:731 se ha implementado la función calcularConteoCalificacionesPendientes.
  • En useDashboard.js se expone reactivamente conteoCalificacionesPendientes.
  • Se ha creado la tarjeta TarjetaKpiPendientes.jsx, posicionada en DashboardPagina.jsx justo encima de WidgetAlertas   
  con enlace directo al informe.
  ──────
  ### 6. Menú y Rutas
  
  • Menú: en menuConfiguracion.js:42 se ha habilitado la entrada Calificaciones pendientes dentro de ELEMENTOS_INFORMES  
  apuntando a /informes/pendientes.
  • Rutas: en App.jsx:160 se han registrado /informes/pendientes, sus alias y la ruta /evaluaciones/calificar.           


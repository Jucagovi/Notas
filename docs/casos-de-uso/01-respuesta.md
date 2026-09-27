Se ha implementado por completo el Panel de Control Inicial para el Docente (Centro de Mando Analítico) según las      
  especificaciones del caso de uso 01-dashboard.md y las normas de desarrollo de CONVENCIONES.md.                        
  ──────                                                                                                                 
  ### 1. Eliminación del código anterior                                                                                 
                                                                                                                         
  Se han suprimido los archivos obsoletos de la implementación previa que no encajaban con la arquitectura analítica     
  requerida:                                                                                                             
                                                                                                                         
  • Componentes eliminados en src/components/dashboard/: CabeceraPanel.jsx, EstadoCargaDashboard.jsx,                    
  GraficoBarrasModulos.jsx, GraficoDistribucionNotas.jsx, TablaAlumnosRiesgo.jsx y TarjetasKpi.jsx.                      
  • Hooks eliminados en src/hooks/: useDashboardStats.js y useAlertasTempranas.js.                                       
  • Página previa: src/pages/PanelControl.jsx.                                                                           
  ──────                                                                                                                 
  ### 2. Motor de cálculo analítico y funciones helper
  
  Se ha creado el archivo de utilidades puras calculosDashboard.js para delegar los cálculos pesados fuera del ciclo de  
  renderizado:
  
  • obtenerAgendaHoy: cruza los tramos de Sesiones y Horarios con Calendario_Eventos. Identifica si hoy es festivo (para 
  cancelar visualmente las clases) o si existen pruebas evaluativas.
  • calcularMapaTactico: examina las Unidades_Trabajo y su Temporizacion para indicar la unidad en curso, las sesiones   
  lectivas restantes y la próxima unidad a impartir.
  • calcularRadarCobertura: evalúa los RA y CE frente a las prácticas y versiones a través de trabajan, detectando RAs   
  huérfanos sin cobertura.
  • calcularDetectorSobrecarga: escanea a 15 días vista la densidad de pruebas en Calendario_Eventos y cierres en        
  Evaluaciones, alertando si se concentran más de 3 hitos en una misma semana.
  • calcularAlertasInmediatas: localiza anomalías como versiones con calificaciones pendientes en evaluan, retrasos en la
  temporización y discentes con notas críticas.
  • calcularProgresoCurricular: compara el porcentaje de unidades finalizadas frente al avance teórico calculado por el  
  calendario.
  ──────
  ### 3. Custom Hook Agregador
  
  Se ha creado useDashboard.js:
  
  • Utiliza el hook base useDatos para aislar todas las operaciones con Supabase.
  • Dispara las consultas masivas a las tablas mediante Promise.all en paralelo para maximizar el rendimiento.           
  • Ofrece los estados reactivos, selectores de curso/módulo y la función recargar.
  ──────
  ### 4. Componentización estricta: Subcomponentes y Widgets
  
  En el directorio src/components/dashboard/ se han creado los 7 widgets presentacionales solicitados:
  
  1. WidgetAgendaHoy.jsx:
      • Línea temporal vertical con Timeline de PrimeReact.
      • Muestra las sesiones del día con hora, módulo, aula y grupo. Destaca exámenes con etiquetas y tacha las clases si
      el día es festivo, integrando acceso directo al Diario de Aula.
  2. WidgetMapaTactico.jsx:
      • Lista compacta de módulos que muestra la posición exacta: Unidad actual (sesiones restantes) y próxima unidad    
      formativa.
  3. WidgetRadarCobertura.jsx:
      • Gráfico radial con Chart (type="radar") de PrimeReact.
      • Incluye el componente común SelectorModulo para alternar módulos y genera un aviso visual en caso de detectar RAs
      o CEs huérfanos.
  4. WidgetDetectorSobrecarga.jsx:
      • Balanceador predictivo a 15 días vista con semáforo de riesgo (Crítico, Medio, Equilibrado) y lista de hitos     
      programados.
  5. WidgetAlertas.jsx:
      • Panel de anomalías urgentes con severidad y botones de resolución inmediata hacia el calificador, la             
      temporización o el cuaderno.
  6. WidgetProgresoCurricular.jsx:
      • Barras de progreso comparativas con ProgressBar de PrimeReact que enfrentan el avance real frente al progreso    
      teórico planificado.
  7. WidgetAccesosRapidos.jsx:
      • Tarjetas iconográficas de gran tamaño para el salto directo a las áreas críticas (Cuaderno, Taller de Prácticas, 
      Master Planner, Calificador, Diario y Horarios).
  8. index.js:
      • Re-exportación unificada de todos los widgets.
  
  ──────
  ### 5. Página Orquestadora y Enrutamiento
  
  • Se ha creado DashboardPagina.jsx, actuando como contenedor que consume useDashboard.js y distribuye los datos a los  
  widgets mediante props en una cuadrícula PrimeFlex estilo bento box (grid, col-12 md:col-6 lg:col-4, etc.).            
  • Utiliza los componentes comunes requeridos: HeaderPagina, SelectorCurso, CargadorSeccion y EstadoVacio sin haber     
  modificado ninguno de ellos.
  • Se ha actualizado App.jsx:58-62 enlazando DashboardPagina.jsx a la ruta raíz / y a sus alias correspondientes.       
  
  │ Note
  │ Sugerencia de componente común: En CONVENCIONES.md:75 se menciona el componente <BadgeEstado>. En este momento no    
  │ existe dicho componente en src/components/common/. Si lo deseas, podemos generar dicho componente genérico (para     
  │ estados como "En Curso", "Completada", "Examen", "No lectivo", etc.) y añadirlo a
  │ src/components/common/BadgeEstado.jsx.

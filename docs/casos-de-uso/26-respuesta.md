 Se ha implementado el Caso de Uso 24: Monitor de Desviación Curricular (Dashboard y Gantt) siguiendo estrictamente las 
  directrices de CONVENCIONES.md, el esquema de base de datos de ESQUEMA.sql y el principio de separación de             
  responsabilidades y componentización.                                                                                  
  ──────                                                                                                                 
  ### 1. Custom Hook Especializado: useMonitorCurricular.js                                                              
                                                                                                                         
  Se ha creado el hook aislador consumiendo el hook genérico useDatos para las tablas Temporizacion, Unidades_Trabajo,   
  Modulos, Cursos e imparte:                                                                                             
                                                                                                                         
  • Cálculo de Desviación: Implementa el algoritmo matemático que resta fecha_fin_prevista de la fecha actual            
  (CURRENT_DATE). Si la diferencia en días es positiva y la unidad no está en estado 'Completada', se genera la alerta de
  retraso ("Retraso de X días" con severidad danger). Si la fecha límite no ha vencido o finalizó a tiempo, se clasifica 
  como "En tiempo" con severidad success.                                                                                
  • Identificación de la Unidad Activa: Determina de forma automática la Unidad de Trabajo activa de cada módulo en el   
  curso actual evaluando el estado ('En Curso'), el solapamiento con la fecha de hoy o la primera unidad pendiente de    
  completar.                                                                                                             
  • Cruce de Entidades y Métricas: Consolida las unidades formateadas con UT01, UT02, etc., y calcula estadísticas       
  globales (total, completadas, enCurso, pendientes, enTiempo, conRetraso, porcentajeProgreso).
  ──────
  ### 2. Widget del Dashboard: WidgetTermometroCurricular.jsx
  
  Componente presentacional basado en el componente Card de PrimeReact:
  
  • Listado de Módulos: Muestra cada uno de los módulos que el docente imparte en el curso activo.
  • Unidad de Trabajo Activa: Presenta la UT correspondiente al momento actual con su rango de fechas previsto.          
  • Indicador de Desviación: Renderiza un Badge e icono contextual (🟢 "En tiempo" o 🔴 "Retraso de X días").            
  • Botón de Ajuste Rápido: Incorpora un botón con icono de engranaje (pi pi-cog) que redirige directamente a la página  
  de TemporizacionPagina.jsx (Caso de Uso 19), pasando el estado necesario para preseleccionar la clase y módulo.        
  • Acceso al Informe Completo: Incluye un enlace directo al nuevo informe de Progreso Curricular.
  • Integración en el Dashboard: Se ha exportado en index.js y colocado en DashboardPagina.jsx sin alterar los           
  componentes existentes.
  ──────
  ### 3. Subcomponentes Modulares en src/components/progreso/
  
  Siguiendo la regla de granularidad (ningún subcomponente supera las 150-200 líneas) y reutilizando estrictamente los   
  componentes de src/components/common/:
  
  1. FiltrosProgreso.jsx:
      • Desplegables de Curso y Módulo reutilizando <SelectorCurso> y <SelectorModulo> junto a un botón de refresco.     
  2. ResumenProgreso.jsx:
      • Tarjetas analíticas KPI con el total de unidades, porcentaje de avance con barra de progreso, unidades en tiempo 
      y unidades con desviación detectada.
  3. LineaTiempoProgreso.jsx:
      • Utiliza el componente Timeline de PrimeReact con marcadores cromáticos personalizados.
      • Muestra el solapamiento visual entre el periodo previsto (caja con fondo transparente/gris y borde discontinuo) y
      el periodo ejecutado real (caja con color sólido: verde #22c55e si a tiempo, rojo #ef4444 si hubo retraso).        
      • Añade barra gráfica de solapamiento relativo para comparar visualmente los intervalos.
  4. GanttComparativoProgreso.jsx:
      • Cronograma horizontal con distribución de meses del curso escolar (septiembre a junio).
      • Dibuja en la misma pista la barra prevista (gris/transparente con contorno discontinuo) y la barra ejecutada real
      (color sólido verde o rojo) superpuesta para visualizar con exactitud cualquier desvío.
  5. TablaProgresoCurricular.jsx:
      • Utiliza el componente común <TablaBase>.
      • Paginación en la parte superior con las opciones reglamentarias [5, 10, 15, 20, 25].
      • Columnas para número de UT, denominación (truncada con tooltip), estado, periodo previsto, periodo real,         
      indicador de desviación y botón de ajuste rápido.
  6. index.js:
      • Archivo barril para exportación centralizada de todos los subcomponentes.
  
  ──────
  ### 4. Página Orquestadora: InformeProgreso.jsx
  
  • Ubicada en src/pages/informes/InformeProgreso.jsx.
  • Actúa como contenedor de estado y orquestador (patrón contenedor-presentacional):
      • Consume useMonitorCurricular y gestiona la navegación con useLocation.
      • Utiliza los componentes base <HeaderPagina>, <EstadoVacio> y <CargadorSeccion>.
      • Ofrece un selector SelectButton para alternar entre la Línea de Tiempo (Timeline), el Diagrama Gantt y la Tabla  
      Detallada.
  
  ──────
  ### 5. Navegación y Enrutamiento
  
  1. menuConfiguracion.js:
      • Se ha incorporado la entrada "Progreso Curricular" con icono pi pi-chart-line y ruta /informes/progreso dentro   
      del submenú ELEMENTOS_INFORMES.
  2. App.jsx:
      • Se ha configurado la ruta protegida /informes/progreso apuntando a InformeProgreso, junto con los alias          
      /informes/progreso-curricular y accesos directos /progreso-curricular.

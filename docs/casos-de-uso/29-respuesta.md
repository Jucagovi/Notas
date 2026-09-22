Se ha completado la implementación del Caso de Uso 29: Calendario Escolar (Fechas y Festivos) cumpliendo estrictamente 
  todas las normas de CONVENCIONES.md y los requerimientos de modularización y componentización sin modificar ningún     
  componente base de src/components/common.                                                                              
  ──────                                                                                                                 
  ### 1. Utilidades de Fecha y Cálculos Académicos                                                                       
                                                                                                                         
  Se ha creado el módulo de utilidades fechas.js para centralizar la manipulación de fechas en hora local (evitando      
  desfases por zona horaria) y calcular los indicadores lectivos:                                                        
                                                                                                                         
  • fechas.js:4: convierte objetos Date en formato YYYY-MM-DD.                                                           
  • fechas.js:15: genera objetos Date a las 00:00:00 locales desde una cadena ISO.                                       
  • fechas.js:26: devuelve la fecha en formato estándar español DD/MM/YYYY.                                              
  • fechas.js:35: nombre del día en castellano (Lunes, Martes, etc.).                                                    
  • fechas.js:43: detecta si un día es sábado o domingo.                                                                 
  • fechas.js:61: crea la serie continua de días entre dos fechas (con opción de excluir fines de semana).               
  • fechas.js:81: calcula días naturales, fines de semana, festivos laborables, días lectivos netos y semanas estimadas  
  de clase.                                                                                                              
  ──────                                                                                                                 
  ### 2. Custom Hook Especializado: useCalendarioEscolar.js                                                              
                                                                                                                         
  Se ha implementado el hook useCalendarioEscolar.js:12 consumiendo el hook base useDatos.js:5 para aislar completamente 
  las operaciones contra la base de datos Supabase:                                                                      
                                                                                                                         
  • Instancias de acceso: utiliza useDatos('Cursos') y useDatos('Festivos').                                             
  • Carga de datos: extrae fecha_inicio y fecha_fin de la tabla Cursos y todos los registros asociados de la tabla       
  Festivos para el curso activo.
  • Sincronización interactiva:
      • useCalendarioEscolar.js:85: enlaza la selección múltiple del calendario de PrimeReact preservando las            
      descripciones existentes de los días ya anotados.
      • useCalendarioEscolar.js:115: actualiza en memoria el motivo asignado a cualquier fecha.
      • useCalendarioEscolar.js:128: añade intervalos continuos (vacaciones de Navidad, Semana Santa, etc.).             
      • useCalendarioEscolar.js:122 y useCalendarioEscolar.js:156: para borrado individual o vaciado completo.           
  • Persistencia consolidada (useCalendarioEscolar.js:162):
      1. Valida que fechaInicio <= fechaFin.
      2. Ejecuta un UPDATE en Cursos actualizando fecha_inicio y fecha_fin.
      3. Ejecuta un DELETE de los festivos previos de ese curso mediante festivosHook.eliminar('id_curso', cursoId).     
      4. Realiza un INSERT masivo de los festivos marcados con sus descripciones.
      5. Emite feedback mediante useGlobalToast.js:5.
  
  ──────
  ### 3. Componentización en src/components/calendario/
  
  Siguiendo la regla de no crear componentes monolíticos, la interfaz se ha dividido en los siguientes subcomponentes    
  presentacionales:
  
  1. CabeceraCalendario.jsx:
      • Incorpora el selector especializado SelectorCurso.jsx:22.
      • Incorpora dos selectores Calendar de PrimeReact para fijar fecha_inicio y fecha_fin del curso lectivo.           
      • Botones de acción: botón modal "Añadir Periodo" y botón principal BotonAccion.jsx:48 de tipo "guardar".          
      • Bloque inferior de métricas cuantitativas calculadas (días lectivos netos, festivos laborables y semanas lectivas
      estimadas).
  2. MatrizCalendario.jsx:
      • Configura el componente Calendar de PrimeReact en modo inline, con selectionMode="multiple" y numberOfMonths={3}.
      • Utiliza la función dateTemplate para marcar con un punto blanco los festivos que tienen motivo anotado y atenuar 
      los días que caen fuera del periodo lectivo oficial.
      • Ofrece botones de salto rápido al inicio oficial de las clases o al mes actual.
  3. calendario.css:
      • Resalta en rojo (#ef4444) los días festivos seleccionados (span.p-highlight).
      • Renderiza los fines de semana (sábados y domingos en las columnas 6 y 7 con semana iniciada en lunes) en color   
      gris/inactivo atenuado.
      • Garantiza la disposición flexible y responsive de los tres meses concurrentes en pantallas de cualquier tamaño.  
  4. PanelDetalleFestivos.jsx:
      • Renderiza la tabla lateral reutilizando TablaBase.jsx:31 con paginador superior en 5, 10, 15, 20 y 25 elementos  
      (según norma 27).
      • Muestra la fecha en formato español, el día de la semana, un InputText editable en línea para el motivo de la    
      festividad y un botón de eliminación directa.
      • Incorpora buscador y utiliza EstadoVacio.jsx:21 cuando no hay festivos registrados.
  5. LeyendaCalendario.jsx:
      • Muestra la guía explicativa del código de colores (días lectivos, fines de semana inactivos, festivos en rojo,   
      festivos con motivo y días fuera del curso).
  6. DialogoRangoFestivos.jsx:
      • Diálogo modal para agregar cómodamente periodos vacacionales (desde, hasta, motivo y casilla para excluir        
      automáticamente fines de semana).
  
  ──────
  ### 4. Página Orquestadora y Enrutamiento
  
  • Página principal (CalendarioEscolarPagina.jsx):
      • Actúa como orquestador conectando el hook useCursos.js:6 y useCalendarioEscolar.js:12.
      • Incluye HeaderPagina.jsx:16, CargadorSeccion.jsx:18 y ModalConfirmacion.jsx:58 para el vaciado masivo.           
  • Adaptador de compatibilidad (CalendarioPagina.jsx):
      • Re-renderiza CalendarioEscolarPagina.jsx:18 para garantizar que las referencias previas a la ruta sigan          
      funcionando.
  • Menú de navegación (menuConfiguracion.js:50):
      • Se ha registrado la entrada Calendario Escolar con icono pi pi-calendar bajo el menú Herramientas apuntando a    
      /herramientas/calendario-escolar.
  • Enrutamiento (App.jsx:114):
      • Se configuraron las rutas /herramientas/calendario-escolar y /herramientas/calendario, así como accesos directos 
      con redirección automática.

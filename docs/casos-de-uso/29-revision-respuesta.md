
Se ha completado la revisión e implementación del Caso de Uso 29 (Master Planner / Calendario Escolar), adaptándolo al 
  esquema de base de datos de ESQUEMA.sql:187-197 y satisfaciendo los requisitos de 29-revision-calendario.md y          
  CONVENCIONES.md.                                                                                                       
  ──────                                                                                                                 
  ### Resumen de cambios implementados                                                                                   
                                                                                                                         
  #### 1. Instalación de librerías requeridas                                                                            
                                                                                                                         
  • Se han instalado las dependencias del ecosistema FullCalendar y generación de PDF:                                   
      • @fullcalendar/react, @fullcalendar/core, @fullcalendar/daygrid, @fullcalendar/interaction.                       
      • jspdf y html2canvas para la exportación de documentos PDF en una sola página.                                    
                                                                                                                         
                                                                                                                         
  #### 2. Utilidad cromática y de tipos de evento                                                                        
                                                                                                                         
  • Se ha creado coloreCalendario.js (con alias coloresCalendario.js) con los 6 tipos estandarizados y su propiedad      
  crítica esLectivo:
      1. Rojo (#ef4444): Festivo Nacional (es_lectivo: false).
      2. Amarillo (#eab308): Festivo Local (es_lectivo: false).
      3. Azul (#3b82f6): Vacaciones (es_lectivo: false).
      4. Verde Claro (#86efac): Evaluación (es_lectivo: true).
      5. Naranja (#f97316): Examen (es_lectivo: true).
      6. Morado (#a855f7): Anotación / Excursión (es_lectivo: true).
  
  
  #### 3. Custom Hook para Supabase (useCalendario.js)
  
  • Se ha implementado useCalendario.js consumiendo useDatos para gestionar la tabla Calendario_Eventos y la             
  actualización de fechas del curso en Cursos:
      • Carga y sincronización reactiva de eventos por id_curso ordenados por fecha_inicio.
      • Inserción (agregarEvento, agregarRangoEventos), actualización (actualizarEvento), eliminación (eliminarEvento) y 
      vaciado (limpiarEventos).
      • Clonación de eventos entre cursos con ajuste de año lectivo (copiarEventosDesdeCurso).
      • Guardado de fechas límite oficiales del curso escolar (guardarFechasCurso).
      • Cálculo dinámico del resumenLectivo mediante la versión actualizada de fechas.js:91-182.
  • Se actualizaron useCalendarioEscolar.js, useFestivos.js, useConfiguracionCurso.js y useCopiasSeguridad.js para       
  garantizar coherencia en todo el proyecto.
  
  #### 4. Subcomponentes modulares (src/components/calendario/)
  
  Siguiendo la regla estricta de componentización, la interfaz se ha dividido en piezas con responsabilidad única:       
  
  1. CabeceraCalendario.jsx:
      • Utiliza el selector común SelectorCurso.jsx.
      • Controles de fecha de inicio y fin de clases.
      • Botones de acción: Imprimir PDF, Añadir Periodo, Copiar de Curso y botón común BotonAccion.jsx para guardar      
      fechas.
      • Tags resumen con días lectivos, festivos, exámenes y evaluaciones.
  2. CalendarioInteractivo.jsx:
      • Integración de @fullcalendar/react con vista mensual (dayGridMonth), localización en español (esLocale) e inicio 
      de semana en lunes (firstDay: 1).
      • Rango lectivo acotado de septiembre del año de inicio a agosto del siguiente.
      • Soporte de selección por arrastre de rangos (selectable, selectMirror), clic en días individuales y clic en      
      eventos ya registrados.
  3. OverlayEditorEvento.jsx:
      • OverlayPanel flotante activado junto al cursor al seleccionar fechas o pulsar eventos.
      • Paleta interactiva de botones circulares con los colores estandarizados.
      • Campo InputText para motivo o detalle opcional.
      • Botones de confirmación y eliminación de eventos.
  4. LeyendaCalendario.jsx:
      • Muestra visualmente los 6 tipos de eventos con su color y distinción entre jornada lectiva y no lectiva.         
  5. TablaEventosCalendario.jsx:
      • Componente basado en TablaBase.jsx con paginación en la parte superior y selector de 5, 10, 15, 20 y 25 elementos
      (regla 27 de convenciones).
      • Texto truncado en una línea con tooltip nativo (regla 24).
      • Búsqueda por texto y botones para editar o eliminar eventos.
  6. DialogoRangoEventos.jsx:
      • Diálogo modal para registrar periodos continuos (vacaciones, evaluaciones, exámenes), con opción de omitir fines 
      de semana.
  7. DialogoCopiarEventos.jsx:
      • Diálogo modal para clonar eventos desde otro curso de origen con adaptación automática de desfase de años.       
  8. GuiaUsoCalendario.jsx:
      • Tarjeta didáctica de 4 pasos explicando el flujo del nuevo Master Planner.
  
  
  #### 5. Generación de PDF en una sola página
  
  • En exportadorCalendarioPdf.js se programó la captura del bloque #bloque-impresion-calendario (calendario + leyenda   
  oficial al pie) escalándolo en un lienzo A4 apaisado con factor de reducción garantizado para no desbordar a una       
  segunda página.
  
  #### 6. Página orquestadora y rutas
  
  • Se creó CalendarioPagina.jsx implementando el patrón Contenedor-Presentacional.
  • Se mantuvieron como adaptadores retrocompatibles CalendarioEscolarPagina.jsx y CalendarioPagina.jsx, y se conectó en 
  App.jsx:98-101.


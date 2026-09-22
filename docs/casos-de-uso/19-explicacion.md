Se ha implementado de forma completa la funcionalidad de Temporización de un módulo a través de sus Unidades de        
  Trabajo, cumpliendo rigurosamente con los requisitos del 19-temporizacion.md, las CONVENCIONES.md y el esquema de base 
  de datos en ESQUEMA.sql.                                                                                               
  ──────                                                                                                                 
  ### Resumen de los Cambios Implementados                                                                               
                                                                                                                         
  #### 1. Servicio de Temporización y Relaciones                                                                         
                                                                                                                         
  • Archivo creado: temporizacionService.js                                                                              
  • Funcionalidades:                                                                                                     
      • obtenerModulosParaTemporizacion(idCurso): obtiene los módulos impartidos en el curso lectivo seleccionado (a     
      través de imparte y Evaluaciones) o todo el catálogo si el curso aún no tiene asignaciones.                        
      • obtenerUtRaPorModulo(idModulo): cruza las Unidades de Trabajo con la tabla ESQUEMA.sql:184-192 y                 
      ESQUEMA.sql:94-103 para listar y mostrar los Resultados de Aprendizaje que cubre cada UT.                          
      • obtenerPracticasPorModuloUT(idModulo, idCurso): consulta las prácticas curriculares asociadas a cada UT tanto en 
      ESQUEMA.sql:55-68 como en ESQUEMA.sql:193-205.                                                                     
      • Manejo de respuestas y errores estructurados según el estándar HTTP (status: 200, status: 400, status: 500).     
                                                                                                                         
                                                                                                                         
  #### 2. Custom Hook useTemporizacion                                                                                   
                                                                                                                         
  • Archivo actualizado: useTemporizacion.js                                                                             
  • Funcionalidades:                                                                                                     
      • Se conecta exclusivamente al hook genérico useDatos.js sobre la tabla Temporizacion.                             
      • Ampliación de guardarTemporizacion para soportar todos los campos del modelo: fecha_ini_prevista,                
      fecha_fin_prevista, fecha_ini_real, fecha_fin_real, estado, observaciones, orden y nombre_alternativo.             
      • actualizarCampo(idTemporizacion, campo, valor): para actualizaciones reactivas e inmediatas desde la tabla.      
      • reordenarTemporizaciones(nuevasPosiciones, idCurso): actualización persistente del campo orden en Supabase tras  
      acciones de reordenación o arrastre.                                                                               
      • obtenerMapaPorCurso(idCurso): indexación de las temporizaciones por id_ut para acceso eficiente.                 
                                                                                                                         
                                                                                                                         
  #### 3. Componente Visual GestorTemporizacion                                                                          
                                                                                                                         
  • Archivo creado: GestorTemporizacion.jsx                                                                              
  • Funcionalidades:                                                                                                     
      • Filtros contextuales: Selectores con Dropdown de PrimeReact para Curso Académico, Módulo Formativo y Filtro de   
      Progreso por Estado (Pendiente, En curso, Completada, Pospuesta, Todos), además de un buscador textual en tiempo   
      real.                                                                                                              
      • Cuadro de mando KPI: Métricas sobre el total de unidades, número de pendientes, en curso, completadas, unidades  
      con retraso y porcentaje global de avance del módulo.                                                              
      • Tabla DataTable de PrimeReact:                                                                                   
          • Orden: indicador ordinal con botones de subida y bajada rápida.                                              
          • Unidad de Trabajo: número y nombre curricular oficial, junto a botón para definir o consultar el             
          nombre_alternativo adaptado al curso actual.                                                                   
          • Resultados de Aprendizaje (ut_ra): etiquetas visuales (Tags) con los RA vinculados a cada UT y sus           
          descripciones en tooltip.                                                                                      
          • Prácticas: recuento de prácticas asociadas a la unidad.                                                      
          • Fechas Previstas: edición directa mediante componentes Calendar de PrimeReact (fecha_ini_prevista y          
          fecha_fin_prevista) con formato dd/mm/yy.                                                                      
          • Fechas Reales: edición directa mediante componentes Calendar de PrimeReact (fecha_ini_real y fecha_fin_real) 
          con botón de limpieza y selección rápida.                                                                      
          • Desviación / Comparativa: cálculo automático de la diferencia en días entre la planificación prevista y la   
          ejecución real, indicando si se cumplió en fecha exacta, con días de adelanto o con días de retraso.           
          • Estado: selector desplegable con Dropdown de PrimeReact para alternar el progreso (Pendiente, En curso,      
          Completada, Pospuesta) con colores semánticos.                                                                 
          • Observaciones: diálogo interactivo para registrar notas de seguimiento o justificar retrasos.                
      • Reordenación con swapy (Drag & Drop):                                                                            
          • Modo interactivo de reordenación arrastrando y soltando filas mediante agarradores [data-swapy-handle], slots
          [data-swapy-slot] e items [data-swapy-item].
          • Guarda automáticamente las nuevas posiciones en el campo orden de la tabla Temporizacion.
      • Inicialización Rápida: botón para generar la temporización estimada inicial escalonada de todas las UTs del      
      módulo que aún no dispongan de planificación en el curso lectivo.
  
  
  #### 4. Nueva Página TemporizacionPagina
  
  • Archivo creado: TemporizacionPagina.jsx
  • Encapsula la cabecera descriptiva de la vista y renderiza el componente GestorTemporizacion.
  
  #### 5. Navegación y Menú Lateral en Layout
  
  • Archivo modificado: Layout.jsx:29-35
      • Se ha creado la nueva entrada desplegable Planificación en el menú principal.
      • Se ha trasladado Unidades de trabajo como submenú hacia /unidades.
      • Se ha incorporado Temporización como submenú hacia /temporizacion.
  
  
  #### 6. Enrutamiento en App
  
  • Archivo modificado: App.jsx:27-31
      • Se ha registrado la ruta protegida /temporizacion vinculada a TemporizacionPagina.
      • Se añadieron redirecciones amigables para /planificacion, /planificacion/unidades y /planificacion/temporizacion.
  
  ──────
  ### Verificación y Calidad de Código
  
  1. Linter: Se ejecutó npm run lint (oxlint) confirmando 0 errores.
  2. Compilación: Se ejecutó npm run build con Vite, completando la compilación y empaquetado de producción de forma     
  satisfactoria.

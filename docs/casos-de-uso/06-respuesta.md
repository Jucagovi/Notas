Se ha completado la implementación de la pantalla tabular e interactiva para la calificación de actividades según lo   
  especificado en el caso de uso 06, cumpliendo rigurosamente las directrices de CONVENCIONES.md, el esquema de base de  
  datos en ESQUEMA.sql y la regla estricta de componentización sin modificar los componentes de src/components/common.   
  ──────                                                                                                                 
  ### Resumen de Cambios Realizados Paso a Paso                                                                          
                                                                                                                         
  #### 1. Custom Hook de Calificación y Persistencia                                                                     
                                                                                                                         
  • Se ha creado useCalificador.js consumiendo exclusivamente el hook genérico useDatos.js.                              
  • obtenerDiscentesConNotas(idVersion, idEvaluacion, idCurso, idModulo): Cruza las matrículas de la tabla imparte con la
  tabla Discentes y las calificaciones registradas en evaluan. Si un alumno carece de nota, se le asigna null para       
  representarlo como pendiente (?).                                                                                      
  • guardarNota(idVersion, idEvaluacion, idDiscente, nota): Realiza un upsert inteligente comprobando la existencia      
  previa en evaluan mediante useDatos. Si ya existe, actualiza el registro; si no existe, inserta uno nuevo; y si se     
  vacía la celda, elimina la calificación devolviendo al alumno al estado pendiente.                                     
  • Expone también las funciones auxiliares obtenerPracticasPorModulo y obtenerVersionesPorPracticaYCurso.               
                                                                                                                         
  #### 2. Subcomponentes Modulares en src/components/calificar/                                                          
                                                                                                                         
  Siguiendo el principio de responsabilidad única (SRP), se ha dividido la interfaz en cuatro subcomponentes             
  independientes:                                                                                                        
                                                                                                                         
  1. **FiltrosCalificar.jsx**:                                                                                           
      • Reutiliza SelectorClase.jsx para la selección de la clase (binomio curso y módulo profesional).                  
      • Incorpora el desplegable dependiente de Prácticas (filtrado por el módulo de la clase activa) sin utilizar       
      componentes Tag dentro del desplegable, conforme a las convenciones.                                               
      • Incluye botón de refresco para recargar catálogos.                                                               
  2. **SelectorVersiones.jsx**:                                                                                          
      • Muestra las versiones de la práctica seleccionada que pertenecen al curso/clase actual.                          
      • Permite hacer clic en cada tarjeta interactiva (v1.0, evaluación vinculada, peso porcentual) para activar la     
      calificación de dicha versión.                                                                                     
  3. **ResumenCalificaciones.jsx**:                                                                                      
      • Presenta una barra de contexto con el nombre de la práctica, versión y evaluación.                               
      • Calcula en tiempo real indicadores clave (KPIs): total de discentes matriculados, calificados, pendientes y la   
      nota media global coloreada mediante getColorNota(nota).                                                           
  4. **TablaCalificaciones.jsx**:                                                                                        
      • Se apoya en TablaBase.jsx con paginación superior (paginatorPosition="top"), opciones de selector [5, 10, 15, 20,
      25] y editMode="cell".                                                                                             
      • Columnas: Apellidos y Nombre (con truncado de una sola línea y tooltip con el texto completo si desborda) y      
      columna editable Nota.                                                                                             
      • La celda de nota muestra el signo de interrogación ? por defecto para discentes sin calificar.                   
      • Al tener nota, se formatea aplicando obligatoriamente las clases semánticas de getColorNota(nota) (rojo, naranja,
      amarillo, verde y azul).                                                                                           
      • Editor de celda con InputNumber de PrimeReact (rango 0 a 100 sin decimales). Si el valor es inválido, aplica la  
      clase p-invalid e impide el guardado.                                                                              
      • Auto-save: al perder el foco (onBlur) o confirmar la celda, guarda automáticamente la calificación en segundo    
      plano y muestra un Toast silencioso («Nota guardada con éxito.»).                                                  
      • Añade campo de búsqueda rápida para localizar alumnos por nombre, apellidos o NIA.                               
  5. **index.js**:                                                                                                       
      • Punto de exportación centralizado para todos los subcomponentes del módulo de calificación.                      
                                                                                                                         
                                                                                                                         
  #### 3. Página Contenedora Orquestadora                                                                                
                                                                                                                         
  • Se ha implementado CalificarPagina.jsx, actuando exclusivamente como orquestador de datos y estados.                 
  • Consume useClases.js, useCalificador.js y useGlobalToast.js.                                                         
  • Gestiona la cascada de selecciones y utiliza EstadoVacio.jsx con mensajes orientativos paso a paso cuando no hay     
  clase, práctica o versión seleccionada.                                                                                
                                                                                                                         
  #### 4. Menú de Navegación y Rutas                                                                                     
                                                                                                                         
  • En menuConfiguracion.js se ha añadido el submenú «Calificar actividades» dentro de ELEMENTOS_EVALUACION.             
  • En App.jsx se ha registrado la ruta anidada /evaluacion/calificar manteniendo la ruta directa /calificar.       
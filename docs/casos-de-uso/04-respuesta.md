  #### 1. Custom Hook de Orquestación con Supabase: useConfiguracionCurso.js
  
  No se crearon servicios aislados, sino un Custom Hook especializado que consume internamente el hook genérico          
  useDatos.js para aislar la comunicación con la base de datos Supabase:
  
  • generarCursoCompleto(...):
      • Inserta o utiliza el registro del curso en la tabla Cursos.
      • Genera silenciosamente las 5 evaluaciones oficiales ('Primera', 'Segunda', 'Tercera', 'Final' y 'Extraordinaria')
      vinculadas al curso y módulo en la tabla Evaluaciones.
      • Registra las matrículas en la tabla imparte para todos los discentes seleccionados.
      • Si se solicita clonación de programación, duplica las ponderaciones de Resultados de Aprendizaje (ra_curso),     
      Criterios de Evaluación (ce_curso), la planificación en Temporizacion y las prácticas en Versiones (así como su    
      cobertura en trabajan).
  • eliminarCurso(cursoId):
      • Realiza el borrado en cascada y seguro de todas las dependencias del curso: imparte, Evaluaciones, evaluan,      
      Versiones, trabajan, Temporizacion, ra_curso, ce_curso, Horarios, Sesiones, Festivos y finalmente Cursos.          
  • actualizarMatriculaClase(cursoId, moduloId, nuevosDiscentesIds):
      • Compara las matrículas existentes con los alumnos transferidos en el componente PickList e inserta las nuevas    
      altas y elimina las bajas en imparte.
  
  ──────
  #### 2. Componentes Modulares Creados en src/components/clases/
  
  Siguiendo la regla estricta de componentización, granularidad (menos de 150 líneas por archivo) y el patrón Contenedor-
  Presentacional:
  
  • CabeceraClases.jsx:
      • Título, subtítulo y conmutador visual con SelectButton de PrimeReact sincronizado con el parámetro de búsqueda   
      pestanya (crear, modificar, eliminar).
  • CrearClaseStepper.jsx:
      • Asistente lineal mediante Stepper y StepperPanel de PrimeReact que guía el flujo de 6 pasos:
          • PasoCursos.jsx: Selector de curso existente mediante Dropdown con plantillas de año y centro, o botón para   
          abrir el diálogo modal de nuevo curso.
          • DialogoNuevoCurso.jsx: Modal Dialog de PrimeReact para registrar un nuevo curso académico en Cursos (nombre, 
          anyo, centro, fechas opcionales y descripción).
          • PasoModulos.jsx: Dos Dropdown encadenados donde al elegir el ciclo formativo se filtran reactivamente los    
          módulos que pertenecen a dicho ciclo.
          • PasoDiscentes.jsx: Tabla DataTable con selección múltiple mediante casillas de verificación (checkbox),      
          filtro de búsqueda rápido y reutilización del componente CeldaTruncada.jsx para truncar texto con Tooltip.     
          • PasoEvaluaciones.jsx: Presentación estructurada de las 5 auto-evaluaciones reglamentarias preparadas para su 
          registro silencioso.
          • PasoProgramacion.jsx: Opciones mediante SelectButton para empezar desde cero o heredar la programación       
          didáctica de un curso previo (con selector de curso origen).
          • PasoConfirmacion.jsx: Informe preliminar detallado con botones de Aceptar y Guardar y Cancelar y Reiniciar.  
  
  • ModificarClasePanel.jsx:
      • Dropdown con las clases existentes (binomio Curso/Módulo).
      • Componente PickList de PrimeReact configurado con "Discentes Disponibles" a la izquierda y "Discentes            
      Matriculados" a la derecha, con filtros de búsqueda en ambas listas y botón de persistencia en imparte.            
  • EliminarClasePanel.jsx:
      • Dropdown para seleccionar el curso/clase.
      • Tarjeta de advertencia que desglosa el impacto del borrado en cascada en todas las tablas afectadas y botón      
      conectado con confirmDialog de PrimeReact para solicitar confirmación crítica.
  
  ──────
  #### 3. Página Orquestadora: ClasesPagina.jsx
  
  • Actúa como contenedor de estado:
      • Lee el parámetro ?pestanya=crear|modificar|eliminar desde la URL (lo que sincroniza perfectamente con el submenú 
      lateral configurado en menuConfiguracion.js).
      • Consume los datos de useCursos.js, useCiclos.js, useModulos.js, useDiscentes.js, useImparte.js y
      useEvaluaciones.js.
      • Informa al usuario a través del sistema global de notificaciones Toast (useGlobalToast.js).

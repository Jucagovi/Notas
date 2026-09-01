# 1. Capa de Servicios y Acceso a Base de Datos (Supabase)

  • **pesosEvaluacionService.js**:
      • pesosEvaluacionService.js:4: Realiza la consulta de los RA y CE del módulo y cruza sus datos con las tablas
      ra_curso y ce_curso para el curso académico seleccionado, transformando la estructura en un árbol jerárquico listo
      para TreeTable.
      • pesosEvaluacionService.js:131: Limpia e inserta en lote los registros actualizados en las tablas ra_curso y
      ce_curso, vinculando los identificadores id_ra, id_ce, id_curso y sus pesos correspondientes.
      • pesosEvaluacionService.js:236: Utilidad para balancear homogéneamente un total de 100% entre N elementos de forma
      exacta.
  
# 2. Custom Hooks
  
  • **usePesosEvaluacion.js**:
      • Controla la selección automática del curso más reciente por defecto y la selección manual del módulo.
      • Mantiene el estado reactivo de los pesos de RA y CE (pesosRA, pesosCE), control de cambios pendientes y estado de
      carga.
      • Gestiona las validaciones en tiempo real: suma global de RA al 100% y suma de CE hijos por cada RA al 100%.
      • Proporciona funciones de balanceo rápido (repartirEquitativamenteRA, repartirEquitativamenteCE,
      repartirEquitativamenteTodosCE) y persistencia (guardarPonderacion).
  • **useRACurso.js** y **useCECurso.js**:
      • Hooks atómicos basados en useDatos.js para operaciones CRUD sobre ra_curso y ce_curso.
  
# 3. Componentes de UI (PrimeReact)
  
  • **PesosRAFiltros.jsx**:
      • Incorpora dos componentes Dropdown para la selección dependiente de Curso y Módulo, con insignias de siglas y    
      resumen contextual.
  • **PesosRAResumen.jsx**:
      • Panel de retroalimentación visual con barra ProgressBar e indicador global de suma de RAs (verde si es 100%, rojo
      en caso contrario).
      • Validación del estado de los criterios por RA y barra de herramientas con botones para repartir pesos,           
      restablecer y guardar.
  • **PesosRATreeTabla.jsx**:
      • Implementa TreeTable con controles para expandir y contraer nodos.
      • Nodos Padre (RA): Muestran el código y nombre del RA, un InputNumber para su porcentaje en el módulo y una       
      etiqueta con la suma de sus CE hijos (verde si es 100%, rojo si no lo es) junto a un botón de reparto rápido.      
      • Nodos Hijo (CE): Muestran el CE, un InputNumber para su porcentaje respecto al RA y el cálculo de aportación     
      efectiva a la nota final del módulo.
  
# 4. Integración de Vistas y Enrutamiento
  
  • **PesosRAPagina.jsx**: Vista principal que integra filtros, resumen de validación, editor jerárquico y tarjeta       
  informativa con directrices pedagógicas.
  • **Layout.jsx:30-36**: Se añadió la opción "Pesos RA y CE" en el submenú de Evaluación.
  • **App.jsx:72-78**: Se registraron las rutas /pesos-ra y sus alias asociados (/evaluacion/pesos-ra, /pesos-ra-ce).   
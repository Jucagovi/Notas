 Se ha implementado el Caso de Uso 12.1: Informe de Auditoría de Cobertura Curricular (CE) siguiendo estrictamente las  
  especificaciones de negocio, las reglas globales de CONVENCIONES.md y los principios de responsabilidad única y        
  componentización modular.
  ──────
  ### 1. Custom Hooks para la obtención y procesamiento de datos
  
  • **`useInformeCobertura.js`**:
      • Se aísla el acceso a Supabase consumiendo instancias especializadas de **`useDatos.js`** para las tablas RA, CE, 
      Versiones, Practicas y trabajan.
      • Se obtienen los Resultados de Aprendizaje del módulo seleccionado, se anidan sus Criterios de Evaluación y se    
      cruzan con las actividades programadas (Versiones) del curso mediante la relación trabajan.
      • Se calcula en el frontend la suma acumulada del porcentaje por cada CE y se prepara la estructura de datos que   
      exige el componente DataTable con agrupación de filas (Row Grouping).
      • Se calculan métricas cuantitativas consolidadas (totalCE, totalCubiertos, totalSinCubrir, totalDesbalanceados,   
      porcentajeGlobal).
  • **`useFiltrosCobertura.js`**:
      • Gestiona el estado dependiente de selección: Curso → Módulo.
      • Resuelve los módulos disponibles para el curso seleccionado a través de las relaciones imparte, Evaluaciones y   
      Horarios (con respaldo a todos los módulos en caso de cursos sin configuración previa).
      • Limpia de forma reactiva la selección del módulo si el docente cambia de curso escolar.
  
  ──────
  ### 2. Componentización en src/components/coberturace/
  
  Siguiendo la regla de granularidad y separación de responsabilidades, la interfaz se ha dividido en tres subcomponentes
  presentacionales:
  
  • **`FiltrosCobertura.jsx`**:
      • Barra superior con diseño responsivo basada en PrimeFlex.
      • Reutiliza los selectores comunes obligatorios **`SelectorCurso.jsx`** y **`SelectorModulo.jsx`**.
      • Incluye botón con icono para refrescar y forzar el recálculo de la auditoría.
  • **`ResumenCobertura.jsx`**:
      • Tarjetas métricas con resumen visual de Criterios Totales, Cubiertos al 100% (verde), Sin Cubrir (gris) y        
      Desbalanceados (rojo).
      • Incorpora una barra de progreso global mediante ProgressBar de PrimeReact.
  • **`TablaCoberturaCe.jsx`**:
      • Implementa **`TablaBase.jsx`** con la propiedad rowGroupMode="subheader" y agrupación por id_ra.
      • La cabecera de grupo (plantillaCabeceraRa) expone el número, nombre y descripción del Resultado de Aprendizaje   
      con icono y tipografía jerárquica.
      • Columna CE: Muestra el código y denominación del criterio en una sola línea truncada con el texto completo en    
      title/tooltip.
      • Columna Actividades Asociadas: Lista separada por comas de las actividades (Versiones) vinculadas con su         
      porcentaje, respetando el límite de línea y tooltip.
      • Columna Porcentaje Total (Semántica UX con Tag):
          • 100%: Verde con severity="success" e icono de verificación.
          • 0% o null: Gris con severity="secondary" y texto "0% (Sin cubrir)".
          • < 100% o > 100%: Rojo con severity="danger" e icono de alerta indicando el desbalance en el tooltip.         
      • Cumple con la directriz de paginación superior con opciones [5, 10, 15, 20, 25].
  • **`index.js`**:
      • Archivo de barril para simplificar las importaciones en la página orquestadora.
  
  ──────
  ### 3. Página Orquestadora y Navegación
  
  • **`InformeCoberturaCE.jsx`**:
      • Actúa como contenedor orquestador integrando los Custom Hooks con las vistas presentacionales.
      • Emplea **`HeaderPagina.jsx`** para la cabecera institucional.
      • Gestiona los estados vacíos mediante **`EstadoVacio.jsx`** (curso no seleccionado, módulo no seleccionado, módulo
      sin criterios registrados) y estado de carga con **`CargadorSeccion.jsx`**.
  • **`menuConfiguracion.js`**:
      • Se añade la entrada "Cobertura de CE" en ELEMENTOS_INFORMES apuntando a /informes/cobertura-ce.
      • Se añade la sección desplegable "Informes" en NAV_ITEMS para permitir su acceso desde la barra lateral.          
  • **`App.jsx`**:
      • Se registra la ruta protegida /informes/cobertura-ce vinculada a InformeCoberturaCE.
      • Se configuran redirecciones y accesos directos auxiliares como /cobertura-ce y /evaluacion/cobertura-ce. 
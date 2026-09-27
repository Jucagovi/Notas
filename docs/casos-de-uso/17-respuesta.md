  Se ha implementado el Caso de Uso 17: Acta de Evaluación por Resultados de Aprendizaje (RA) siguiendo estrictamente las
  directrices de CONVENCIONES.md, el esquema en ESQUEMA.sql y el principio de responsabilidad única (SRP) con alta       
  granularidad y componentización.
  ──────
  ### Resumen de los Cambios Implementados
  
  #### 1. Función RPC en Base de Datos y Script SQL
  
  • Archivo generado: calcular_acta_ra.sql
  • Se ha definido la función PostgreSQL calcular_acta_ra(p_id_curso uuid, p_id_modulo uuid) para delegar en el servidor 
  el cruce masivo de relaciones (imparte → Discentes → RA → CE → ce_curso → ra_curso → Versiones → trabajan → evaluan).  
  Devuelve un objeto JSON estructurado con los discentes matriculados y sus calificaciones por Resultado de Aprendizaje. 
  
  #### 2. Custom Hook Especializado
  
  • Archivo generado: useInformeActaRA.js
  • Consume useDatos para aislar el acceso a Supabase.
  • Estrategia híbrida tolerante a fallos: intenta ejecutar en primer lugar la función RPC calcular_acta_ra en Supabase; 
  si la función aún no está creada en la base de datos (código de error PGRST202), conmutará automáticamente a un cálculo
  en cliente cruzando las tablas requeridas.
  • Aplica las dos modalidades de cálculo:
      • Evaluación Continua: filtra los RA completados al 100% (cuyos criterios se han cubierto en su totalidad) y       
      reescala proporcionalmente la calificación al 100% dividiendo por la suma de pesos de dichos RA.
      • Evaluación Final: pondera cada RA por su peso oficial sobre el 100% curricular, asignando un valor 0 a los       
      aspectos pendientes de evaluar.
  
  
  #### 3. Componentización y Arquitectura Presentacional
  
  Se ha creado la carpeta src/components/actara/ dividiendo la interfaz en componentes desacoplados:
  
  1. FiltrosActaRa.jsx:
      • Selectores para el Año Académico (desplegable que muestra formato 2026/2027 seleccionando el más reciente por    
      defecto) y Curso / Módulo (Clase) utilizando el componente común SelectorClase.
  2. BarraHerramientasActa.jsx:
      • SelectButton de PrimeReact para alternar entre "Evaluación Continua" y "Evaluación Final".
      • Botones de acción para "Exportar a PDF" y "Exportar CSV".
  3. ResumenActaRa.jsx:
      • Panel explicativo de la metodología matemática aplicada y tarjetas de indicadores rápidos (alumnos matriculados, 
      RAs evaluados, aprobados y calificación media).
  4. TablaActaRa.jsx:
      • DataTable dinámico (Pivot Table) con:
          • Columna fija (frozen) con Apellidos y Nombre del discente y su NIA.
          • Columnas dinámicas por cada Resultado de Aprendizaje con el color de fondo obtenido estrictamente de         
          getColorNota.
          • Columna fija a la derecha con la Nota Módulo calculada según el modo seleccionado.
          • Paginación en la parte superior con opciones de visualización de 5, 10, 15, 20 y 25 elementos.
  
  5. index.js:
      • Punto de exportación centralizado del módulo.
  
  
  #### 4. Utilidades de Exportación Oficial
  
  • exportadorActaPdf.js: genera un documento PDF oficial en orientación apaisada (A4 landscape) con membrete            
  institucional, metadatos de la clase, matriz de calificaciones coloreada, resumen estadístico del grupo y diligencia de
  firmas del profesorado y jefatura de estudios.
  • exportadorActaCsv.js: genera y descarga la hoja de cálculo CSV con codificación UTF-8 y delimitador estándar ; para  
  compatibilidad directa con Microsoft Excel en español.
  
  #### 5. Página Orquestadora y Enrutamiento
  
  • Página principal: InformeEvaluacionRa.jsx, actúa como orquestador consumiendo HeaderPagina, EstadoVacio y los        
  subcomponentes creados.
  • Menú de Navegación: en menuConfiguracion.js:30-42, se ha añadido la entrada Acta evaluación RA dentro de la sección  
  Evaluación con ruta /evaluacion/acta-ra.
  • Enrutador: en App.jsx:140-157, se han registrado las rutas protegidas /evaluacion/acta-ra, /acta-ra e
  /informes/evaluacion-ra.

Se ha implementado la funcionalidad de flexibilización de dos módulos en un mismo curso siguiendo las directrices del  
  caso de uso 32-temporizacion-flex.md, el esquema de base de datos ESQUEMA.sql y las reglas de diseño y arquitectura de 
  CONVENCIONES.md.                                                                                                       
  ──────                                                                                                                 
  ### 1. Desglose de Componentización y UI                                                                               
                                                                                                                         
  Siguiendo la regla estricta de componentización, se han evitado componentes monolíticos separando la lógica visual en  
  subcomponentes especializados e integrándolos en las vistas contenedoras:                                              
                                                                                                                         
  1. **SeccionFlexibilizacionModulo.jsx**:                                                                               
      • Subcomponente extraído a la carpeta src/components/clases/ para el Paso 2 del asistente de creación de clases.   
      • Incorpora un componente InputSwitch de PrimeReact con la etiqueta "¿Flexibilizar con otro módulo?".              
      • Al activarse, despliega el desplegable reutilizando SelectorModulo de common.
      • Filtra las opciones para que únicamente aparezcan módulos pertenecientes al mismo ciclo formativo seleccionado y 
      oculta el módulo principal activo para evitar autoflexibilización.
  2. **PasoModulos.jsx**:
      • Integra SeccionFlexibilizacionModulo y gestiona el reseteo de la selección secundaria si se modifica el ciclo o  
      el módulo principal.
  3. **PasoEvaluaciones.jsx**:
      • Adapta el mensaje explicativo para indicar que se prepararán 10 registros de evaluación independientes en la     
      tabla Evaluaciones (5 para el módulo principal y 5 para el secundario flexibilizado).
  4. **PasoConfirmacion.jsx**:
      • Informa sobre la creación dual de cursos vinculados bidireccionalmente (id_modulo_flexible), la matriculación    
      idéntica de discentes en ambos cursos (imparte) y las 10 evaluaciones a registrar.
  5. **CrearClaseStepper.jsx**:
      • Centraliza los estados reactivos esFlexibilizado y moduloFlexibleId.
      • En la validación del paso 2, exige la selección del módulo secundario si la flexibilización está activa antes de 
      avanzar.
  6. **BadgeModuloFlexibilizado.jsx**:
      • Subcomponente visual en src/components/temporizacion/ que renderiza un Tag informativo de PrimeReact con la      
      leyenda:
      Módulo flexibilizado con [Nombre del módulo secundario] ([Siglas]).
  7. **FiltrosTemporizacion.jsx**:
      • Detecta si la clase seleccionada posee id_modulo_flexible e inserta BadgeModuloFlexibilizado en la cabecera junto
      al selector de clase.
  
  ──────
  ### 2. Custom Hooks y Capa de Datos (Supabase)
  
  1. **useModuloFlexibilizado.js**:
      • Nuevo Custom Hook que encapsula las consultas a Modulos y Horarios del módulo flexibilizado utilizando useDatos. 
  2. **useConfiguracionCurso.js**:
      • Modificada la función generarCursoCompleto:
          • Inserta secuencialmente dos registros en la tabla Cursos cruzando sus identificadores: el curso principal    
          guarda el UUID del secundario en id_modulo_flexible y el curso secundario guarda el del principal.             
          • Inserta 5 evaluaciones reglamentarias para el curso principal y otras 5 independientes para el secundario.   
          • Realiza la matriculación cruzada en imparte para ambos cursos con los discentes seleccionados.
          • Implementa rollback de seguridad y propagación de errores estructurados { error: "...", status: 400 } para   
          abortar la operación en caso de fallo parcial.
  
  3. **usePropuestaTemporizacion.js**:
      • Modificada la función generarPropuesta:
          • Consulta las sesiones lectivas en Horarios aplicando el filtro condicional consulta.or(id_modulo.eq.idModulo,
          idₘodulo.eq.{flexibleId}).
          • Combina las horas y días de ambos módulos en un calendario lectivo unificado para calcular las fechas        
          previstas de las unidades de trabajo.
  
  4. **useCalendarioEscolar.js**:
      • Admite el parámetro idModuloFlexible y unifica la consulta de horarios lectivos, permitiendo que la vista del    
      Calendario Escolar y el Diagrama de Gantt cubran la distribución horaria conjunta de ambos módulos.
  5. **useClases.js**:
      • Mapea en el catálogo de clases las propiedades id_modulo_flexible, id_modulo_flexibilizado, moduloFlexibleNombre,
      moduloFlexibleSiglas y esFlexibilizado.
  
  ──────
  ### 3. Orquestadores de Página
  
  • **ClasesPagina.jsx**:
      • Conecta los parámetros de flexibilización y emite un toast de confirmación específico cuando se completa la      
      creación dual.
  • **TemporizacionPagina.jsx**:
      • Extrae idModuloFlexible de la clase seleccionada y lo propaga a useCalendarioEscolar y a
      usePropuestaTemporizacion.
  
  ──────
  │ Note
  │ Aviso sobre Componentes Comunes (Regla 78 de CONVENCIONES.md):
  │ En la sección 7 de las convenciones se menciona el componente genérico <BadgeEstado>. En este momento no existe dicho
  │ archivo en la carpeta src/components/common. Para mostrar la etiqueta de módulo flexibilizado se ha implementado     
  │ BadgeModuloFlexibilizado.jsx mediante Tag de PrimeReact respetando la regla de no alterar src/components/common. Si  
  │ deseas que generemos el componente genérico <BadgeEstado> y lo incorporemos a la biblioteca de componentes comunes en
  │ src/components/common/BadgeEstado.jsx, indícalo y lo implementaremos.


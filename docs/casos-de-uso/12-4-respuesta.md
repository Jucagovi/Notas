Se ha completado la implementación del Caso de Uso 12.4: Análisis de Dificultad (Histograma de Frecuencias), respetando
  las reglas definidas en CONVENCIONES.md, el modelo relacional de ESQUEMA.sql y el principio de responsabilidad única   
  (SRP).                                                                                                                 
                                                                                                                         
  A continuación se detalla la arquitectura y los cambios realizados paso a paso:                                        
  ──────                                                                                                                 
  ### 1. Custom Hook de Datos (useInformeDificultad.js)                                                                  
                                                                                                                         
  Se ha creado el hook useInformeDificultad aislando la lógica de negocio y las consultas a Supabase a través del hook   
  genérico useDatos:                                                                                                     
                                                                                                                         
  • obtenerVersionesPorClase(idCurso, idModulo): consulta la tabla Versiones para el curso y módulo indicados,           
  vinculándolas con sus Practicas y Evaluaciones. Prepara una lista ordenada alfabéticamente omitiendo el enunciado para 
  su renderizado en tarjetas.                                                                                            
  • obtenerDistribucionNotas(idVersion): ejecuta la consulta sobre la tabla evaluan filtrando por la versión seleccionada.
  Extrae de forma limpia un array con las calificaciones numéricas (0-100), ignorando registros nulos o discentes sin    
  entregar.
  • Gestión de Estados: expone versiones, notas, cargandoVersiones, cargandoNotas, error y funciones de reseteo          
  (limpiarDatos, limpiarNotas).
  ──────
  ### 2. Componentización Modular ()
  
  Conforme a la regla estricta de componentización, la interfaz visual se ha desglosado en submódulos especializados sin 
  sobrecargar la página orquestadora:
  
  1. **FiltrosDificultad.jsx**:
      • Selector contextual con Dropdown de PrimeReact para Año Académico (preseleccionando el año más reciente de forma 
      automática).
      • Reutilización de SelectorClase.jsx de la carpeta common, ordenando las clases del registro más reciente al más   
      antiguo y deshabilitándolo hasta que el usuario escoja un año académico.
      • Botón de recarga para refrescar los datos.
  2. **TarjetasPracticas.jsx**:
      • Renderiza el catálogo de actividades como una cuadrícula (grid) de tarjetas interactivas (Card de PrimeReact)    
      situadas debajo de los desplegables.
      • Ocultación estricta del enunciado: cumple la directriz pedagógica de mostrar únicamente el nombre de la práctica,
      código de versión y evaluación asociada, sin incluir el enunciado.
      • Resalta visualmente la tarjeta activa mediante borde primario y sombra.
  3. **PanelResumenDificultad.jsx**:
      • Grid superior compuesto por tres componentes Card de PrimeReact:
          1. Nota Media: cálculo aritmético sobre las notas entregadas (0-100), con color dinámico extraído mediante     
          getColorNota.
          2. Tasa de Aprobados: porcentaje de discentes con nota ≥ 50.
          3. Diagnóstico Automático: evaluación dinámica según los umbrales especificados:
              • "Muy Fácil" si media > 80.
              • "Adecuada" si media está entre 50 y 80.
              • "Difícil" si media < 50.
  
  
  4. **HistogramaDificultad.jsx**:
      • Gráfico mediante el componente Chart de PrimeReact en modo barra (bar).
      • Eje X (Deciles): diez intervalos normalizados: '0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90' y '91-100'.
      • Eje Y: número absoluto de discentes en cada rango con escala de enteros (stepSize: 1).
      • Escala Cromática Centralizada: cada barra recibe el color oficial correspondiente a su decil invocando getColorNota(notaRef).hex.
      • Leyenda cromática explicativa al pie con los umbrales oficiales del centro educativo.
  5. **GraficoDonutNiveles.jsx**:
      • Gráfico circular/donut (Chart type="doughnut" de PrimeReact) posicionado junto al histograma en diseño a dos columnas.
      • Agrupa las calificaciones según los cinco tramos oficiales (Suspenso, Suficiente, Bien, Notable, Sobresaliente) aplicando los colores oficiales de getColorNota.
      • Leyenda inferior interactiva y tooltip con conteo absoluto y porcentaje exacto.
  6. **index.js**:
      • Barril de exportación para centralizar las importaciones en la página orquestadora.
  
  ──────
  ### 3. Página Orquestadora (InformeDificultad.jsx)
  
  • Actúa como contenedor orquestador siguiendo el patrón Contenedor-Presentacional.
  • Reutiliza los componentes comunes de :
      • HeaderPagina.jsx para el título institucional.
      • EstadoVacio.jsx para guiar la interacción (selección de clase, selección de actividad, estados sin entregas).    
      • CargadorSeccion.jsx para feedback visual durante la carga.
  • Conecta los hooks useAniosAcademicos, useClases y useInformeDificultad.
  ──────
  ### 4. Menú y Enrutamiento
  
  1. **menuConfiguracion.js**:
      • Se ha agregado la opción Análisis dificultad dentro del submenú ELEMENTOS_INFORMES apuntando a
      /informes/dificultad.
  2. **App.jsx**:
      • Se ha registrado la ruta /informes/dificultad asociada a InformeDificultad.
      • Se han configurado los alias de conveniencia /analisis-dificultad e /informe-dificultad.
  

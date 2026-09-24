Se ha implementado el Centro de Ayuda y Guía de Onboarding conforme a las especificaciones del Caso de Uso 31 y las    
  directrices globales de CONVENCIONES.md.
  ──────
  ### 1. Resumen de Cambios y Arquitectura
  
  1. Separación de Responsabilidades y Componentización Estricta:
      • La vista principal actúa exclusivamente como orquestadora (AyudaPagina.jsx), delegando la lógica de filtrado y   
      estado en un Custom Hook especializado (useAyuda.js).
      • La interfaz se ha dividido en subcomponentes modulares de menos de 150 líneas ubicados en .
      • Se han reutilizado los componentes base obligatorios de  (HeaderPagina y EstadoVacio) sin modificarlos.          
  2. Carga Estática y Eficiente:
      • Siguiendo el caso de uso, no se ejecutan peticiones de red a Supabase para esta vista, garantizando una carga    
      instantánea y nulo consumo de ancho de banda.
  3. Pestaña 1: "Guía de Inicio (Paso a Paso)" con PrimeReact Timeline:
      • Implementa el "Camino Feliz" secuencial con los 7 pasos exactos:
          • Paso 1: Crear la Clase (ligada a un módulo, ciclo y curso escolar).
          • Paso 2: Crear el Calendario Escolar (días lectivos, festivos y vacaciones).
          • Paso 3: Asignar los pesos de los Resultados de Aprendizaje (RA y CE al 100%).
          • Paso 4: Definir el Horario del grupo y del docente (cuadrícula semanal y sesiones).
          • Paso 5: Diseñar las Unidades de Trabajo (UT y cobertura de RAs).
          • Paso 6: Crear la temporización con el Asistente de Temporización (orden y fechas previstas).
          • Paso 7: Matricular Discentes (registro de NIA y vinculación con la clase).
      • Cada paso incluye descripción, checklist de tareas, tablas de BD implicadas, consejo didáctico y botón de        
      navegación directa al módulo correspondiente.
  4. Pestaña 2: "Manual de Módulos Complejos" con PrimeReact Accordion:
      • Implementa paneles desplegables independientes (multiple) para los conceptos técnicos de la aplicación:          
          • ¿Cómo calcula el sistema la nota final de un alumno? (modelo en cascada, evaluación continua vs final y      
          escala de colores 0-100).
          • ¿Cómo exportar a ITACA correctamente? (delimitador ;, validación de NIA y conversión de notas a escala 1-10).
          • ¿Cómo exportar calificaciones a Aules (Moodle)? (delimitador , y correo institucional).
          • ¿Cómo funciona el Asistente de Temporización de Unidades? (RowReorder nativo, fechas previstas vs reales).   
          • Configuración y validación de Pesos Curriculares (RA y CE al 100%).
          • Prácticas maestras frente a Versiones anuales.
          • Copias de Seguridad, Clonado de Cursos e Importación de datos.
          • Visor del Discente y Enlaces Mágicos.
  
  5. Navegación e Integración:
      • Se ha añadido la entrada Ayuda en NAV_ITEMS (/ayuda), visible en el menú lateral de escritorio y móvil.          
      • Se ha conectado la ruta /ayuda en App.jsx:201.
  
  ──────
  ### 2. Archivos Creados y Modificados
  
  • datosAyuda.js: Estructura de datos estática para los 7 pasos del Onboarding y los temas del manual con sus categorías.
  • useAyuda.js: Custom Hook con filtrado en tiempo real por texto y categoría, así como sincronización de pestaña con la
  URL (?seccion=manual).
  • BuscadorAyuda.jsx: Componente con campo de búsqueda interactivo y selector de categorías mediante chips.             
  • TarjetaPasoGuia.jsx: Tarjeta presentacional para cada paso del Timeline con tareas clave, consejos, tablas de BD y   
  botón de acceso directo.
  • GuiaInicioPasoAPaso.jsx: Componente que monta el Timeline de PrimeReact con marcadores circulares numerados.         
  • PanelManualItem.jsx: Formateador del contenido técnico de cada panel (pasos, tablas comparativas y escalas de nota). 
  • ManualModulosComplejos.jsx: Componente presentacional con el Accordion desplegable múltiple.
  • index.js: Exportación barril centralizada.
  • AyudaPagina.jsx: Página orquestadora con HeaderPagina y TabView.
  • AyudaPagina.jsx: Re-export canónico para resolución directa de rutas.
  • menuConfiguracion.js: Inclusión de la entrada Ayuda en el menú principal de navegación.
  • App.jsx: Asignación de la ruta protegida /ayuda al componente AyudaPagina.

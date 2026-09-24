  Se ha implementado el Caso de uso 16: Configuración de Pesos Curriculares (RA y CE) respetando las reglas de           
  CONVENCIONES.md, el esquema de base de datos de ESQUEMA.sql y el patrón Contenedor-Presentacional.
  ──────
  ### 1. Creación del Custom Hook usePesosCurriculares.js
  
  Se ha creado el hook en usePesosCurriculares.js para aislar la lógica de negocio y las peticiones a Supabase mediante  
  useDatos:
  
  • Cruce Jerárquico de Datos: Consulta los RA del módulo y sus CE correspondientes, cruzándolos con las tablas de       
  relación ra_curso y ce_curso para el id_curso activo. Si aún no tienen ponderación asignada, se inicializan con 0.     
  • Estructuración para TreeTable: Modela los datos en formato compatible con el TreeTable de PrimeReact (key, data,     
  children).
  • Interactividad en Tiempo Real: Las funciones actualizarPesoRA y actualizarPesoCE recalculan al instante el acumulado 
  global de los RA y el balance local de los CE en cada RA padre.
  • Automatismo Equitativo: Implementa distribuirPesosEquitativamente (reparto matemático exacto del 100% entre RA y     
  entre los CE de cada RA sin decimales) y distribuirPesosCEEquitativamente (para un RA individual).
  • Persistencia Transaccional (Upsert): La función guardarPesos inserta nuevas filas o actualiza los registros          
  existentes en ra_curso y ce_curso, permitiendo guardar estados incompletos o borradores intermedios.
  ──────
  ### 2. Componentización de la Interfaz en src/components/pesos/
  
  Siguiendo la regla de no crear componentes monolíticos, se ha dividido la vista en subcomponentes modulares:           
  
  1. FiltrosPesos.jsx:
      • Utiliza el componente común SelectorClase.jsx para seleccionar el binomio Curso + Módulo.
      • Integra botones para Reparto Equitativo, Restablecer cambios y el componente común BotonAccion.jsx para Guardar  
      Ponderación.
  2. ResumenPonderacion.jsx:
      • Renderiza tarjetas KPI con la suma global de RA, cantidad de RA con balance correcto al 100%, total de CE y      
      estado general.
      • Muestra una barra ProgressBar con color dinámico (verde si es 100%, rojo si supera 100%, naranja si es menor a   
      100%) y mensajes explicativos.
  3. TablaArbolPesos.jsx:
      • Implementa TreeTable de PrimeReact con botones para Expandir Todo y Colapsar Todo.
      • Nodos Padre (RA): Muestran el código y nombre del RA (con tooltip ante desbordamiento), su InputNumber editable y
      una etiqueta Tag verde/roja con la suma de sus CE hijos, más un botón de reparto equitativo local.
      • Nodos Hijo (CE): Muestran el enunciado del criterio, su InputNumber editable respecto al RA padre y el cálculo   
      reactivo de su impacto porcentual en el módulo.
      • Pie de Tabla: Muestra el totalizador global con indicador verde/rojo.
      • Utiliza EstadoVacio.jsx cuando no hay datos curriculares.
  4. index.js:
      • Archivo barril para exportar limpiamente los subcomponentes.
  
  ──────
  ### 3. Página Orquestadora PesosRAPagina.jsx
  
  Actúa como contenedor único conectando los hooks y coordinando el flujo:
  
  • Obtiene los cursos y módulos mediante useCursos y useModulos, consolidando la lista de clases disponibles a través de
  imparte y Evaluaciones.
  • Conecta con usePesosCurriculares para suministrar el estado a los subcomponentes.
  • Utiliza HeaderPagina.jsx, CargadorSeccion.jsx y useGlobalToast para feedback visual de guardado exitoso o borrador. 
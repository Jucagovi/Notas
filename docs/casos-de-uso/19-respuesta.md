Se ha implementado el espacio para estimar y realizar el seguimiento de la Temporización de las Unidades de Trabajo de un módulo
  conforme al caso de uso 19, el esquema de la base de datos en ESQUEMA.sql y las reglas de diseño y arquitectura en
  CONVENCIONES.md.
  ──────
  ### 1. Custom Hook de Datos: useTemporizacion.js

  • **Aislamiento con useDatos**: consume el hook genérico para consultar y mutar las tablas Temporizacion y Unidades_Trabajo sin
  invocar Supabase directamente desde los componentes.
  • Sincronización automática de UTs: al seleccionar un curso y un módulo, si existen unidades curriculares que aún no cuentan con
  registro en Temporizacion, se inicializan en la base de datos con su número de orden por defecto y estado 'Pendiente'.
  • Reordenación por arrastre (RowReorder): recalcula el campo orden secuencialmente (1, 2, 3...) y persiste las posiciones
  modificadas en Supabase.
  • Manejo estricto de errores: devuelve objetos estructurados ({ error: string, status: 400 }) en caso de fallo para permitir la
  emisión de avisos precisos a través del sistema global de notificaciones.
  ──────
  ### 2. Estructura de Subcomponentes en src/components/temporizacion/

  Siguiendo el principio de responsabilidad única (SRP) y manteniendo los componentes por debajo de 150-200 líneas de código:

  1. **FiltrosTemporizacion.jsx**:
      • Reutiliza los selectores oficiales SelectorCurso y SelectorModulo sin alterarlos.
      • Proporciona botones para refrescar la consulta y para restablecer el orden curricular original.
  2. **ResumenTemporizacion.jsx**:
      • Muestra tarjetas KPI con el total de UTs, las pendientes, las que están en curso y las completadas.
      • Integra una barra de progreso porcentual (ProgressBar) sobre la ejecución del currículo.
  3. **CeldaFechaTemporizacion.jsx**:
      • Control Calendar de PrimeReact para la edición en celda con formato español dd/mm/yy y semana iniciada en lunes
      (firstDayOfWeek={1}).
      • Maneja el aislamiento de eventos de ratón para no interferir con el arrastre de filas.
  4. **TablaTemporizacion.jsx**:
      • DataTable configurado con reorderableRows y la columna asidero <Column rowReorder /> para la modificación visual del orden.
      • Edición en línea de las cuatro fechas clave (fecha_ini_prevista, fecha_fin_prevista, fecha_ini_real, fecha_fin_real).
      • Selector Dropdown en línea para alternar el estado ('Pendiente', 'En Curso', 'Completada') sin usar etiquetas Tag internas,
      cumpliendo las convenciones.
      • Textos en una sola línea con truncado automático y Tooltip emergente al pasar el ratón.
      • Paginador superior configurable en 5, 10, 15, 20 y 25 filas.
  5. **DialogoTemporizacion.jsx**:
      • Diálogo modal de edición detallada para modificar el nombre alternativo anual, fechas previstas y reales, estado y
      observaciones.
      • Valida la coherencia cronológica (fecha de inicio menor o igual a fecha de fin).
      • Incorpora BotonAccion para guardar y cancelar.
  6. **GestorTemporizacion.jsx**:
      • Componente visual orquestador principal que une el resumen, la tabla y el diálogo modal.
      • Disponible y exportado como GestorTemporizacion cumpliendo la especificación del caso de uso.
  7. **index.js**:
      • Barril de exportación limpia de todos los subcomponentes.

  ──────
  ### 3. Página Orquestadora: TemporizacionPagina.jsx

  • Coordina el estado de curso y módulo, la integración con useGlobalToast y la confirmación modal previa al restablecimiento de
  orden.
  • Emplea HeaderPagina y EstadoVacio para los estados sin selección o sin unidades.
  • Se añade alias en TemporizacionPagina.jsx para garantizar la compatibilidad con todas las rutas y accesos de navegación.
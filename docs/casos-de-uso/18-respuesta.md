  Se ha implementado el Caso de Uso 18: Gestor de Unidades de Trabajo y Asignación de Actividades,
  respetando las reglas de CONVENCIONES.md, el esquema de ESQUEMA.sql y el principio estricto de
  componentización.
  ──────
  ### 1. Resumen de los Cambios Realizados

  1. Custom Hook Orquestador:
      • useGestorCurriculo.js: Consume useDatos.js para gestionar de forma unificada el CRUD de
      Unidades_Trabajo y las actualizaciones del campo id_ut en la tabla Versiones. Evita el Hook
      Hell y agrupa reactivamente las actividades asignadas a cada UT y las actividades huérfanas
      (id_ut === null).
  2. Componentes Especializados por Funcionalidad (src/components/unidades/):
      • FiltrosCurriculo.jsx: Barra superior de control que integra SelectorCurso.jsx,
      SelectorModulo.jsx, BotonAccion.jsx, selector de vista (Drag & Drop vs. Tabla) e indicadores
      de conteo.
      • TarjetaActividad.jsx: Elemento interactivo arrastrable ([data-swapy-item]) con asa de
      arrastre ([data-swapy-handle]), etiquetas de versión, información truncada con tooltip y
      acciones rápidas de asignación y desvinculación.
      • TarjetaUnidadTrabajo.jsx: Tarjeta contenedora de una UT con su cabecera, lista de
      actividades asignadas en ranuras Swapy y zona receptora (Drop Zone) para soltar actividades.
      • ZonaCurricularUTs.jsx: Cuadrícula responsiva de tarjetas de UTs con soporte de
      EstadoVacio.jsx cuando no hay registros creados.
      • PanelActividadesHuerfanas.jsx: Panel lateral interactivo con buscador en tiempo real, zona
      para desvincular actividades soltándolas y lista de prácticas pendientes de asignación.
      • DialogoUnidadTrabajo.jsx: Diálogo modal (Dialog) de PrimeReact para dar de alta y editar
      Unidades de Trabajo con validación de campos requeridos y número correlativo automático.
      • TablaUnidadesTrabajo.jsx: Vista técnica tabular implementada sobre TablaBase.jsx con
      paginación en la parte superior (5, 10, 15, 20, 25 elementos), textos en una sola línea y
      tooltips.
      • unidades.css: Hoja de estilos con las transiciones y reglas visuales para las zonas Swapy,
      tarjetas y zonas de soltado.
  3. Componente Principal Gestor:
      • GestorCurriculo.jsx: Orquesta la instancia de swapy (createSwapy), detecta en onSwapEnd el
      movimiento de actividades entre ranuras actualizando la base de datos a través del hook, y
      canaliza los avisos de confirmación de borrado mediante ModalConfirmacion.jsx.
  4. Página Contenedora:
      • UnidadesPagina.jsx: Sigue el patrón Contenedor-Presentacional. Incorpora HeaderPagina.jsx,
      gestiona la selección inicial de curso y módulo, y conecta las notificaciones globales
      mediante useGlobalToast.js.

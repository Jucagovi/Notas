import React, { useState } from 'react';
import ResumenTemporizacion from './ResumenTemporizacion.jsx';
import TablaTemporizacion from './TablaTemporizacion.jsx';
import DiagramaGanttTemporizacion from './DiagramaGanttTemporizacion.jsx';
import SeccionCalendarioTemporizacion from './SeccionCalendarioTemporizacion.jsx';
import DialogoTemporizacion from './DialogoTemporizacion.jsx';
import DialogoObservaciones from './DialogoObservaciones.jsx';

/**
 * GestorTemporizacion - Componente visual orquestador de la temporización de la clase.
 *
 * Responsabilidad Única: Coordinar la vista de métricas resumen, la tabla interactiva de
 * planificación, el diagrama de Gantt del curso escolar, el calendario interactivo de 12 meses
 * y los diálogos modales de edición exhaustiva y observaciones.
 *
 * @param {Object} props
 * @param {Array<Object>} props.temporizaciones - Lista ordenada de unidades temporizadas.
 * @param {Object} props.estadisticas - Métricas sobre el estado y avance de las unidades.
 * @param {Array<Object>} [props.diasClase=[]] - Lista cronológica de días lectivos escolares.
 * @param {Set} [props.conjuntoNoLectivos=new Set()] - Conjunto de fechas festivas o no lectivas.
 * @param {Date|null} [props.fechaInicioPeriodo] - Fecha de inicio del curso escolar.
 * @param {Date|null} [props.fechaFinPeriodo] - Fecha de fin del curso escolar.
 * @param {number} [props.anioInicio=2026] - Año académico inicial.
 * @param {boolean} [props.cargando=false] - Indicador de consulta de datos en progreso.
 * @param {boolean} [props.guardando=false] - Indicador de persistencia o reordenación en curso.
 * @param {Function} props.onReordenar - Callback para reordenar la secuencia de unidades.
 * @param {Function} props.onActualizarCampo - Callback para actualizar un campo específico en línea.
 * @param {Function} props.onActualizarTemporizacion - Callback para actualizar todos los campos de una unidad.
 * @param {Function} props.onGuardarFechas - Callback para aplicar y guardar cambios de fechas desde el calendario.
 */
export const GestorTemporizacion = ({
  temporizaciones = [],
  estadisticas = {},
  diasClase = [],
  conjuntoNoLectivos = new Set(),
  fechaInicioPeriodo = null,
  fechaFinPeriodo = null,
  anioInicio = 2026,
  cargando = false,
  guardando = false,
  onReordenar,
  onActualizarCampo,
  onActualizarTemporizacion,
  onGuardarFechas,
  onCambioEnVivo
}) => {
  // Estado local para el control del diálogo modal de edición exhaustiva.
  const [dialogoVisible, setDialogoVisible] = useState(false);
  const [temporizacionEdicion, setTemporizacionEdicion] = useState(null);

  // Estado local para el control del diálogo modal de observaciones.
  const [dialogoObservacionesVisible, setDialogoObservacionesVisible] = useState(false);
  const [temporizacionObservaciones, setTemporizacionObservaciones] = useState(null);

  // Apertura del modal de edición cargando los datos de la unidad seleccionada.
  const manejarAbrirEdicion = (temp) => {
    setTemporizacionEdicion(temp);
    setDialogoVisible(true);
  };

  // Cierre del diálogo modal de edición.
  const manejarCerrarEdicion = () => {
    setDialogoVisible(false);
    setTemporizacionEdicion(null);
  };

  // Apertura del modal de observaciones de la unidad.
  const manejarAbrirObservaciones = (temp) => {
    setTemporizacionObservaciones(temp);
    setDialogoObservacionesVisible(true);
  };

  // Cierre del diálogo modal de observaciones.
  const manejarCerrarObservaciones = () => {
    setDialogoObservacionesVisible(false);
    setTemporizacionObservaciones(null);
  };

  // Manejador del guardado de los datos modificados desde el diálogo modal de edición.
  const manejarGuardarEdicion = async (idTemporizacion, valores) => {
    const respuesta = await onActualizarTemporizacion(idTemporizacion, valores);
    if (!respuesta?.error) {
      manejarCerrarEdicion();
    }
  };

  // Manejador del guardado de observaciones.
  const manejarGuardarObservaciones = async (idTemporizacion, textoObservaciones) => {
    const respuesta = await onActualizarCampo(idTemporizacion, 'observaciones', textoObservaciones);
    if (!respuesta?.error) {
      manejarCerrarObservaciones();
    }
  };

  return (
    <div className="flex flex-column w-full gap-3">
      {/* 1. Resumen de seguimiento de la temporización */}
      <ResumenTemporizacion estadisticas={estadisticas} />

      {/* 2. Calendario escolar con la temporización actual (sin fechas marcadas si no existe temporización) */}
      <SeccionCalendarioTemporizacion
        temporizaciones={temporizaciones}
        diasClase={diasClase}
        conjuntoNoLectivos={conjuntoNoLectivos}
        anioInicio={anioInicio}
        guardando={guardando}
        onGuardarFechas={onGuardarFechas}
        onCambioEnVivo={onCambioEnVivo}
      />

      {/* 3. Diagrama de Gantt con la temporización del curso escolar dibujando las unidades */}
      <DiagramaGanttTemporizacion
        temporizaciones={temporizaciones}
        fechaInicioPeriodo={fechaInicioPeriodo}
        fechaFinPeriodo={fechaFinPeriodo}
        anioInicio={anioInicio}
      />

      {/* 4. Listado de UT con las fechas de planificación (sólo fechas previstas) */}
      <TablaTemporizacion
        temporizaciones={temporizaciones}
        cargando={cargando}
        guardando={guardando}
        onReordenar={onReordenar}
        onActualizarCampo={onActualizarCampo}
        onEditar={manejarAbrirEdicion}
        onAbrirObservaciones={manejarAbrirObservaciones}
      />

      {/* 5. Diálogo modal para la edición completa de la unidad */}
      <DialogoTemporizacion
        visible={dialogoVisible}
        temporizacion={temporizacionEdicion}
        guardando={guardando}
        onGuardar={manejarGuardarEdicion}
        onOcultar={manejarCerrarEdicion}
      />

      {/* 6. Diálogo modal para visualización y edición rápida de observaciones */}
      <DialogoObservaciones
        visible={dialogoObservacionesVisible}
        temporizacion={temporizacionObservaciones}
        guardando={guardando}
        onGuardar={manejarGuardarObservaciones}
        onOcultar={manejarCerrarObservaciones}
      />
    </div>
  );
};

export default GestorTemporizacion;

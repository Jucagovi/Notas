import React, { useState } from 'react';
import ResumenTemporizacion from './ResumenTemporizacion.jsx';
import TablaTemporizacion from './TablaTemporizacion.jsx';
import DialogoTemporizacion from './DialogoTemporizacion.jsx';

/**
 * GestorTemporizacion - Componente visual orquestador de la temporización de un módulo.
 *
 * Responsabilidad Única: Coordinar la vista de métricas resumen, la tabla interactiva de
 * planificación con reordenación nativa y el diálogo modal de edición exhaustiva de unidades.
 *
 * @param {Object} props
 * @param {Array<Object>} props.temporizaciones - Lista ordenada de unidades temporizadas.
 * @param {Object} props.estadisticas - Métricas sobre el estado y avance de las unidades.
 * @param {boolean} [props.cargando=false] - Indicador de consulta de datos en progreso.
 * @param {boolean} [props.guardando=false] - Indicador de persistencia o reordenación en curso.
 * @param {Function} props.onReordenar - Callback para reordenar la secuencia de unidades.
 * @param {Function} props.onActualizarCampo - Callback para actualizar un campo específico en línea.
 * @param {Function} props.onActualizarTemporizacion - Callback para actualizar todos los campos de una unidad.
 */
export const GestorTemporizacion = ({
  temporizaciones = [],
  estadisticas = {},
  cargando = false,
  guardando = false,
  onReordenar,
  onActualizarCampo,
  onActualizarTemporizacion
}) => {
  // Estado local para el control del diálogo modal de edición.
  const [dialogoVisible, setDialogoVisible] = useState(false);
  const [temporizacionEdicion, setTemporizacionEdicion] = useState(null);

  // Apertura del modal cargando los datos de la unidad seleccionada.
  const manejarAbrirEdicion = (temp) => {
    setTemporizacionEdicion(temp);
    setDialogoVisible(true);
  };

  // Cierre del diálogo modal de edición.
  const manejarCerrarEdicion = () => {
    setDialogoVisible(false);
    setTemporizacionEdicion(null);
  };

  // Manejador del guardado de los datos modificados desde el diálogo modal.
  const manejarGuardarEdicion = async (idTemporizacion, valores) => {
    const respuesta = await onActualizarTemporizacion(idTemporizacion, valores);
    if (!respuesta?.error) {
      manejarCerrarEdicion();
    }
  };

  return (
    <div className="flex flex-column w-full gap-2">
      {/* 1. Panel de indicadores y progreso temporal */}
      <ResumenTemporizacion estadisticas={estadisticas} />

      {/* 2. Tabla principal con arrastre nativo RowReorder y controles en línea */}
      <TablaTemporizacion
        temporizaciones={temporizaciones}
        cargando={cargando}
        guardando={guardando}
        onReordenar={onReordenar}
        onActualizarCampo={onActualizarCampo}
        onEditar={manejarAbrirEdicion}
      />

      {/* 3. Diálogo modal para la edición completa de la unidad */}
      <DialogoTemporizacion
        visible={dialogoVisible}
        temporizacion={temporizacionEdicion}
        guardando={guardando}
        onGuardar={manejarGuardarEdicion}
        onOcultar={manejarCerrarEdicion}
      />
    </div>
  );
};

export default GestorTemporizacion;

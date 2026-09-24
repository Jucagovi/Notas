import React from 'react';
import EstadoVacio from '../common/EstadoVacio.jsx';
import CargadorSeccion from '../common/CargadorSeccion.jsx';
import TarjetaUnidadTrabajo from './TarjetaUnidadTrabajo.jsx';

/**
 * ZonaCurricularUTs - Componente presentacional contenedor para la cuadrícula de Unidades de Trabajo.
 *
 * Responsabilidad Única: Renderizar el conjunto de tarjetas curriculares o el estado vacío correspondiente
 * si el módulo aún no tiene unidades didácticas dadas de alta.
 *
 * @param {Object} props
 * @param {Array<Object>} props.unidades - Lista de unidades de trabajo con sus versiones asignadas.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {Function} props.onNuevaUT - Callback para crear la primera o una nueva unidad didáctica.
 * @param {Function} props.onEditarUT - Callback para editar una unidad didáctica.
 * @param {Function} props.onEliminarUT - Callback para eliminar una unidad didáctica.
 * @param {Function} props.onDesvincularActividad - Callback para desvincular una actividad.
 * @param {Function} props.onAsignarUT - Callback para asignar una actividad a una unidad de trabajo.
 */
const ZonaCurricularUTs = ({
  unidades = [],
  cargando = false,
  onNuevaUT,
  onEditarUT,
  onEliminarUT,
  onDesvincularActividad,
  onAsignarUT
}) => {
  if (cargando && unidades.length === 0) {
    return <CargadorSeccion texto="Cargando unidades didácticas..." />;
  }

  if (unidades.length === 0) {
    return (
      <EstadoVacio
        mensaje="No hay Unidades de Trabajo definidas"
        descripcion="Define las unidades didácticas del módulo para estructurar el currículo y organizar las prácticas y actividades evaluables."
        icono="pi pi-folder-open"
        botonLabel="Crear Primera Unidad"
        botonIcono="pi pi-plus"
        onAccion={onNuevaUT}
        className="w-full my-0"
      />
    );
  }

  return (
    <div className="zona-curricular-grid">
      {unidades.map((ut) => (
        <TarjetaUnidadTrabajo
          key={ut.id_ut}
          unidad={ut}
          unidadesDisponibles={unidades}
          onEditar={onEditarUT}
          onEliminar={onEliminarUT}
          onDesvincularActividad={onDesvincularActividad}
          onAsignarUT={onAsignarUT}
        />
      ))}
    </div>
  );
};

export default ZonaCurricularUTs;

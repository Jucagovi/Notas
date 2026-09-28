import React from 'react';
import { DataView } from 'primereact/dataview';
import TarjetaModuloAgenda from './TarjetaModuloAgenda.jsx';
import EstadoVacio from '../../common/EstadoVacio.jsx';

/**
 * ListaAgendaSemanal - Componente presentacional basado en DataView de PrimeReact.
 *
 * Responsabilidad Única: Renderizar el listado agrupado por módulos de las unidades
 * de trabajo mediante DataView, o presentar un estado vacío estandarizado cuando no constan
 * unidades planificadas en el intervalo seleccionado.
 *
 * @param {Object} props
 * @param {Array<Object>} props.modulosConAgenda - Colección de módulos con sus unidades de la semana.
 * @param {Function} props.onModuloClick - Manejador de selección de un módulo para su navegación.
 * @param {Function} [props.onIrTemporizacion] - Manejador para acceder a la gestión de temporización.
 */
const ListaAgendaSemanal = ({
  modulosConAgenda = [],
  onModuloClick,
  onIrTemporizacion
}) => {
  // En ausencia de módulos con unidades en la semana, se recurre al componente común EstadoVacio.
  if (!modulosConAgenda || modulosConAgenda.length === 0) {
    return (
      <EstadoVacio
        mensaje="Sin unidades programadas esta semana"
        descripcion="No constan Unidades de Trabajo con fechas previstas o reales en el intervalo semanal seleccionado para este curso."
        icono="pi pi-calendar-times"
        botonLabel={onIrTemporizacion ? "Planificar Temporización" : undefined}
        botonIcono="pi pi-calendar"
        onAccion={onIrTemporizacion}
        className="my-1 p-4 surface-ground border-round"
      />
    );
  }

  // Plantilla para cada elemento de la colección en el componente DataView.
  const plantillaElemento = (modulo) => {
    return (
      <div className="col-12 p-0 mb-1" key={modulo.id_modulo}>
        <TarjetaModuloAgenda modulo={modulo} onClick={onModuloClick} />
      </div>
    );
  };

  return (
    <div className="overflow-y-auto pr-1" style={{ maxHeight: '380px' }}>
      <DataView
        value={modulosConAgenda}
        itemTemplate={plantillaElemento}
        className="w-full"
      />
    </div>
  );
};

export default ListaAgendaSemanal;

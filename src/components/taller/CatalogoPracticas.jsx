import React from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import TablaBase from '../common/TablaBase.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';
import './taller.css';

/**
 * CatalogoPracticas - Componente maestro de la columna izquierda del Taller de Prácticas.
 *
 * Responsabilidad Única: Listar en formato tabular las prácticas del catálogo, gestionar la
 * selección de la práctica activa y proporcionar accesos directos para nueva práctica, edición y borrado.
 *
 * @param {Object} props
 * @param {Array<Object>} props.practicas - Listado de prácticas a mostrar.
 * @param {Object|null} props.practicaSeleccionada - Práctica actualmente seleccionada en el estado.
 * @param {Function} props.onSeleccionarPractica - Callback al hacer clic en una fila del catálogo.
 * @param {Function} props.onNuevaPractica - Callback para abrir el diálogo de nueva práctica.
 * @param {Function} props.onEditarPractica - Callback para abrir el diálogo de edición de práctica.
 * @param {Function} props.onEliminarPractica - Callback para solicitar la eliminación de una práctica.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga de la tabla.
 */
export const CatalogoPracticas = ({
  practicas = [],
  practicaSeleccionada = null,
  onSeleccionarPractica,
  onNuevaPractica,
  onEditarPractica,
  onEliminarPractica,
  cargando = false
}) => {
  // Plantilla para la columna de nombre con texto truncado en una línea y tooltip explicativo.
  const plantillaNombre = (fila) => {
    const textoTooltip = fila.descripcion
      ? `${fila.nombre} — ${fila.descripcion}`
      : fila.nombre;

    return (
      <div className="flex align-items-center gap-2 overflow-hidden">
        <span
          className="celda-texto-truncado font-medium text-900"
          data-pr-tooltip={textoTooltip}
        >
          {fila.nombre}
        </span>
      </div>
    );
  };

  // Configuración de iconos representativos para cada tipo de práctica (sin usar Tag)
  const ICONOS_TIPO = {
    Individual: { icono: 'pi pi-user', color: 'text-blue-600', etiqueta: 'Individual' },
    Grupal: { icono: 'pi pi-users', color: 'text-teal-600', etiqueta: 'Grupal' },
    Examen: { icono: 'pi pi-file-edit', color: 'text-orange-600', etiqueta: 'Examen' },
    Proyecto: { icono: 'pi pi-briefcase', color: 'text-purple-600', etiqueta: 'Proyecto' }
  };

  // Plantilla para la columna de modalidad de práctica: solo icono con tooltip al pasar el ratón encima.
  const plantillaTipo = (fila) => {
    const tipo = fila.id_tipopractica || 'Individual';
    const conf = ICONOS_TIPO[tipo] || { icono: 'pi pi-file', color: 'text-500', etiqueta: tipo };

    return (
      <div className="flex align-items-center justify-content-center">
        <i
          className={`${conf.icono} ${conf.color} text-lg cursor-pointer`}
          data-pr-tooltip={conf.etiqueta}
          aria-label={conf.etiqueta}
        />
      </div>
    );
  };

  // Plantilla para la columna de acciones rápidas sobre la práctica maestra.
  const plantillaAcciones = (fila) => {
    return (
      <div
        className="flex align-items-center justify-content-end gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="secondary"
          size="small"
          tooltip="Editar práctica"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onEditarPractica(fila)}
          aria-label="Editar práctica"
        />
        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          size="small"
          tooltip="Eliminar práctica"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onEliminarPractica(fila)}
          aria-label="Eliminar práctica"
        />
      </div>
    );
  };

  // Función para asignar estilos condicionales a la fila activa en la tabla.
  const claseFila = (fila) => {
    if (practicaSeleccionada && practicaSeleccionada.id_practica === fila.id_practica) {
      return 'fila-practica-activa cursor-pointer';
    }
    return 'cursor-pointer';
  };

  return (
    <div className="tarjeta-taller">
      {/* Tooltip unificado para los elementos del catálogo con atributo data-pr-tooltip */}
      <Tooltip target="[data-pr-tooltip]" position="top" />

      {/* Cabecera del catálogo con título y botón de acción */}
      <div className="tarjeta-taller-cabecera">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-folder-open text-primary text-xl" />
          <h2 className="text-lg font-bold text-900 m-0">Catálogo de Prácticas</h2>
        </div>
        <Button
          label="Nueva Práctica"
          icon="pi pi-plus"
          size="small"
          onClick={onNuevaPractica}
          className="p-button-primary"
        />
      </div>

      {/* Contenido con la tabla o estado vacío */}
      <div className="tarjeta-taller-cuerpo">
        {practicas.length === 0 && !cargando ? (
          <EstadoVacio
            mensaje="No hay prácticas disponibles"
            descripcion="Crea tu primera práctica en este módulo para comenzar a generar versiones y enunciados."
            icono="pi pi-file-edit"
            botonLabel="Nueva Práctica"
            onAccion={onNuevaPractica}
          />
        ) : (
          <TablaBase
            data={practicas}
            loading={cargando}
            selectionMode="single"
            selection={practicaSeleccionada}
            onSelectionChange={(e) => onSeleccionarPractica(e.value)}
            rowClassName={claseFila}
            dataKey="id_practica"
            paginator
            paginatorPosition="top"
            rows={5}
            rowsPerPageOptions={[5, 10, 15, 20, 25]}
            emptyMessage="No se han encontrado prácticas coincidentes"
            responsiveLayout="scroll"
          >
            <Column
              field="nombre"
              header="Nombre de la Práctica"
              body={plantillaNombre}
              sortable
              style={{ width: '65%' }}
            />
            <Column
              field="id_tipopractica"
              header="Tipo"
              body={plantillaTipo}
              sortable
              headerStyle={{ textAlign: 'center' }}
              style={{ width: '15%', textAlign: 'center' }}
            />
            <Column
              body={plantillaAcciones}
              header="Acciones"
              headerStyle={{ textAlign: 'right' }}
              style={{ width: '20%', textAlign: 'right' }}
            />
          </TablaBase>
        )}
      </div>
    </div>
  );
};

export default CatalogoPracticas;

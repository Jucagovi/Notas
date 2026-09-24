import React from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import TablaBase from '../common/TablaBase.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';
import './taller.css';

/**
 * PanelVersiones - Componente de detalle de la columna derecha del Taller de Prácticas.
 *
 * Responsabilidad Única: Renderizar el panel histórico de versiones de la práctica activa,
 * la botonera de acciones (editar, clonar, exportar a PDF y borrar) y la cabecera dinámica.
 *
 * @param {Object} props
 * @param {Object|null} props.practicaSeleccionada - Práctica activa sobre la que se listan las versiones.
 * @param {Array<Object>} props.versiones - Lista de versiones registradas para la práctica.
 * @param {Function} props.onCrearVersion - Callback para abrir el editor modal de nueva versión.
 * @param {Function} props.onEditarVersion - Callback para abrir el editor modal en modo modificación.
 * @param {Function} props.onClonarVersion - Callback para duplicar la versión seleccionada.
 * @param {Function} props.onExportarPdf - Callback para generar y descargar el documento PDF.
 * @param {Function} props.onEliminarVersion - Callback para solicitar la eliminación de la versión.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga de las versiones.
 * @param {boolean} [props.exportandoPdf=false] - Indicador visual mientras se compila el PDF.
 */
export const PanelVersiones = ({
  practicaSeleccionada = null,
  versiones = [],
  onCrearVersion,
  onEditarVersion,
  onClonarVersion,
  onExportarPdf,
  onEliminarVersion,
  cargando = false,
  exportandoPdf = false
}) => {
  // Si no hay ninguna práctica seleccionada en el catálogo maestro, se muestra un estado instructivo.
  if (!practicaSeleccionada) {
    return (
      <div className="tarjeta-taller">
        <div className="tarjeta-taller-cabecera">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-history text-500 text-xl" />
            <h2 className="text-lg font-bold text-900 m-0">Historial de Versiones</h2>
          </div>
        </div>
        <div className="tarjeta-taller-cuerpo flex align-items-center justify-content-center min-h-20rem">
          <EstadoVacio
            mensaje="Ninguna práctica seleccionada"
            descripcion="Selecciona una práctica del catálogo de la izquierda para consultar sus versiones, editar sus enunciados y exportarlas a PDF."
            icono="pi pi-arrow-left"
          />
        </div>
      </div>
    );
  }

  // Plantilla para la columna de número de versión mostrada como texto plano.
  const plantillaNumero = (fila) => {
    return (
      <span className="font-medium text-900 text-sm">
        {fila.numero || ''}
      </span>
    );
  };

  // Plantilla para la columna de clase académica con texto truncado.
  const plantillaClase = (fila) => {
    const clase = fila.Cursos;
    const textoClase = clase ? `${clase.nombre || ''} (${clase.anyo || ''})` : 'Sin clase';

    return (
      <div className="overflow-hidden">
        <span
          className="celda-texto-truncado text-sm text-800"
          data-pr-tooltip={textoClase}
        >
          {textoClase}
        </span>
      </div>
    );
  };

  // Plantilla para la columna de Unidad de Trabajo vinculada.
  const plantillaUT = (fila) => {
    const ut = fila.Unidades_Trabajo;
    if (!ut) {
      return <span className="text-400 text-xs italic">Sin asignar</span>;
    }

    const textoUT = `UT ${ut.numero}: ${ut.nombre}`;

    return (
      <div className="overflow-hidden">
        <span
          className="celda-texto-truncado text-sm text-800"
          data-pr-tooltip={textoUT}
        >
          {textoUT}
        </span>
      </div>
    );
  };

  // Plantilla para la columna de peso en la evaluación.
  const plantillaPeso = (fila) => {
    const peso = fila.peso_evaluacion !== undefined && fila.peso_evaluacion !== null
      ? `${fila.peso_evaluacion}%`
      : '0%';
    return (
      <span className="text-sm font-medium text-700">
        {peso}
      </span>
    );
  };

  // Plantilla para la columna de acciones (Editar, Clonar, Exportar a PDF y Borrar).
  const plantillaAcciones = (fila) => {
    return (
      <div className="flex align-items-center justify-content-end gap-1">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="secondary"
          size="small"
          tooltip="Editar versión y enunciado"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onEditarVersion(fila)}
          aria-label="Editar versión"
        />
        <Button
          icon="pi pi-copy"
          rounded
          text
          severity="info"
          size="small"
          tooltip="Clonar versión (crea una copia inmediata)"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onClonarVersion(fila)}
          aria-label="Clonar versión"
        />
        <Button
          icon="pi pi-file-pdf"
          rounded
          text
          severity="danger"
          size="small"
          loading={exportandoPdf}
          tooltip="Exportar enunciado a PDF"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onExportarPdf(fila)}
          aria-label="Exportar a PDF"
        />
        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          size="small"
          tooltip="Eliminar versión"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onEliminarVersion(fila)}
          aria-label="Eliminar versión"
        />
      </div>
    );
  };

  return (
    <div className="tarjeta-taller">
      {/* Tooltip unificado para los elementos del panel de versiones con atributo data-pr-tooltip */}
      <Tooltip target="[data-pr-tooltip]" position="top" />

      {/* Cabecera dinámica con el título de la práctica activa y botón de creación */}
      <div className="tarjeta-taller-cabecera">
        <div className="flex flex-column gap-1">
          <div className="flex align-items-center gap-2">
            <span className="text-xs uppercase font-bold text-500 tracking-wider">
              Práctica Activa
            </span>
            <span className="inline-flex align-items-center gap-1 text-xs text-700 font-medium">
              <i
                className={
                  practicaSeleccionada.id_tipopractica === 'Grupal'
                    ? 'pi pi-users text-teal-600'
                    : practicaSeleccionada.id_tipopractica === 'Examen'
                    ? 'pi pi-file-edit text-orange-600'
                    : practicaSeleccionada.id_tipopractica === 'Proyecto'
                    ? 'pi pi-briefcase text-purple-600'
                    : 'pi pi-user text-blue-600'
                }
              />
              <span>{practicaSeleccionada.id_tipopractica || 'Individual'}</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-900 m-0">
            {practicaSeleccionada.nombre}
          </h2>
          {practicaSeleccionada.descripcion && (
            <p className="text-color-secondary text-sm m-0 line-height-2 max-w-30rem">
              {practicaSeleccionada.descripcion}
            </p>
          )}
        </div>

        <Button
          label="Crear Nueva Versión"
          icon="pi pi-plus"
          size="small"
          onClick={onCrearVersion}
          className="p-button-primary"
        />
      </div>

      {/* Contenido con listado de versiones o estado vacío si no tiene */}
      <div className="tarjeta-taller-cuerpo">
        {versiones.length === 0 && !cargando ? (
          <EstadoVacio
            mensaje="Aún no hay versiones para esta práctica"
            descripcion="Crea la primera versión para redactar el enunciado con el editor enriquecido y vincularlo a una clase."
            icono="pi pi-code"
            botonLabel="Crear Nueva Versión"
            onAccion={onCrearVersion}
          />
        ) : (
          <TablaBase
            data={versiones}
            loading={cargando}
            dataKey="id_version"
            paginator
            paginatorPosition="top"
            rows={5}
            rowsPerPageOptions={[5, 10, 15, 20, 25]}
            emptyMessage="No se han registrado versiones para esta práctica"
            responsiveLayout="scroll"
          >
            <Column
              field="numero"
              header="Versión"
              body={plantillaNumero}
              sortable
              style={{ width: '15%' }}
            />
            <Column
              header="Clase"
              body={plantillaClase}
              style={{ width: '25%' }}
            />
            <Column
              header="Unidad de Trabajo"
              body={plantillaUT}
              style={{ width: '25%' }}
            />
            <Column
              field="peso_evaluacion"
              header="Peso"
              body={plantillaPeso}
              sortable
              style={{ width: '12%' }}
            />
            <Column
              body={plantillaAcciones}
              header="Acciones"
              headerStyle={{ textAlign: 'right' }}
              style={{ width: '23%', textAlign: 'right' }}
            />
          </TablaBase>
        )}
      </div>
    </div>
  );
};

export default PanelVersiones;

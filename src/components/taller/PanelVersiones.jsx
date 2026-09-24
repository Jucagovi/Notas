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

  // Plantilla para la columna de número de versión.
  const plantillaNumero = (fila) => {
    return (
      <span className="font-semibold text-900 bg-blue-50 text-blue-700 px-2 py-1 border-round text-xs border-1 border-blue-200 white-space-nowrap">
        {fila.numero || 'v1.0'}
      </span>
    );
  };

  // Plantilla para la columna de curso escolar con texto truncado.
  const plantillaCurso = (fila) => {
    const curso = fila.Cursos;
    const textoCurso = curso ? `${curso.nombre || ''} (${curso.anyo || ''})` : 'Sin curso';
    const tooltipId = `tooltip-curso-${fila.id_version}`;

    return (
      <div className="overflow-hidden">
        <Tooltip target={`.${tooltipId}`} content={textoCurso} position="top" />
        <span className={`celda-texto-truncado text-sm text-800 ${tooltipId}`}>
          {textoCurso}
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
    const tooltipId = `tooltip-ut-${fila.id_version}`;

    return (
      <div className="overflow-hidden">
        <Tooltip target={`.${tooltipId}`} content={textoUT} position="top" />
        <span className={`celda-texto-truncado text-sm text-800 ${tooltipId}`}>
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
      {/* Cabecera dinámica con el título de la práctica activa y botón de creación */}
      <div className="tarjeta-taller-cabecera">
        <div className="flex flex-column gap-1">
          <div className="flex align-items-center gap-2">
            <span className="text-xs uppercase font-bold text-500 tracking-wider">
              Práctica Activa
            </span>
            <span className="badge-tipo-practica badge-tipo-individual text-xs">
              {practicaSeleccionada.id_tipopractica || 'Individual'}
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
            descripcion="Crea la primera versión para redactar el enunciado con el editor enriquecido y vincularlo a un curso académico."
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
              header="Curso Académico"
              body={plantillaCurso}
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

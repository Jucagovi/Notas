import React, { useState } from 'react';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { SelectButton } from 'primereact/selectbutton';
import { Tooltip } from 'primereact/tooltip';
import TablaBase from '../common/TablaBase.jsx';
import { formatearFechaEspanol } from '../../utils/fechas.js';

/**
 * TablaVistaPreviaSeguimiento - Subcomponente presentacional para la vista previa
 * fiel del documento de seguimiento y la tabla detallada de contraste.
 *
 * Responsabilidad Única: Renderizar la ficha visual idéntica a seguimiento.pdf
 * emulando su cuadrícula institucional y proporcionar alternativamente un DataTable
 * de solo lectura con paginación reglamentaria (5, 10, 15, 20, 25 filas en cabecera)
 * y columnas truncadas con tooltip ante desbordamiento.
 *
 * @param {Object} props
 * @param {string} props.profesor - Nombre del profesor titular.
 * @param {string} props.grupo - Denominación del grupo o curso escolar.
 * @param {string} props.asignatura - Denominación de la asignatura o módulo profesional.
 * @param {string} props.evaluacion - Denominación de la evaluación (ej. '1ª EVALUACIÓN').
 * @param {string} props.fechaCorteTexto - Cadena de fecha de corte (ej. 'Hasta 30/09/2025').
 * @param {Array<Object>} props.contenidosProgramados - Lista de Unidades de Trabajo programadas.
 * @param {string} props.contenidosImpartidosTexto - Redacción cualitativa de contenidos impartidos.
 * @param {Array<Object>} props.contenidosImpartidos - Lista de Unidades de Trabajo completadas.
 * @param {string} props.observaciones - Redacción de observaciones e incidencias.
 * @param {boolean} [props.cargando=false] - Indicador visual de carga.
 */
const TablaVistaPreviaSeguimiento = ({
  profesor = '',
  grupo = '',
  anioAcademicoTexto = '2026/2027',
  asignatura = '',
  evaluacion = '1ª EVALUACIÓN',
  fechaCorteTexto = '',
  contenidosProgramados = [],
  contenidosImpartidosTexto = '',
  contenidosImpartidos = [],
  observaciones = '',
  cargando = false
}) => {
  // Modalidad visual: 'documento' (réplica exacta de seguimiento.pdf) o 'tabla' (DataTable).
  const [modoVisualizacion, setModoVisualizacion] = useState('documento');

  const opcionesVista = [
    { label: 'Ficha Oficial (PDF/ODT)', value: 'documento', icon: 'pi pi-file' },
    { label: 'Tabla Detallada (DataTable)', value: 'tabla', icon: 'pi pi-table' }
  ];

  // Plantilla para la columna de Unidad de Trabajo con tooltip en caso de texto largo.
  const plantillaUnidad = (rowData) => {
    const texto = `${rowData.numUT ? `${rowData.numUT}. ` : ''}${rowData.nombreUT || rowData.nombre || 'Unidad'}`;
    const idTooltip = `ut-tooltip-${rowData.id_ut || rowData.orden}`;

    return (
      <div className="flex align-items-center gap-2 overflow-hidden text-overflow-ellipsis white-space-nowrap">
        <span
          id={idTooltip}
          className="font-bold text-900 cursor-pointer overflow-hidden text-overflow-ellipsis white-space-nowrap"
          data-pr-tooltip={texto}
          data-pr-position="top"
        >
          {texto}
        </span>
        <Tooltip target={`#${idTooltip}`} />
      </div>
    );
  };

  // Plantilla para la descripción truncada con tooltip.
  const plantillaDescripcion = (rowData) => {
    const texto = rowData.descripcionUT || rowData.descripcion || 'Sin descripción';
    const idTooltip = `desc-tooltip-${rowData.id_ut || rowData.orden}`;

    return (
      <div className="overflow-hidden text-overflow-ellipsis white-space-nowrap">
        <span
          id={idTooltip}
          className="text-color-secondary cursor-pointer overflow-hidden text-overflow-ellipsis white-space-nowrap block"
          data-pr-tooltip={texto}
          data-pr-position="top"
        >
          {texto}
        </span>
        <Tooltip target={`#${idTooltip}`} />
      </div>
    );
  };

  // Plantilla para la columna de fechas previstas e impartidas.
  const plantillaFechas = (rowData) => {
    const fIni = rowData.fecha_ini_prevista ? formatearFechaEspanol(rowData.fecha_ini_prevista) : '—';
    const fFin = rowData.fecha_fin_prevista ? formatearFechaEspanol(rowData.fecha_fin_prevista) : '—';
    return (
      <span className="text-sm white-space-nowrap">
        {fIni} - {fFin}
      </span>
    );
  };

  // Plantilla para el estado de contraste (Programada vs Impartida).
  const plantillaEstado = (rowData) => {
    const completada = rowData.esCompletada || rowData.estado === 'Completada';
    return (
      <Tag
        value={completada ? 'Impartida' : 'Programada'}
        severity={completada ? 'success' : 'warning'}
        icon={completada ? 'pi pi-check' : 'pi pi-clock'}
      />
    );
  };

  return (
    <div className="surface-card p-3 md:p-4 border-round border-1 surface-border shadow-1 mb-4">
      {/* Barra de alternancia de vista */}
      <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mb-3 pb-2 border-bottom-1 surface-border">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-eye text-primary text-xl" />
          <h3 className="text-base md:text-lg font-bold text-900 m-0">
            Vista Previa de Cumplimiento Curricular
          </h3>
        </div>
        <SelectButton
          value={modoVisualizacion}
          options={opcionesVista}
          onChange={(e) => e.value && setModoVisualizacion(e.value)}
          className="p-buttonset-sm"
          aria-label="Seleccionar modo de visualización"
        />
      </div>

      {modoVisualizacion === 'documento' ? (
        /* ========================================================================= */
        /* MODALIDAD 1: Réplica Fiel del documento original de seguimiento.pdf       */
        /* ========================================================================= */
        <div className="w-full flex justify-content-center p-2 md:p-4 surface-50 border-round">
          <div
            className="w-full bg-white shadow-2 border-round"
            style={{
              maxWidth: '850px',
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              color: '#0f172a',
              border: '1.5px solid #000000'
            }}
          >
            {/* 1. Cabecera con datos del profesor, grupo, módulo y fecha de corte */}
            <div
              className="grid m-0"
              style={{ borderBottom: '1.5px solid #000000' }}
            >
              {/* Celda izquierda: Profesor, Grupo y Asignatura */}
              <div
                className="col-12 sm:col-7 p-3 flex flex-column justify-content-between"
                style={{ borderRight: '1.5px solid #000000' }}
              >
                <div>
                  <div className="font-bold text-sm uppercase">
                    PROFESOR: <span className="font-normal">{profesor || 'Docente titular'}</span>
                  </div>
                  <div className="font-bold text-sm uppercase mt-1">
                    AÑO ACADÉMICO: <span className="font-normal">{anioAcademicoTexto || '2026/2027'}</span>
                  </div>
                  <div className="font-bold text-sm uppercase mt-1">
                    ASIGNATURA:
                  </div>
                  <div className="text-sm mt-1 line-height-2">
                    {asignatura || 'Módulo profesional'}
                  </div>
                </div>
              </div>

              {/* Celda derecha: Evaluación y fecha de corte con fondo gris suave */}
              <div
                className="col-12 sm:col-5 p-3 flex flex-column justify-content-center"
                style={{ backgroundColor: '#e2e8f0' }}
              >
                <div className="font-bold text-base uppercase text-900">
                  {evaluacion || '1ª EVALUACIÓN'}
                </div>
                <div className="font-bold text-sm text-800 mt-1">
                  {fechaCorteTexto ? (fechaCorteTexto.startsWith('Hasta') ? fechaCorteTexto : `Hasta ${fechaCorteTexto}`) : 'Período ordinario'}
                </div>
              </div>
            </div>

            {/* 2. Cuerpo: Contenidos Programados frente a Contenidos Impartidos */}
            <div
              className="grid m-0"
              style={{ borderBottom: '1.5px solid #000000' }}
            >
              {/* Columna Izquierda: CONTENIDOS PROGRAMADOS */}
              <div
                className="col-12 sm:col-7 p-3 flex flex-column gap-2"
                style={{ borderRight: '1.5px solid #000000' }}
              >
                <div className="font-bold text-xs uppercase tracking-wider text-800 pb-1 border-bottom-1 surface-200">
                  CONTENIDOS PROGRAMADOS:
                </div>
                {contenidosProgramados.length === 0 ? (
                  <p className="text-sm text-500 font-italic m-0 py-2">
                    No constan unidades programadas para este corte temporal.
                  </p>
                ) : (
                  <div className="flex flex-column gap-2 pt-1">
                    {contenidosProgramados.map((ut) => (
                      <div key={ut.id_ut || ut.orden} className="flex flex-column">
                        <span className="font-bold text-sm text-900">
                          {ut.numUT ? `${ut.numUT}. ` : ''}{ut.nombreUT || ut.nombre}
                        </span>
                        {(ut.descripcionUT || ut.descripcion) && (
                          <span className="text-xs text-700 pl-3 line-height-2">
                            {ut.descripcionUT || ut.descripcion}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Columna Derecha: CONTENIDOS IMPARTIDOS */}
              <div className="col-12 sm:col-5 p-3 flex flex-column gap-2">
                <div className="font-bold text-xs uppercase tracking-wider text-800 pb-1 border-bottom-1 surface-200">
                  CONTENIDOS IMPARTIDOS:
                </div>
                {contenidosImpartidosTexto ? (
                  <p className="text-sm line-height-3 m-0 text-800 pt-1">
                    {contenidosImpartidosTexto}
                  </p>
                ) : (
                  <p className="text-sm text-500 font-italic m-0 py-2">
                    Durante este período no se han registrado unidades impartidas.
                  </p>
                )}

                {contenidosImpartidos.length > 0 && (
                  <div className="mt-2 pt-2 border-top-1 surface-200">
                    <span className="text-xs font-semibold text-600 uppercase block mb-1">
                      Unidades completadas:
                    </span>
                    <ul className="m-0 pl-3 text-xs line-height-3 text-800">
                      {contenidosImpartidos.map((ut) => (
                        <li key={`imp-${ut.id_ut || ut.orden}`}>
                          {ut.numUT ? `${ut.numUT}. ` : ''}{ut.nombreUT || ut.nombre}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Bloque inferior a ancho completo: Observaciones */}
            <div className="p-3">
              <div className="font-bold text-xs uppercase tracking-wider text-800 mb-1">
                Observaciones:
              </div>
              <p className="text-sm line-height-3 m-0 text-800">
                {observaciones && observaciones.trim() !== ''
                  ? observaciones
                  : 'El curso avanza de forma correcta y sin incidentes.'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* MODALIDAD 2: Pequeño DataTable de solo lectura con TablaBase              */
        /* ========================================================================= */
        <div className="w-full">
          <TablaBase
            data={contenidosProgramados}
            loading={cargando}
            paginator={true}
            rows={10}
            paginatorPosition="top"
            rowsPerPageOptions={[5, 10, 15, 20, 25]}
            emptyMessage="No hay Unidades de Trabajo programadas para este filtro"
            className="p-datatable-sm w-full"
          >
            <Column
              field="orden"
              header="Orden"
              style={{ width: '80px', textAlign: 'center' }}
              body={(row) => <span className="font-bold text-center block">{row.orden}</span>}
            />
            <Column
              header="Unidad de Trabajo"
              style={{ minWidth: '220px', maxWidth: '300px' }}
              body={plantillaUnidad}
            />
            <Column
              header="Descripción Curricular"
              style={{ minWidth: '240px', maxWidth: '340px' }}
              body={plantillaDescripcion}
            />
            <Column
              header="Fechas Previstas"
              style={{ minWidth: '170px' }}
              body={plantillaFechas}
            />
            <Column
              header="Estado Contraste"
              style={{ minWidth: '130px', textAlign: 'center' }}
              body={plantillaEstado}
            />
          </TablaBase>
        </div>
      )}
    </div>
  );
};

export default TablaVistaPreviaSeguimiento;

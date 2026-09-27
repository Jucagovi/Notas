import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tooltip } from 'primereact/tooltip';
import { getColorNota } from '../../utils/coloresNota.js';

/**
 * TablaActaRa - Componente de tabla dinámica (Pivot Table) para visualizar las calificaciones por RA.
 *
 * Responsabilidad Única: Renderizar el listado tabular de discentes con la columna de identificación fija (frozen),
 * generar las columnas dinámicas para cada Resultado de Aprendizaje aplicando el color semántico de fondo
 * y calcular visualmente la Nota del Módulo según la modalidad seleccionada.
 *
 * @param {Object} props
 * @param {Array<Object>} props.discentes - Lista de discentes con calificaciones por RA y notas finales.
 * @param {Array<Object>} props.ras - Lista de Resultados de Aprendizaje del módulo curricular.
 * @param {string} props.modoCalculo - Modo activo ('continua' o 'final').
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 */
export const TablaActaRa = ({
  discentes = [],
  ras = [],
  modoCalculo = 'final',
  cargando = false
}) => {
  // Plantilla para la columna fija de identificación del discente
  const plantillaDiscente = (rowData) => {
    const textoNombre = `${rowData.apellidos || ''}, ${rowData.nombre || ''}`.trim() || 'Sin nombre';
    const nia = rowData.nia || rowData.NIA;

    return (
      <div className="flex flex-column justify-content-center py-1">
        <span
          className="font-semibold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis cursor-pointer"
          title={textoNombre}
          style={{ maxWidth: '240px' }}
        >
          {textoNombre}
        </span>
        {nia && (
          <span className="text-xs text-color-secondary font-monospace">
            NIA: {nia}
          </span>
        )}
      </div>
    );
  };

  // Plantilla para el encabezado de cada columna de Resultado de Aprendizaje
  const plantillaEncabezadoRa = (ra) => {
    const pesoTexto = ra.peso !== undefined && ra.peso !== null ? `${ra.peso}%` : '0%';
    const tituloTooltip = `${ra.nombre || ''}${ra.descripcion ? ` — ${ra.descripcion}` : ''}`;

    return (
      <div
        className="flex flex-column align-items-center justify-content-center text-center w-full py-1 cursor-help"
        title={tituloTooltip}
      >
        <span className="font-bold text-800 text-sm">
          RA {ra.numero}
        </span>
        <span className="text-xs text-color-secondary font-medium">
          ({pesoTexto})
        </span>
      </div>
    );
  };

  // Plantilla para las celdas de nota de cada Resultado de Aprendizaje
  const plantillaCeldaRa = (rowData, ra) => {
    const infoCalif = rowData.notasRA ? rowData.notasRA[ra.id_ra] : null;
    const nota = infoCalif && infoCalif.nota !== null && infoCalif.nota !== undefined
      ? infoCalif.nota
      : null;
    const completo = Boolean(infoCalif && infoCalif.completo);

    // Si el RA no tiene calificación registrada, se muestra el signo de interrogación
    if (nota === null) {
      return (
        <div
          className="flex align-items-center justify-content-center mx-auto text-color-secondary font-bold text-sm border-round surface-100"
          style={{ width: '44px', height: '32px' }}
          title="Sin calificación registrada en las actividades de este RA"
        >
          ?
        </div>
      );
    }

    // Se obtiene el color normativo a través de la función auxiliar centralizada
    const { hex, etiqueta } = getColorNota(nota);
    const estadoCompletitud = completo ? 'Completado al 100%' : 'En progreso / parcial';

    return (
      <div
        className="flex align-items-center justify-content-center mx-auto border-round font-bold text-sm shadow-1 transition-all transition-duration-200 select-none cursor-help"
        style={{
          backgroundColor: hex,
          color: '#ffffff',
          width: '44px',
          height: '32px'
        }}
        title={`RA ${ra.numero}: ${nota} / 100 (${etiqueta}) — ${estadoCompletitud}`}
      >
        {nota}
      </div>
    );
  };

  // Plantilla para la columna final de Nota (sin fondo, solo texto con el color semántico de coloresNota.js y tamaño igual al resto de columnas)
  const plantillaNotaModulo = (rowData) => {
    const nota =
      modoCalculo === 'continua' ? rowData.notaContinua : rowData.notaFinal;

    if (nota === null || nota === undefined) {
      return (
        <div
          className="flex align-items-center justify-content-center mx-auto text-color-secondary font-bold text-sm"
          style={{ width: '44px', height: '32px' }}
          title={
            modoCalculo === 'continua'
              ? 'Evaluación Continua: no hay RAs completos para computar.'
              : 'Evaluación Final: sin notas registradas.'
          }
        >
          ?
        </div>
      );
    }

    const { hex, etiqueta } = getColorNota(nota);

    const descripcionMetodo =
      modoCalculo === 'continua'
        ? `Evaluación Continua: ${nota} / 100 (${etiqueta}). Reescalado sobre ${rowData.rasCompletados} de ${rowData.totalRAs} RAs completados.`
        : `Evaluación Final Ordinaria: ${nota} / 100 (${etiqueta}). Ponderado al 100% sobre el currículo oficial.`;

    return (
      <div
        className="flex align-items-center justify-content-center mx-auto font-bold text-sm select-none cursor-help"
        style={{ color: hex, width: '44px', height: '32px' }}
        title={descripcionMetodo}
      >
        {nota}
      </div>
    );
  };

  return (
    <div className="surface-card shadow-2 border-round border-1 surface-border overflow-hidden tabla-acta-contenedor">
      {/* Estilos CSS específicos para forzar el centrado horizontal y vertical de los contenedores de cabecera en PrimeReact */}
      <style>{`
        .tabla-acta-contenedor .p-datatable-thead > tr > th {
          text-align: center !important;
          vertical-align: middle !important;
        }
        .tabla-acta-contenedor .p-datatable-thead > tr > th .p-column-header-content {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          text-align: center !important;
          width: 100% !important;
        }
        .tabla-acta-contenedor .p-datatable-thead > tr > th .p-column-title {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100% !important;
          text-align: center !important;
        }
      `}</style>
      <Tooltip target=".cursor-help" position="top" />

      <DataTable
        value={discentes}
        loading={cargando}
        paginator
        paginatorPosition="top"
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        emptyMessage="No se encontraron discentes matriculados en la clase seleccionada."
        stripedRows
        scrollable
        scrollHeight="flex"
        responsiveLayout="scroll"
        className="p-datatable-sm"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} discentes"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
      >
        {/* Columna Fija (Frozen) a la izquierda con los datos del discente y cabecera 'Discente' */}
        <Column
          field="nombreCompleto"
          header={
            <div className="flex align-items-center justify-content-center text-center w-full py-1">
              <span>Discente</span>
            </div>
          }
          headerClassName="text-center justify-content-center align-items-center"
          headerStyle={{ textAlign: 'center', verticalAlign: 'middle' }}
          pt={{
            headerContent: { style: { justifyContent: 'center', textAlign: 'center', width: '100%' } },
            headerTitle: { style: { width: '100%', textAlign: 'center' } }
          }}
          body={plantillaDiscente}
          frozen
          style={{ minWidth: '240px', width: '260px' }}
          className="border-right-1 surface-border font-medium"
        />

        {/* Columnas Dinámicas para cada Resultado de Aprendizaje con cabeceras rigurosamente centradas */}
        {ras.map((ra) => (
          <Column
            key={ra.id_ra}
            header={() => plantillaEncabezadoRa(ra)}
            headerClassName="text-center justify-content-center align-items-center"
            headerStyle={{ textAlign: 'center', verticalAlign: 'middle' }}
            pt={{
              headerContent: { style: { justifyContent: 'center', textAlign: 'center', width: '100%' } },
              headerTitle: { style: { width: '100%', textAlign: 'center' } }
            }}
            body={(rowData) => plantillaCeldaRa(rowData, ra)}
            style={{ minWidth: '95px', textAlign: 'center' }}
            bodyClassName="text-center"
          />
        ))}

        {/* Columna Final con la calificación calculada del Módulo renombrada a 'Nota' y cabecera centrada */}
        <Column
          header={
            <div
              className="flex align-items-center justify-content-center text-center w-full py-1 cursor-help"
              title={
                modoCalculo === 'continua'
                  ? 'Nota calculada en modo Evaluación Continua'
                  : 'Nota calculada en modo Evaluación Final'
              }
            >
              <span className="font-bold text-primary text-sm">
                Nota
              </span>
            </div>
          }
          headerClassName="text-center justify-content-center align-items-center"
          headerStyle={{ textAlign: 'center', verticalAlign: 'middle' }}
          pt={{
            headerContent: { style: { justifyContent: 'center', textAlign: 'center', width: '100%' } },
            headerTitle: { style: { width: '100%', textAlign: 'center' } }
          }}
          body={plantillaNotaModulo}
          frozen
          alignFrozen="right"
          style={{ minWidth: '85px', width: '95px', textAlign: 'center' }}
          className="border-left-1 surface-border"
          bodyClassName="text-center font-bold"
        />
      </DataTable>
    </div>
  );
};

export default TablaActaRa;

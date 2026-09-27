import React from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import TablaBase from '../common/TablaBase.jsx';

/**
 * TablaEvaluaciones - Listado de las 5 evaluaciones normativas y sus prácticas asignadas.
 *
 * Responsabilidad Única: Renderizar el DataTable sin paginación con el orden reglamentario estricto
 * (Primera, Segunda, Tercera, Final/Ordinaria y Extraordinaria), mostrando las prácticas asignadas
 * con botón para desasignarlas y la cobertura curricular calculada en tiempo real.
 *
 * @param {Object} props
 * @param {Array<Object>} props.evaluaciones - Listado de evaluaciones ordenadas con métricas.
 * @param {boolean} props.cargando - Indicador de estado de carga.
 * @param {Function} props.onDesasignarPractica - Manejador para desvincular una práctica de la evaluación.
 * @param {boolean} props.guardando - Indicador de operación en curso.
 */
export const TablaEvaluaciones = ({
  evaluaciones = [],
  cargando = false,
  onDesasignarPractica,
  guardando = false
}) => {
  // Plantilla para la columna Nombre de la Evaluación.
  const plantillaNombre = (fila) => {
    return (
      <div className="flex align-items-center gap-2 py-2">
        <i className="pi pi-calendar-plus text-primary text-base flex-shrink-0" />
        <span
          className="font-bold text-900 text-sm white-space-nowrap overflow-hidden text-overflow-ellipsis"
          title={fila.nombre}
        >
          {fila.nombre}
        </span>
      </div>
    );
  };

  // Plantilla para la columna "Prácticas asignadas" con visualización en filas individuales y botón de desasignación.
  const plantillaPracticasAsignadas = (fila) => {
    const versiones = fila.versionesAsignadas || [];

    if (versiones.length === 0) {
      return (
        <span className="text-secondary text-xs italic">
          Sin prácticas asignadas
        </span>
      );
    }

    return (
      <div className="flex flex-column gap-1 py-1 w-full">
        {versiones.map((v) => (
          <div
            key={v.id_version}
            className="flex align-items-center justify-content-between gap-2 surface-50 border-1 surface-border border-round px-2 py-1 w-full"
          >
            <div className="flex align-items-center gap-2 overflow-hidden flex-grow-1">
              <i className="pi pi-file text-500 text-xs flex-shrink-0" />
              <span
                className="text-xs font-semibold text-800 white-space-nowrap overflow-hidden text-overflow-ellipsis"
                title={v.etiquetaCompleta || v.nombrePractica}
              >
                {v.nombrePractica}
              </span>
              {v.numeroVersion && (
                <Tag
                  value={v.numeroVersion}
                  severity="secondary"
                  className="text-xs px-1 py-0 flex-shrink-0"
                  style={{ fontSize: '0.7rem', height: '1.2rem' }}
                />
              )}
            </div>

            {/* Botón para desasignar la práctica de esta evaluación */}
            <Button
              type="button"
              icon="pi pi-times"
              rounded
              text
              severity="danger"
              tooltip="Desasignar de esta evaluación (vuelve a la bandeja de pendientes)"
              tooltipOptions={{ position: 'top' }}
              onClick={() => onDesasignarPractica(v.id_version)}
              disabled={guardando}
              className="p-button-xs ml-1 flex-shrink-0"
              style={{ width: '1.25rem', height: '1.25rem', padding: 0 }}
            />
          </div>
        ))}
      </div>
    );
  };

  // Plantilla para la cobertura curricular estimada de Resultados de Aprendizaje.
  const plantillaCobertura = (fila) => {
    const coberturas = fila.coberturasRA || [];

    if (coberturas.length === 0) {
      return <span className="text-secondary text-xs italic">Sin cobertura de RA</span>;
    }

    return (
      <div
        className="flex align-items-center gap-1 flex-wrap py-1"
        title={fila.textoResumenCurricular || ''}
      >
        {coberturas.map((item) => (
          <Tag
            key={item.id_ra || item.codigo}
            value={`${item.codigo}: ${item.porcentaje}%`}
            severity={item.porcentaje >= 80 ? 'success' : item.porcentaje >= 50 ? 'info' : 'warning'}
            className="text-xs font-semibold px-2 py-0"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="surface-card border-round shadow-1 border-1 surface-border overflow-hidden">
      <TablaBase
        value={evaluaciones}
        loading={cargando}
        paginator={false}
        emptyMessage="No hay evaluaciones configuradas para este curso lectivo"
        responsiveLayout="scroll"
        className="p-datatable-sm w-full"
      >
        <Column
          field="nombre"
          header="Evaluación"
          body={plantillaNombre}
          style={{ width: '22%' }}
        />
        <Column
          header="Prácticas asignadas"
          body={plantillaPracticasAsignadas}
          style={{ width: '48%' }}
        />
        <Column
          header="Cobertura Curricular (RA)"
          body={plantillaCobertura}
          style={{ width: '30%' }}
        />
      </TablaBase>
    </div>
  );
};

export default TablaEvaluaciones;

import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { Avatar } from 'primereact/avatar';
import { Tooltip } from 'primereact/tooltip';
import { getColorNota } from '../../utils/coloresNota.js';

// Componente presentacional para renderizar la tabla de discentes en situación de riesgo académico.
const TablaAlumnosRiesgo = ({ alertas = [], cargando = false, error = null }) => {
  const [filasExpandidas, setFilasExpandidas] = useState(null);

  // Renderizado del discente con su avatar o iniciales y texto truncado con tooltip.
  const plantillaDiscente = (fila) => {
    const iniciales = `${fila.nombre?.[0] || ''}${fila.apellidos?.[0] || ''}`.toUpperCase();

    return (
      <div className="flex align-items-center gap-2" style={{ maxWidth: '100%' }}>
        {fila.imagen ? (
          <Avatar image={fila.imagen} shape="circle" size="normal" className="flex-shrink-0" />
        ) : (
          <Avatar label={iniciales} shape="circle" size="normal" className="flex-shrink-0" />
        )}
        <span
          className="white-space-nowrap overflow-hidden text-overflow-ellipsis font-medium"
          title={fila.nombreCompleto}
          style={{ maxWidth: '180px' }}
        >
          {fila.nombreCompleto}
        </span>
      </div>
    );
  };

  // Renderizado de texto simple de una sola línea con tooltip ante desbordamientos.
  const plantillaTextoTruncado = (texto, maxAncho = '150px') => (
    <span
      className="white-space-nowrap overflow-hidden text-overflow-ellipsis inline-block"
      title={texto}
      style={{ maxWidth: maxAncho }}
    >
      {texto}
    </span>
  );

  // Renderizado de la nota media con la escala cromática obligatoria.
  const plantillaNota = (fila) => {
    const estilo = getColorNota(fila.media);
    return (
      <Tag
        value={fila.media.toFixed(1)}
        style={{
          backgroundColor: estilo.hex,
          color: '#ffffff',
          fontWeight: 'bold',
          padding: '0.2rem 0.6rem'
        }}
      />
    );
  };

  // Renderizado del nivel de riesgo con severidad PrimeReact.
  const plantillaNivelRiesgo = (fila) => {
    const esCritico = fila.nivelRiesgo?.toLowerCase() === 'crítico';
    return (
      <Tag
        value={fila.nivelRiesgo}
        severity={esCritico ? 'danger' : 'warning'}
        icon={esCritico ? 'pi pi-exclamation-circle' : 'pi pi-info-circle'}
      />
    );
  };

  // Plantilla de fila expandida con el desglose de actividades no entregadas o suspendidas.
  const plantillaDetalleFila = (fila) => {
    return (
      <div className="p-3 surface-ground border-round">
        <h5 className="m-0 mb-2 text-sm font-bold text-color">
          Desglose de actividades en {fila.unidadTrabajo}:
        </h5>
        {fila.detalles && fila.detalles.length > 0 ? (
          <div className="grid">
            {fila.detalles.map((detalle, idx) => {
              const estiloNota = getColorNota(detalle.nota);
              const esNoEntregado = detalle.estado === 'Falta de entrega';
              return (
                <div key={idx} className="col-12 sm:col-6 md:col-4">
                  <div className="p-2 border-round surface-card border-1 surface-border flex justify-content-between align-items-center">
                    <span
                      className="text-xs font-medium white-space-nowrap overflow-hidden text-overflow-ellipsis mr-2"
                      title={detalle.actividad}
                    >
                      {detalle.actividad}
                    </span>
                    <Tag
                      value={esNoEntregado ? 'Sin entregar' : detalle.nota}
                      severity={esNoEntregado ? 'danger' : detalle.nota < 50 ? 'danger' : 'success'}
                      style={!esNoEntregado ? { backgroundColor: estiloNota.hex, color: '#ffffff' } : {}}
                      className="text-xs flex-shrink-0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-xs text-muted">No hay desglose detallado de actividades.</span>
        )}
      </div>
    );
  };

  return (
    <Card
      title={
        <div className="flex align-items-center justify-content-between">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-exclamation-triangle text-orange-500 text-xl" />
            <span className="font-bold text-lg">Alumnos en riesgo (Alertas tempranas)</span>
          </div>
          <Badge
            value={alertas.length}
            severity={alertas.length > 0 ? 'danger' : 'success'}
          />
        </div>
      }
      subTitle="Discentes con nota media ponderada inferior a 50 o faltas de entrega en unidades de trabajo finalizadas."
      className="shadow-1 border-round surface-card"
    >
      <Tooltip target=".p-datatable [title]" position="top" />

      {error && (
        <div
          className="w-full mb-3 p-3 border-round flex align-items-center gap-2"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5'
          }}
        >
          <i className="pi pi-times-circle text-red-400" />
          <span className="text-sm">{error.error || 'Error al procesar alertas tempranas.'}</span>
        </div>
      )}

      <DataTable
        value={alertas}
        loading={cargando}
        expandedRows={filasExpandidas}
        onRowToggle={(e) => setFilasExpandidas(e.data)}
        rowExpansionTemplate={plantillaDetalleFila}
        dataKey="id"
        responsiveLayout="scroll"
        emptyMessage="No se han detectado alumnos en situación de riesgo en las unidades finalizadas."
        className="p-datatable-sm"
        stripedRows
      >
        <Column expander style={{ width: '3rem' }} />
        <Column
          field="nombreCompleto"
          header="Alumno"
          body={plantillaDiscente}
          sortable
          style={{ minWidth: '220px' }}
        />
        <Column
          field="nia"
          header="NIA"
          body={(f) => plantillaTextoTruncado(f.nia, '120px')}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="modulo"
          header="Módulo"
          body={(f) => plantillaTextoTruncado(f.modulo, '130px')}
          sortable
          style={{ minWidth: '130px' }}
        />
        <Column
          field="unidadTrabajo"
          header="Unidad de Trabajo"
          body={(f) => plantillaTextoTruncado(f.unidadTrabajo, '180px')}
          sortable
          style={{ minWidth: '180px' }}
        />
        <Column
          field="suspensos"
          header="Actividades sin superar"
          body={(f) => <Badge value={f.suspensos} severity="danger" />}
          sortable
          style={{ minWidth: '170px', textAlign: 'center' }}
        />
        <Column
          field="media"
          header="Nota Media"
          body={plantillaNota}
          sortable
          style={{ minWidth: '120px' }}
        />
        <Column
          field="nivelRiesgo"
          header="Nivel de Riesgo"
          body={plantillaNivelRiesgo}
          sortable
          style={{ minWidth: '140px' }}
        />
      </DataTable>
    </Card>
  );
};

export default TablaAlumnosRiesgo;

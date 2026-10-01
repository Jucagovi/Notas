import React from 'react';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import TablaBase from '../common/TablaBase.jsx';
import { formatearFechaEspanol } from '../../utils/fechas.js';

/**
 * TablaProgresoCurricular - Componente presentacional tabular del progreso curricular.
 *
 * Responsabilidad Única: Renderizar una tabla detallada con paginación superior,
 * opciones reglamentarias [5, 10, 15, 20, 25] y columnas con datos truncados con tooltip,
 * reutilizando estrictamente el componente común TablaBase.
 *
 * @param {Object} props
 * @param {Array<Object>} props.unidades - Lista de unidades con cálculo de desviación e hitos.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {string|null} [props.idCurso] - Identificador del curso activo.
 * @param {string|null} [props.idModulo] - Identificador del módulo activo.
 */
export const TablaProgresoCurricular = ({
  unidades = [],
  cargando = false,
  idCurso = null,
  idModulo = null
}) => {
  const navigate = useNavigate();

  // Redirección directa al Caso de Uso 19 (Temporización) para editar la unidad seleccionada.
  const manejarIrATemporizacion = (fila) => {
    navigate('/temporizacion', {
      state: {
        id_curso: fila.id_curso || idCurso,
        id_modulo: fila.id_modulo || idModulo,
        cursoId: fila.id_curso || idCurso,
        moduloId: fila.id_modulo || idModulo
      }
    });
  };

  // Plantilla para la columna identificativa de la unidad
  const plantillaUnidad = (fila) => {
    return (
      <span className="font-bold text-xs text-primary bg-primary-50 px-2 py-1 border-round border-1 surface-border">
        {fila.numUT}
      </span>
    );
  };

  // Plantilla para la denominación de la unidad con tooltip para prevenir desbordamientos
  const plantillaNombre = (fila) => {
    const textoCompleto = fila.nombre_alternativo
      ? `${fila.nombreUT} (${fila.nombre_alternativo})`
      : fila.nombreUT;

    return (
      <span
        className="white-space-nowrap overflow-hidden text-overflow-ellipsis block text-xs font-semibold text-900"
        title={textoCompleto}
        style={{ maxWidth: '280px' }}
      >
        {textoCompleto}
      </span>
    );
  };

  // Plantilla para el estado de la unidad formativa
  const plantillaEstado = (fila) => {
    return (
      <Tag
        value={fila.estado}
        severity={
          fila.esCompletada
            ? 'success'
            : fila.estado === 'En Curso'
            ? 'info'
            : 'warning'
        }
        className="text-xs py-0 px-2"
      />
    );
  };

  // Plantilla para las fechas planificadas previstas
  const plantillaPeriodoPrevisto = (fila) => {
    if (!fila.fecha_ini_prevista || !fila.fecha_fin_prevista) {
      return <span className="text-xs text-color-secondary italic">Sin planificar</span>;
    }
    return (
      <span className="text-xs text-700 white-space-nowrap">
        {formatearFechaEspanol(fila.fecha_ini_prevista)} — {formatearFechaEspanol(fila.fecha_fin_prevista)}
      </span>
    );
  };

  // Plantilla para las fechas de ejecución real
  const plantillaPeriodoReal = (fila) => {
    if (fila.fecha_ini_real && fila.fecha_fin_real) {
      return (
        <span className="text-xs text-700 white-space-nowrap">
          {formatearFechaEspanol(fila.fecha_ini_real)} — {formatearFechaEspanol(fila.fecha_fin_real)}
        </span>
      );
    }
    if (fila.estado === 'En Curso') {
      return <span className="text-xs text-blue-600 font-semibold">En curso</span>;
    }
    return <span className="text-xs text-color-secondary italic">No iniciada</span>;
  };

  // Plantilla para el indicador de desviación
  const plantillaDesviacion = (fila) => {
    return (
      <div className="flex align-items-center gap-1">
        <i
          className={`${fila.icono} ${
            fila.enRetraso ? 'text-red-500' : 'text-green-500'
          } text-xs`}
        />
        <Badge
          value={fila.textoDesviacion}
          severity={fila.severidad}
          className="text-xs font-bold"
        />
      </div>
    );
  };

  // Plantilla para la columna de acciones rápidas
  const plantillaAcciones = (fila) => {
    return (
      <Button
        icon="pi pi-cog"
        rounded
        text
        size="small"
        severity="secondary"
        tooltip="Ajustar en Temporización"
        tooltipOptions={{ position: 'left' }}
        onClick={() => manejarIrATemporizacion(fila)}
        aria-label={`Ajustar ${fila.numUT}`}
      />
    );
  };

  return (
    <div className="surface-card p-3 border-round border-1 surface-border shadow-1">
      <div className="mb-2 pb-2 border-bottom-1 surface-border">
        <h3 className="text-lg font-bold text-900 m-0">Detalle Tabular de Unidades</h3>
        <span className="text-xs text-color-secondary">
          Registro pormenorizado de fechas previstas, fechas reales y desviaciones
        </span>
      </div>

      <TablaBase
        data={unidades}
        loading={cargando}
        paginator={true}
        rows={10}
        paginatorPosition="top"
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        emptyMessage="No constan unidades de trabajo para mostrar"
        className="p-datatable-sm"
      >
        <Column
          field="numUT"
          header="UT"
          body={plantillaUnidad}
          style={{ width: '75px' }}
        />
        <Column
          field="nombreUT"
          header="Denominación"
          body={plantillaNombre}
          style={{ minWidth: '220px' }}
        />
        <Column
          field="estado"
          header="Estado"
          body={plantillaEstado}
          style={{ width: '120px' }}
        />
        <Column
          field="fecha_ini_prevista"
          header="Periodo Previsto"
          body={plantillaPeriodoPrevisto}
          style={{ minWidth: '190px' }}
        />
        <Column
          field="fecha_ini_real"
          header="Periodo Real"
          body={plantillaPeriodoReal}
          style={{ minWidth: '190px' }}
        />
        <Column
          field="textoDesviacion"
          header="Desviación"
          body={plantillaDesviacion}
          style={{ width: '170px' }}
        />
        <Column
          body={plantillaAcciones}
          header="Acciones"
          style={{ width: '80px', textAlign: 'center' }}
        />
      </TablaBase>
    </div>
  );
};

export default TablaProgresoCurricular;

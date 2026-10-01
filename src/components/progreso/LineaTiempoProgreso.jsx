import React from 'react';
import { Timeline } from 'primereact/timeline';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { useNavigate } from 'react-router-dom';
import EstadoVacio from '../common/EstadoVacio.jsx';
import { formatearFechaEspanol } from '../../utils/fechas.js';

/**
 * LineaTiempoProgreso - Componente visual con el Timeline de PrimeReact.
 *
 * Responsabilidad Única: Renderizar una línea temporal cronológica de las Unidades de Trabajo
 * visualizando el solapamiento entre el periodo previsto (transparente/gris) y el ejecutado real
 * (color sólido: verde si finalizó o progresa a tiempo, rojo si incurre en retraso).
 *
 * @param {Object} props
 * @param {Array<Object>} props.unidades - Lista de unidades con cálculo de desviación e hitos.
 * @param {string|null} [props.idCurso] - Identificador del curso activo.
 * @param {string|null} [props.idModulo] - Identificador del módulo activo.
 */
export const LineaTiempoProgreso = ({ unidades = [], idCurso = null, idModulo = null }) => {
  const navigate = useNavigate();

  // Redirección directa al Caso de Uso 19 (Temporización) para realizar ajustes rápidos.
  const manejarIrATemporizacion = (idCursoTemp, idModuloTemp) => {
    navigate('/temporizacion', {
      state: {
        id_curso: idCursoTemp || idCurso,
        id_modulo: idModuloTemp || idModulo,
        cursoId: idCursoTemp || idCurso,
        moduloId: idModuloTemp || idModulo
      }
    });
  };

  if (!unidades || unidades.length === 0) {
    return (
      <EstadoVacio
        mensaje="Sin unidades para la línea temporal"
        descripcion="No se encontraron unidades de trabajo temporizadas con los filtros seleccionados."
        icono="pi pi-calendar-times"
        className="my-3 p-4"
      />
    );
  }

  // Personalización del marcador circular en el eje de la línea de tiempo.
  const plantillaMarcador = (item) => {
    let claseColor = 'bg-gray-400';
    let icono = 'pi pi-clock';

    if (item.enRetraso) {
      claseColor = 'bg-red-500';
      icono = 'pi pi-exclamation-triangle';
    } else if (item.esCompletada) {
      claseColor = 'bg-green-500';
      icono = 'pi pi-check';
    } else if (item.estado === 'En Curso') {
      claseColor = 'bg-blue-500';
      icono = 'pi pi-spin pi-spinner';
    }

    return (
      <span
        className={`flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1 ${claseColor}`}
      >
        <i className={`${icono} text-xs`} />
      </span>
    );
  };

  // Contenido lateral opuesto con identificador de UT y etiqueta de desviación.
  const plantillaOpuesto = (item) => {
    return (
      <div className="flex flex-column align-items-end gap-1 my-2">
        <span className="font-bold text-sm text-900">{item.numUT}</span>
        <div className="flex align-items-center gap-1">
          <i
            className={`${item.icono} ${
              item.enRetraso ? 'text-red-500' : 'text-green-500'
            } text-xs`}
          />
          <Badge
            value={item.textoDesviacion}
            severity={item.severidad}
            className="text-xs"
          />
        </div>
        <Tag
          value={item.estado}
          severity={
            item.esCompletada
              ? 'success'
              : item.estado === 'En Curso'
              ? 'info'
              : 'warning'
          }
          className="text-xs py-0 px-2"
        />
      </div>
    );
  };

  // Tarjeta principal con el detalle curricular y la comparativa visual de solapamiento.
  const plantillaContenido = (item) => {
    const tienePrevistas = Boolean(item.fecha_ini_prevista && item.fecha_fin_prevista);
    const tieneReales = Boolean(item.fecha_ini_real && item.fecha_fin_real);

    return (
      <div className="surface-card p-3 border-round border-1 surface-border shadow-1 mb-4">
        {/* Cabecera de la tarjeta con denominación y botón de ajuste */}
        <div className="flex align-items-start justify-content-between gap-2 mb-2 pb-2 border-bottom-1 surface-border">
          <div>
            <h4 className="text-base font-bold text-900 m-0 line-height-2">
              {item.numUT}: {item.nombreUT}
            </h4>
            {item.nombre_alternativo && (
              <span className="text-xs text-primary font-semibold">
                Variación: {item.nombre_alternativo}
              </span>
            )}
          </div>
          <Button
            icon="pi pi-cog"
            rounded
            text
            size="small"
            severity="secondary"
            tooltip="Ajustar en Temporización"
            tooltipOptions={{ position: 'left' }}
            onClick={() => manejarIrATemporizacion(item.id_curso, item.id_modulo)}
            aria-label={`Ajustar ${item.numUT}`}
          />
        </div>

        {/* Cajas comparativas de periodos */}
        <div className="grid mb-2">
          {/* Periodo previsto: representación transparente/gris con borde discontinuo */}
          <div className="col-12 sm:col-6">
            <div
              className="p-2 border-round border-1 border-dashed surface-border text-xs flex flex-column gap-1"
              style={{ backgroundColor: 'rgba(156, 163, 175, 0.12)' }}
            >
              <div className="flex align-items-center gap-1 text-color-secondary font-semibold">
                <i className="pi pi-calendar text-xs" />
                <span>Periodo Previsto (Planificado)</span>
              </div>
              <span className="font-bold text-700">
                {tienePrevistas
                  ? `${formatearFechaEspanol(item.fecha_ini_prevista)} — ${formatearFechaEspanol(item.fecha_fin_prevista)}`
                  : 'Sin fechas asignadas'}
              </span>
            </div>
          </div>

          {/* Periodo ejecutado real: color sólido verde si a tiempo, rojo si con retraso */}
          <div className="col-12 sm:col-6">
            <div
              className="p-2 border-round text-white text-xs flex flex-column gap-1 shadow-1"
              style={{
                backgroundColor: item.colorReal,
                opacity: item.estado === 'Pendiente' && !tieneReales ? 0.7 : 1
              }}
            >
              <div className="flex align-items-center gap-1 font-semibold">
                <i
                  className={
                    item.enRetraso
                      ? 'pi pi-exclamation-triangle text-xs'
                      : 'pi pi-check-circle text-xs'
                  }
                />
                <span>Periodo Ejecutado Real</span>
              </div>
              <span className="font-bold">
                {tieneReales
                  ? `${formatearFechaEspanol(item.fecha_ini_real)} — ${formatearFechaEspanol(item.fecha_fin_real)}`
                  : item.estado === 'En Curso'
                  ? 'En curso actualmente'
                  : 'Pendiente de inicio'}
              </span>
            </div>
          </div>
        </div>

        {/* Barra visual de solapamiento entre lo previsto y lo ejecutado */}
        {tienePrevistas && (
          <div className="flex flex-column gap-1 mt-2 pt-2 border-top-1 surface-border">
            <div className="flex justify-content-between text-xs text-color-secondary">
              <span>Solapamiento Previsto vs Real</span>
              <span className="font-semibold">{item.textoDesviacion}</span>
            </div>
            <div
              className="w-full border-round surface-200 relative overflow-hidden"
              style={{ height: '14px' }}
            >
              {/* Barra de fondo previsto (gris semitransparente con borde rayado) */}
              <div
                className="absolute h-full border-1 border-dashed"
                style={{
                  left: '10%',
                  width: '65%',
                  backgroundColor: 'rgba(156, 163, 175, 0.45)',
                  borderColor: '#6b7280'
                }}
                title="Marco temporal previsto"
              />
              {/* Barra frontal de ejecución real con color sólido */}
              <div
                className="absolute h-full border-round-sm shadow-1"
                style={{
                  left: item.enRetraso ? '25%' : '10%',
                  width: item.enRetraso ? '75%' : item.esCompletada ? '65%' : '40%',
                  backgroundColor: item.colorReal,
                  zIndex: 2
                }}
                title={`Ejecución real: ${item.textoDesviacion}`}
              />
            </div>
          </div>
        )}

        {/* Observaciones complementarias */}
        {item.observaciones && (
          <p className="text-xs text-color-secondary m-0 mt-2 italic line-height-2">
            Nota: {item.observaciones}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1">
      <Tooltip target="[data-pr-tooltip]" position="top" />

      {/* Cabecera y leyenda explicativa */}
      <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2 mb-4 pb-2 border-bottom-1 surface-border">
        <div>
          <h3 className="text-lg font-bold text-900 m-0">Línea de Tiempo Curricular</h3>
          <span className="text-xs text-color-secondary">
            Evolución secuencial y solapamiento entre fechas previstas y ejecución real
          </span>
        </div>

        {/* Leyenda cromática de apoyo */}
        <div className="flex align-items-center gap-3 text-xs text-color-secondary flex-wrap">
          <span className="flex align-items-center gap-1">
            <span
              className="w-1rem h-1rem border-round border-1 border-dashed inline-block"
              style={{ backgroundColor: 'rgba(156, 163, 175, 0.4)', borderColor: '#6b7280' }}
            />
            <span>Previsto (Planificado)</span>
          </span>
          <span className="flex align-items-center gap-1">
            <span className="w-1rem h-1rem border-round bg-green-500 inline-block" />
            <span>En tiempo</span>
          </span>
          <span className="flex align-items-center gap-1">
            <span className="w-1rem h-1rem border-round bg-red-500 inline-block" />
            <span>Retraso</span>
          </span>
        </div>
      </div>

      {/* Componente Timeline nativo de PrimeReact */}
      <Timeline
        value={unidades}
        align="alternate"
        className="customized-timeline"
        marker={plantillaMarcador}
        opposite={plantillaOpuesto}
        content={plantillaContenido}
      />
    </div>
  );
};

export default LineaTiempoProgreso;

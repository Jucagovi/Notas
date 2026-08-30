import React, { useState, useMemo } from 'react';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import useEvaluacionGestionContexto from '../../hooks/useEvaluacionGestionContexto.js';
import useToast from '../../hooks/useToast.js';

// Componente para la columna izquierda que lista las prácticas disponibles del módulo seleccionado
const PracticasColumna = ({
  alSeleccionarPractica = () => {},
  alVerDetallePractica = () => {}
}) => {
  const {
    practicas,
    asignacionesTrabajan,
    practicasEvaluacion,
    evaluacionSeleccionada,
    vincularPracticaAEvaluacion,
    desvincularPracticaDeEvaluacion,
    guardando
  } = useEvaluacionGestionContexto();

  const { mostrarExito, mostrarError } = useToast();

  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas'); // 'todas' | 'sin_ce' | 'con_ce' | 'en_evaluacion'

  // Identificadores de prácticas vinculadas a la evaluación actual
  const idsPracticasEvaluacion = useMemo(() => {
    return new Set((practicasEvaluacion || []).map((p) => p.id_practica));
  }, [practicasEvaluacion]);

  // Mapa con el conteo de CE y porcentaje acumulado de cada práctica
  const estadisticasPracticas = useMemo(() => {
    const mapa = new Map();
    (asignacionesTrabajan || []).forEach((asig) => {
      const actual = mapa.get(asig.id_practica) || { totalCE: 0, sumaPorcentaje: 0, ces: [] };
      actual.totalCE += 1;
      actual.sumaPorcentaje += asig.porcentaje || 0;
      if (asig.CE) {
        actual.ces.push(asig.CE.nombre || `CE ${asig.CE.numero}`);
      }
      mapa.set(asig.id_practica, actual);
    });
    return mapa;
  }, [asignacionesTrabajan]);

  // Filtrado dinámico de las prácticas según el texto de búsqueda y el filtro de estado
  const practicasFiltradas = useMemo(() => {
    return (practicas || []).filter((practica) => {
      const coincideTexto =
        !filtroTexto.trim() ||
        (practica.nombre && practica.nombre.toLowerCase().includes(filtroTexto.toLowerCase())) ||
        (practica.numero && practica.numero.toString().includes(filtroTexto)) ||
        (practica.unidad && practica.unidad.toLowerCase().includes(filtroTexto.toLowerCase()));

      if (!coincideTexto) return false;

      const stats = estadisticasPracticas.get(practica.id_practica) || { totalCE: 0 };
      const estaEnEvaluacion = idsPracticasEvaluacion.has(practica.id_practica);

      if (filtroEstado === 'sin_ce') return stats.totalCE === 0;
      if (filtroEstado === 'con_ce') return stats.totalCE > 0;
      if (filtroEstado === 'en_evaluacion') return estaEnEvaluacion;

      return true;
    });
  }, [practicas, filtroTexto, filtroEstado, estadisticasPracticas, idsPracticasEvaluacion]);

  // Manejo del evento de inicio de arrastre HTML5
  const manejarDragStart = (e, practica) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        id_practica: practica.id_practica,
        nombre: practica.nombre,
        numero: practica.numero,
        unidad: practica.unidad
      })
    );
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  // Manejo de la vinculación/desvinculación con la evaluación actual
  const alternarVinculacionEvaluacion = async (practica) => {
    const estaVinculada = idsPracticasEvaluacion.has(practica.id_practica);
    if (estaVinculada) {
      const resp = await desvincularPracticaDeEvaluacion(practica.id_practica);
      if (resp.exito) {
        mostrarExito('Práctica desvinculada', `Se ha desvinculado la práctica de ${evaluacionSeleccionada.nombre}.`);
      } else {
        mostrarError('Error', resp.error || 'No se pudo desvincular la práctica.');
      }
    } else {
      const resp = await vincularPracticaAEvaluacion(practica.id_practica, 100);
      if (resp.exito) {
        mostrarExito('Práctica vinculada', `Se ha vinculado la práctica a ${evaluacionSeleccionada.nombre}.`);
      } else {
        mostrarError('Error', resp.error || 'No se pudo vincular la práctica.');
      }
    }
  };

  return (
    <div className="surface-card p-3 border-round shadow-1 h-full flex flex-column">
      {/* Cabecera de la columna de Prácticas */}
      <div className="flex align-items-center justify-content-between mb-2">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-file-edit text-primary text-xl" />
          <h3 className="m-0 text-lg font-bold">Catálogo de Prácticas</h3>
        </div>
        <Badge value={practicasFiltradas.length} severity="info" />
      </div>

      <p className="text-xs text-muted m-0 mb-3">
        Arrastre una práctica sobre cualquier Criterio de Evaluación (CE) para asignarle porcentaje de cobertura.
      </p>

      {/* Buscador de prácticas */}
      <div className="p-input-icon-left w-full mb-2">
        <i className="pi pi-search" />
        <InputText
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          placeholder="Buscar práctica por nombre o unidad..."
          className="w-full p-inputtext-sm"
        />
      </div>

      {/* Filtros rápidos por estado */}
      <div className="flex flex-wrap gap-1 mb-3">
        <Button
          label="Todas"
          size="small"
          text={filtroEstado !== 'todas'}
          severity={filtroEstado === 'todas' ? 'primary' : 'secondary'}
          className="p-1 text-xs"
          onClick={() => setFiltroEstado('todas')}
        />
        <Button
          label="Sin CE"
          size="small"
          text={filtroEstado !== 'sin_ce'}
          severity={filtroEstado === 'sin_ce' ? 'warning' : 'secondary'}
          className="p-1 text-xs"
          onClick={() => setFiltroEstado('sin_ce')}
        />
        <Button
          label="Con CE"
          size="small"
          text={filtroEstado !== 'con_ce'}
          severity={filtroEstado === 'con_ce' ? 'success' : 'secondary'}
          className="p-1 text-xs"
          onClick={() => setFiltroEstado('con_ce')}
        />
        {evaluacionSeleccionada && (
          <Button
            label="En Evaluación"
            size="small"
            text={filtroEstado !== 'en_evaluacion'}
            severity={filtroEstado === 'en_evaluacion' ? 'info' : 'secondary'}
            className="p-1 text-xs"
            onClick={() => setFiltroEstado('en_evaluacion')}
          />
        )}
      </div>

      {/* Listado de tarjetas de prácticas arrastrables */}
      <div
        className="flex-1 overflow-y-auto pr-1 flex flex-column gap-2"
        style={{ maxHeight: 'calc(100vh - 360px)', minHeight: '380px' }}
      >
        {practicasFiltradas.length === 0 ? (
          <div className="flex flex-column align-items-center justify-content-center p-4 text-center border-dashed surface-border border-round">
            <i className="pi pi-inbox text-4xl text-muted mb-2" />
            <span className="text-sm font-semibold text-muted">
              {practicas.length === 0
                ? 'No hay prácticas registradas para este módulo.'
                : 'No hay prácticas que coincidan con la búsqueda.'}
            </span>
          </div>
        ) : (
          practicasFiltradas.map((practica) => {
            const stats = estadisticasPracticas.get(practica.id_practica) || { totalCE: 0, sumaPorcentaje: 0 };
            const estaEnEvaluacion = idsPracticasEvaluacion.has(practica.id_practica);

            return (
              <div
                key={practica.id_practica}
                data-swapy-item={`practica-${practica.id_practica}`}
                draggable
                onDragStart={(e) => manejarDragStart(e, practica)}
                className="surface-card border-1 surface-border border-round p-3 transition-colors hover:surface-hover cursor-grab active:cursor-grabbing shadow-1"
                style={{ position: 'relative' }}
              >
                {/* Cabecera de la tarjeta */}
                <div className="flex align-items-start justify-content-between gap-2 mb-1">
                  <div className="flex align-items-center gap-2">
                    <span
                      data-swapy-handle
                      className="cursor-move text-muted hover:text-primary"
                      title="Arrastrar práctica"
                    >
                      <i className="pi pi-bars text-sm" />
                    </span>
                    <span className="font-bold text-sm text-color line-clamp-1" title={practica.nombre}>
                      {practica.numero ? `${practica.numero}. ` : ''}{practica.nombre}
                    </span>
                  </div>
                  {practica.unidad && (
                    <Tag
                      value={`UD ${practica.unidad}`}
                      severity="secondary"
                      className="text-xs"
                    />
                  )}
                </div>

                {/* Breve descripción o enunciado si existe */}
                {practica.enunciado && (
                  <p className="text-xs text-muted m-0 mb-2 line-clamp-2" title={practica.enunciado}>
                    {practica.enunciado}
                  </p>
                )}

                {/* Indicadores de estado de la práctica */}
                <div className="flex flex-wrap align-items-center justify-content-between gap-1 pt-1 border-top-1 surface-border mt-1">
                  <div className="flex align-items-center gap-1">
                    {stats.totalCE > 0 ? (
                      <Tag
                        severity="success"
                        icon="pi pi-check"
                        value={`${stats.totalCE} CE (${stats.sumaPorcentaje}%)`}
                        className="text-xs"
                      />
                    ) : (
                      <Tag
                        severity="warning"
                        icon="pi pi-exclamation-triangle"
                        value="Sin CE asignado"
                        className="text-xs"
                      />
                    )}
                  </div>

                  <div className="flex align-items-center gap-1">
                    {/* Botón para alternar la vinculación con la evaluación actual */}
                    {evaluacionSeleccionada && (
                      <Button
                        type="button"
                        icon={estaEnEvaluacion ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'}
                        size="small"
                        severity={estaEnEvaluacion ? 'info' : 'secondary'}
                        text
                        disabled={guardando}
                        onClick={(e) => {
                          e.stopPropagation();
                          alternarVinculacionEvaluacion(practica);
                        }}
                        tooltip={
                          estaEnEvaluacion
                            ? `Asignada a ${evaluacionSeleccionada.nombre}. Clic para desvincular.`
                            : `Vincular a ${evaluacionSeleccionada.nombre}`
                        }
                        tooltipOptions={{ position: 'top' }}
                        className="p-1"
                      />
                    )}

                    {/* Botón de detalle */}
                    <Button
                      type="button"
                      icon="pi pi-eye"
                      size="small"
                      severity="secondary"
                      text
                      onClick={(e) => {
                        e.stopPropagation();
                        alVerDetallePractica(practica);
                      }}
                      tooltip="Ver detalles de la práctica"
                      tooltipOptions={{ position: 'top' }}
                      className="p-1"
                    />

                    {/* Botón de asignación manual rápida */}
                    <Button
                      type="button"
                      icon="pi pi-plus"
                      size="small"
                      severity="primary"
                      text
                      onClick={(e) => {
                        e.stopPropagation();
                        alSeleccionarPractica(practica);
                      }}
                      tooltip="Asignar manualmente a un criterio"
                      tooltipOptions={{ position: 'top' }}
                      className="p-1"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PracticasColumna;

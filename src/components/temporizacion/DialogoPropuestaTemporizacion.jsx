import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Badge } from 'primereact/badge';
import CalendarioPropuesta from './CalendarioPropuesta.jsx';
import { formatearFechaEspanol } from '../../utils/fechas.js';
import { formatearNumeroUT } from '../../utils/formatoUT.js';
import {
  recalcularPropuestaDesdeFronteras,
  ajustarDiasUnidad,
  asignarRangoAUnidad,
  ajustarFronteraPorClick
} from './gestorPropuestaFechas.js';

/**
 * DialogoPropuestaTemporizacion - Ventana modal interactiva para la propuesta de temporización con edición directa.
 *
 * Responsabilidad Única: Mostrar el resumen de ponderación por RA, la leyenda cromática interactiva de las UTs,
 * la cuadrícula escolar de doce meses (septiembre a agosto) y permitir al docente manipular y editar las fechas
 * de las unidades mediante clics, arrastres con el ratón en el calendario o botones de ajuste paso a paso.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Estado de visibilidad de la ventana modal.
 * @param {Function} props.onOcultar - Callback disparado al cerrar la ventana.
 * @param {Object|null} props.propuesta - Resultado del cálculo de temporización estimada.
 * @param {boolean} [props.cargando=false] - Indicador de cálculo en proceso.
 * @param {boolean} [props.guardando=false] - Indicador de persistencia de fechas en progreso.
 * @param {Function} props.onAceptarPropuesta - Callback al aceptar y aplicar la propuesta de fechas calculadas/editadas.
 */
export const DialogoPropuestaTemporizacion = ({
  visible = false,
  onOcultar,
  propuesta = null,
  cargando = false,
  guardando = false,
  onAceptarPropuesta
}) => {
  // Estado local para almacenar las unidades en proceso de edición.
  const [unidadesEditadas, setUnidadesEditadas] = useState([]);
  const [mapaFechaUtActual, setMapaFechaUtActual] = useState(new Map());
  const [boundaries, setBoundaries] = useState([]);
  const [utActivaId, setUtActivaId] = useState(null);
  const [modificado, setModificado] = useState(false);

  // Inicialización de los datos cuando cambia la propuesta original o se abre el diálogo.
  useEffect(() => {
    if (propuesta?.unidadesPropuestas && propuesta.unidadesPropuestas.length > 0) {
      const units = propuesta.unidadesPropuestas;
      const dias = propuesta.diasClase || [];

      // Extracción de los índices de corte iniciales correspondientes a cada unidad
      const limitesIniciales = [];
      for (let i = 0; i < units.length - 1; i += 1) {
        const idx = dias.findIndex((d) => d.fechaISO === units[i].fecha_fin_prevista);
        limitesIniciales.push(idx !== -1 ? idx : i);
      }

      setBoundaries(limitesIniciales);
      setUnidadesEditadas(units);
      setMapaFechaUtActual(propuesta.mapaFechaUt || new Map());
      setUtActivaId(units[0]?.id_ut || null);
      setModificado(false);
    } else {
      setBoundaries([]);
      setUnidadesEditadas([]);
      setMapaFechaUtActual(new Map());
      setUtActivaId(null);
      setModificado(false);
    }
  }, [propuesta, visible]);

  // Identificación del índice de la Unidad de Trabajo seleccionada actualmente.
  const indiceUtActiva = useMemo(() => {
    if (!utActivaId || !unidadesEditadas) return 0;
    const idx = unidadesEditadas.findIndex((u) => String(u.id_ut) === String(utActivaId));
    return idx !== -1 ? idx : 0;
  }, [utActivaId, unidadesEditadas]);

  const utActiva = unidadesEditadas[indiceUtActiva] || null;

  // Manejo del ajuste fino de días lectivos (+1 o -1 día) para la unidad seleccionada.
  const manejarAjusteDias = (delta) => {
    if (!propuesta?.diasClase || unidadesEditadas.length === 0) return;

    const resultado = ajustarDiasUnidad(
      boundaries,
      indiceUtActiva,
      delta,
      propuesta.unidadesPropuestas,
      propuesta.diasClase
    );

    if (resultado?.unidades) {
      setBoundaries(resultado.boundaries);
      setUnidadesEditadas(resultado.unidades);
      setMapaFechaUtActual(resultado.mapaFechaUt);
      setModificado(true);
    }
  };

  // Manejo de la selección de un rango arrastrando con el ratón sobre el calendario.
  const manejarRangoSeleccionado = (startIdx, endIdx) => {
    if (!propuesta?.diasClase || unidadesEditadas.length === 0) return;

    const resultado = asignarRangoAUnidad(
      boundaries,
      indiceUtActiva,
      startIdx,
      endIdx,
      propuesta.unidadesPropuestas,
      propuesta.diasClase
    );

    if (resultado?.unidades) {
      setBoundaries(resultado.boundaries);
      setUnidadesEditadas(resultado.unidades);
      setMapaFechaUtActual(resultado.mapaFechaUt);
      setModificado(true);
    }
  };

  // Manejo del clic directo en un día escolar para expandir o contraer la unidad activa.
  const manejarDiaClick = (_fechaISO, diaIdx) => {
    if (!propuesta?.diasClase || unidadesEditadas.length === 0) return;

    const resultado = ajustarFronteraPorClick(
      boundaries,
      indiceUtActiva,
      diaIdx,
      propuesta.unidadesPropuestas,
      propuesta.diasClase
    );

    if (resultado?.unidades) {
      setBoundaries(resultado.boundaries);
      setUnidadesEditadas(resultado.unidades);
      setMapaFechaUtActual(resultado.mapaFechaUt);
      setModificado(true);
    }
  };

  // Reversión de todos los cambios manuales devolviendo el calendario a la propuesta algorítmica original.
  const manejarRestablecerOriginal = () => {
    if (propuesta) {
      const units = propuesta.unidadesPropuestas || [];
      const dias = propuesta.diasClase || [];

      const limitesIniciales = [];
      for (let i = 0; i < units.length - 1; i += 1) {
        const idx = dias.findIndex((d) => d.fechaISO === units[i].fecha_fin_prevista);
        limitesIniciales.push(idx !== -1 ? idx : i);
      }

      setBoundaries(limitesIniciales);
      setUnidadesEditadas(units);
      setMapaFechaUtActual(propuesta.mapaFechaUt || new Map());
      setModificado(false);
    }
  };

  const pieDialogo = (
    <div className="flex justify-content-between align-items-center w-full pt-2 flex-wrap gap-2">
      <div className="text-xs text-color-secondary text-left flex align-items-center gap-1">
        <i className="pi pi-info-circle text-primary" />
        <span>
          {modificado
            ? 'Has ajustado manualmente la propuesta. Al hacer clic en Aceptar se guardarán las fechas personalizadas.'
            : 'Al aceptar la propuesta, las fechas calculadas se volcarán automáticamente en las fechas previstas de cada UT.'}
        </span>
      </div>
      <div className="flex align-items-center gap-2">
        {modificado && (
          <Button
            type="button"
            label="Restablecer original"
            icon="pi pi-undo"
            severity="secondary"
            text
            onClick={manejarRestablecerOriginal}
            disabled={guardando}
            tooltip="Volver a la distribución automática inicial según los pesos de los RA"
            tooltipOptions={{ position: 'top' }}
          />
        )}
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          outlined
          onClick={onOcultar}
          disabled={guardando}
        />
        <Button
          type="button"
          label="Aceptar Propuesta"
          icon="pi pi-check"
          severity="primary"
          onClick={() => onAceptarPropuesta && onAceptarPropuesta(unidadesEditadas)}
          loading={guardando}
          disabled={cargando || unidadesEditadas.length === 0}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      header="Propuesta de Temporización Curricular (Ponderación de RA y Calendario Escolar)"
      footer={pieDialogo}
      onHide={onOcultar}
      style={{ width: '95vw', maxWidth: '1300px' }}
      maximizable
      modal
      className="p-fluid"
    >
      {cargando ? (
        <div className="flex flex-column align-items-center justify-content-center p-6 gap-3">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          <span className="font-semibold text-700 text-sm">
            Calculando distribución de días lectivos y ponderación de Resultados de Aprendizaje...
          </span>
        </div>
      ) : !propuesta || unidadesEditadas.length === 0 ? (
        <div className="p-4 text-center text-color-secondary">
          <i className="pi pi-exclamation-circle text-2xl text-orange-500 mb-2 block" />
          <p className="m-0">No se ha podido generar la propuesta de temporización para esta clase.</p>
        </div>
      ) : (
        <div className="flex flex-column gap-3 pt-2">
          {/* 1. Tarjeta de métricas resumen del período escolar */}
          <div className="surface-50 border-round-lg border-1 surface-border p-3 flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="flex align-items-center gap-4 flex-wrap text-sm">
              <span className="flex align-items-center gap-1 font-semibold text-800">
                <i className="pi pi-calendar text-primary" />
                <span>Año Académico:</span>
                <span className="text-primary font-bold">
                  {propuesta.anioInicio}/{propuesta.anioInicio + 1}
                </span>
              </span>

              <span className="flex align-items-center gap-1 font-semibold text-800">
                <i className="pi pi-folder text-teal-600" />
                <span>Unidades de Trabajo:</span>
                <span className="font-bold text-900">{unidadesEditadas.length}</span>
              </span>

              <span className="flex align-items-center gap-1 font-semibold text-800">
                <i className="pi pi-clock text-orange-500" />
                <span>Días Lectivos Totales:</span>
                <span className="font-bold text-900">{propuesta.totalDiasLectivos} días</span>
              </span>

              <span className="flex align-items-center gap-1 text-color-secondary">
                <i className="pi pi-flag text-blue-500" />
                <span>Período:</span>
                <span>
                  {formatearFechaEspanol(propuesta.fechaInicioPeriodo)} — {formatearFechaEspanol(propuesta.fechaFinPeriodo)}
                </span>
              </span>

              {modificado && (
                <span className="inline-flex align-items-center gap-1 text-xs font-semibold px-2 py-1 border-round bg-blue-100 text-blue-800 border-1 border-blue-200">
                  <i className="pi pi-pencil text-xs" />
                  Personalizada con el ratón
                </span>
              )}
            </div>
          </div>

          {/* Banner informativo sobre el cálculo de ponderación aplicado */}
          {!propuesta.hayVinculosDesarrollan ? (
            <div className="surface-50 border-round-lg border-1 border-orange-300 p-2 px-3 text-xs text-800 flex align-items-center gap-2">
              <i className="pi pi-info-circle text-orange-600 text-sm flex-shrink-0" />
              <span>
                <strong>Reparto uniforme por defecto:</strong> No se han detectado Resultados de Aprendizaje asociados a las Unidades de Trabajo de este módulo. Para calcular la propuesta ponderando los pesos de los RAs y sus porcentajes, configúralos en el <em>Gestor de Unidades de Trabajo</em>.
              </span>
            </div>
          ) : (
            <div className="surface-50 border-round-lg border-1 border-teal-300 p-2 px-3 text-xs text-800 flex align-items-center gap-2">
              <i className="pi pi-check-circle text-teal-600 text-sm flex-shrink-0" />
              <span>
                <strong>Ponderación curricular activa:</strong> Los días lectivos se han calculado ponderando los pesos de cada Resultado de Aprendizaje y el porcentaje de cobertura asignado a cada Unidad de Trabajo.
              </span>
            </div>
          )}

          {/* 2. Barra interactiva de control para edición con el ratón */}
          <div className="surface-card border-round-lg border-1 surface-border p-3 shadow-1 flex flex-column gap-2">
            <div className="flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="flex flex-column gap-1">
                <div className="flex align-items-center gap-2">
                  <span className="font-bold text-xs uppercase text-color-secondary">
                    Unidad activa para edición:
                  </span>
                  {utActiva && (
                    <span
                      className="inline-flex align-items-center gap-2 px-3 py-1 border-round-lg text-xs font-bold text-white shadow-1"
                      style={{ backgroundColor: utActiva.color?.fondo || '#2563eb' }}
                    >
                      <span>{formatearNumeroUT(utActiva.unidad_trabajo?.numero || utActiva.orden)}</span>
                      <span className="font-normal opacity-90">• {utActiva.unidad_trabajo?.nombre || 'Unidad'}</span>
                      <Badge value={`${utActiva.numDias} días`} severity="info" className="ml-1" />
                    </span>
                  )}
                </div>

                {utActiva?.rasDesarrollados && utActiva.rasDesarrollados.length > 0 && (
                  <div className="flex align-items-center gap-1 flex-wrap mt-1">
                    <span className="text-xs text-color-secondary font-semibold">RAs desarrollados:</span>
                    {utActiva.rasDesarrollados.map((r) => (
                      <span
                        key={r.id_ra}
                        className="text-xs px-2 py-0 border-round bg-blue-50 text-blue-900 border-1 border-blue-200 font-mono inline-flex align-items-center gap-1"
                        title={`RA${r.numero}: ${r.nombre || ''} (Cubre el ${r.porcentaje}% del RA, peso RA en el curso: ${r.pesoRa}%)`}
                      >
                        <span>RA{r.numero}</span>
                        <span className="text-blue-600 font-bold">({r.porcentaje}%)</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Botones de micro-ajuste paso a paso (+ / - días) */}
              <div className="flex align-items-center gap-2">
                <span className="text-xs text-color-secondary">Ajuste fino:</span>
                <Button
                  type="button"
                  icon="pi pi-minus"
                  label="-1 día"
                  size="small"
                  severity="secondary"
                  outlined
                  onClick={() => manejarAjusteDias(-1)}
                  disabled={!utActiva || utActiva.numDias <= 1}
                  tooltip="Reducir 1 día lectivo a esta unidad"
                  tooltipOptions={{ position: 'top' }}
                />
                <Button
                  type="button"
                  icon="pi pi-plus"
                  label="+1 día"
                  size="small"
                  severity="secondary"
                  outlined
                  onClick={() => manejarAjusteDias(1)}
                  disabled={!utActiva}
                  tooltip="Añadir 1 día lectivo a esta unidad"
                  tooltipOptions={{ position: 'top' }}
                />
              </div>
            </div>

            <div className="text-xs text-color-secondary flex align-items-center gap-2 pt-1 border-top-1 surface-border">
              <i className="pi pi-mouse text-primary" />
              <span>
                <strong>Cómo interactuar con el ratón:</strong> Haz clic en una unidad para activarla. A continuación,{' '}
                <strong>haz clic sobre un día escolar</strong> o <strong>arrastra el ratón</strong> a lo largo del calendario para definir su rango lectivo.
              </span>
            </div>
          </div>

          {/* 3. Leyenda cromática interactiva de Unidades de Trabajo */}
          <div className="surface-card border-round-lg border-1 surface-border p-3 shadow-1">
            <span className="font-bold text-xs uppercase text-color-secondary block mb-2">
              Unidades Didácticas (Haz clic en una para activarla)
            </span>
            <div className="flex flex-wrap gap-2">
              {unidadesEditadas.map((u) => {
                const esActiva = String(u.id_ut) === String(utActivaId);
                const nombreCorto = u.unidad_trabajo?.nombre || 'UT';
                const rangoTexto = `${formatearFechaEspanol(u.fecha_ini_prevista)} - ${formatearFechaEspanol(u.fecha_fin_prevista)}`;

                return (
                  <button
                    key={`leyenda-ut-${u.id_ut}`}
                    type="button"
                    onClick={() => setUtActivaId(u.id_ut)}
                    className={`inline-flex align-items-center gap-2 px-3 py-1 border-round-lg text-xs font-semibold cursor-pointer border-none transition-all transition-duration-150 ${
                      esActiva ? 'shadow-3' : 'shadow-1 opacity-90 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: u.color.fondo,
                      color: u.color.texto,
                      boxShadow: esActiva ? '0 0 0 2px #ffffff, 0 0 0 4px #10b981' : undefined,
                      transform: esActiva ? 'scale(1.04)' : undefined
                    }}
                    title={`Hacer clic para activar UT ${u.unidad_trabajo?.numero || u.orden}: ${nombreCorto} (${u.numDias} días lectivos, ${u.porcentaje}%)${
                      u.rasDesarrollados && u.rasDesarrollados.length > 0
                        ? ' • RAs: ' + u.rasDesarrollados.map((r) => `RA${r.numero} (${r.porcentaje}%)`).join(', ')
                        : ''
                    }`}
                  >
                    {esActiva && <i className="pi pi-check-circle text-xs" />}
                    <span>{formatearNumeroUT(u.unidad_trabajo?.numero || u.orden)}</span>
                    <span className="opacity-80">({u.porcentaje}%)</span>
                    <span className="font-normal opacity-90">• {rangoTexto}</span>
                    <span className="ml-1 opacity-75">({u.numDias} d)</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Cuadrícula interactiva de doce meses (septiembre a agosto) */}
          <div className="mt-1">
            <span className="font-bold text-xs uppercase text-color-secondary block mb-2">
              Calendario Escolar de 12 Meses (Septiembre a Agosto)
            </span>
            <CalendarioPropuesta
              anioInicio={propuesta.anioInicio}
              mapaFechaUt={mapaFechaUtActual}
              conjuntoNoLectivos={propuesta.conjuntoNoLectivos}
              diasClase={propuesta.diasClase}
              utActivaId={utActivaId}
              onDiaClick={manejarDiaClick}
              onRangoSeleccionado={manejarRangoSeleccionado}
              onSeleccionarUt={setUtActivaId}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default DialogoPropuestaTemporizacion;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import CalendarioPropuesta from './CalendarioPropuesta.jsx';
import { formatearFechaEspanol } from '../../utils/fechas.js';
import { formatearNumeroUT } from '../../utils/formatoUT.js';
import {
  PALETA_COLORES_UT,
  recalcularPropuestaDesdeFronteras,
  ajustarDiasUnidad,
  asignarRangoAUnidad,
  ajustarFronteraPorClick
} from './gestorPropuestaFechas.js';

/**
 * SeccionCalendarioTemporizacion - Sección integrada en la página con el calendario escolar interactivo.
 *
 * Responsabilidad Única: Renderizar la cuadrícula de 12 meses (septiembre a agosto) en la página principal,
 * reflejando la configuración actual de temporización y permitiendo editar las fechas directamente con el ratón
 * (mediante clics, arrastres o botones de ajuste) con propagación reactiva en vivo a todas las secciones.
 *
 * @param {Object} props
 * @param {Array<Object>} props.temporizaciones - Lista de unidades de la clase con sus fechas.
 * @param {Array<Object>} [props.diasClase=[]] - Lista cronológica de días lectivos del curso.
 * @param {Set} [props.conjuntoNoLectivos=new Set()] - Conjunto de fechas festivas o no lectivas.
 * @param {number} [props.anioInicio=2026] - Año inicial del curso.
 * @param {boolean} [props.guardando=false] - Indicador de persistencia en proceso.
 * @param {Function} props.onGuardarFechas - Callback para persistir las fechas modificadas en la base de datos.
 * @param {Function} [props.onCambioEnVivo] - Callback para reflejar cambios en tiempo real en la tabla y Gantt.
 */
export const SeccionCalendarioTemporizacion = ({
  temporizaciones = [],
  diasClase = [],
  conjuntoNoLectivos = new Set(),
  anioInicio = 2026,
  guardando = false,
  onGuardarFechas,
  onCambioEnVivo
}) => {
  const [unidadesLocales, setUnidadesLocales] = useState([]);
  const [mapaFechaUt, setMapaFechaUt] = useState(new Map());
  const [boundaries, setBoundaries] = useState([]);
  const [utActivaId, setUtActivaId] = useState(null);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);

  // Inicialización o sincronización cuando cambian las temporizaciones del servidor o de la tabla.
  const sincronizarConServidor = useCallback(() => {
    if (!temporizaciones || temporizaciones.length === 0 || diasClase.length === 0) {
      setUnidadesLocales([]);
      setMapaFechaUt(new Map());
      setBoundaries([]);
      setUtActivaId(null);
      setCambiosPendientes(false);
      return;
    }

    const unidadesBase = temporizaciones.map((temp, index) => {
      const color = PALETA_COLORES_UT[index % PALETA_COLORES_UT.length];
      return {
        id_temporizacion: temp.id_temporizacion,
        id_ut: temp.id_ut,
        orden: temp.orden,
        unidad_trabajo: temp.unidad_trabajo,
        fecha_ini_prevista: temp.fecha_ini_prevista || null,
        fecha_fin_prevista: temp.fecha_fin_prevista || null,
        color
      };
    });

    // Se verifica si la clase tiene alguna fecha planificada registrada
    const tieneFechasPlanificadas = unidadesBase.some(
      (u) => Boolean(u.fecha_ini_prevista && u.fecha_fin_prevista)
    );

    // Caso 1: No existe temporización configurada todavía (o fue borrada por completo)
    if (!tieneFechasPlanificadas) {
      const unidadesVacias = unidadesBase.map((u) => ({
        ...u,
        fecha_ini_prevista: null,
        fecha_fin_prevista: null,
        numDias: 0,
        porcentaje: 0,
        diasISO: []
      }));

      setBoundaries([]);
      setUnidadesLocales(unidadesVacias);
      setMapaFechaUt(new Map());
      setUtActivaId((prev) => prev || unidadesVacias[0]?.id_ut || null);
      setCambiosPendientes(false);
      return;
    }

    // Caso 2: Existen fechas planificadas: se calcula el mapa de días lectivos y las fronteras
    const M = diasClase.length;
    const N = unidadesBase.length;
    const limitesIniciales = [];

    for (let i = 0; i < N - 1; i += 1) {
      let idx = diasClase.findIndex((d) => d.fechaISO === unidadesBase[i].fecha_fin_prevista);
      if (idx === -1) {
        idx = Math.floor(((i + 1) / N) * M) - 1;
      }
      limitesIniciales.push(idx);
    }

    const { unidades, mapaFechaUt: nuevoMapa, boundaries: bValidos } = recalcularPropuestaDesdeFronteras(
      limitesIniciales,
      unidadesBase,
      diasClase
    );

    setBoundaries(bValidos);
    setUnidadesLocales(unidades);
    setMapaFechaUt(nuevoMapa);
    setUtActivaId((prev) => prev || unidades[0]?.id_ut || null);
    setCambiosPendientes(false);
  }, [temporizaciones, diasClase]);

  useEffect(() => {
    sincronizarConServidor();
  }, [sincronizarConServidor]);

  // Identificación del índice de la Unidad de Trabajo activa para edición.
  const indiceUtActiva = useMemo(() => {
    if (!utActivaId || !unidadesLocales) return 0;
    const idx = unidadesLocales.findIndex((u) => String(u.id_ut) === String(utActivaId));
    return idx !== -1 ? idx : 0;
  }, [utActivaId, unidadesLocales]);

  const utActiva = unidadesLocales[indiceUtActiva] || null;

  // Obtención de límites seguros (si estaba vacío, inicializa una partición base de días).
  const obtenerLimitesSeguros = () => {
    const N = unidadesLocales.length;
    const M = diasClase.length;
    if (boundaries && boundaries.length === N - 1 && boundaries.length > 0) {
      return boundaries;
    }
    const b = [];
    for (let i = 0; i < N - 1; i += 1) {
      b.push(Math.floor(((i + 1) / N) * M) - 1);
    }
    return b;
  };

  // Manejo del ajuste fino (+/- 1 día lectivo).
  const manejarAjusteDias = (delta) => {
    if (diasClase.length === 0 || unidadesLocales.length === 0) return;

    const bSeguros = obtenerLimitesSeguros();
    const resultado = ajustarDiasUnidad(
      bSeguros,
      indiceUtActiva,
      delta,
      unidadesLocales,
      diasClase
    );

    if (resultado?.unidades) {
      setBoundaries(resultado.boundaries);
      setUnidadesLocales(resultado.unidades);
      setMapaFechaUt(resultado.mapaFechaUt);
      setCambiosPendientes(true);
      if (onCambioEnVivo) onCambioEnVivo(resultado.unidades);
    }
  };

  // Manejo de la selección de un rango arrastrando con el ratón.
  const manejarRangoSeleccionado = (startIdx, endIdx) => {
    if (diasClase.length === 0 || unidadesLocales.length === 0) return;

    const bSeguros = obtenerLimitesSeguros();
    const resultado = asignarRangoAUnidad(
      bSeguros,
      indiceUtActiva,
      startIdx,
      endIdx,
      unidadesLocales,
      diasClase
    );

    if (resultado?.unidades) {
      setBoundaries(resultado.boundaries);
      setUnidadesLocales(resultado.unidades);
      setMapaFechaUt(resultado.mapaFechaUt);
      setCambiosPendientes(true);
      if (onCambioEnVivo) onCambioEnVivo(resultado.unidades);
    }
  };

  // Manejo del clic directo en un día lectivo escolar.
  const manejarDiaClick = (_fechaISO, diaIdx) => {
    if (diasClase.length === 0 || unidadesLocales.length === 0) return;

    const bSeguros = obtenerLimitesSeguros();
    const resultado = ajustarFronteraPorClick(
      bSeguros,
      indiceUtActiva,
      diaIdx,
      unidadesLocales,
      diasClase
    );

    if (resultado?.unidades) {
      setBoundaries(resultado.boundaries);
      setUnidadesLocales(resultado.unidades);
      setMapaFechaUt(resultado.mapaFechaUt);
      setCambiosPendientes(true);
      if (onCambioEnVivo) onCambioEnVivo(resultado.unidades);
    }
  };

  // Guardado de las fechas modificadas en la base de datos.
  const manejarGuardar = async () => {
    if (onGuardarFechas && unidadesLocales.length > 0) {
      await onGuardarFechas(unidadesLocales);
      setCambiosPendientes(false);
    }
  };

  if (temporizaciones.length === 0) {
    return null;
  }

  const tieneFechas = mapaFechaUt.size > 0;

  return (
    <div className="surface-card border-round border-1 surface-border shadow-1 p-3 mb-4">
      {/* Cabecera de la sección del calendario */}
      <div className="flex align-items-center justify-content-between mb-3 pb-2 border-bottom-1 surface-border flex-wrap gap-2">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-calendar text-primary text-xl" />
          <div>
            <div className="flex align-items-center gap-2">
              <h3 className="m-0 text-base font-bold text-900">
                Calendario Escolar Anual (Configuración Actual de Temporización)
              </h3>
              {cambiosPendientes && (
                <span className="inline-flex align-items-center gap-1 text-xs font-semibold px-2 py-0 border-round bg-yellow-100 text-yellow-800 border-1 border-yellow-300">
                  <i className="pi pi-exclamation-circle text-xs" />
                  Cambios pendientes de guardar
                </span>
              )}
            </div>
            <span className="text-xs text-color-secondary">
              {tieneFechas
                ? 'Haz clic en una unidad para activarla y arrastra o haz clic sobre los días escolares para modificar su rango.'
                : 'Calendario escolar sin fechas asignadas. Selecciona una unidad y marca días para comenzar la planificación.'}
            </span>
          </div>
        </div>

        {/* Botones de acción del calendario: Guardar y Deshacer */}
        <div className="flex align-items-center gap-2">
          {cambiosPendientes && (
            <Button
              type="button"
              label="Deshacer cambios"
              icon="pi pi-undo"
              severity="secondary"
              text
              size="small"
              onClick={sincronizarConServidor}
              disabled={guardando}
            />
          )}

          <Button
            type="button"
            label="Guardar Calendario"
            icon="pi pi-check"
            severity="primary"
            size="small"
            onClick={manejarGuardar}
            loading={guardando}
            disabled={!cambiosPendientes}
            tooltip="Guardar las fechas editadas en la base de datos"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      {/* Aviso informativo cuando no existen fechas planificadas */}
      {!tieneFechas && !cambiosPendientes && (
        <div className="surface-100 border-round p-3 mb-3 flex align-items-center gap-2 text-sm text-700">
          <i className="pi pi-info-circle text-primary text-base" />
          <span>
            Esta clase aún no tiene fechas planificadas. Puedes utilizar el botón <strong>Propuesta</strong> superior para calcularlas según los Resultados de Aprendizaje, o hacer clic/arrastrar con el ratón sobre los días del calendario para asignarlas manualmente.
          </span>
        </div>
      )}

      {/* Barra de control para la unidad activa y micro-ajustes */}
      <div className="surface-50 border-round-lg border-1 surface-border p-2 mb-3 flex align-items-center justify-content-between flex-wrap gap-2">
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
              <Badge
                value={utActiva.numDias > 0 ? `${utActiva.numDias} días` : 'Sin fechas'}
                severity={utActiva.numDias > 0 ? 'info' : 'secondary'}
                className="ml-1"
              />
            </span>
          )}
        </div>

        {/* Botones de ajuste paso a paso */}
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
            disabled={!utActiva || utActiva.numDias <= 1 || guardando}
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
            disabled={!utActiva || guardando}
            tooltip="Añadir 1 día lectivo a esta unidad"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      {/* Leyenda interactiva de Unidades de Trabajo */}
      <div className="mb-3">
        <span className="font-bold text-xs uppercase text-color-secondary block mb-2">
          Unidades Didácticas (Haz clic para activar):
        </span>
        <div className="flex flex-wrap gap-2">
          {unidadesLocales.map((u) => {
            const esActiva = String(u.id_ut) === String(utActivaId);
            const numUT = formatearNumeroUT(u.unidad_trabajo?.numero || u.orden);
            const nombreCorto = u.unidad_trabajo?.nombre || 'UT';
            const tieneRango = Boolean(u.fecha_ini_prevista && u.fecha_fin_prevista);
            const rangoTexto = tieneRango
              ? `${formatearFechaEspanol(u.fecha_ini_prevista)} - ${formatearFechaEspanol(u.fecha_fin_prevista)}`
              : 'Sin fechas asignadas';

            return (
              <button
                key={`seccion-leyenda-ut-${u.id_ut}`}
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
                title={`Hacer clic para activar ${numUT}: ${nombreCorto} (${u.numDias} días lectivos)`}
              >
                {esActiva && <i className="pi pi-check-circle text-xs" />}
                <span>{numUT}</span>
                {tieneRango && <span className="opacity-80">({u.porcentaje}%)</span>}
                <span className="font-normal opacity-90">• {rangoTexto}</span>
                {tieneRango && <span className="ml-1 opacity-75">({u.numDias} d)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cuadrícula interactiva de 12 meses */}
      <CalendarioPropuesta
        anioInicio={anioInicio}
        mapaFechaUt={mapaFechaUt}
        conjuntoNoLectivos={conjuntoNoLectivos}
        diasClase={diasClase}
        utActivaId={utActivaId}
        onDiaClick={manejarDiaClick}
        onRangoSeleccionado={manejarRangoSeleccionado}
        onSeleccionarUt={setUtActivaId}
      />
    </div>
  );
};

export default SeccionCalendarioTemporizacion;

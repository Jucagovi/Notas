import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Tooltip } from 'primereact/tooltip';
import { formatearFechaEspanol } from '../../utils/fechas.js';
import { formatearNumeroUT } from '../../utils/formatoUT.js';

// Nombres de los días de la semana en formato corto (lunes a domingo).
const DIAS_SEMANA_CORTO = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

// Nombres canónicos de los 12 meses en español comenzando en septiembre.
const NOMBRES_MESES = [
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto'
];

/**
 * CalendarioPropuesta - Visualizador y editor anual interactivo de 12 meses para la propuesta de temporización.
 *
 * Responsabilidad Única: Renderizar una cuadrícula estructurada de doce meses (septiembre a agosto)
 * destacando los días lectivos asignados a cada Unidad de Trabajo, permitiendo la interacción con el
 * ratón (clic y arrastre) para ajustar visualmente los rangos de fechas de cada unidad.
 *
 * @param {Object} props
 * @param {number} [props.anioInicio=2026] - Año inicial del curso académico.
 * @param {Map} props.mapaFechaUt - Mapa asociativo de fecha ISO ('YYYY-MM-DD') a metadatos de la UT.
 * @param {Set} [props.conjuntoNoLectivos=new Set()] - Conjunto de fechas festivas o no lectivas.
 * @param {Array<Object>} [props.diasClase=[]] - Lista completa de días lectivos ordenados cronológicamente.
 * @param {string|number|null} [props.utActivaId=null] - Identificador de la UT actualmente seleccionada para edición.
 * @param {Function} [props.onDiaClick] - Callback disparado al hacer clic sobre un día lectivo.
 * @param {Function} [props.onRangoSeleccionado] - Callback disparado al seleccionar un rango arrastrando el ratón.
 * @param {Function} [props.onSeleccionarUt] - Callback para alternar la UT activa directamente desde el calendario.
 */
export const CalendarioPropuesta = ({
  anioInicio = 2026,
  mapaFechaUt = new Map(),
  conjuntoNoLectivos = new Set(),
  diasClase = [],
  utActivaId = null,
  onDiaClick,
  onRangoSeleccionado,
  onSeleccionarUt
}) => {
  // Mapa auxiliar para localizar en O(1) la posición de cualquier fecha en el array de días lectivos.
  const mapaIndiceDias = useMemo(() => {
    const mapa = new Map();
    (diasClase || []).forEach((item, idx) => {
      mapa.set(item.fechaISO, idx);
    });
    return mapa;
  }, [diasClase]);

  // Estado del arrastre interactivo con el ratón.
  const [arrastrando, setArrastrando] = useState(false);
  const [indiceInicioArrastre, setIndiceInicioArrastre] = useState(null);
  const [indiceActualArrastre, setIndiceActualArrastre] = useState(null);

  const arrastrandoRef = useRef(false);
  const inicioArrastreRef = useRef(null);
  const actualArrastreRef = useRef(null);

  arrastrandoRef.current = arrastrando;
  inicioArrastreRef.current = indiceInicioArrastre;
  actualArrastreRef.current = indiceActualArrastre;

  // Manejo de la finalización global del arrastre al soltar el ratón en cualquier punto de la ventana.
  useEffect(() => {
    const manejarMouseUpGlobal = () => {
      if (arrastrandoRef.current) {
        const start = inicioArrastreRef.current;
        const current = actualArrastreRef.current;

        if (start !== null && current !== null) {
          const a = Math.min(start, current);
          const b = Math.max(start, current);

          if (a === b) {
            const fechaISO = diasClase[a]?.fechaISO;
            if (fechaISO && onDiaClick) {
              onDiaClick(fechaISO, a);
            }
          } else if (onRangoSeleccionado) {
            onRangoSeleccionado(a, b);
          }
        }

        setArrastrando(false);
        setIndiceInicioArrastre(null);
        setIndiceActualArrastre(null);
      }
    };

    window.addEventListener('mouseup', manejarMouseUpGlobal);
    return () => {
      window.removeEventListener('mouseup', manejarMouseUpGlobal);
    };
  }, [diasClase, onDiaClick, onRangoSeleccionado]);

  // Manejador del inicio del arrastre al pulsar el botón principal del ratón.
  const iniciarArrastre = (e, diaClaseIdx) => {
    if (e.button !== 0 || diaClaseIdx < 0) return;
    setArrastrando(true);
    setIndiceInicioArrastre(diaClaseIdx);
    setIndiceActualArrastre(diaClaseIdx);
  };

  // Manejador del avance del cursor sobre las celdas lectivas durante el arrastre.
  const avanzarArrastre = (diaClaseIdx) => {
    if (arrastrando && diaClaseIdx >= 0) {
      setIndiceActualArrastre(diaClaseIdx);
    }
  };

  // Construcción de la matriz estructurada de 12 meses (septiembre a agosto).
  const meses = useMemo(() => {
    return NOMBRES_MESES.map((nombreMes, indiceRelativo) => {
      const anio = indiceRelativo < 4 ? anioInicio : anioInicio + 1;
      const mesJS = (8 + indiceRelativo) % 12;

      const primerDia = new Date(anio, mesJS, 1);
      const totalDias = new Date(anio, mesJS + 1, 0).getDate();

      const diaSemanaPrimerDia = primerDia.getDay();
      const huecosVacios = diaSemanaPrimerDia === 0 ? 6 : diaSemanaPrimerDia - 1;

      const celdas = [];

      for (let i = 0; i < huecosVacios; i += 1) {
        celdas.push({ tipo: 'vacio', clave: `v-${indiceRelativo}-${i}` });
      }

      for (let dia = 1; dia <= totalDias; dia += 1) {
        const diaStr = String(dia).padStart(2, '0');
        const mesStr = String(mesJS + 1).padStart(2, '0');
        const fechaISO = `${anio}-${mesStr}-${diaStr}`;

        const fechaObj = new Date(anio, mesJS, dia, 0, 0, 0);
        const jsDay = fechaObj.getDay();
        const esFinSemana = jsDay === 0 || jsDay === 6;
        const esFestivo = conjuntoNoLectivos.has(fechaISO);
        const asignacionUt = mapaFechaUt.get(fechaISO) || null;
        const diaClaseIdx = mapaIndiceDias.has(fechaISO) ? mapaIndiceDias.get(fechaISO) : -1;

        celdas.push({
          tipo: 'dia',
          dia,
          fechaISO,
          esFinSemana,
          esFestivo,
          asignacionUt,
          diaClaseIdx,
          clave: `d-${fechaISO}`
        });
      }

      return {
        nombre: nombreMes,
        anio,
        celdas
      };
    });
  }, [anioInicio, mapaFechaUt, conjuntoNoLectivos, mapaIndiceDias]);

  // Rango de índices de días lectivos seleccionados temporalmente durante el arrastre.
  const rangoMin = arrastrando && indiceInicioArrastre !== null && indiceActualArrastre !== null
    ? Math.min(indiceInicioArrastre, indiceActualArrastre)
    : null;
  const rangoMax = arrastrando && indiceInicioArrastre !== null && indiceActualArrastre !== null
    ? Math.max(indiceInicioArrastre, indiceActualArrastre)
    : null;

  return (
    <div className="w-full select-none" style={{ userSelect: 'none' }}>
      {/* Tooltip interactivo global para inspección de unidades y festivos */}
      <Tooltip target="[data-pr-tooltip]" position="top" />

      {/* Cuadrícula de 12 meses (3 meses por fila en pantallas medianas/grandes) */}
      <div className="grid">
        {meses.map((mes, idxMes) => (
          <div key={`mes-${mes.nombre}-${idxMes}`} className="col-12 sm:col-6 md:col-4 lg:col-3 p-2">
            <div className="surface-card border-1 surface-border border-round-lg p-2 h-full flex flex-column shadow-1">
              {/* Encabezado del mes con año */}
              <div className="text-center font-bold text-sm text-800 pb-1 mb-2 border-bottom-1 surface-border">
                {mes.nombre} {mes.anio}
              </div>

              {/* Fila de días de la semana (L, M, X, J, V, S, D) */}
              <div className="grid grid-nogutter text-center text-xs font-semibold text-color-secondary mb-1">
                {DIAS_SEMANA_CORTO.map((diaLetra, i) => (
                  <div
                    key={`header-${idxMes}-${i}`}
                    className={`col ${i >= 5 ? 'text-400' : 'text-700'}`}
                    style={{ width: '14.28%' }}
                  >
                    {diaLetra}
                  </div>
                ))}
              </div>

              {/* Matriz de días del mes */}
              <div className="grid grid-nogutter flex-1 align-content-start">
                {mes.celdas.map((celda) => {
                  if (celda.tipo === 'vacio') {
                    return (
                      <div
                        key={celda.clave}
                        style={{ width: '14.28%', height: '26px' }}
                      />
                    );
                  }

                  const { dia, esFinSemana, esFestivo, asignacionUt, diaClaseIdx, fechaISO } = celda;

                  // 1. Caso: Fin de semana (sábado o domingo)
                  if (esFinSemana) {
                    return (
                      <div
                        key={celda.clave}
                        className="flex align-items-center justify-content-center p-1"
                        style={{ width: '14.28%', height: '26px' }}
                      >
                        <div className="w-full h-full flex align-items-center justify-content-center border-round text-xs text-400 surface-50">
                          {dia}
                        </div>
                      </div>
                    );
                  }

                  // 2. Caso: Día festivo o no lectivo
                  if (esFestivo) {
                    return (
                      <div
                        key={celda.clave}
                        className="flex align-items-center justify-content-center p-1"
                        style={{ width: '14.28%', height: '26px' }}
                      >
                        <div
                          className="w-full h-full flex align-items-center justify-content-center text-xs font-bold cursor-default"
                          style={{ color: '#dc2626' }}
                          data-pr-tooltip={`Día no lectivo / Festivo (${formatearFechaEspanol(fechaISO)})`}
                        >
                          {dia}
                        </div>
                      </div>
                    );
                  }

                  // 3. Caso: Día lectivo asignado a una Unidad de Trabajo
                  if (asignacionUt) {
                    const esUtActiva = utActivaId !== null && String(asignacionUt.id_ut) === String(utActivaId);
                    const estaEnRangoArrastre = rangoMin !== null && rangoMax !== null && diaClaseIdx >= rangoMin && diaClaseIdx <= rangoMax;

                    const numUT = formatearNumeroUT(asignacionUt.numero || asignacionUt.orden);
                    const textoTooltip = `${numUT}: ${asignacionUt.nombre} (${formatearFechaEspanol(asignacionUt.fecha_ini_prevista)} - ${formatearFechaEspanol(asignacionUt.fecha_fin_prevista)}) • Arrastra o haz clic para reasignar fechas`;

                    return (
                      <div
                        key={celda.clave}
                        className="flex align-items-center justify-content-center p-1"
                        style={{ width: '14.28%', height: '26px' }}
                        onMouseDown={(e) => iniciarArrastre(e, diaClaseIdx)}
                        onMouseEnter={() => avanzarArrastre(diaClaseIdx)}
                      >
                        <div
                          className={`w-full h-full flex align-items-center justify-content-center border-round cursor-pointer text-xs font-bold transition-all transition-duration-150 ${
                            esUtActiva ? 'shadow-3' : 'shadow-1'
                          }`}
                          style={{
                            backgroundColor: asignacionUt.color.fondo,
                            color: asignacionUt.color.texto,
                            boxShadow: estaEnRangoArrastre
                              ? '0 0 0 2px #ffffff, 0 0 0 4px var(--primary-color, #2563eb)'
                              : esUtActiva
                              ? '0 0 0 2px #ffffff, 0 0 0 3px #10b981'
                              : undefined,
                            transform: estaEnRangoArrastre ? 'scale(1.1)' : undefined,
                            zIndex: estaEnRangoArrastre ? 3 : esUtActiva ? 2 : 1
                          }}
                          data-pr-tooltip={textoTooltip}
                          onClick={() => {
                            if (onSeleccionarUt && !esUtActiva) {
                              onSeleccionarUt(asignacionUt.id_ut);
                            }
                          }}
                        >
                          {dia}
                        </div>
                      </div>
                    );
                  }

                  // 4. Caso: Día lectivo escolar sin unidad aún o fuera de rango
                  const estaEnRangoArrastreVacio = rangoMin !== null && rangoMax !== null && diaClaseIdx >= rangoMin && diaClaseIdx <= rangoMax;

                  return (
                    <div
                      key={celda.clave}
                      className="flex align-items-center justify-content-center p-1"
                      style={{ width: '14.28%', height: '26px' }}
                      onMouseDown={(e) => iniciarArrastre(e, diaClaseIdx)}
                      onMouseEnter={() => avanzarArrastre(diaClaseIdx)}
                    >
                      <div
                        className={`w-full h-full flex align-items-center justify-content-center border-round text-xs text-500 cursor-pointer ${
                          estaEnRangoArrastreVacio ? 'surface-primary text-white font-bold' : 'hover:surface-100'
                        }`}
                        style={{
                          boxShadow: estaEnRangoArrastreVacio ? '0 0 0 2px #ffffff, 0 0 0 4px var(--primary-color)' : undefined
                        }}
                        data-pr-tooltip={`Día lectivo (${formatearFechaEspanol(fechaISO)}) • Haz clic para asignar`}
                      >
                        {dia}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarioPropuesta;

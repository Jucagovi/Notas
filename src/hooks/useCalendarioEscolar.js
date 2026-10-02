import { useState, useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';
import {
  parsearFechaISO,
  formatearFechaISO,
  extraerAnioInicioCurso
} from '../utils/fechas.js';

/**
 * useCalendarioEscolar - Hook especializado para obtener los días lectivos y festivos del curso.
 *
 * Responsabilidad Única: Consultar el calendario de eventos escolares, los horarios lectivos
 * y las fechas límite del curso para estructurar la lista cronológica de días lectivos
 * y el conjunto de fechas festivas o no lectivas.
 *
 * @param {string|null} idCurso - Identificador del curso académico activo.
 * @param {string|null} idModulo - Identificador del módulo formativo asociado.
 * @param {number|string|null} anioSeleccionado - Año escolar seleccionado en los filtros.
 */
export const useCalendarioEscolar = (idCurso, idModulo, anioSeleccionado, idModuloFlexible = null) => {
  const [diasClase, setDiasClase] = useState([]);
  const [conjuntoNoLectivos, setConjuntoNoLectivos] = useState(new Set());
  const [anioInicio, setAnioInicio] = useState(2026);
  const [fechaInicioPeriodo, setFechaInicioPeriodo] = useState(null);
  const [fechaFinPeriodo, setFechaFinPeriodo] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { obtenerDatos: obtenerEventos } = useDatos('Calendario_Eventos');
  const { obtenerDatos: obtenerHorarios } = useDatos('Horarios');
  const { obtenerDatos: obtenerCursos } = useDatos('Cursos');

  const cargarCalendario = useCallback(async () => {
    if (!idCurso) {
      setDiasClase([]);
      setConjuntoNoLectivos(new Set());
      setFechaInicioPeriodo(null);
      setFechaFinPeriodo(null);
      return;
    }

    setCargando(true);
    try {
      // Se determina si existe flexibilización para unificar la bolsa horaria.
      let flexibleId = idModuloFlexible;
      if (!flexibleId) {
        const cursosPrevios = await obtenerCursos('*', (q) => q.eq('id_curso', idCurso));
        const cursoEncontrado = (cursosPrevios || []).find((c) => c.id_curso === idCurso);
        flexibleId = cursoEncontrado?.id_modulo_flexible || null;
      }

      const filtroHorarios = (q) => {
        if (idModulo && flexibleId) {
          return q.or(`id_modulo.eq.${idModulo},id_modulo.eq.${flexibleId}`);
        }
        return q.eq('id_modulo', idModulo);
      };

      // Consulta concurrente de los eventos del calendario, horarios y datos del curso.
      const [eventosCalendario, horariosClase, datosCursos] = await Promise.all([
        obtenerEventos('*'),
        idModulo ? obtenerHorarios('*', filtroHorarios) : Promise.resolve([]),
        obtenerCursos('*', (q) => q.eq('id_curso', idCurso))
      ]);

      const cursoActual = (datosCursos || []).find((c) => c.id_curso === idCurso) || null;
      const anio = anioSeleccionado ? Number(anioSeleccionado) : extraerAnioInicioCurso(cursoActual);
      setAnioInicio(anio);

      // Determinación de las fechas límites oficiales del período escolar.
      let fIni = cursoActual?.fecha_inicio
        ? parsearFechaISO(cursoActual.fecha_inicio)
        : new Date(anio, 8, 15);
      let fFin = cursoActual?.fecha_fin
        ? parsearFechaISO(cursoActual.fecha_fin)
        : new Date(anio + 1, 5, 22);

      if (!fIni || isNaN(fIni.getTime())) fIni = new Date(anio, 8, 15);
      if (!fFin || isNaN(fFin.getTime())) fFin = new Date(anio + 1, 5, 22);

      setFechaInicioPeriodo(fIni);
      setFechaFinPeriodo(fFin);

      // Conjunto de días festivos o no lectivos declarados en el calendario escolar.
      const noLectivos = new Set();
      (eventosCalendario || []).forEach((ev) => {
        if (ev.es_lectivo === false && ev.fecha_inicio) {
          const ini = parsearFechaISO(ev.fecha_inicio);
          const fin = ev.fecha_fin ? parsearFechaISO(ev.fecha_fin) : ini;
          if (ini && fin && !isNaN(ini.getTime()) && !isNaN(fin.getTime())) {
            const iter = new Date(ini);
            while (iter <= fin) {
              noLectivos.add(formatearFechaISO(iter));
              iter.setDate(iter.getDate() + 1);
            }
          }
        }
      });
      setConjuntoNoLectivos(noLectivos);

      // Días de la semana con docencia asignada en el horario.
      const diasSemana = new Set();
      (horariosClase || []).forEach((h) => {
        if (h.dia_semana) diasSemana.add(Number(h.dia_semana));
      });

      // Si no hay horario específico registrado, se asume docencia de lunes a viernes.
      if (diasSemana.size === 0) {
        [1, 2, 3, 4, 5].forEach((d) => diasSemana.add(d));
      }

      // Matriz cronológica de días lectivos efectivos.
      const listaDias = [];
      const iter = new Date(fIni);
      while (iter <= fFin) {
        const jsDay = iter.getDay();
        const diaSemana = jsDay === 0 ? 7 : jsDay;
        const fechaISO = formatearFechaISO(iter);

        if (diaSemana !== 6 && diaSemana !== 7) {
          if (!noLectivos.has(fechaISO)) {
            if (diasSemana.has(diaSemana)) {
              listaDias.push({ fechaISO, date: new Date(iter) });
            }
          }
        }
        iter.setDate(iter.getDate() + 1);
      }

      setDiasClase(listaDias);
    } catch (err) {
      console.error('Error al cargar calendario escolar:', err);
    } finally {
      setCargando(false);
    }
  }, [idCurso, idModulo, anioSeleccionado, idModuloFlexible, obtenerEventos, obtenerHorarios, obtenerCursos]);

  useEffect(() => {
    cargarCalendario();
  }, [cargarCalendario]);

  return {
    diasClase,
    conjuntoNoLectivos,
    anioInicio,
    fechaInicioPeriodo,
    fechaFinPeriodo,
    cargando,
    recargar: cargarCalendario
  };
};

export default useCalendarioEscolar;

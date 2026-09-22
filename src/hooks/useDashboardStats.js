import { useState, useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';
import { getColorNota } from '../utils/coloresNota.js';

// Hook personalizado para obtener y computar las estadísticas globales del panel de control.
const useDashboardStats = (cursoSeleccionadoId = null) => {
  const { obtenerDatos: obtenerCursos } = useDatos('Cursos');
  const { obtenerDatos: obtenerModulos } = useDatos('Modulos');
  const { obtenerDatos: obtenerDiscentes } = useDatos('Discentes');
  const { obtenerDatos: obtenerImparte } = useDatos('imparte');
  const { obtenerDatos: obtenerEvaluaciones } = useDatos('Evaluaciones');
  const { obtenerDatos: obtenerEvaluan } = useDatos('evaluan');

  const [cursos, setCursos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [estadisticas, setEstadisticas] = useState({
    totalDiscentes: 0,
    totalCursos: 0,
    totalModulos: 0,
    notaMediaGlobal: null,
    tasaAprobados: null,
    totalAprobados: 0,
    totalSuspensos: 0,
    tieneCalificaciones: false,
    tieneDatos: false,
    datosGraficoModulos: null,
    datosGraficoDistribucion: null
  });

  // Se calculan las métricas procesando los registros obtenidos de la base de datos.
  const cargarEstadisticas = useCallback(async () => {
    setCargando(true);
    setError(null);

    try {
      // Se obtienen las entidades maestras mediante el hook useDatos.
      const listaCursos = await obtenerCursos('id_curso, nombre, anyo, centro', (q) =>
        q.order('nombre')
      );
      setCursos(listaCursos || []);

      const listaModulos = await obtenerModulos('id_modulo, nombre, siglas');
      const listaDiscentes = await obtenerDiscentes('id_discente, nombre, apellidos, NIA, activo', (q) =>
        q.eq('activo', true)
      );

      // Se obtienen las asignaciones y evaluaciones según el filtro de curso.
      const filtroImparte = cursoSeleccionadoId
        ? (q) => q.eq('id_curso', cursoSeleccionadoId)
        : null;
      const listaImparte = await obtenerImparte('id_curso, id_modulo, id_discente', filtroImparte);

      const filtroEvaluaciones = cursoSeleccionadoId
        ? (q) => q.eq('id_curso', cursoSeleccionadoId)
        : null;
      const listaEvaluaciones = await obtenerEvaluaciones(
        'id_evaluacion, nombre, id_curso, id_modulo',
        filtroEvaluaciones
      );

      // Se obtienen las calificaciones registradas.
      let listaCalificaciones = [];
      if (listaEvaluaciones && listaEvaluaciones.length > 0) {
        const idsEvaluaciones = listaEvaluaciones.map((e) => e.id_evaluacion);
        listaCalificaciones = await obtenerEvaluan('id_evaluan, nota, id_evaluacion, id_discente', (q) =>
          q.in('id_evaluacion', idsEvaluaciones)
        );
      } else if (!cursoSeleccionadoId) {
        listaCalificaciones = await obtenerEvaluan('id_evaluan, nota, id_evaluacion, id_discente');
      }

      // Se filtran solo las notas válidas numéricas entre 0 y 100.
      const notasValidas = (listaCalificaciones || [])
        .map((item) => Number(item.nota))
        .filter((nota) => !Number.isNaN(nota) && nota >= 0 && nota <= 100);

      // 1. Cálculo de total de discentes activos.
      let totalDiscentesActivos = 0;
      if (cursoSeleccionadoId) {
        const idsDiscentesEnCurso = new Set((listaImparte || []).map((i) => i.id_discente));
        totalDiscentesActivos = (listaDiscentes || []).filter((d) =>
          idsDiscentesEnCurso.has(d.id_discente)
        ).length;
      } else {
        totalDiscentesActivos = (listaDiscentes || []).length;
      }

      // 2. Cálculo de módulos activos.
      let totalModulosActivos = 0;
      if (cursoSeleccionadoId) {
        const idsModulosEnCurso = new Set([
          ...(listaImparte || []).map((i) => i.id_modulo),
          ...(listaEvaluaciones || []).map((e) => e.id_modulo)
        ]);
        totalModulosActivos = idsModulosEnCurso.size;
      } else {
        totalModulosActivos = (listaModulos || []).length;
      }

      // 3. Cálculo de nota media global y porcentaje de aprobados.
      let notaMediaGlobal = null;
      let tasaAprobados = null;
      let totalAprobados = 0;
      let totalSuspensos = 0;

      if (notasValidas.length > 0) {
        const suma = notasValidas.reduce((acumulado, n) => acumulado + n, 0);
        notaMediaGlobal = Number((suma / notasValidas.length).toFixed(2));

        totalAprobados = notasValidas.filter((n) => n >= 50).length;
        totalSuspensos = notasValidas.filter((n) => n < 50).length;
        tasaAprobados = Number(((totalAprobados / notasValidas.length) * 100).toFixed(1));
      }

      // 4. Generación de datos para el gráfico de barras por módulo.
      let datosGraficoModulos = null;
      const modulosParaGrafico = cursoSeleccionadoId
        ? (listaModulos || []).filter((m) =>
            (listaEvaluaciones || []).some((e) => e.id_modulo === m.id_modulo)
          )
        : (listaModulos || []);

      if (modulosParaGrafico.length > 0 && notasValidas.length > 0) {
        const etiquetasModulos = [];
        const mediasModulos = [];
        const coloresBarras = [];
        const coloresBordes = [];

        modulosParaGrafico.forEach((modulo) => {
          const evaluacionesModulo = (listaEvaluaciones || []).filter(
            (e) => e.id_modulo === modulo.id_modulo
          );
          const idsEvModulo = new Set(evaluacionesModulo.map((e) => e.id_evaluacion));
          const notasModulo = (listaCalificaciones || [])
            .filter((c) => idsEvModulo.has(c.id_evaluacion))
            .map((c) => Number(c.nota))
            .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 100);

          if (notasModulo.length > 0) {
            const mediaMod = Number(
              (notasModulo.reduce((acc, val) => acc + val, 0) / notasModulo.length).toFixed(2)
            );
            etiquetasModulos.push(modulo.siglas || modulo.nombre);
            mediasModulos.push(mediaMod);
            const estiloColor = getColorNota(mediaMod);
            coloresBarras.push(estiloColor.hex);
            coloresBordes.push(estiloColor.hex);
          }
        });

        if (mediasModulos.length > 0) {
          datosGraficoModulos = {
            labels: etiquetasModulos,
            datasets: [
              {
                label: 'Nota media',
                data: mediasModulos,
                backgroundColor: coloresBarras,
                borderColor: coloresBordes,
                borderWidth: 1,
                borderRadius: 4
              }
            ]
          };
        }
      }

      // 5. Generación de datos para el gráfico circular (doughnut) con tramos de notas y colores oficiales.
      let datosGraficoDistribucion = null;
      if (notasValidas.length > 0) {
        const tramos = {
          suspensos: notasValidas.filter((n) => n < 50).length,
          suficientes: notasValidas.filter((n) => n >= 50 && n < 60).length,
          bien: notasValidas.filter((n) => n >= 60 && n < 70).length,
          notables: notasValidas.filter((n) => n >= 70 && n < 90).length,
          sobresalientes: notasValidas.filter((n) => n >= 90).length
        };

        datosGraficoDistribucion = {
          labels: [
            'Suspensos (<50)',
            'Suficientes (50-59)',
            'Bien (60-69)',
            'Notables (70-89)',
            'Sobresalientes (90-100)'
          ],
          datasets: [
            {
              data: [
                tramos.suspensos,
                tramos.suficientes,
                tramos.bien,
                tramos.notables,
                tramos.sobresalientes
              ],
              backgroundColor: [
                getColorNota(40).hex,
                getColorNota(55).hex,
                getColorNota(65).hex,
                getColorNota(80).hex,
                getColorNota(95).hex
              ],
              hoverBackgroundColor: [
                getColorNota(40).hex,
                getColorNota(55).hex,
                getColorNota(65).hex,
                getColorNota(80).hex,
                getColorNota(95).hex
              ],
              borderWidth: 1
            }
          ]
        };
      }

      const tieneDatos =
        (listaCursos && listaCursos.length > 0) ||
        (listaDiscentes && listaDiscentes.length > 0) ||
        (listaModulos && listaModulos.length > 0);

      setEstadisticas({
        totalDiscentes: totalDiscentesActivos,
        totalCursos: (listaCursos || []).length,
        totalModulos: totalModulosActivos,
        notaMediaGlobal,
        tasaAprobados,
        totalAprobados,
        totalSuspensos,
        tieneCalificaciones: notasValidas.length > 0,
        tieneDatos,
        datosGraficoModulos,
        datosGraficoDistribucion
      });
    } catch (err) {
      console.error('Error al calcular estadísticas del dashboard:', err);
      setError('No fue posible cargar las estadísticas del panel.');
    } finally {
      setCargando(false);
    }
  }, [
    cursoSeleccionadoId,
    obtenerCursos,
    obtenerModulos,
    obtenerDiscentes,
    obtenerImparte,
    obtenerEvaluaciones,
    obtenerEvaluan
  ]);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  return {
    ...estadisticas,
    cursos,
    cargando,
    error,
    recargar: cargarEstadisticas
  };
};

export default useDashboardStats;

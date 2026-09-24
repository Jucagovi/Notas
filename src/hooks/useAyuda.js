import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PASOS_GUIA_INICIO,
  TEMAS_MANUAL_COMPLEJO,
  CATEGORIAS_MANUAL
} from '../components/ayuda/datosAyuda.js';

/**
 * Custom Hook para la gestión del estado, navegación y filtrado del Centro de Ayuda.
 *
 * Responsabilidad Única: Centralizar la sincronización de pestañas activas,
 * el paso activo del Stepper en la guía de inicio, la selección y modo de visualización
 * del manual de conceptos complejos, y el filtrado en memoria sin peticiones de red.
 */
const useAyuda = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Se determina la pestaña inicial según el parámetro opcional de la URL.
  const pestanyaUrl = searchParams.get('seccion');
  const [indicePestanya, setIndicePestanya] = useState(
    pestanyaUrl === 'manual' ? 1 : 0
  );

  // Estado del paso activo en el Stepper (0 a 6).
  const [pasoActivo, setPasoActivo] = useState(0);

  // Estados locales para la barra de búsqueda y el filtro de categorías.
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');

  // Estado para el tema seleccionado en la vista Maestro-Detalle del manual.
  const [temaSeleccionadoId, setTemaSeleccionadoId] = useState(
    TEMAS_MANUAL_COMPLEJO[0]?.id || null
  );

  // Modo de visualización del manual: 'maestroDetalle' (recomendada) o 'tarjetas'.
  const [modoVistaManual, setModoVistaManual] = useState('maestroDetalle');

  // Se actualiza la pestaña activa y se refleja en la URL para permitir compartir enlaces directos.
  const cambiarPestanya = (nuevoIndice) => {
    setIndicePestanya(nuevoIndice);
    const nuevosParams = new URLSearchParams(searchParams);
    if (nuevoIndice === 1) {
      nuevosParams.set('seccion', 'manual');
    } else {
      nuevosParams.delete('seccion');
    }
    setSearchParams(nuevosParams, { replace: true });
  };

  // Se filtran los pasos de la Guía de Inicio según el término de búsqueda.
  const pasosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) {
      return PASOS_GUIA_INICIO;
    }
    const query = terminoBusqueda.toLowerCase();
    return PASOS_GUIA_INICIO.filter(
      (paso) =>
        paso.titulo.toLowerCase().includes(query) ||
        paso.subtitulo.toLowerCase().includes(query) ||
        paso.descripcion.toLowerCase().includes(query) ||
        paso.tareas.some((t) => t.toLowerCase().includes(query)) ||
        paso.tablas.some((tb) => tb.toLowerCase().includes(query))
    );
  }, [terminoBusqueda]);

  // Se filtran los temas del Manual de Módulos Complejos por texto y categoría.
  const temasFiltrados = useMemo(() => {
    const query = terminoBusqueda.trim().toLowerCase();

    return TEMAS_MANUAL_COMPLEJO.filter((tema) => {
      const coincideCategoria =
        categoriaSeleccionada === 'Todas' ||
        tema.categoria === categoriaSeleccionada;

      if (!coincideCategoria) {
        return false;
      }

      if (!query) {
        return true;
      }

      const coincideTitulo =
        tema.titulo.toLowerCase().includes(query) ||
        tema.tituloLargo.toLowerCase().includes(query);
      const coincideResumen = tema.resumen.toLowerCase().includes(query);
      const coincideSecciones = tema.secciones.some(
        (sec) =>
          sec.subtitulo.toLowerCase().includes(query) ||
          sec.texto.toLowerCase().includes(query)
      );

      return coincideTitulo || coincideResumen || coincideSecciones;
    });
  }, [terminoBusqueda, categoriaSeleccionada]);

  // Se ajusta el tema seleccionado al filtrar si el actual ya no está visible.
  useEffect(() => {
    if (temasFiltrados.length > 0) {
      const existe = temasFiltrados.some((t) => t.id === temaSeleccionadoId);
      if (!existe) {
        setTemaSeleccionadoId(temasFiltrados[0].id);
      }
    }
  }, [temasFiltrados, temaSeleccionadoId]);

  // Objeto completo del tema seleccionado actualmente.
  const temaSeleccionado = useMemo(() => {
    return (
      temasFiltrados.find((t) => t.id === temaSeleccionadoId) ||
      temasFiltrados[0] ||
      null
    );
  }, [temasFiltrados, temaSeleccionadoId]);

  // Funciones de navegación para el Stepper.
  const avanzarPaso = () => {
    if (pasoActivo < PASOS_GUIA_INICIO.length - 1) {
      setPasoActivo((prev) => prev + 1);
    }
  };

  const retrocederPaso = () => {
    if (pasoActivo > 0) {
      setPasoActivo((prev) => prev - 1);
    }
  };

  // Se restablecen los filtros a sus valores predeterminados.
  const limpiarFiltros = () => {
    setTerminoBusqueda('');
    setCategoriaSeleccionada('Todas');
  };

  return {
    indicePestanya,
    cambiarPestanya,
    pasoActivo,
    setPasoActivo,
    avanzarPaso,
    retrocederPaso,
    terminoBusqueda,
    setTerminoBusqueda,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    categoriasDisponibles: CATEGORIAS_MANUAL,
    pasosFiltrados,
    temasFiltrados,
    temaSeleccionadoId,
    setTemaSeleccionadoId,
    temaSeleccionado,
    modoVistaManual,
    setModoVistaManual,
    limpiarFiltros,
    totalPasos: PASOS_GUIA_INICIO.length,
    totalTemas: TEMAS_MANUAL_COMPLEJO.length
  };
};

export default useAyuda;

import React, { useState, useEffect, useMemo } from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import ModalConfirmacion from '../components/common/ModalConfirmacion.jsx';
import CabeceraCalendario from '../components/calendario/CabeceraCalendario.jsx';
import CalendarioInteractivo from '../components/calendario/CalendarioInteractivo.jsx';
import LeyendaCalendario from '../components/calendario/LeyendaCalendario.jsx';
import TablaEventosCalendario from '../components/calendario/TablaEventosCalendario.jsx';
import DialogoRangoEventos from '../components/calendario/DialogoRangoEventos.jsx';
import useCursos from '../hooks/useCursos.js';
import useCalendario from '../hooks/useCalendario.js';
import useGlobalToast from '../hooks/useGlobalToast.js';
import { exportarCalendarioPDF } from '../utils/exportadorCalendarioPdf.js';
import { extraerAnioInicioCurso } from '../utils/fechas.js';

/**
 * CalendarioPagina - Página orquestadora del Calendario Escolar Global (Master Planner).
 *
 * Responsabilidad Única: Actuar como orquestador del calendario escolar unificado que afecta
 * a todos los cursos y clases por igual, filtrando los eventos de 1 de septiembre a 31 de agosto
 * del año académico seleccionado a través del Dropdown de años únicos de la tabla Cursos.
 */
const CalendarioPagina = () => {
  const [anioSeleccionado, setAnioSeleccionado] = useState(null);
  const [dialogoRangoVisible, setDialogoRangoVisible] = useState(false);
  const [confirmarLimpiezaVisible, setConfirmarLimpiezaVisible] = useState(false);
  const [imprimiendoPDF, setImprimiendoPDF] = useState(false);

  const { mostrarExito, mostrarError } = useGlobalToast();

  // Consulta de la tabla Cursos para extraer la lista de años únicos registrados en la columna anyo.
  const { datos: cursos, cargando: cargandoCursos } = useCursos();

  // Se calculan los años académicos únicos con formato visual YYYY/YYYY+1 (ej. 2026 -> "2026/2027").
  const opcionesAnios = useMemo(() => {
    const aniosRegistrados = new Set();
    const lista = [];

    (cursos || []).forEach((c) => {
      const anioInicio = extraerAnioInicioCurso(c);
      if (anioInicio && !aniosRegistrados.has(anioInicio)) {
        aniosRegistrados.add(anioInicio);
        lista.push({
          label: `${anioInicio}/${anioInicio + 1}`,
          value: anioInicio
        });
      }
    });

    // Ordenación descendente por año de inicio (años más recientes primero).
    lista.sort((a, b) => b.value - a.value);

    // En caso de que no existan cursos dados de alta todavía, se provee el año escolar actual como respaldo.
    if (lista.length === 0) {
      const hoy = new Date();
      const anioBase = hoy.getMonth() < 8 ? hoy.getFullYear() - 1 : hoy.getFullYear();
      lista.push(
        { label: `${anioBase}/${anioBase + 1}`, value: anioBase },
        { label: `${anioBase + 1}/${anioBase + 2}`, value: anioBase + 1 }
      );
    }

    return lista;
  }, [cursos]);

  // Se autoselecciona el primer año académico disponible si no hay ninguno seleccionado.
  useEffect(() => {
    if (!anioSeleccionado && opcionesAnios.length > 0) {
      setAnioSeleccionado(opcionesAnios[0].value);
    }
  }, [opcionesAnios, anioSeleccionado]);

  // Hook especializado para la gestión reactiva de Calendario_Eventos de forma global.
  const {
    eventos,
    resumenLectivo,
    cargando: cargandoCalendario,
    guardando,
    agregarEvento,
    actualizarEvento,
    eliminarEvento,
    limpiarEventos,
    agregarRangoEventos
  } = useCalendario(anioSeleccionado);

  // Etiqueta legible del año activo (ej. "2024/2025").
  const etiquetaAnioActivo = useMemo(() => {
    const encontrada = opcionesAnios.find((o) => o.value === anioSeleccionado);
    return encontrada ? encontrada.label : `${anioSeleccionado}/${(anioSeleccionado || 0) + 1}`;
  }, [opcionesAnios, anioSeleccionado]);

  // Manejador para confirmar la inserción de un periodo continuo desde el diálogo.
  const manejarConfirmarRango = async (desde, hasta, tipoEvento, descripcion, soloLaborables) => {
    const exito = await agregarRangoEventos(desde, hasta, tipoEvento, descripcion, soloLaborables);
    if (exito) {
      setDialogoRangoVisible(false);
    }
  };

  // Manejador para confirmar la eliminación de los eventos del año escolar activo.
  const manejarAceptarLimpieza = async () => {
    await limpiarEventos();
    setConfirmarLimpiezaVisible(false);
  };

  // Manejador para la exportación del calendario en PDF a una sola página.
  const manejarImprimirPDF = async () => {
    const elemento = document.getElementById('bloque-impresion-calendario');
    if (!elemento) {
      mostrarError('No se encontró el contenedor del calendario para la exportación.');
      return;
    }

    setImprimiendoPDF(true);
    try {
      await exportarCalendarioPDF({
        elemento,
        anioSeleccionado,
        anyoLabel: etiquetaAnioActivo
      });
      mostrarExito('Documento PDF generado y descargado correctamente.');
    } catch (err) {
      console.error('Error al generar el PDF del calendario:', err);
      mostrarError('Ocurrió un error al intentar generar el archivo PDF.');
    } finally {
      setImprimiendoPDF(false);
    }
  };

  const estaCargando = cargandoCursos || cargandoCalendario;

  // Límites temporales para el diálogo de periodos (1 sept a 31 ago del año seleccionado).
  const fechaMinimaPeriodo = useMemo(() => {
    return anioSeleccionado ? new Date(anioSeleccionado, 8, 1) : null;
  }, [anioSeleccionado]);

  const fechaMaximaPeriodo = useMemo(() => {
    return anioSeleccionado ? new Date(anioSeleccionado + 1, 7, 31) : null;
  }, [anioSeleccionado]);

  return (
    <div className="flex flex-column w-full gap-4 pb-5">
      {/* Cabecera general de la página */}
      <HeaderPagina
        titulo="Calendario Escolar"
        descripcion="Master Planner anual unificado: festividades, periodos vacacionales, evaluaciones y fechas clave para todos los cursos y clases."
      />

      {/* 1. Cabecera con Dropdown de año académico y botones Imprimir en PDF y Añadir Periodo */}
      <CabeceraCalendario
        anioSeleccionado={anioSeleccionado}
        opcionesAnios={opcionesAnios}
        onCambiarAnio={setAnioSeleccionado}
        onImprimirPDF={manejarImprimirPDF}
        onAbrirDialogoRango={() => setDialogoRangoVisible(true)}
        guardando={guardando}
        imprimiendo={imprimiendoPDF}
        resumenLectivo={resumenLectivo}
        cargando={estaCargando}
      />

      {/* Bloque imprimible que engloba la Leyenda superior y el FullCalendar para el PDF */}
      <div id="bloque-impresion-calendario" className="flex flex-column gap-3 w-full">
        {/* 2. Leyenda oficial de tipos de evento y colores (situada sobre el calendario escolar) */}
        <LeyendaCalendario />

        {/* 3. Calendario interactivo Master Planner mostrando doce meses (septiembre a agosto) */}
        <CalendarioInteractivo
          eventos={eventos}
          anioSeleccionado={anioSeleccionado || new Date().getFullYear()}
          onAgregarEvento={agregarEvento}
          onActualizarEvento={actualizarEvento}
          onEliminarEvento={eliminarEvento}
          guardando={guardando}
        />
      </div>

      {/* 4. Tabla de eventos registrados para consulta, filtrado y edición */}
      <TablaEventosCalendario
        eventos={eventos}
        onEliminar={eliminarEvento}
        onLimpiarTodo={() => setConfirmarLimpiezaVisible(true)}
        cargando={estaCargando}
        disabled={guardando}
      />

      {/* Diálogo modal para incorporar periodos continuos */}
      <DialogoRangoEventos
        visible={dialogoRangoVisible}
        onOcultar={() => setDialogoRangoVisible(false)}
        onConfirmar={manejarConfirmarRango}
        fechaMinima={fechaMinimaPeriodo}
        fechaMaxima={fechaMaximaPeriodo}
        cargando={guardando}
      />

      {/* Diálogo modal de confirmación para el borrado masivo de eventos del año */}
      <ModalConfirmacion
        visible={confirmarLimpiezaVisible}
        onHide={() => setConfirmarLimpiezaVisible(false)}
        onAceptar={manejarAceptarLimpieza}
        onCancelar={() => setConfirmarLimpiezaVisible(false)}
        header="Limpiar Eventos del Año Escolar"
        message={`¿Desea eliminar todos los eventos registrados para el curso escolar ${etiquetaAnioActivo}? Esta acción no se puede deshacer.`}
        acceptLabel="Eliminar Todo"
        rejectLabel="Cancelar"
      />
    </div>
  );
};

export default CalendarioPagina;

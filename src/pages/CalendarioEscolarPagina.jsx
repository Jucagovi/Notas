import React, { useState, useEffect } from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import CargadorSeccion from '../components/common/CargadorSeccion.jsx';
import EstadoVacio from '../components/common/EstadoVacio.jsx';
import ModalConfirmacion from '../components/common/ModalConfirmacion.jsx';
import CabeceraCalendario from '../components/calendario/CabeceraCalendario.jsx';
import MatrizCalendario from '../components/calendario/MatrizCalendario.jsx';
import PanelDetalleFestivos from '../components/calendario/PanelDetalleFestivos.jsx';
import LeyendaCalendario from '../components/calendario/LeyendaCalendario.jsx';
import GuiaUsoCalendario from '../components/calendario/GuiaUsoCalendario.jsx';
import DialogoRangoFestivos from '../components/calendario/DialogoRangoFestivos.jsx';
import DialogoCopiarFestivos from '../components/calendario/DialogoCopiarFestivos.jsx';
import useCursos from '../hooks/useCursos.js';
import useCalendarioEscolar from '../hooks/useCalendarioEscolar.js';

/**
 * CalendarioEscolarPagina - Página orquestadora del caso de uso 29 (Calendario Escolar).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador de datos y vistas para definir el marco
 * temporal anual del curso (fecha de inicio y fin) y los días no lectivos (festivos y vacaciones)
 * dispuestos en una estructura secuencial de columna única.
 */
const CalendarioEscolarPagina = () => {
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [dialogoRangoVisible, setDialogoRangoVisible] = useState(false);
  const [dialogoCopiarVisible, setDialogoCopiarVisible] = useState(false);
  const [confirmarLimpiezaVisible, setConfirmarLimpiezaVisible] = useState(false);

  // Se obtienen los cursos académicos disponibles mediante el hook especializado.
  const { datos: cursos, cargando: cargandoCursos } = useCursos();

  // Se autoselecciona el primer curso académico disponible al completar la carga.
  useEffect(() => {
    if (!cursoSeleccionadoId && cursos && cursos.length > 0) {
      setCursoSeleccionadoId(cursos[0].id_curso);
    }
  }, [cursos, cursoSeleccionadoId]);

  // Hook que aísla la carga, gestión y persistencia del calendario escolar en Supabase.
  const {
    cursoActual,
    fechaInicio,
    fechaFin,
    festivos,
    fechasSeleccionadas,
    resumenLectivo,
    cargando: cargandoCalendario,
    guardando,
    haCambiado,
    setFechaInicio,
    setFechaFin,
    actualizarFechasCalendario,
    actualizarDescripcionFestivo,
    conmutarFestivo,
    agregarFestivo,
    eliminarFestivo,
    agregarRangoFestivos,
    limpiarFestivos,
    copiarFestivosDesdeCurso,
    guardarCalendario
  } = useCalendarioEscolar(cursoSeleccionadoId);

  // Manejador para confirmar la adición de un periodo continuo de festivos.
  const manejarConfirmarRango = (desde, hasta, descripcion, soloLaborables) => {
    agregarRangoFestivos(desde, hasta, descripcion, soloLaborables);
    setDialogoRangoVisible(false);
  };

  // Manejador para confirmar la copia de festivos desde otro curso escolar.
  const manejarConfirmarCopia = async (cursoOrigenId, opciones) => {
    const exito = await copiarFestivosDesdeCurso(cursoOrigenId, opciones);
    if (exito) {
      setDialogoCopiarVisible(false);
    }
  };

  // Manejador para confirmar el vaciado de festivos.
  const manejarAceptarLimpieza = () => {
    limpiarFestivos();
    setConfirmarLimpiezaVisible(false);
  };

  const estaCargando = cargandoCursos || cargandoCalendario;

  return (
    <div className="flex flex-column w-full gap-4 pb-5">
      {/* Cabecera general de la página */}
      <HeaderPagina
        titulo="Calendario Escolar"
        descripcion="Definición de las fechas oficiales de inicio y fin de las clases e identificación de festivos y días no lectivos."
      />

      {/* Estado de carga inicial mientras se recuperan los cursos */}
      {cargandoCursos && !cursoSeleccionadoId ? (
        <CargadorSeccion tipo="formulario" filas={2} />
      ) : cursos.length === 0 ? (
        <EstadoVacio
          mensaje="No existen cursos académicos"
          descripcion="Para configurar un calendario escolar es necesario dar de alta previamente un curso académico en el sistema."
          icono="pi pi-calendar-times"
        />
      ) : (
        <>
          {/* 1. Selección del curso, fechas oficiales y acciones de guardado */}
          <CabeceraCalendario
            cursos={cursos}
            cursoId={cursoSeleccionadoId}
            onCambiarCurso={setCursoSeleccionadoId}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            onChangeFechaInicio={setFechaInicio}
            onChangeFechaFin={setFechaFin}
            onGuardar={guardarCalendario}
            onAbrirDialogoRango={() => setDialogoRangoVisible(true)}
            onAbrirDialogoCopiar={() => setDialogoCopiarVisible(true)}
            guardando={guardando}
            haCambiado={haCambiado}
            resumenLectivo={resumenLectivo}
            cargando={estaCargando}
          />

          {/* 2. Cuadrícula de calendario escolar (12 meses del curso en filas de 3 meses fijos) */}
          <MatrizCalendario
            fechasSeleccionadas={fechasSeleccionadas}
            onActualizarFechas={actualizarFechasCalendario}
            onConmutarFestivo={conmutarFestivo}
            onEliminarFestivo={eliminarFestivo}
            onAgregarFestivo={agregarFestivo}
            festivos={festivos}
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            cursoActual={cursoActual}
            disabled={!cursoSeleccionadoId || guardando}
          />

          {/* 3. Días no lectivos marcados (etiquetas compactas con día/mes y motivo en tooltip) */}
          <PanelDetalleFestivos
            festivos={festivos}
            onEliminarFestivo={eliminarFestivo}
            onLimpiarFestivos={() => setConfirmarLimpiezaVisible(true)}
            onAbrirDialogoRango={() => setDialogoRangoVisible(true)}
            onAbrirDialogoCopiar={() => setDialogoCopiarVisible(true)}
            disabled={!cursoSeleccionadoId || guardando}
          />

          {/* 4. Leyenda del calendario */}
          <LeyendaCalendario />

          {/* 5. Breve explicación de uso de la sección */}
          <GuiaUsoCalendario />

          {/* Diálogo modal para añadir periodos vacacionales completos */}
          <DialogoRangoFestivos
            visible={dialogoRangoVisible}
            onOcultar={() => setDialogoRangoVisible(false)}
            onConfirmar={manejarConfirmarRango}
          />

          {/* Diálogo modal para copiar festivos desde otro curso escolar */}
          <DialogoCopiarFestivos
            visible={dialogoCopiarVisible}
            onOcultar={() => setDialogoCopiarVisible(false)}
            onConfirmar={manejarConfirmarCopia}
            cursos={cursos}
            cursoActual={cursoActual}
            cargando={guardando}
          />

          {/* Modal de confirmación para el vaciado masivo de festivos */}
          <ModalConfirmacion
            visible={confirmarLimpiezaVisible}
            onHide={() => setConfirmarLimpiezaVisible(false)}
            onAceptar={manejarAceptarLimpieza}
            onCancelar={() => setConfirmarLimpiezaVisible(false)}
            header="Limpiar Días No Lectivos"
            message="¿Desea desmarcar todos los días festivos registrados para este curso? Recuerde pulsar en 'Guardar Calendario' para consolidar los cambios en la base de datos."
            acceptLabel="Limpiar Todo"
            rejectLabel="Cancelar"
          />
        </>
      )}
    </div>
  );
};

export default CalendarioEscolarPagina;

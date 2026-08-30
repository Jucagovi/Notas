import React, { useMemo } from "react";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { getColorNota } from "../../utils/coloresNota.js";
import { formatNota } from "../../utils/formatters.js";

// Función auxiliar para formatear la fecha de nacimiento según el estándar español (DD/MM/AAAA) y calcular la edad exacta
const formatearFechaNacimientoYEdad = (fechaNacStr) => {
  if (!fechaNacStr) return null;

  try {
    const partes = fechaNacStr.split("-");
    let fechaObj;
    if (partes.length === 3) {
      const anyo = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const dia = parseInt(partes[2], 10);
      fechaObj = new Date(anyo, mes, dia);
    } else {
      fechaObj = new Date(fechaNacStr);
    }

    if (isNaN(fechaObj.getTime())) {
      return fechaNacStr;
    }

    // Formato regional para España (es-ES)
    const fechaFormateada = fechaObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Cálculo cronológico de la edad
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaObj.getFullYear();
    const mesDiff = hoy.getMonth() - fechaObj.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fechaObj.getDate())) {
      edad -= 1;
    }

    return `${fechaFormateada} (${edad} años)`;
  } catch (err) {
    console.error("Error al formatear fecha de nacimiento:", err);
    return fechaNacStr;
  }
};

// Componente de cabecera para la ficha detallada del discente con selector de curso y tarjetas KPI
const DiscenteDetalleCabecera = ({
  discente = {},
  cursosDisponibles = [],
  cursoSeleccionadoId = null,
  estadisticas = {},
  alVolver = () => {},
  alCambiarCurso = () => {},
  alRecargar = () => {},
}) => {
  const nombreCompleto =
    `${discente.nombre || ""} ${discente.apellidos || ""}`.trim() ||
    "Estudiante";
  const iniciales =
    `${(discente.nombre || "")[0] || ""}${(discente.apellidos || "")[0] || ""}`.toUpperCase() ||
    "AL";
  const esActivo = discente.activo !== false;

  // Se formatea la fecha de nacimiento con el cálculo de edad
  const textoFechaNacYEdad = useMemo(() => {
    return formatearFechaNacimientoYEdad(discente.fecha_nac);
  }, [discente.fecha_nac]);

  // Opciones formateadas para el selector desplegable de Cursos escolares
  const opcionesCursos = (cursosDisponibles || []).map((c) => ({
    label: `${c.anyo ? `[${c.anyo}] ` : ""}${c.nombre || "Curso escolar"}${c.centro ? ` - ${c.centro}` : ""}`,
    value: c.id_curso,
  }));

  const porcentajeCompletado =
    estadisticas.totalPracticas > 0
      ? Math.round(
          ((estadisticas.calificadas || 0) / estadisticas.totalPracticas) * 100,
        )
      : 0;

  const colorMediaGlobal = getColorNota(estadisticas.mediaGlobal);

  return (
    <div className='flex flex-column gap-3'>
      {/* 1. Tarjeta de información personal del discente */}
      <Card className='shadow-1 surface-card border-round'>
        <div className='flex flex-column gap-3'>
          {/* Fila superior con botón de retorno y acciones */}
          <div className='flex flex-column sm:flex-row sm:justify-content-between sm:align-items-center gap-2 pb-2 border-bottom-1 surface-border'>
            <Button
              label='Volver al listado'
              icon='pi pi-arrow-left'
              severity='secondary'
              text
              size='small'
              onClick={alVolver}
              className='p-0 font-semibold'
            />

            <div className='flex align-items-center gap-2'>
              <Button
                type='button'
                icon='pi pi-refresh'
                label='Actualizar ficha'
                size='small'
                outlined
                onClick={alRecargar}
                tooltip='Recargar expediente y calificaciones'
                tooltipOptions={{ position: "bottom" }}
              />
            </div>
          </div>

          {/* Fila de datos personales del discente */}
          <div className='flex flex-column sm:flex-row align-items-start gap-4'>
            {discente.imagen ? (
              <Avatar
                image={discente.imagen}
                shape='circle'
                size='xlarge'
                className='shadow-2 flex-shrink-0'
                style={{ width: "5rem", height: "5rem" }}
              />
            ) : (
              <Avatar
                label={iniciales}
                shape='circle'
                size='xlarge'
                className='surface-300 text-primary font-bold shadow-1 flex-shrink-0'
                style={{ width: "5rem", height: "5rem", fontSize: "1.6rem" }}
              />
            )}

            <div className='flex flex-column gap-2 flex-grow-1'>
              <div className='flex flex-wrap align-items-center gap-3'>
                <h1 className='text-2xl font-bold m-0 text-color'>
                  {nombreCompleto}
                </h1>
                <Tag
                  value={
                    esActivo ? "Matriculado Activo" : "Expediente Inactivo"
                  }
                  severity={esActivo ? "success" : "danger"}
                  icon={esActivo ? "pi pi-check-circle" : "pi pi-ban"}
                />
              </div>

              <div className='flex flex-wrap align-items-center gap-4 text-sm text-muted mt-1'>
                {discente.NIA && (
                  <span className='flex align-items-center gap-1 font-mono font-semibold'>
                    <i className='pi pi-id-card text-primary' />
                    {discente.NIA}
                  </span>
                )}
                {discente.correo && (
                  <span className='flex align-items-center gap-1'>
                    <i className='pi pi-envelope text-blue-500' />
                    {discente.correo}
                  </span>
                )}
                {discente.localidad && (
                  <span className='flex align-items-center gap-1'>
                    <i className='pi pi-map-marker text-orange-500' />
                    {discente.localidad}
                  </span>
                )}
                {textoFechaNacYEdad && (
                  <span className='flex align-items-center gap-1 font-medium text-color'>
                    <i className='pi pi-calendar text-indigo-500' />
                    {textoFechaNacYEdad}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Selector de Contexto de Curso escolar en una línea horizontal independiente */}
      <Card className='shadow-1 surface-card border-round p-0'>
        <div className='flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-3 p-3 surface-ground border-round border-1 surface-border'>
          <div className='flex align-items-center gap-3'>
            <div
              className='flex align-items-center justify-content-center border-round flex-shrink-0'
              style={{
                width: "2.5rem",
                height: "2.5rem",
                backgroundColor: "var(--primary-light)",
              }}
            >
              <i className='pi pi-graduation-cap text-primary font-bold text-lg' />
            </div>
            <div>
              <label
                htmlFor='selector-curso-escolar'
                className='text-sm font-bold text-color block'
              >
                Curso escolar:
              </label>
              <span className='text-xs text-muted'>
                Seleccione el año lectivo para consultar el historial de módulos
                y calificaciones del alumno.
              </span>
            </div>
          </div>

          <div className='w-full sm:w-22rem flex-shrink-0'>
            <Dropdown
              id='selector-curso-escolar'
              value={cursoSeleccionadoId}
              options={opcionesCursos}
              onChange={(e) => alCambiarCurso(e.value)}
              placeholder='Seleccione un curso escolar'
              className='w-full p-inputtext-sm'
            />
          </div>
        </div>
      </Card>

      {/* 3. Tarjetas KPI de resumen global para el curso seleccionado */}
      <div className='grid'>
        {/* Tarjeta: Total Prácticas */}
        <div className='col-12 sm:col-6 lg:col-3'>
          <Card className='shadow-1 h-full surface-card border-round'>
            <div className='flex justify-content-between align-items-start'>
              <div>
                <span className='text-xs font-bold text-muted block mb-1'>
                  TOTAL PRÁCTICAS
                </span>
                <span className='text-2xl font-bold text-color'>
                  {estadisticas.totalPracticas || 0}
                </span>
                <div className='text-xs text-muted mt-2'>
                  <span className='text-primary font-semibold'>
                    {estadisticas.calificadas || 0} calificadas
                  </span>{" "}
                  / {estadisticas.pendientes || 0} pendientes
                </div>
              </div>
              <div
                className='flex align-items-center justify-content-center border-round'
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  backgroundColor: "var(--primary-light)",
                }}
              >
                <i className='pi pi-file text-primary font-bold text-lg' />
              </div>
            </div>
          </Card>
        </div>

        {/* Tarjeta: Calificadas y Cobertura */}
        <div className='col-12 sm:col-6 lg:col-3'>
          <Card className='shadow-1 h-full surface-card border-round'>
            <div className='flex justify-content-between align-items-start'>
              <div className='w-full mr-2'>
                <span className='text-xs font-bold text-muted block mb-1'>
                  PROGRESO DE EVALUACIÓN
                </span>
                <span className='text-2xl font-bold text-indigo-600 mb-2 block'>
                  {porcentajeCompletado}%
                </span>
                <ProgressBar
                  value={porcentajeCompletado}
                  showValue={false}
                  style={{ height: "6px" }}
                  color='#6366f1'
                />
                <div className='text-xs text-muted mt-2'>
                  {estadisticas.calificadas || 0} de{" "}
                  {estadisticas.totalPracticas || 0} asentadas
                </div>
              </div>
              <div
                className='flex align-items-center justify-content-center border-round flex-shrink-0'
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  backgroundColor: "rgba(99, 102, 241, 0.15)",
                }}
              >
                <i className='pi pi-check-circle text-indigo-500 font-bold text-lg' />
              </div>
            </div>
          </Card>
        </div>

        {/* Tarjeta: Nota Media Global */}
        <div className='col-12 sm:col-6 lg:col-3'>
          <Card className='shadow-1 h-full surface-card border-round'>
            <div className='flex justify-content-between align-items-start'>
              <div>
                <span className='text-xs font-bold text-muted block mb-1'>
                  NOTA MEDIA GLOBAL
                </span>
                <div className='flex align-items-baseline gap-2'>
                  <span
                    className={`text-2xl font-bold ${estadisticas.mediaGlobal !== null ? colorMediaGlobal.text : "text-color"}`}
                  >
                    {estadisticas.mediaGlobal !== null &&
                    estadisticas.mediaGlobal !== undefined
                      ? formatNota(estadisticas.mediaGlobal)
                      : "-"}
                  </span>
                  {estadisticas.mediaGlobal !== null && (
                    <span className='text-xs text-muted'>/ 100</span>
                  )}
                </div>
                <div className='mt-2'>
                  <Tag
                    value={colorMediaGlobal.label}
                    className={`${colorMediaGlobal.bg} ${colorMediaGlobal.text}`}
                  />
                </div>
              </div>
              <div
                className='flex align-items-center justify-content-center border-round'
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                }}
              >
                <i className='pi pi-chart-line text-blue-500 font-bold text-lg' />
              </div>
            </div>
          </Card>
        </div>

        {/* Tarjeta: Tasa de Aprobados */}
        <div className='col-12 sm:col-6 lg:col-3'>
          <Card className='shadow-1 h-full surface-card border-round'>
            <div className='flex justify-content-between align-items-start'>
              <div>
                <span className='text-xs font-bold text-muted block mb-1'>
                  TASA DE APROBADOS
                </span>
                <div className='text-2xl font-bold text-green-600'>
                  {estadisticas.tasaAprobados !== undefined
                    ? `${estadisticas.tasaAprobados}%`
                    : "-"}
                </div>
                <div className='text-xs text-muted mt-2'>
                  <span className='text-green-600 font-semibold'>
                    {(estadisticas.distribucion?.aprobados || 0) +
                      (estadisticas.distribucion?.notables || 0) +
                      (estadisticas.distribucion?.sobresalientes || 0)}{" "}
                    superadas
                  </span>
                  <span className='mx-1'>/</span>
                  <span className='text-red-500 font-semibold'>
                    {estadisticas.distribucion?.suspensos || 0} suspensas
                  </span>
                </div>
              </div>
              <div
                className='flex align-items-center justify-content-center border-round'
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                }}
              >
                <i className='pi pi-thumbs-up text-green-500 font-bold text-lg' />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiscenteDetalleCabecera;

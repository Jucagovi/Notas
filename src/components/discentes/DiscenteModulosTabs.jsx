import React, { useState } from "react";
import { Card } from "primereact/card";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { ProgressBar } from "primereact/progressbar";
import { InputNumber } from "primereact/inputnumber";
import { Message } from "primereact/message";
import DiscenteGraficos from "./DiscenteGraficos.jsx";
import { getColorNota } from "../../utils/coloresNota.js";
import { formatNota } from "../../utils/formatters.js";

// Componente para la navegación por pestañas de los módulos matriculados, estadísticas por materia, gráficas y desglose de evaluaciones
const DiscenteModulosTabs = ({ modulos = [], alGuardarNota = () => {} }) => {
  const [indiceActivo, setIndiceActivo] = useState(0);

  // Asegurar que el índice activo esté dentro del rango válido de pestañas
  const indiceValido = indiceActivo < modulos.length ? indiceActivo : 0;

  // Plantilla visual obligatoria de notas: muestra '?' centrado si el valor es nulo
  const plantillaNota = (rowData) => {
    if (
      rowData.nota === null ||
      rowData.nota === undefined ||
      rowData.nota === ""
    ) {
      return (
        <div className='flex align-items-center justify-content-center'>
          <span
            className='font-bold text-muted text-base border-1 border-dashed surface-border border-round px-3 py-1 inline-block'
            style={{
              minWidth: "2.5rem",
              textAlign: "center",
              backgroundColor: "transparent",
            }}
            title='Práctica sin calificar (haga clic para introducir nota)'
          >
            ?
          </span>
        </div>
      );
    }

    const color = getColorNota(rowData.nota);

    return (
      <div className='flex align-items-center justify-content-center'>
        <span
          className={`font-bold text-base px-3 py-1 border-round border-1 surface-border inline-block ${color.text}`}
          style={{
            minWidth: "2.5rem",
            textAlign: "center",
            backgroundColor: "transparent",
            color: color.hex,
          }}
          title='Haga clic para editar la calificación'
        >
          {rowData.nota}
        </span>
      </div>
    );
  };

  // Plantilla para la evaluación cualitativa de cada práctica
  const plantillaEstado = (rowData) => {
    if (
      rowData.nota === null ||
      rowData.nota === undefined ||
      rowData.nota === ""
    ) {
      return (
        <Tag
          severity='warning'
          icon='pi pi-clock'
          value='Pendiente'
          className='text-xs font-semibold'
        />
      );
    }

    const color = getColorNota(rowData.nota);
    return (
      <Tag
        value={color.label}
        style={{ color: color.hex }}
        className={`text-xs font-semibold ${color.bg} ${color.text}`}
      />
    );
  };

  // Editor numérico para la edición en celda de la nota
  const editorNota = (options) => {
    return (
      <div className='flex align-items-center justify-content-center w-full'>
        <InputNumber
          value={options.value}
          onValueChange={(e) => options.editorCallback(e.value)}
          min={0}
          max={100}
          locale='es-ES'
          minFractionDigits={0}
          maxFractionDigits={0}
          useGrouping={false}
          placeholder='?'
          className='w-full'
          inputClassName='text-center font-bold text-base p-inputtext-sm'
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
            }
          }}
        />
      </div>
    );
  };

  // Manejo de la finalización de edición en celda (In-cell Editing al pulsar Enter o desenfocar)
  const alCompletarEdicionNota = async (e) => {
    const { rowData, newValue, field } = e;

    let valorFinal = null;
    if (newValue !== null && newValue !== undefined && newValue !== "") {
      const num =
        typeof newValue === "number"
          ? newValue
          : parseFloat(String(newValue).replace(",", "."));
      if (!isNaN(num) && num >= 0 && num <= 100) {
        valorFinal = num;
      } else {
        return;
      }
    }

    if (rowData[field] === valorFinal) {
      return;
    }

    await alGuardarNota({
      idEvaluacion: rowData.id_evaluacion,
      idPractica: rowData.id_practica,
      idDiscente: rowData.id_discente,
      idEvaluan: rowData.id_evaluan,
      peso: rowData.peso || 100,
      nota: valorFinal,
      idFilaUnica: rowData.id_fila_unica,
    });
  };

  // Plantilla para la cabecera de grupo de filas por Evaluación con cálculo de la nota media ponderada
  const plantillaCabeceraGrupo = (data, todasPracticas = []) => {
    // Se filtran las prácticas correspondientes a este periodo de evaluación
    const practicasGrupo = (todasPracticas || []).filter(
      (p) =>
        (data.id_evaluacion && p.id_evaluacion === data.id_evaluacion) ||
        p.evaluacionNombre === data.evaluacionNombre,
    );

    // Se comprueba si todas las prácticas tienen calificación asignada
    const tieneTodasLasNotas =
      practicasGrupo.length > 0 &&
      practicasGrupo.every(
        (p) =>
          p.nota !== null &&
          p.nota !== undefined &&
          p.nota !== "" &&
          !isNaN(Number(p.nota)),
      );

    // Se comprueba si todas las prácticas tienen un peso numérico válido
    const tienenPesoValido =
      practicasGrupo.length > 0 &&
      practicasGrupo.every(
        (p) =>
          p.peso !== null &&
          p.peso !== undefined &&
          !isNaN(Number(p.peso)) &&
          Number(p.peso) > 0,
      );

    let notaMediaPonderada = null;
    if (tieneTodasLasNotas && tienenPesoValido) {
      const sumaPesos = practicasGrupo.reduce(
        (acc, p) => acc + Number(p.peso),
        0,
      );
      if (sumaPesos > 0) {
        const sumaPonderada = practicasGrupo.reduce(
          (acc, p) => acc + Number(p.nota) * Number(p.peso),
          0,
        );
        notaMediaPonderada = Math.round(sumaPonderada / sumaPesos);
      }
    }

    const colorMedia = getColorNota(notaMediaPonderada);

    return (
      <div className='flex align-items-center justify-content-between py-1 font-bold text-sm text-color'>
        <div className='flex align-items-center gap-2'>
          <i className='pi pi-calendar text-primary' />
          <span className='text-base text-primary font-bold'>
            {data.evaluacionNombre}
          </span>
          {data.evaluacionFechaIni && data.evaluacionFechaFin && (
            <span className='text-xs text-muted font-normal ml-2'>
              ({data.evaluacionFechaIni} al {data.evaluacionFechaFin})
            </span>
          )}
        </div>

        {/* Indicador de nota media ponderada de la evaluación o signo de interrogación si está incompleta */}
        <div className='flex align-items-center gap-2'>
          <span className='text-xs text-muted font-semibold mr-1'>
            Media ponderada
          </span>
          {notaMediaPonderada !== null ? (
            <span
              className={`font-bold text-lg px-1 py-1 surface-border inline-block ${colorMedia.text}`}
              style={{
                minWidth: "2.5rem",
                textAlign: "center",
                backgroundColor: "transparent",
                color: colorMedia.hex,
              }}
              title={`Nota media ponderada de la evaluación: ${notaMediaPonderada}`}
            >
              {notaMediaPonderada}
            </span>
          ) : (
            <span
              className='font-bold text-muted text-sm border-1 border-dashed surface-border border-round px-3 py-1 inline-block'
              style={{
                minWidth: "2.5rem",
                textAlign: "center",
                backgroundColor: "transparent",
              }}
              title='Evaluación con calificaciones o pesos pendientes'
            >
              ?
            </span>
          )}
        </div>
      </div>
    );
  };

  // Plantilla de título de pestaña identificada por siglas (o nombre) con insignia de nota media o total de prácticas
  const plantillaEncabezadoPestaña = (modulo) => {
    const titulo = modulo.siglas || modulo.nombre || "Módulo";
    const media = modulo.estadisticas?.media;
    const color = getColorNota(media);

    return (
      <div className='flex align-items-center gap-2 py-1'>
        <span className='font-bold text-sm'>{titulo}</span>
        {media !== null && media !== undefined ? (
          <span
            className={`text-xs font-semibold px-2 py-2 border-round ${color.bg} ${color.text}`}
          >
            {media}
          </span>
        ) : (
          <Badge
            value={`${modulo.estadisticas?.totalPracticas || 0}`}
            severity='secondary'
            className='text-xs'
          />
        )}
      </div>
    );
  };

  if (!modulos || modulos.length === 0) {
    return (
      <Card className='shadow-1'>
        <Message
          severity='info'
          text='El discente no figura matriculado en ningún módulo para el curso escolar seleccionado.'
          className='w-full'
        />
      </Card>
    );
  }

  return (
    <Card className='shadow-1'>
      <div className='flex flex-column gap-2 mb-3 pb-2 border-bottom-1 surface-border'>
        <div className='flex justify-content-between align-items-center'>
          <div>
            <h2 className='text-xl font-bold m-0 text-color'>
              Desglose por Módulos y Evaluaciones
            </h2>
            <p className='text-muted text-xs m-0 mt-1'>
              Haga clic sobre cualquier calificación para editarla al vuelo
              (In-cell Editing). Pulse Enter para guardar automáticamente.
            </p>
          </div>
        </div>
      </div>

      {/* Componente TabView de PrimeReact para navegar por los módulos matriculados */}
      <TabView
        activeIndex={indiceValido}
        onTabChange={(e) => setIndiceActivo(e.index)}
        className='p-tabview-custom'
      >
        {modulos.map((mod) => {
          const stats = mod.estadisticas || {};

          return (
            <TabPanel
              key={mod.id_modulo}
              header={plantillaEncabezadoPestaña(mod)}
            >
              <div className='flex flex-column gap-4 pt-2'>
                {/* 1. Cabecera descriptiva del módulo */}
                <div className='surface-ground p-3 border-round border-1 surface-border'>
                  <div className='flex flex-column sm:flex-row sm:justify-content-between sm:align-items-center gap-2'>
                    <div>
                      <div className='flex align-items-center gap-2'>
                        <i className='pi pi-book text-primary text-lg' />
                        <h3 className='text-base font-bold m-0 text-color'>
                          {mod.nombre} {mod.siglas ? `(${mod.siglas})` : ""}
                        </h3>
                      </div>
                      {mod.descripcion && (
                        <p className='text-muted text-xs m-0 mt-1'>
                          {mod.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Tarjetas estadísticas KPI específicas de este módulo */}
                <div className='grid'>
                  {/* Total Prácticas del Módulo */}
                  <div className='col-12 sm:col-6 lg:col-3'>
                    <div className='surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between'>
                      <div className='flex justify-content-between align-items-start mb-2'>
                        <div>
                          <span className='text-xs font-bold text-muted block mb-1'>
                            TOTAL PRÁCTICAS
                          </span>
                          <span className='text-2xl font-bold text-color'>
                            {stats.totalPracticas || 0}
                          </span>
                        </div>
                        <div
                          className='flex align-items-center justify-content-center border-round'
                          style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            backgroundColor: "rgba(59, 130, 246, 0.15)",
                          }}
                        >
                          <i className='pi pi-list-check text-blue-500 font-bold text-lg' />
                        </div>
                      </div>
                      <span className='text-xs text-muted'>
                        {stats.calificadas || 0} calificadas ·{" "}
                        {stats.pendientes || 0} pendientes
                      </span>
                    </div>
                  </div>

                  {/* Progreso de Evaluación del Módulo */}
                  <div className='col-12 sm:col-6 lg:col-3'>
                    <div className='surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between'>
                      <div className='flex justify-content-between align-items-start mb-2'>
                        <div>
                          <span className='text-xs font-bold text-muted block mb-1'>
                            PROGRESO EVALUACIÓN
                          </span>
                          <span className='text-2xl font-bold text-color'>
                            {stats.porcentajeProgreso || 0}%
                          </span>
                        </div>
                        <div
                          className='flex align-items-center justify-content-center border-round'
                          style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            backgroundColor: "rgba(6, 182, 212, 0.15)",
                          }}
                        >
                          <i className='pi pi-chart-pie text-cyan-500 font-bold text-lg' />
                        </div>
                      </div>
                      <div className='mt-1'>
                        <ProgressBar
                          value={stats.porcentajeProgreso || 0}
                          showValue={false}
                          style={{ height: "6px" }}
                        />
                        <span className='text-xs text-muted block mt-2'>
                          {stats.calificadas || 0} de{" "}
                          {stats.totalPracticas || 0} evaluadas
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nota Media del Módulo */}
                  <div className='col-12 sm:col-6 lg:col-3'>
                    <div className='surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between'>
                      <div className='flex justify-content-between align-items-start mb-2'>
                        <div>
                          <span className='text-xs font-bold text-muted block mb-1'>
                            NOTA MEDIA MÓDULO
                          </span>
                          <div className='flex align-items-baseline gap-1'>
                            <span
                              className={`text-2xl font-bold ${stats.media !== null && stats.media !== undefined ? getColorNota(stats.media).text : "text-color"}`}
                            >
                              {stats.media !== null && stats.media !== undefined
                                ? formatNota(stats.media)
                                : "-"}
                            </span>
                            {stats.media !== null &&
                              stats.media !== undefined && (
                                <span className='text-xs text-muted'>
                                  / 100
                                </span>
                              )}
                          </div>
                        </div>
                        <div
                          className='flex align-items-center justify-content-center border-round'
                          style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            backgroundColor: "rgba(99, 102, 241, 0.15)",
                          }}
                        >
                          <i className='pi pi-star text-indigo-500 font-bold text-lg' />
                        </div>
                      </div>
                      <div className='mt-1'>
                        <Tag
                          value={getColorNota(stats.media).label}
                          className={`${getColorNota(stats.media).bg} ${getColorNota(stats.media).text}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tasa de Aprobados del Módulo */}
                  <div className='col-12 sm:col-6 lg:col-3'>
                    <div className='surface-card p-3 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between'>
                      <div className='flex justify-content-between align-items-start mb-2'>
                        <div>
                          <span className='text-xs font-bold text-muted block mb-1'>
                            TASA DE APROBADOS
                          </span>
                          <span className='text-2xl font-bold text-color'>
                            {stats.tasaAprobados || 0}%
                          </span>
                        </div>
                        <div
                          className='flex align-items-center justify-content-center border-round'
                          style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            backgroundColor: "rgba(34, 197, 94, 0.15)",
                          }}
                        >
                          <i className='pi pi-check-circle text-green-500 font-bold text-lg' />
                        </div>
                      </div>
                      <span className='text-xs text-muted'>
                        {stats.aprobados || 0} aprobadas ·{" "}
                        {stats.suspensos || 0} suspensas
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Visualización gráfica de evolución temporal y distribución por tramos del módulo */}
                <DiscenteGraficos
                  evolucionTemporal={stats.evolucionTemporal}
                  distribucion={stats.distribucion}
                />

                {/* 4. DataTable de Prácticas agrupado por Evaluaciones con edición en celda */}
                <DataTable
                  value={mod.todasPracticas}
                  editMode='cell'
                  dataKey='id_fila_unica'
                  rowGroupMode='subheader'
                  groupRowsBy='evaluacionNombre'
                  sortField='evaluacionOrden'
                  sortOrder={1}
                  rowGroupHeaderTemplate={(data) =>
                    plantillaCabeceraGrupo(data, mod.todasPracticas)
                  }
                  responsiveLayout='scroll'
                  className='p-datatable-sm'
                  emptyMessage='No hay prácticas asignadas a las evaluaciones de este módulo en el curso seleccionado.'
                  stripedRows
                >
                  <Column
                    field='numeroPractica'
                    header='Nº'
                    style={{
                      width: "80px",
                      minWidth: "80px",
                      textAlign: "center",
                    }}
                    body={(row) => (
                      <span className='font-mono font-bold text-sm text-color-secondary'>
                        {row.numeroPractica || "P"}
                      </span>
                    )}
                  />
                  <Column
                    field='nombrePractica'
                    header='Práctica / Tarea'
                    style={{ minWidth: "240px" }}
                    body={(row) => (
                      <span
                        className='font-semibold text-color text-sm'
                        title={row.enunciado || undefined}
                      >
                        {row.nombrePractica}
                      </span>
                    )}
                  />
                  <Column
                    field='peso'
                    header='Peso (%)'
                    style={{
                      width: "100px",
                      minWidth: "100px",
                      textAlign: "center",
                    }}
                    body={(row) => (
                      <span className='text-xs font-semibold text-muted'>
                        {row.peso ? `${row.peso}%` : "100%"}
                      </span>
                    )}
                  />
                  <Column
                    field='nota'
                    header='Calificación'
                    style={{
                      width: "160px",
                      minWidth: "160px",
                      textAlign: "center",
                    }}
                    body={plantillaNota}
                    editor={(options) => editorNota(options)}
                    onCellEditComplete={alCompletarEdicionNota}
                  />
                  <Column
                    header='Evaluación'
                    style={{
                      width: "150px",
                      minWidth: "150px",
                      textAlign: "center",
                    }}
                    body={plantillaEstado}
                  />
                </DataTable>

                <div className='flex align-items-center gap-2 text-xs text-muted pt-1'>
                  <i className='pi pi-info-circle text-primary' />
                  <span>
                    Haga clic en la casilla de calificación para editar. Los
                    cambios se guardan al presionar Enter o al hacer clic fuera
                    de la celda.
                  </span>
                </div>
              </div>
            </TabPanel>
          );
        })}
      </TabView>
    </Card>
  );
};

export default DiscenteModulosTabs;

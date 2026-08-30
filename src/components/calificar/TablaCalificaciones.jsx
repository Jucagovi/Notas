import React, { useState, useMemo, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { getColorNota } from "../../utils/coloresNota.js";
import { formatNota } from "../../utils/formatters.js";

// Componente para la celda de calificación editable con guardado automático al desenfocar (onBlur)
const CeldaNota = ({ discente, alGuardarNota, errorFila }) => {
  const [valorLocal, setValorLocal] = useState(
    discente.nota !== undefined && discente.nota !== null
      ? discente.nota
      : null,
  );
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState(null);

  // Sincronización del valor local con la propiedad reactiva recibida
  useEffect(() => {
    setValorLocal(
      discente.nota !== undefined && discente.nota !== null
        ? discente.nota
        : null,
    );
    setErrorLocal(null);
  }, [discente.nota]);

  // Se ejecuta el guardado automático cuando el input pierde el foco
  const manejarBlur = async () => {
    // Si el valor está fuera de rango permitido
    if (valorLocal !== null && valorLocal !== undefined && valorLocal !== "") {
      const num =
        typeof valorLocal === "number"
          ? valorLocal
          : parseFloat(String(valorLocal).replace(",", "."));
      if (isNaN(num) || num < 0 || num > 100) {
        setErrorLocal("0 a 100");
        return;
      }
    }
    setErrorLocal(null);

    // Se normaliza el valor para comprobar si realmente ha cambiado
    const notaNormalizada =
      valorLocal === "" || valorLocal === null || valorLocal === undefined
        ? null
        : typeof valorLocal === "number"
          ? valorLocal
          : parseFloat(String(valorLocal).replace(",", "."));

    const notaOriginal =
      discente.nota === "" ||
      discente.nota === null ||
      discente.nota === undefined
        ? null
        : typeof discente.nota === "number"
          ? discente.nota
          : parseFloat(String(discente.nota).replace(",", "."));

    if (notaNormalizada === notaOriginal) {
      return;
    }

    setGuardando(true);
    try {
      await alGuardarNota(discente.id_discente, notaNormalizada);
    } finally {
      setGuardando(false);
    }
  };

  // Se permite confirmar el guardado pulsando la tecla Enter
  const manejarKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const hayError = Boolean(errorLocal || errorFila);
  const colorNota = getColorNota(valorLocal);

  return (
    <div className='flex align-items-center justify-content-center gap-2'>
      <div style={{ width: "4.75rem" }} className='flex-shrink-0'>
        <InputNumber
          value={valorLocal}
          onValueChange={(e) => {
            setValorLocal(e.value);
            if (
              e.value !== null &&
              e.value !== undefined &&
              (e.value < 0 || e.value > 100)
            ) {
              setErrorLocal("0 a 100");
            } else {
              setErrorLocal(null);
            }
          }}
          onBlur={manejarBlur}
          onKeyDown={manejarKeyDown}
          min={0}
          max={100}
          locale='es-ES'
          minFractionDigits={0}
          maxFractionDigits={0}
          useGrouping={false}
          placeholder='?'
          style={{ width: "100%" }}
          inputStyle={{
            width: "100%",
            textAlign: "center",
            fontWeight: "bold",
            color: colorNota.hex,
          }}
          className={hayError ? "p-invalid" : ""}
          inputClassName={`text-center font-bold text-base ${colorNota.text} ${hayError ? "p-invalid" : ""}`}
          disabled={guardando}
          tooltip={
            hayError
              ? errorLocal || errorFila
              : "Nota de 0 a 100. Se guarda al salir de la casilla."
          }
          tooltipOptions={{ position: "top" }}
        />
      </div>

      {/* Indicadores de estado de guardado */}
      <div
        style={{ width: "1.25rem", height: "1.25rem" }}
        className='flex align-items-center justify-content-center flex-shrink-0'
      >
        {guardando ? (
          <i
            className='pi pi-spin pi-spinner text-primary text-sm'
            title='Guardando calificación...'
          />
        ) : hayError ? (
          <i
            className='pi pi-exclamation-circle text-red-500 text-sm'
            title={errorLocal || errorFila}
          />
        ) : discente.nota !== null && discente.nota !== undefined ? (
          <i className='pi pi-check text-green-500 text-sm' title='Guardado' />
        ) : null}
      </div>
    </div>
  );
};

// Componente principal de la tabla de calificación de discentes para la práctica seleccionada
const TablaCalificaciones = ({
  discentes = [],
  practica = null,
  estadisticas = {},
  erroresFilas = {},
  alGuardarNota = () => {},
  alCalificarMasivo = () => {},
  cargando = false,
}) => {
  // Filtros locales para la tabla
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos"); // 'todos' | 'calificados' | 'pendientes' | 'aprobados' | 'suspensos'

  // Modal para calificar de forma masiva
  const [dialogoMasivoVisible, setDialogoMasivoVisible] = useState(false);
  const [notaMasiva, setNotaMasiva] = useState(null);

  // Filtrado reactivo de discentes en la tabla
  const discentesFiltrados = useMemo(() => {
    return (discentes || []).filter((d) => {
      const termino = filtroTexto.trim().toLowerCase();
      const coincideTexto =
        !termino ||
        (d.nombre && d.nombre.toLowerCase().includes(termino)) ||
        (d.apellidos && d.apellidos.toLowerCase().includes(termino)) ||
        (d.NIA && d.NIA.toLowerCase().includes(termino));

      if (!coincideTexto) return false;

      const tieneNota = d.nota !== null && d.nota !== undefined;

      if (filtroEstado === "calificados") return tieneNota;
      if (filtroEstado === "pendientes") return !tieneNota;
      if (filtroEstado === "aprobados")
        return tieneNota && Number(d.nota) >= 50;
      if (filtroEstado === "suspensos") return tieneNota && Number(d.nota) < 50;

      return true;
    });
  }, [discentes, filtroTexto, filtroEstado]);

  // Manejo de la acción masiva
  const ejecutarCalificacionMasiva = async () => {
    await alCalificarMasivo(notaMasiva);
    setDialogoMasivoVisible(false);
    setNotaMasiva(null);
  };

  if (cargando) {
    return (
      <div className='surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center'>
        <ProgressSpinner
          style={{ width: "50px", height: "50px" }}
          strokeWidth='4'
        />
        <span className='text-muted text-sm mt-3'>
          Cargando listado de discentes y notas...
        </span>
      </div>
    );
  }

  return (
    <Card className='shadow-1'>
      {/* Cabecera de la tabla con información de la práctica y estadísticas */}
      <div className='flex flex-column gap-3 mb-3'>
        <div className='flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2 pb-2 border-bottom-1 surface-border'>
          <div>
            <h3 className='text-lg font-bold m-0 text-color'>
              {practica?.practica?.nombre || "Calificación de la Práctica"}
            </h3>
            <p className='text-muted text-xs m-0 mt-1'>
              Introduzca la nota numérica de cada alumno (0 - 100). El sistema
              guarda los cambios automáticamente al salir de la celda.
            </p>
          </div>

          <div className='flex align-items-center gap-2'>
            <Button
              type='button'
              label='Calificación Rápida'
              icon='pi pi-bolt'
              size='small'
              severity='secondary'
              outlined
              onClick={() => setDialogoMasivoVisible(true)}
              tooltip='Asignar una misma nota a todos los alumnos o vaciarlas'
              tooltipOptions={{ position: "top" }}
            />
          </div>
        </div>

        {/* Tarjetas de estadísticas resumidas */}
        <div className='grid grid-nogutter gap-2'>
          <div className='col flex align-items-center p-2 surface-ground border-round border-1 surface-border gap-2'>
            <i className='pi pi-users text-primary text-xl' />
            <div>
              <span className='text-xs text-muted block font-semibold'>
                Total Alumnos
              </span>
              <span className='text-base font-bold text-color'>
                {estadisticas.total || 0}
              </span>
            </div>
          </div>

          <div className='col flex align-items-center p-2 surface-ground border-round border-1 surface-border gap-2'>
            <i className='pi pi-check-circle text-green-500 text-xl' />
            <div>
              <span className='text-xs text-muted block font-semibold'>
                Calificados
              </span>
              <span className='text-base font-bold text-green-600'>
                {estadisticas.calificados || 0} (
                {estadisticas.porcentajeCompletado || 0}%)
              </span>
            </div>
          </div>

          <div className='col flex align-items-center p-2 surface-ground border-round border-1 surface-border gap-2'>
            <i className='pi pi-clock text-orange-500 text-xl' />
            <div>
              <span className='text-xs text-muted block font-semibold'>
                Pendientes
              </span>
              <span className='text-base font-bold text-orange-600'>
                {estadisticas.pendientes || 0}
              </span>
            </div>
          </div>

          <div className='col flex align-items-center p-2 surface-ground border-round border-1 surface-border gap-2'>
            <i className='pi pi-chart-line text-cyan-500 text-xl' />
            <div>
              <span className='text-xs text-muted block font-semibold'>
                Nota Media
              </span>
              <span
                className={`text-base font-bold ${estadisticas.media !== null && estadisticas.media !== undefined ? getColorNota(estadisticas.media).text : "text-color"}`}
              >
                {estadisticas.media !== null && estadisticas.media !== undefined
                  ? formatNota(estadisticas.media)
                  : "-"}
              </span>
            </div>
          </div>

          <div className='col flex align-items-center p-2 surface-ground border-round border-1 surface-border gap-2'>
            <i className='pi pi-thumbs-up text-indigo-500 text-xl' />
            <div>
              <span className='text-xs text-muted block font-semibold'>
                Aprobados / Suspensos
              </span>
              <span className='text-base font-bold text-color'>
                <span className='text-green-600'>
                  {estadisticas.aprobados || 0}
                </span>
                <span className='text-muted mx-1'>/</span>
                <span className='text-red-500'>
                  {estadisticas.suspensos || 0}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Barra de herramientas para búsqueda y filtrado rápido */}
        <div className='flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3 pt-2'>
          <div className='p-input-icon-left w-full sm:w-20rem'>
            <i className='pi pi-search' />
            <InputText
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              placeholder='Buscar por nombre, apellidos o NIA...'
              className='w-full p-inputtext-sm'
            />
          </div>

          <div className='flex flex-wrap align-items-center gap-1'>
            <span className='text-xs font-semibold text-muted mr-1'>
              Filtrar:
            </span>
            <Button
              label={`Todos (${estadisticas.total || 0})`}
              size='small'
              text={filtroEstado !== "todos"}
              severity={filtroEstado === "todos" ? "primary" : "secondary"}
              className='p-1 px-2 text-xs'
              onClick={() => setFiltroEstado("todos")}
            />
            <Button
              label={`Calificados (${estadisticas.calificados || 0})`}
              size='small'
              text={filtroEstado !== "calificados"}
              severity={
                filtroEstado === "calificados" ? "success" : "secondary"
              }
              className='p-1 px-2 text-xs'
              onClick={() => setFiltroEstado("calificados")}
            />
            <Button
              label={`Pendientes (${estadisticas.pendientes || 0})`}
              size='small'
              text={filtroEstado !== "pendientes"}
              severity={filtroEstado === "pendientes" ? "warning" : "secondary"}
              className='p-1 px-2 text-xs'
              onClick={() => setFiltroEstado("pendientes")}
            />
            <Button
              label={`Aprobados (${estadisticas.aprobados || 0})`}
              size='small'
              text={filtroEstado !== "aprobados"}
              severity={filtroEstado === "aprobados" ? "info" : "secondary"}
              className='p-1 px-2 text-xs'
              onClick={() => setFiltroEstado("aprobados")}
            />
            <Button
              label={`Suspensos (${estadisticas.suspensos || 0})`}
              size='small'
              text={filtroEstado !== "suspensos"}
              severity={filtroEstado === "suspensos" ? "danger" : "secondary"}
              className='p-1 px-2 text-xs'
              onClick={() => setFiltroEstado("suspensos")}
            />
          </div>
        </div>
      </div>

      {/* Tabla PrimeReact de Discentes */}
      <DataTable
        value={discentesFiltrados}
        dataKey='id_discente'
        emptyMessage={
          discentes.length === 0
            ? "No hay discentes matriculados en la clase de este módulo."
            : "No se encontraron alumnos con los criterios de búsqueda especificados."
        }
        className='p-datatable-sm'
        responsiveLayout='scroll'
        stripedRows
      >
        {/* Columna con Avatar, Nombre y Apellidos */}
        <Column
          field='nombreCompleto'
          header='Discente'
          style={{ minWidth: "220px" }}
          body={(rowData) => {
            const iniciales =
              `${(rowData.nombre || "")[0] || ""}${(rowData.apellidos || "")[0] || ""}`.toUpperCase() ||
              "AL";
            return (
              <div className='flex align-items-center gap-3 py-1'>
                {rowData.imagen ? (
                  <Avatar image={rowData.imagen} shape='circle' size='normal' />
                ) : (
                  <Avatar
                    label={iniciales}
                    shape='circle'
                    size='normal'
                    className='surface-200 text-primary font-bold text-xs'
                  />
                )}
                <div className='flex flex-column'>
                  <span className='font-semibold text-color text-sm'>
                    {rowData.apellidos}, {rowData.nombre}
                  </span>
                  <div className='flex align-items-center gap-2'>
                    {rowData.NIA && (
                      <span className='text-xs text-muted'> {rowData.NIA}</span>
                    )}
                    {rowData.correo && (
                      <span className='text-xs text-muted truncate max-w-15rem'>
                        {rowData.correo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
        />

        {/* Columna de Estado / Calificación cualitativa */}
        <Column
          header='Estado'
          style={{ width: "160px", minWidth: "160px" }}
          body={(rowData) => {
            const color = getColorNota(rowData.nota);
            const estaSinCalificar =
              rowData.nota === null ||
              rowData.nota === undefined ||
              rowData.nota === "";

            return (
              <Tag
                icon={estaSinCalificar ? "pi pi-clock" : undefined}
                value={color.label}
                style={{ color: color.hex }}
                className={`text-xs font-semibold ${color.bg} ${color.text}`}
              />
            );
          }}
        />

        {/* Columna editable de Nota con guardado automático al perder el foco (onBlur) */}
        <Column
          field='nota'
          header='Nota (0 - 100)'
          style={{ width: "160px", minWidth: "160px", textAlign: "center" }}
          headerStyle={{
            width: "160px",
            minWidth: "160px",
            textAlign: "center",
          }}
          bodyStyle={{
            width: "160px",
            minWidth: "160px",
            textAlign: "center",
            overflow: "visible",
          }}
          body={(rowData) => (
            <CeldaNota
              discente={rowData}
              alGuardarNota={alGuardarNota}
              errorFila={erroresFilas[rowData.id_discente]}
            />
          )}
        />
      </DataTable>

      {/* Modal para Calificación Rápida / Masiva */}
      <Dialog
        visible={dialogoMasivoVisible}
        onHide={() => setDialogoMasivoVisible(false)}
        header='Calificación Rápida Masiva'
        modal
        style={{ width: "90vw", maxWidth: "450px" }}
        footer={
          <div className='flex justify-content-end gap-2'>
            <Button
              label='Cancelar'
              icon='pi pi-times'
              severity='secondary'
              text
              onClick={() => setDialogoMasivoVisible(false)}
            />
            <Button
              label='Aplicar a todos'
              icon='pi pi-check'
              severity='primary'
              onClick={ejecutarCalificacionMasiva}
            />
          </div>
        }
      >
        <div className='flex flex-column gap-3 pt-2'>
          <p className='text-sm text-muted m-0'>
            Introduzca una calificación para asignarla a todos los alumnos de la
            lista de esta práctica, o déjelo en blanco para vaciar las notas.
          </p>

          <div className='flex flex-column gap-1'>
            <label
              htmlFor='nota-masiva-input'
              className='text-xs font-semibold text-color'
            >
              Nota común (0 - 100):
            </label>
            <InputNumber
              id='nota-masiva-input'
              value={notaMasiva}
              onValueChange={(e) => setNotaMasiva(e.value)}
              min={0}
              max={100}
              locale='es-ES'
              minFractionDigits={2}
              maxFractionDigits={2}
              useGrouping={false}
              placeholder='Ej: 100, 80 (o vacío para borrar)'
              className='w-full'
            />
          </div>

          <div className='flex flex-wrap gap-2 pt-2 border-top-1 surface-border'>
            <span className='text-xs text-muted block w-full mb-1'>
              Accesos rápidos:
            </span>
            <Button
              label='100 (Sobresaliente)'
              size='small'
              severity='success'
              outlined
              className='text-xs'
              onClick={() => setNotaMasiva(100)}
            />
            <Button
              label='75 (Notable)'
              size='small'
              severity='info'
              outlined
              className='text-xs'
              onClick={() => setNotaMasiva(75)}
            />
            <Button
              label='50 (Aprobado)'
              size='small'
              severity='secondary'
              outlined
              className='text-xs'
              onClick={() => setNotaMasiva(50)}
            />
            <Button
              label='Vaciar todas'
              size='small'
              severity='danger'
              text
              className='text-xs'
              onClick={() => setNotaMasiva(null)}
            />
          </div>
        </div>
      </Dialog>
    </Card>
  );
};

export default TablaCalificaciones;

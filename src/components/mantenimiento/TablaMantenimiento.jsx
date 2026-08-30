import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import useToast from "../../hooks/useToast.js";
import { plantillaOpcionModulo, plantillaValorModulo } from "../../utils/plantillasDropdown.jsx";

// Componente genérico y reutilizable de mantenimiento de tablas CRUD integrado con el diseño de la aplicación
const TablaMantenimiento = ({
  titulo = "Mantenimiento",
  descripcion = "",
  nombreEntidad = "Registro",
  campoId = "id",
  columnas = [],
  datos = [],
  cargando = false,
  alCrear,
  alModificar,
  alEliminar,
  alRecargar,
  accionesExtra = null,
}) => {
  const navigate = useNavigate();
  const { mostrarExito, mostrarError, mostrarInfo } = useToast();
  const tablaRef = useRef(null);

  // Estados del diálogo modal de creación y edición
  const [dialogoVisible, setDialogoVisible] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  const [registroActual, setRegistroActual] = useState({});
  const [erroresFormulario, setErroresFormulario] = useState({});
  const [filtroGlobal, setFiltroGlobal] = useState("");

  // Se abre el formulario para la creación de un nuevo registro
  const abrirNuevo = () => {
    const registroVacio = {};
    columnas.forEach((col) => {
      if (col.tipo === "booleano") {
        registroVacio[col.campo] =
          col.valorPorDefecto !== undefined ? col.valorPorDefecto : true;
      } else if (col.tipo === "numero") {
        registroVacio[col.campo] =
          col.valorPorDefecto !== undefined ? col.valorPorDefecto : null;
      } else if (col.tipo === "fecha") {
        registroVacio[col.campo] = null;
      } else {
        registroVacio[col.campo] = col.valorPorDefecto || "";
      }
    });
    setRegistroActual(registroVacio);
    setErroresFormulario({});
    setEsEdicion(false);
    setDialogoVisible(true);
  };

  // Se abre el formulario para la edición de un registro existente
  const abrirEditar = (registro) => {
    const registroFormateado = { ...registro };
    // Se adaptan las fechas a objetos Date de JavaScript para el componente Calendar
    columnas.forEach((col) => {
      if (col.tipo === "fecha" && registroFormateado[col.campo]) {
        registroFormateado[col.campo] = new Date(registroFormateado[col.campo]);
      }
    });
    setRegistroActual(registroFormateado);
    setErroresFormulario({});
    setEsEdicion(true);
    setDialogoVisible(true);
  };

  // Se cierra el modal de formulario
  const ocultarDialogo = () => {
    setDialogoVisible(false);
    setErroresFormulario({});
  };

  // Se actualizan los valores del formulario
  const manejarCambio = (campo, valor) => {
    setRegistroActual((prev) => ({
      ...prev,
      [campo]: valor,
    }));
    if (erroresFormulario[campo]) {
      setErroresFormulario((prev) => ({
        ...prev,
        [campo]: null,
      }));
    }
  };

  // Se validan los campos requeridos del formulario
  const validarFormulario = () => {
    const errores = {};
    columnas.forEach((col) => {
      if (col.requerido && col.mostrarEnFormulario !== false) {
        const valor = registroActual[col.campo];
        if (
          valor === undefined ||
          valor === null ||
          (typeof valor === "string" && valor.trim() === "")
        ) {
          errores[col.campo] = `El campo ${col.encabezado} es obligatorio.`;
        }
      }
    });
    setErroresFormulario(errores);
    return Object.keys(errores).length === 0;
  };

  // Se prepara el payload formateando fechas y tipos de datos antes del guardado
  const prepararPayload = () => {
    const payload = { ...registroActual };
    columnas.forEach((col) => {
      if (col.tipo === "fecha" && payload[col.campo] instanceof Date) {
        // Se formatea la fecha a formato ISO YYYY-MM-DD
        const d = payload[col.campo];
        const anyo = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const dia = String(d.getDate()).padStart(2, "0");
        payload[col.campo] = `${anyo}-${mes}-${dia}`;
      }
      if (
        col.tipo === "numero" &&
        payload[col.campo] !== null &&
        payload[col.campo] !== ""
      ) {
        payload[col.campo] = Number(payload[col.campo]);
      }
    });
    return payload;
  };

  // Se procesa la acción de guardar nuevo registro
  const ejecutarCreacion = async () => {
    const payload = prepararPayload();
    delete payload[campoId];
    delete payload.created_at;

    try {
      const resultado = await alCrear(payload);
      if (resultado) {
        mostrarExito(
          "Registro creado",
          `${nombreEntidad} añadido correctamente.`,
        );
        ocultarDialogo();
      } else {
        mostrarError(
          "Error al crear",
          `No se pudo crear el registro en ${titulo}.`,
        );
      }
    } catch (err) {
      console.error(`Error en la creación de ${nombreEntidad}:`, err);
      mostrarError(
        "Error al crear",
        err.message || "Ocurrió un fallo durante la creación.",
      );
    }
  };

  // Se procesa la acción de modificar registro tras confirmación
  const ejecutarModificacion = async () => {
    const id = registroActual[campoId];
    const payload = prepararPayload();
    delete payload[campoId];
    delete payload.created_at;

    try {
      const resultado = await alModificar(id, payload);
      if (resultado) {
        mostrarExito(
          "Registro actualizado",
          `${nombreEntidad} modificado correctamente.`,
        );
        ocultarDialogo();
      } else {
        mostrarError(
          "Error al actualizar",
          `No se pudieron guardar los cambios en ${titulo}.`,
        );
      }
    } catch (err) {
      console.error(`Error en la modificación de ${nombreEntidad}:`, err);
      mostrarError(
        "Error al actualizar",
        err.message || "Ocurrió un fallo durante la actualización.",
      );
    }
  };

  // Se gestiona el envío del formulario con confirmación previa en caso de modificación
  const manejarGuardar = () => {
    if (!validarFormulario()) {
      mostrarError(
        "Formulario incompleto",
        "Por favor, complete todos los campos obligatorios.",
      );
      return;
    }

    if (esEdicion) {
      // Se solicita confirmación previa al usuario antes de modificar según reglas de negocio
      confirmDialog({
        message: `¿Está seguro de que desea guardar las modificaciones en este ${nombreEntidad.toLowerCase()}?`,
        header: "Confirmar Modificación",
        icon: "pi pi-exclamation-triangle",
        acceptLabel: "Sí, guardar",
        rejectLabel: "Cancelar",
        acceptClassName: "p-button-primary",
        rejectClassName: "p-button-secondary p-button-text",
        accept: ejecutarModificacion,
      });
    } else {
      ejecutarCreacion();
    }
  };

  // Se solicita confirmación previa antes de eliminar un registro según reglas de negocio
  const manejarEliminar = (registro) => {
    const id = registro[campoId];
    const etiqueta = registro.nombre || registro.siglas || registro[campoId];

    confirmDialog({
      message: `¿Está seguro de que desea eliminar permanentemente "${etiqueta}"? Esta acción no se puede deshacer.`,
      header: "Confirmar Eliminación",
      icon: "pi pi-trash",
      acceptLabel: "Sí, eliminar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      rejectClassName: "p-button-secondary p-button-text",
      accept: async () => {
        try {
          const resultado = await alEliminar(id);
          if (resultado) {
            mostrarExito(
              "Registro eliminado",
              `${nombreEntidad} eliminado correctamente.`,
            );
          } else {
            mostrarError(
              "Error al eliminar",
              `No se pudo eliminar el registro de ${titulo}.`,
            );
          }
        } catch (err) {
          console.error(`Error al eliminar ${nombreEntidad}:`, err);
          mostrarError(
            "Error al eliminar",
            err.message || "Ocurrió un fallo durante la eliminación.",
          );
        }
      },
    });
  };

  // Se exportan los datos actuales de la tabla a formato CSV
  const exportarCSV = () => {
    if (tablaRef.current) {
      tablaRef.current.exportCSV();
      mostrarInfo(
        "Exportación iniciada",
        "Se ha generado el archivo CSV con los datos de la tabla.",
      );
    }
  };

  // Cabecera integrada del DataTable con botones de acción y campo de búsqueda global
  const renderizarCabeceraTabla = () => (
    <div className='flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3'>
      <div className='flex flex-wrap align-items-center gap-2'>
        <Button
          type='button'
          label='Nuevo Registro'
          icon='pi pi-plus'
          severity='primary'
          size='small'
          onClick={abrirNuevo}
        />
        {alRecargar && (
          <Button
            type='button'
            label='Recargar'
            icon='pi pi-refresh'
            severity='secondary'
            size='small'
            outlined
            onClick={async () => {
              await alRecargar();
              mostrarInfo(
                "Datos recargados",
                `Se ha actualizado la lista de ${titulo.toLowerCase()}.`,
              );
            }}
          />
        )}
        <Button
          type='button'
          icon='pi pi-file-export'
          label='Exportar CSV'
          severity='secondary'
          size='small'
          outlined
          onClick={exportarCSV}
        />
        {accionesExtra}
      </div>

      <div className='flex align-items-center'>
        <span className='p-input-icon-left w-full md:w-auto'>
          <i className='pi pi-search' />
          <InputText
            type='search'
            value={filtroGlobal}
            onChange={(e) => setFiltroGlobal(e.target.value)}
            placeholder='Buscar...'
            className='p-inputtext-sm w-full md:w-16rem'
          />
        </span>
      </div>
    </div>
  );

  // Renderizado de las acciones de cada fila (editar y eliminar)
  const plantillaAcciones = (rowData) => (
    <div className='flex gap-1 justify-content-center'>
      <Button
        icon='pi pi-pencil'
        severity='info'
        rounded
        text
        size='small'
        tooltip='Modificar registro'
        tooltipOptions={{ position: "top" }}
        onClick={() => abrirEditar(rowData)}
      />
      <Button
        icon='pi pi-trash'
        severity='danger'
        rounded
        text
        size='small'
        tooltip='Eliminar registro'
        tooltipOptions={{ position: "top" }}
        onClick={() => manejarEliminar(rowData)}
      />
    </div>
  );

  // Cabecera estilizada del modal de formulario
  const cabeceraDialogo = (
    <div className='flex align-items-center gap-3'>
      <div
        className='flex align-items-center justify-content-center border-round'
        style={{
          width: "36px",
          height: "36px",
          backgroundColor: "var(--primary-light)",
          color: "var(--primary-color)",
        }}
      >
        <i
          className={
            esEdicion ? "pi pi-pencil text-base" : "pi pi-plus text-base"
          }
        />
      </div>
      <div>
        <h3 className='m-0 font-bold text-lg text-color'>
          {esEdicion ? "Modificar" : "Nuevo"} {nombreEntidad}
        </h3>
        <p className='text-xs text-muted m-0 mt-1'>
          {esEdicion
            ? "Actualice los datos del registro y confirme para guardar."
            : `Rellene los campos obligatorios para dar de alta un nuevo elemento.`}
        </p>
      </div>
    </div>
  );

  // Pie de diálogo modal con botones de guardar y cancelar
  const pieDialogo = (
    <div className='flex justify-content-end align-items-center gap-2'>
      <Button
        label='Cancelar'
        icon='pi pi-times'
        severity='secondary'
        outlined
        size='small'
        onClick={ocultarDialogo}
      />
      <Button
        label={esEdicion ? "Guardar Cambios" : "Crear Registro"}
        icon='pi pi-check'
        severity='primary'
        size='small'
        onClick={manejarGuardar}
      />
    </div>
  );

  return (
    <div className='page-container'>
      <ConfirmDialog />

      {/* Cabecera estándar de la página */}
      <div className='flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2'>
        <div>
          <h1 className='page-title m-0'>{titulo}</h1>
          {descripcion && <p className='text-muted m-0 mt-1'>{descripcion}</p>}
        </div>
        <Button
          type='button'
          label='Volver a Herramientas'
          icon='pi pi-arrow-left'
          severity='secondary'
          size='small'
          outlined
          onClick={() => navigate("/herramientas")}
        />
      </div>

      <Divider />

      {/* Contenedor principal con Card idéntico a las páginas de la aplicación */}
      <div className='page-content'>
        <Card className='shadow-1 border-round surface-card'>
          <DataTable
            ref={tablaRef}
            value={datos}
            loading={cargando}
            dataKey={campoId}
            header={renderizarCabeceraTabla()}
            paginator
            paginatorPosition='top'
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            globalFilter={filtroGlobal}
            emptyMessage='No existen datos para esta tabla.'
            stripedRows
            responsiveLayout='scroll'
            className='p-datatable-sm'
          >
            {columnas
              .filter((col) => col.mostrarEnTabla !== false)
              .map((col) => {
                if (col.renderizar) {
                  return (
                    <Column
                      key={col.campo}
                      field={col.campo}
                      header={col.encabezado}
                      body={col.renderizar}
                      sortable={col.ordenar !== false}
                      style={{ width: col.ancho || "auto" }}
                    />
                  );
                }

                if (col.tipo === "booleano") {
                  return (
                    <Column
                      key={col.campo}
                      field={col.campo}
                      header={col.encabezado}
                      sortable={col.ordenar !== false}
                      style={{ width: col.ancho || "110px" }}
                      body={(rowData) => (
                        <Tag
                          severity={rowData[col.campo] ? "success" : "danger"}
                          value={
                            rowData[col.campo]
                              ? col.etiquetaVerdadero || "Activo"
                              : col.etiquetaFalso || "Inactivo"
                          }
                        />
                      )}
                    />
                  );
                }

                if (col.tipo === "fecha") {
                  return (
                    <Column
                      key={col.campo}
                      field={col.campo}
                      header={col.encabezado}
                      sortable={col.ordenar !== false}
                      style={{ width: col.ancho || "140px" }}
                      body={(rowData) => {
                        const fecha = rowData[col.campo];
                        if (!fecha) return "-";
                        try {
                          const parsed = new Date(fecha);
                          return isNaN(parsed.getTime())
                            ? fecha
                            : parsed.toLocaleDateString("es-ES");
                        } catch {
                          return fecha;
                        }
                      }}
                    />
                  );
                }

                if (col.tipo === "seleccion" && col.opciones) {
                  return (
                    <Column
                      key={col.campo}
                      field={col.campo}
                      header={col.encabezado}
                      sortable={col.ordenar !== false}
                      style={{ width: col.ancho || "auto" }}
                      body={(rowData) => {
                        const val = rowData[col.campo];
                        const encontrada = col.opciones.find(
                          (opt) => opt.value === val,
                        );
                        return encontrada ? encontrada.label : val || "-";
                      }}
                    />
                  );
                }

                return (
                  <Column
                    key={col.campo}
                    field={col.campo}
                    header={col.encabezado}
                    sortable={col.ordenar !== false}
                    style={{ width: col.ancho || "auto" }}
                  />
                );
              })}

            <Column
              header='Acciones'
              body={plantillaAcciones}
              exportable={false}
              style={{ width: "110px", textAlign: "center" }}
            />
          </DataTable>
        </Card>
      </div>

      {/* Diálogo modal estructurado y coherente para Crear / Modificar registro */}
      <Dialog
        visible={dialogoVisible}
        style={{ width: "640px", maxWidth: "95vw" }}
        header={cabeceraDialogo}
        modal
        className='p-fluid'
        footer={pieDialogo}
        onHide={ocultarDialogo}
      >
        <div className='grid formgrid mt-2'>
          {columnas
            .filter(
              (col) => col.mostrarEnFormulario !== false && !col.soloLectura,
            )
            .map((col) => {
              const valor = registroActual[col.campo];
              const error = erroresFormulario[col.campo];
              // Se calcula el ancho de columna (ancho completo para áreas de texto o nombres largos, media columna para el resto)
              const claseColumna =
                col.tipo === "textarea" ||
                col.anchoCompleto ||
                col.campo === "nombre" ||
                col.campo === "descripcion" ||
                col.campo === "enunciado"
                  ? "col-12"
                  : "col-12 md:col-6";

              return (
                <div
                  key={col.campo}
                  className={`${claseColumna} form-field-group`}
                >
                  <label htmlFor={col.campo} className='form-field-label'>
                    {col.encabezado}
                    {col.requerido && (
                      <span className='text-red-500 ml-1'>*</span>
                    )}
                  </label>

                  {col.tipo === "textarea" ? (
                    <InputTextarea
                      id={col.campo}
                      value={valor || ""}
                      onChange={(e) => manejarCambio(col.campo, e.target.value)}
                      rows={3}
                      autoResize
                      className={`w-full ${error ? "p-invalid" : ""}`}
                      placeholder={col.placeholder || ""}
                    />
                  ) : col.tipo === "numero" ? (
                    <InputNumber
                      id={col.campo}
                      value={
                        valor !== undefined && valor !== null
                          ? Number(valor)
                          : null
                      }
                      onValueChange={(e) => manejarCambio(col.campo, e.value)}
                      min={col.min !== undefined ? col.min : undefined}
                      max={col.max !== undefined ? col.max : undefined}
                      locale='es-ES'
                      minFractionDigits={col.decimales ? 1 : 0}
                      maxFractionDigits={col.decimales ? 2 : 0}
                      className={`w-full ${error ? "p-invalid" : ""}`}
                      placeholder={col.placeholder || ""}
                    />
                  ) : col.tipo === "fecha" ? (
                    <Calendar
                      id={col.campo}
                      value={valor || null}
                      onChange={(e) => manejarCambio(col.campo, e.value)}
                      dateFormat='dd/mm/yy'
                      showIcon
                      className={`w-full ${error ? "p-invalid" : ""}`}
                      placeholder='Seleccionar fecha'
                    />
                  ) : col.tipo === "seleccion" ? (
                    <Dropdown
                      id={col.campo}
                      value={valor || null}
                      options={col.opciones || []}
                      onChange={(e) => manejarCambio(col.campo, e.value)}
                      optionLabel='label'
                      optionValue='value'
                      itemTemplate={col.campo === 'id_modulo' ? plantillaOpcionModulo : col.itemTemplate}
                      valueTemplate={col.campo === 'id_modulo' ? plantillaValorModulo : col.valueTemplate}
                      placeholder={col.placeholder || "Seleccionar una opción"}
                      filter={col.filtrable !== false}
                      showClear={!col.requerido}
                      className={`w-full ${error ? "p-invalid" : ""}`}
                    />
                  ) : col.tipo === "booleano" ? (
                    <div className='flex align-items-center gap-2 p-2 border-1 surface-border border-round surface-ground mt-1'>
                      <Checkbox
                        inputId={col.campo}
                        checked={Boolean(valor)}
                        onChange={(e) => manejarCambio(col.campo, e.checked)}
                      />
                      <label
                        htmlFor={col.campo}
                        className='cursor-pointer text-sm font-medium text-color m-0'
                      >
                        {col.etiquetaCheckbox || "Registro en estado activo"}
                      </label>
                    </div>
                  ) : (
                    <InputText
                      id={col.campo}
                      value={valor || ""}
                      onChange={(e) => manejarCambio(col.campo, e.target.value)}
                      className={`w-full ${error ? "p-invalid" : ""}`}
                      placeholder={col.placeholder || ""}
                    />
                  )}

                  {error && <small className='p-error'>{error}</small>}
                </div>
              );
            })}
        </div>
      </Dialog>
    </div>
  );
};

export default TablaMantenimiento;

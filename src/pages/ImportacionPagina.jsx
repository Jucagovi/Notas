import React, { useRef } from "react";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { InputTextarea } from "primereact/inputtextarea";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { ProgressBar } from "primereact/progressbar";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { SelectButton } from "primereact/selectbutton";
import useImportacion from "../hooks/useImportacion.js";
import useToast from "../hooks/useToast.js";
import { formatearTamanoArchivo } from "../utils/formatters.js";

// Componente principal de página para la importación masiva de datos CSV a tablas del sistema
const ImportacionPagina = () => {
  const {
    tablas,
    tablaSeleccionada,
    configuracionActual,
    filasProcesadas,
    filasFiltradas,
    resumen,
    procesando,
    importando,
    progreso,
    filtroEstado,
    textoCSV,
    delimitador,
    esquemaCabeceras,
    setFiltroEstado,
    setTextoCSV,
    setDelimitador,
    cambiarTabla,
    descargarPlantilla,
    descargarPlantillaVacia,
    procesarArchivo,
    procesarTexto,
    ejecutarImportacion,
    limpiar,
  } = useImportacion("Discentes");

  const { mostrarInfo } = useToast();
  const fileUploadRef = useRef(null);

  // Se copia la cadena de cabeceras al portapapeles del usuario
  const copiarCabeceras = () => {
    if (navigator.clipboard && esquemaCabeceras) {
      navigator.clipboard.writeText(esquemaCabeceras);
      mostrarInfo(
        "Copiado al portapapeles",
        "Se ha copiado el esquema de cabeceras del CSV.",
      );
    }
  };

  // Opciones disponibles para el selector desplegable de delimitadores
  const opcionesDelimitador = [
    { label: "Automático (Detección inteligente)", value: "" },
    { label: "Coma (,)", value: "," },
    { label: "Punto y coma (;)", value: ";" },
    { label: "Tabulador (\\t)", value: "\t" },
  ];

  // Opciones de filtrado para la vista previa de la tabla
  const opcionesFiltro = [
    { label: `Todos (${resumen.total})`, value: "todos" },
    { label: `Válidos (${resumen.validos})`, value: "validos" },
    { label: `Con errores (${resumen.invalidos})`, value: "errores" },
  ];

  // Plantilla personalizada para los elementos del selector de tablas
  const plantillaOpcionTabla = (opcion) => {
    return (
      <div className='flex align-items-center gap-2'>
        <i className={`${opcion.icono}`} style={{ color: opcion.color }} />
        <div>
          <div className='font-semibold'>{opcion.nombre}</div>
          <div className='text-xs text-muted'>{opcion.descripcion}</div>
        </div>
      </div>
    );
  };

  // Plantilla para el valor seleccionado en el selector de tablas
  const plantillaValorSeleccionado = (opcion) => {
    if (!opcion) return <span>Seleccione una tabla</span>;
    return (
      <div className='flex align-items-center gap-2'>
        <i className={`${opcion.icono}`} style={{ color: opcion.color }} />
        <span className='font-semibold'>{opcion.nombre}</span>
      </div>
    );
  };

  // Se solicita confirmación previa a la inserción masiva en Supabase
  const confirmarImportacion = () => {
    const totalAImportar = resumen.validos;
    const conErrores = resumen.invalidos > 0;

    confirmDialog({
      message: conErrores
        ? `Se detectaron ${resumen.invalidos} filas con errores que serán omitidas. ¿Desea proceder con la importación de los ${totalAImportar} registros válidos en la tabla ${configuracionActual?.nombre}?`
        : `¿Está seguro de que desea importar ${totalAImportar} registros en la tabla ${configuracionActual?.nombre}?`,
      header: "Confirmar Importación Masiva",
      icon: conErrores
        ? "pi pi-exclamation-triangle text-orange-500"
        : "pi pi-question-circle text-primary",
      acceptLabel: `Importar ${totalAImportar} registros`,
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-primary",
      accept: () => ejecutarImportacion(true),
    });
  };

  // Plantilla para la columna de estado de validación en la tabla de vista previa
  const plantillaColumnaEstado = (fila) => {
    if (fila.esValido) {
      return (
        <Tag
          severity='success'
          value='Válido'
          icon='pi pi-check-circle'
          className='text-xs px-2 py-1'
        />
      );
    }

    return (
      <div className='flex flex-column gap-1'>
        <Tag
          severity='danger'
          value='Error'
          icon='pi pi-times-circle'
          className='text-xs px-2 py-1'
        />
        <div className='text-xs text-red-600 font-semibold mt-1'>
          {fila.errores.map((err, i) => (
            <div key={i} className='flex align-items-center gap-1'>
              <i className='pi pi-exclamation-circle text-xs' />
              <span>{err}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Plantilla personalizada para el elemento de archivo en FileUpload con tamaño en formato español (coma y 1 decimal)
  const plantillaElementoArchivo = (file, props) => {
    const tamanoFormateado = formatearTamanoArchivo(file.size);

    return (
      <div className='flex align-items-center justify-content-between p-3 surface-card border-1 surface-border border-round gap-3 w-full my-2'>
        <div className='flex align-items-center gap-3 overflow-hidden'>
          <div
            className='flex align-items-center justify-content-center border-round flex-shrink-0'
            style={{
              width: '42px',
              height: '42px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
            }}
          >
            <i className='pi pi-file-excel text-xl' />
          </div>
          <div className='flex flex-column overflow-hidden'>
            <span className='font-semibold text-sm text-color text-overflow-ellipsis overflow-hidden white-space-nowrap'>
              {file.name}
            </span>
            <span className='text-xs text-muted font-mono mt-1'>
              {tamanoFormateado}
            </span>
          </div>
        </div>
        <div className='flex align-items-center gap-2 flex-shrink-0'>
          <Tag
            value={tamanoFormateado}
            severity='info'
            className='text-xs font-mono px-2 py-1'
          />
          <Button
            type='button'
            icon='pi pi-times'
            rounded
            text
            severity='danger'
            size='small'
            onClick={(e) => {
              if (props && typeof props.onRemove === 'function') {
                props.onRemove(e);
              }
            }}
            tooltip='Quitar archivo'
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>
    );
  };

  // Determinación de clases CSS para resaltar visualmente filas erróneas
  const obtenerClaseFila = (fila) => {
    if (!fila.esValido) {
      return "surface-50 border-left-3 border-red-500";
    }
    return "";
  };

  return (
    <div className='page-container'>
      <ConfirmDialog />

      {/* Cabecera principal de la página */}
      <div className='flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-2'>
        <div>
          <h1 className='page-title m-0 flex align-items-center gap-2'>
            <i className='pi pi-file-import text-primary' />
            <span>Importación masiva de datos</span>
          </h1>
          <p className='text-muted m-0 mt-1'>
            Carga ágil y segura de grandes volúmenes de registros en tablas
            clave mediante archivos CSV o texto directo con validación previa.
          </p>
        </div>
      </div>

      <Divider />

      <div className='page-content flex flex-column gap-4'>
        {/* =========================================================================
            SECCIÓN 1: Configuración de Destino y Guía de Columnas
           ========================================================================= */}
        <div className='grid'>
          <div className='col-12 lg:col-5'>
            <Card className='h-full border-1 surface-border shadow-1'>
              <h3 className='m-0 text-lg font-bold mb-3 flex align-items-center gap-2'>
                <i className='pi pi-database text-primary' />
                <span>1. Tabla de Destino</span>
              </h3>

              <div className='flex flex-column gap-3'>
                <div>
                  <label
                    htmlFor='selector-tabla'
                    className='block text-sm font-semibold mb-2'
                  >
                    Seleccione la entidad a importar:
                  </label>
                  <Dropdown
                    id='selector-tabla'
                    value={tablaSeleccionada}
                    options={tablas}
                    optionValue='id'
                    optionLabel='nombre'
                    itemTemplate={plantillaOpcionTabla}
                    valueTemplate={plantillaValorSeleccionado(
                      configuracionActual,
                    )}
                    onChange={(e) => {
                      cambiarTabla(e.value);
                      if (fileUploadRef.current) {
                        fileUploadRef.current.clear();
                      }
                    }}
                    className='w-full'
                    placeholder='Seleccionar tabla...'
                  />
                </div>

                <div>
                  <label
                    htmlFor='selector-delimitador'
                    className='block text-sm font-semibold mb-2'
                  >
                    Delimitador CSV:
                  </label>
                  <Dropdown
                    id='selector-delimitador'
                    value={delimitador}
                    options={opcionesDelimitador}
                    onChange={(e) => setDelimitador(e.value)}
                    className='w-full text-sm'
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className='col-12 lg:col-7'>
            <Card className='h-full border-1 surface-border shadow-1 flex flex-column justify-content-between'>
              <div>
                <div className='flex align-items-center justify-content-between mb-2'>
                  <h3 className='m-0 text-lg font-bold flex align-items-center gap-2'>
                    <i className='pi pi-code text-primary' />
                    <span>2. Esquema del fichero CSV</span>
                  </h3>
                </div>

                <p className='text-muted text-xs m-0 mb-3'>
                  Estructura exacta de cabeceras que debe contener la primera
                  fila del archivo CSV para la tabla{" "}
                  <strong>{configuracionActual?.nombre}</strong>:
                </p>

                {/* Bloque visual con el esquema de cabeceras formateado con el delimitador elegido */}
                <div
                  className='surface-900 text-0 border-round p-3 mb-3 font-mono text-sm overflow-x-auto shadow-1 select-all'
                  style={{ whiteSpace: "nowrap" }}
                >
                  <div className='text-xs text-400 mb-1 flex align-items-center justify-content-between'>
                    <span>
                      # Cabeceras CSV (
                      {configuracionActual?.columnas?.length || 0} campos):
                    </span>
                    {/* <span className='text-xs text-300'>Formato activo</span> */}
                  </div>
                  <div className='text-green-400 font-bold font-mono text-sm py-1'>
                    {esquemaCabeceras}
                  </div>
                </div>
              </div>

              {/* Acciones para generar y descargar archivo CSV vacío o copiar cabeceras */}
              <div className='flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top-1 surface-border'>
                <Button
                  label='Copiar Esquema'
                  icon='pi pi-copy'
                  size='small'
                  severity='secondary'
                  outlined
                  onClick={copiarCabeceras}
                  tooltip='Copia la línea de cabeceras al portapapeles'
                  tooltipOptions={{ position: "top" }}
                />

                <div className='flex flex-wrap gap-2'>
                  <Button
                    label='Generar CSV Vacío'
                    icon='pi pi-file'
                    size='small'
                    severity='primary'
                    onClick={descargarPlantillaVacia}
                    tooltip={`Descarga un fichero CSV vacío con la estructura de cabeceras para ${configuracionActual?.nombre}`}
                    tooltipOptions={{ position: "top" }}
                    className='font-bold'
                  />
                  <Button
                    label='Plantilla con Ejemplos'
                    icon='pi pi-download'
                    size='small'
                    severity='secondary'
                    outlined
                    onClick={descargarPlantilla}
                    tooltip='Descarga la plantilla con registros de muestra'
                    tooltipOptions={{ position: "top" }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* =========================================================================
            SECCIÓN 2: Zona de Carga de Datos (Archivo CSV o Copiar/Pegar)
           ========================================================================= */}
        <Card className='border-1 surface-border shadow-1'>
          <h3 className='m-0 text-lg font-bold mb-3 flex align-items-center gap-2'>
            <i className='pi pi-upload text-primary' />
            <span>3. Carga y procesamiento del CSV</span>
          </h3>

          <TabView>
            {/* Pestaña A: Carga de Archivo */}
            <TabPanel
              header='Subir Archivo CSV'
              leftIcon='pi pi-file-excel mr-2'
            >
              <div className='flex flex-column gap-3'>
                <FileUpload
                  ref={fileUploadRef}
                  name='archivoCsv'
                  mode='advanced'
                  accept='.csv,text/csv,text/plain'
                  maxFileSize={5000000}
                  chooseLabel='Seleccionar archivo CSV'
                  uploadLabel='Validar y Procesar'
                  cancelLabel='Cancelar'
                  customUpload
                  itemTemplate={plantillaElementoArchivo}
                  uploadHandler={(e) => {
                    if (e.files && e.files.length > 0) {
                      procesarArchivo(e.files[0], delimitador);
                    }
                  }}
                  onClear={limpiar}
                  emptyTemplate={
                    <div className='zona-arrastre-csv flex flex-column align-items-center justify-content-center'>
                      <i className='pi pi-cloud-upload icono-arrastre' />
                      <p className='titulo-arrastre'>
                        Arrastre y suelte su archivo CSV aquí o haga clic en "Seleccionar archivo CSV"
                      </p>
                      <p className='subtitulo-arrastre'>
                        Formatos soportados: <strong>.csv</strong> (codificación UTF-8 recomendada, máx. 5 MB)
                      </p>
                    </div>
                  }
                />
              </div>
            </TabPanel>

            {/* Pestaña B: Copiar y Pegar directo */}
            <TabPanel header='Copiar y Pegar Texto' leftIcon='pi pi-copy mr-2'>
              <div className='flex flex-column gap-3'>
                <p className='text-muted text-sm m-0'>
                  Pegue directamente los datos copiados desde su hoja de cálculo
                  (Excel, LibreOffice Calc o Google Sheets). La primera fila
                  debe incluir los nombres de las columnas.
                </p>

                <InputTextarea
                  value={textoCSV}
                  onChange={(e) => setTextoCSV(e.target.value)}
                  rows={8}
                  className='w-full font-mono text-sm surface-ground text-color border-1 surface-border'
                  placeholder={`${configuracionActual?.columnas?.map((c) => c.campo).join(delimitador || ",")}\n${configuracionActual?.filasEjemplo?.map((f) => Object.values(f).join(delimitador || ",")).join("\n")}`}
                />

                <div className='flex justify-content-end gap-2'>
                  <Button
                    label='Limpiar Texto'
                    icon='pi pi-trash'
                    severity='secondary'
                    outlined
                    size='small'
                    disabled={!textoCSV || procesando}
                    onClick={limpiar}
                  />
                  <Button
                    label='Validar y Procesar Texto'
                    icon='pi pi-cog'
                    severity='primary'
                    size='small'
                    loading={procesando}
                    disabled={!textoCSV.trim() || procesando}
                    onClick={() => procesarTexto(textoCSV, delimitador)}
                  />
                </div>
              </div>
            </TabPanel>
          </TabView>
        </Card>

        {/* Barra de progreso interactiva durante la inserción */}
        {importando && (
          <div className='flex flex-column gap-2'>
            <div className='flex justify-content-between text-sm font-semibold'>
              <span>Guardando registros en Supabase...</span>
              <span>{progreso}%</span>
            </div>
            <ProgressBar
              value={progreso}
              showValue={false}
              style={{ height: "8px" }}
            />
          </div>
        )}

        {/* =========================================================================
            SECCIÓN 3: Vista Previa y Resumen de Validación
           ========================================================================= */}
        {filasProcesadas.length > 0 && (
          <Card className='border-1 surface-border shadow-2'>
            {/* Barra superior del resumen */}
            <div className='flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-4'>
              <div className='flex align-items-center gap-3'>
                <div
                  className='flex align-items-center justify-content-center border-round'
                  style={{
                    width: "46px",
                    height: "46px",
                    backgroundColor: "var(--primary-color)",
                    color: "#ffffff",
                  }}
                >
                  <i className='pi pi-table text-xl' />
                </div>
                <div>
                  <h3 className='m-0 text-lg font-bold'>
                    4. Vista Previa de Datos
                  </h3>
                  <p className='text-muted text-xs m-0'>
                    Compruebe los registros antes de proceder con la inserción
                    definitiva en la base de datos.
                  </p>
                </div>
              </div>

              {/* Botón de importación definitiva */}
              <div className='flex align-items-center gap-2'>
                <Button
                  label='Cancelar'
                  icon='pi pi-times'
                  severity='secondary'
                  text
                  size='small'
                  onClick={limpiar}
                  disabled={importando}
                />
                <Button
                  label={`Importar ${resumen.validos} Registros Válidos`}
                  icon='pi pi-check'
                  severity='success'
                  size='small'
                  disabled={resumen.validos === 0 || importando}
                  loading={importando}
                  onClick={confirmarImportacion}
                  className='font-bold'
                />
              </div>
            </div>

            {/* Tarjetas de estadísticas de validación */}
            <div className='grid mb-3'>
              <div className='col-12 sm:col-4 p-2'>
                <div className='border-1 surface-border surface-card border-round p-3 text-center'>
                  <div className='text-xs text-muted font-bold uppercase mb-1'>
                    Total Leídos
                  </div>
                  <div className='text-2xl font-bold text-900'>
                    {resumen.total}
                  </div>
                </div>
              </div>
              <div className='col-12 sm:col-4 p-2'>
                <div className='border-1 surface-border surface-card border-round p-3 text-center border-green-500'>
                  <div className='text-xs text-green-700 font-bold uppercase mb-1'>
                    Registros Válidos
                  </div>
                  <div className='text-2xl font-bold text-green-600'>
                    {resumen.validos}
                  </div>
                </div>
              </div>
              <div className='col-12 sm:col-4 p-2'>
                <div className='border-1 surface-border surface-card border-round p-3 text-center border-red-500'>
                  <div className='text-xs text-red-700 font-bold uppercase mb-1'>
                    Registros con Error
                  </div>
                  <div className='text-2xl font-bold text-red-600'>
                    {resumen.invalidos}
                  </div>
                </div>
              </div>
            </div>

            {/* Filtro rápido por estado */}
            <div className='flex flex-column sm:flex-row align-items-center justify-content-between gap-3 mb-3'>
              <div className='flex align-items-center gap-2'>
                <span className='text-xs font-semibold text-muted'>
                  Mostrar:
                </span>
                <SelectButton
                  value={filtroEstado}
                  options={opcionesFiltro}
                  onChange={(e) => e.value && setFiltroEstado(e.value)}
                  className='text-xs'
                />
              </div>

              {resumen.invalidos > 0 && (
                <div className='text-xs text-red-600 flex align-items-center gap-1 font-semibold'>
                  <i className='pi pi-exclamation-triangle' />
                  <span>
                    Las filas resaltadas en rojo contienen errores y no serán
                    insertadas.
                  </span>
                </div>
              )}
            </div>

            {/* Tabla de previsualización DataTable */}
            <DataTable
              value={filasFiltradas}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              tableStyle={{ minWidth: "50rem" }}
              rowClassName={obtenerClaseFila}
              size='small'
              stripedRows
              emptyMessage='No hay registros para mostrar con el filtro actual.'
            >
              <Column
                field='indice'
                header='#'
                style={{ width: "60px", textAlign: "center" }}
                body={(rowData) => (
                  <span className='font-mono text-xs font-semibold'>
                    {rowData.indice}
                  </span>
                )}
              />
              <Column
                header='Estado'
                body={plantillaColumnaEstado}
                style={{ minWidth: "150px" }}
              />

              {/* Columnas dinámicas según el esquema de la tabla */}
              {configuracionActual?.columnas?.map((col) => (
                <Column
                  key={col.campo}
                  field={`datosVistaPrevia.${col.campo}`}
                  header={col.etiqueta}
                  body={(rowData) => {
                    const valor = rowData.datosVistaPrevia[col.campo];
                    if (valor === undefined || valor === null || valor === "") {
                      return (
                        <span className='text-muted font-italic text-xs'>
                          Vacío
                        </span>
                      );
                    }
                    if (col.tipo === "booleano") {
                      const valBool = rowData.datosNormalizados[col.campo];
                      return (
                        <Tag
                          severity={valBool ? "success" : "secondary"}
                          value={valBool ? "Sí" : "No"}
                          className='text-xs'
                        />
                      );
                    }
                    return <span className='text-sm'>{String(valor)}</span>;
                  }}
                  style={{ minWidth: "140px" }}
                />
              ))}
            </DataTable>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ImportacionPagina;

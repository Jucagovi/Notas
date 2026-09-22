import React, { useState } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Tooltip } from 'primereact/tooltip';
import TablaBase from '../common/TablaBase.jsx';
import BotonAccion from '../common/BotonAccion.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';
import { confirmarBorrado } from '../common/ModalConfirmacion.jsx';
import DialogoNuevoTramo from './DialogoNuevoTramo.jsx';
import DialogoGenerarTramos from './DialogoGenerarTramos.jsx';
import DialogoClonarTramos from './DialogoClonarTramos.jsx';
import {
  formatearHoraParaMostrar,
  formatearHoraParaBD,
  esHoraValida,
  esSesionRecreo
} from './constantesHorarios.js';

/**
 * TablaTramosHorarios - Componente presentacional para la configuración de tramos horarios (Pestaña 1).
 *
 * Responsabilidad Única: Renderizar el DataTable editable con cellEdit para definir y modificar
 * en tiempo real el orden, horas de inicio/fin y descripción de cada hora lectiva o descanso,
 * permitiendo además la generación personalizada por rango horario y la clonación desde cursos previos.
 *
 * @param {Object} props
 * @param {Array<Object>} props.sesiones - Lista de tramos horarios ordenados.
 * @param {Function} props.onCrearTramo - Callback para crear un nuevo tramo.
 * @param {Function} props.onActualizarTramo - Callback para actualizar un tramo por su id.
 * @param {Function} props.onEliminarTramo - Callback para eliminar un tramo por su id.
 * @param {Function} props.onGenerarPredeterminados - Callback para generar los tramos base.
 * @param {Function} [props.onClonarTramos] - Callback para clonar los tramos de otro curso.
 * @param {Array<Object>} [props.cursos=[]] - Lista de cursos académicos registrados.
 * @param {string|null} [props.cursoId=null] - Identificador del curso actual.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const TablaTramosHorarios = ({
  sesiones = [],
  onCrearTramo,
  onActualizarTramo,
  onEliminarTramo,
  onGenerarPredeterminados,
  onClonarTramos,
  cursos = [],
  cursoId = null,
  cargando = false,
  guardando = false
}) => {
  const [dialogoNuevoVisible, setDialogoNuevoVisible] = useState(false);
  const [dialogoGenerarVisible, setDialogoGenerarVisible] = useState(false);
  const [dialogoClonarVisible, setDialogoClonarVisible] = useState(false);

  // Manejador del evento de finalización de edición en celda.
  const alCompletarEdicionCelda = (e) => {
    const { rowData, newValue, field } = e;
    if (newValue === undefined || newValue === null) return;

    // Se verifica si el valor efectivamente ha cambiado.
    if (field === 'hora_inicio' || field === 'hora_fin') {
      const horaVisualOriginal = formatearHoraParaMostrar(rowData[field]);
      const horaVisualNueva = formatearHoraParaMostrar(newValue);
      if (horaVisualOriginal === horaVisualNueva) return;

      if (!esHoraValida(newValue)) {
        return;
      }
      onActualizarTramo(rowData.id_sesion, {
        [field]: formatearHoraParaBD(newValue)
      });
      return;
    }

    if (rowData[field] !== newValue) {
      onActualizarTramo(rowData.id_sesion, { [field]: newValue });
    }
  };

  // Confirmación previa de eliminación para evitar borrados accidentales de tramos con clases.
  const manejarConfirmarBorrado = (sesion) => {
    confirmarBorrado({
      header: 'Eliminar Tramo Horario',
      message: `¿Estás seguro de que deseas eliminar el tramo "${sesion.descripcion || sesion.numero}"? Las clases asociadas a esta hora también se desvincularán.`,
      onAceptar: () => onEliminarTramo(sesion.id_sesion)
    });
  };

  // Editor numérico para la columna de número de orden.
  const editorNumero = (opciones) => {
    return (
      <InputNumber
        value={opciones.value}
        onValueChange={(e) => opciones.editorCallback(e.value)}
        min={1}
        max={30}
        className="w-full p-inputtext-sm"
        autoFocus
      />
    );
  };

  // Editor de texto simple para la descripción del tramo.
  const editorTexto = (opciones) => {
    return (
      <InputText
        type="text"
        value={opciones.value || ''}
        onChange={(e) => opciones.editorCallback(e.target.value)}
        className="w-full p-inputtext-sm"
        autoFocus
      />
    );
  };

  // Editor de hora formateada en HH:mm.
  const editorHora = (opciones) => {
    return (
      <InputText
        type="text"
        value={formatearHoraParaMostrar(opciones.value)}
        onChange={(e) => opciones.editorCallback(e.target.value)}
        placeholder="08:00"
        className="w-full p-inputtext-sm"
        autoFocus
      />
    );
  };

  // Plantilla visual para el campo de descripción con distinción de recreo y tooltip.
  const plantillaDescripcion = (fila) => {
    const esRecreo = esSesionRecreo(fila.descripcion);
    return (
      <div className="flex align-items-center gap-2 text-overflow-ellipsis white-space-nowrap overflow-hidden">
        <i
          className={`pi ${esRecreo ? 'pi-coffee text-orange-500' : 'pi-clock text-primary'}`}
        />
        <span
          className={`font-semibold ${esRecreo ? 'text-orange-700' : 'text-900'}`}
          data-pr-tooltip={fila.descripcion}
        >
          {fila.descripcion || `Tramo ${fila.numero}`}
        </span>
      </div>
    );
  };

  // Plantilla visual para la hora de inicio con formato HH:mm.
  const plantillaHoraInicio = (fila) => (
    <span className="font-medium text-700">
      {formatearHoraParaMostrar(fila.hora_inicio)}
    </span>
  );

  // Plantilla visual para la hora de fin con formato HH:mm.
  const plantillaHoraFin = (fila) => (
    <span className="font-medium text-700">
      {formatearHoraParaMostrar(fila.hora_fin)}
    </span>
  );

  // Plantilla para la columna de acciones de fila.
  const plantillaAcciones = (fila) => {
    return (
      <div className="flex align-items-center justify-content-end gap-1">
        <Button
          icon="pi pi-trash"
          severity="danger"
          text
          rounded
          tooltip="Eliminar tramo"
          tooltipOptions={{ position: 'top' }}
          onClick={() => manejarConfirmarBorrado(fila)}
        />
      </div>
    );
  };

  // Cabecera superior con botones de acción y mensaje orientativo.
  const cabeceraTabla = (
    <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3 py-2">
      <div className="flex flex-column gap-1">
        <span className="font-bold text-lg text-900">
          Tramos y Sesiones Lectivas
        </span>
        <span className="text-sm text-color-secondary">
          Haz clic directamente sobre cualquier celda de la tabla para editar su valor en tiempo real.
        </span>
      </div>
      <div className="flex align-items-center gap-2 flex-wrap">
        <Button
          label="Clonar de Otro Curso"
          icon="pi pi-copy"
          severity="secondary"
          outlined
          onClick={() => setDialogoClonarVisible(true)}
          disabled={guardando || cursos.filter((c) => c.id_curso !== cursoId).length === 0}
          tooltip="Clonar los tramos horarios de un curso académico previo"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          label="Generar Tramos Predeterminados"
          icon="pi pi-bolt"
          severity="secondary"
          outlined
          onClick={() => setDialogoGenerarVisible(true)}
          disabled={guardando}
          tooltip="Calcular automáticamente los tramos introduciendo el rango de horas de inicio y fin"
          tooltipOptions={{ position: 'top' }}
        />
        <BotonAccion
          tipo="guardar"
          label="Nuevo Tramo"
          icon="pi pi-plus"
          onClick={() => setDialogoNuevoVisible(true)}
          disabled={guardando}
        />
      </div>
    </div>
  );

  const siguienteOrden = sesiones.length > 0
    ? Math.max(...sesiones.map((s) => Number(s.numero) || 0)) + 1
    : 1;

  const otrosCursosDisponibles = cursos.filter((c) => c.id_curso !== cursoId).length > 0;

  return (
    <div className="flex flex-column gap-3 w-full">
      <Tooltip target="[data-pr-tooltip]" />

      {sesiones.length === 0 && !cargando ? (
        <div className="surface-card p-4 border-round shadow-1 flex flex-column gap-4">
          <EstadoVacio
            mensaje="No hay tramos horarios configurados"
            descripcion="Configura las horas lectivas del centro para poder ubicar las asignaturas en la cuadrícula semanal."
            icono="pi pi-clock"
            accion={
              <div className="flex gap-2 flex-wrap justify-content-center">
                <Button
                  label="Generar Tramos Predeterminados"
                  icon="pi pi-bolt"
                  severity="primary"
                  onClick={() => setDialogoGenerarVisible(true)}
                  loading={guardando}
                />
                {otrosCursosDisponibles && (
                  <Button
                    label="Clonar de Curso Anterior"
                    icon="pi pi-copy"
                    severity="secondary"
                    outlined
                    onClick={() => setDialogoClonarVisible(true)}
                    disabled={guardando}
                  />
                )}
                <Button
                  label="Añadir Manualmente"
                  icon="pi pi-plus"
                  outlined
                  onClick={() => setDialogoNuevoVisible(true)}
                />
              </div>
            }
          />
        </div>
      ) : (
        <div className="surface-card p-3 border-round shadow-1">
          <TablaBase
            data={sesiones}
            loading={cargando}
            header={cabeceraTabla}
            editMode="cell"
            paginator={sesiones.length > 10}
            paginatorPosition="top"
            rows={10}
            rowsPerPageOptions={[5, 10, 15, 20, 25]}
            emptyMessage="No hay tramos horarios disponibles."
            className="p-datatable-sm"
          >
            <Column
              field="numero"
              header="Orden"
              editor={editorNumero}
              onCellEditComplete={alCompletarEdicionCelda}
              sortable
              style={{ width: '90px', textAlign: 'center' }}
              bodyClassName="font-bold text-center"
            />
            <Column
              field="descripcion"
              header="Descripción / Tramo"
              body={plantillaDescripcion}
              editor={editorTexto}
              onCellEditComplete={alCompletarEdicionCelda}
              sortable
              style={{ minWidth: '200px' }}
            />
            <Column
              field="hora_inicio"
              header="Hora Inicio"
              body={plantillaHoraInicio}
              editor={editorHora}
              onCellEditComplete={alCompletarEdicionCelda}
              sortable
              style={{ width: '130px', textAlign: 'center' }}
            />
            <Column
              field="hora_fin"
              header="Hora Fin"
              body={plantillaHoraFin}
              editor={editorHora}
              onCellEditComplete={alCompletarEdicionCelda}
              sortable
              style={{ width: '130px', textAlign: 'center' }}
            />
            <Column
              header="Acciones"
              body={plantillaAcciones}
              exportable={false}
              style={{ width: '90px', textAlign: 'center' }}
            />
          </TablaBase>
        </div>
      )}

      {/* Diálogo modal para la creación de un nuevo tramo horario */}
      <DialogoNuevoTramo
        visible={dialogoNuevoVisible}
        onHide={() => setDialogoNuevoVisible(false)}
        onGuardar={(datos) => {
          onCrearTramo(datos);
          setDialogoNuevoVisible(false);
        }}
        siguienteNumero={siguienteOrden}
        guardando={guardando}
      />

      {/* Diálogo modal para calcular tramos predeterminados por rango horario */}
      <DialogoGenerarTramos
        visible={dialogoGenerarVisible}
        onHide={() => setDialogoGenerarVisible(false)}
        onConfirmar={(tramosCalculados) => {
          onGenerarPredeterminados(tramosCalculados);
          setDialogoGenerarVisible(false);
        }}
        tieneTramosPrevios={sesiones.length > 0}
        guardando={guardando}
      />

      {/* Diálogo modal para clonar tramos desde un curso anterior */}
      <DialogoClonarTramos
        visible={dialogoClonarVisible}
        onHide={() => setDialogoClonarVisible(false)}
        onConfirmarClonado={(cursoOrigenId) => {
          if (onClonarTramos) {
            onClonarTramos(cursoOrigenId);
          }
          setDialogoClonarVisible(false);
        }}
        cursos={cursos}
        cursoDestinoId={cursoId}
        tieneTramosActuales={sesiones.length > 0}
        guardando={guardando}
      />
    </div>
  );
};

export default TablaTramosHorarios;

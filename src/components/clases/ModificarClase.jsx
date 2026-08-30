import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import useClases from '../../hooks/useClases.js';
import useToast from '../../hooks/useToast.js';

// Componente para la modificación de clases, gestión de matriculación y desmatriculación de discentes
const ModificarClase = () => {
  const { mostrarExito, mostrarError } = useToast();

  const {
    clases,
    cargando: cargandoClases,
    discentesActivos,
    consultarDiscentesDeClase,
    matricular,
    desmatricular
  } = useClases();

  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);
  const [discentesMatriculados, setDiscentesMatriculados] = useState([]);
  const [cargandoDiscentes, setCargandoDiscentes] = useState(false);
  const [filtroMatriculados, setFiltroMatriculados] = useState('');

  // Estados del modal para matricular nuevos discentes
  const [modalMatricularVisible, setModalMatricularVisible] = useState(false);
  const [discentesParaMatricular, setDiscentesParaMatricular] = useState([]);
  const [filtroNuevosDiscentes, setFiltroNuevosDiscentes] = useState('');
  const [guardandoMatricula, setGuardandoMatricula] = useState(false);

  // Se localiza la clase actualmente seleccionada
  const claseActual = (clases || []).find((c) => c.clave === claseSeleccionadaId);

  // Se cargan los discentes matriculados en la clase activa
  const cargarMatriculados = useCallback(async () => {
    if (!claseActual) {
      setDiscentesMatriculados([]);
      return;
    }
    setCargandoDiscentes(true);
    try {
      const data = await consultarDiscentesDeClase(claseActual.id_curso, claseActual.id_modulo);
      setDiscentesMatriculados(data);
    } catch (err) {
      console.error('Error al cargar discentes matriculados:', err);
      mostrarError('Error', 'No se pudieron obtener los discentes de la clase.');
    } finally {
      setCargandoDiscentes(false);
    }
  }, [claseActual, consultarDiscentesDeClase, mostrarError]);

  useEffect(() => {
    let activo = true;
    const ejecutarCarga = async () => {
      if (!claseActual) {
        if (activo) setDiscentesMatriculados([]);
        return;
      }
      setCargandoDiscentes(true);
      try {
        const data = await consultarDiscentesDeClase(claseActual.id_curso, claseActual.id_modulo);
        if (activo) setDiscentesMatriculados(data);
      } catch (err) {
        console.error('Error al cargar discentes matriculados:', err);
      } finally {
        if (activo) setCargandoDiscentes(false);
      }
    };
    ejecutarCarga();
    return () => {
      activo = false;
    };
  }, [claseActual, consultarDiscentesDeClase]);

  // Se filtran los discentes activos que no estén matriculados en la clase actual
  const idsMatriculados = new Set((discentesMatriculados || []).map((d) => d.id_discente));
  const discentesDisponibles = (discentesActivos || []).filter(
    (d) => !idsMatriculados.has(d.id_discente)
  );

  // Se abre el diálogo modal para matricular nuevos alumnos
  const abrirModalMatricular = () => {
    setDiscentesParaMatricular([]);
    setFiltroNuevosDiscentes('');
    setModalMatricularVisible(true);
  };

  // Se procesa la acción de matricular los alumnos seleccionados en el modal
  const manejarGuardarNuevosMatriculados = async () => {
    if (discentesParaMatricular.length === 0) {
      mostrarError('Selección vacía', 'Debe seleccionar al menos un discente para matricular.');
      return;
    }

    setGuardandoMatricula(true);
    try {
      const ids = discentesParaMatricular.map((d) => d.id_discente);
      const res = await matricular(claseActual.id_curso, claseActual.id_modulo, ids);

      if (res.exito) {
        mostrarExito(
          'Matriculación realizada',
          `Se han añadido ${ids.length} discentes a la clase ${claseActual.nombre}.`
        );
        setModalMatricularVisible(false);
        await cargarMatriculados();
      } else {
        mostrarError('Error al matricular', res.error || 'Ocurrió un fallo.');
      }
    } catch (err) {
      console.error('Error al matricular discentes:', err);
      mostrarError('Error', err.message || 'Fallo en la matriculación.');
    } finally {
      setGuardandoMatricula(false);
    }
  };

  // Se solicita confirmación previa para desmatricular a un discente de la clase
  const manejarDesmatricularDiscente = (discente) => {
    confirmDialog({
      message: `¿Desea desmatricular a ${discente.nombre} ${discente.apellidos} de esta clase? Se eliminarán también sus calificaciones asociadas en esta asignatura.`,
      header: 'Confirmar Desmatriculación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, desmatricular',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-secondary p-button-text',
      accept: async () => {
        const res = await desmatricular(
          claseActual.id_curso,
          claseActual.id_modulo,
          discente.id_discente
        );

        if (res.exito) {
          mostrarExito(
            'Discente desmatriculado',
            `${discente.nombre} ${discente.apellidos} ha sido eliminado de la clase.`
          );
          await cargarMatriculados();
        } else {
          mostrarError('Error al desmatricular', res.error || 'No se pudo completar la operación.');
        }
      }
    });
  };

  // Opciones formateadas para el selector de clases con formato de siglas y nombre de módulo
  const opcionesClases = (clases || []).map((c) => ({
    label: `${c.curso?.nombre || 'Curso'} - ${c.modulo?.siglas ? `[${c.modulo.siglas}] ` : ''}${c.modulo?.nombre || 'Módulo'}`,
    value: c.clave,
    cursoNombre: c.curso?.nombre || 'Curso',
    moduloNombre: c.modulo?.nombre || 'Módulo',
    siglas: c.modulo?.siglas || ''
  }));

  // Plantilla visual para las opciones de Clase
  const plantillaOpcionClase = (opcion) => {
    if (!opcion) return null;
    return (
      <div className="flex align-items-center gap-2 py-1">
        <span className="text-xs text-muted font-bold">{opcion.cursoNombre}</span>
        <span className="text-muted text-xs">/</span>
        {opcion.siglas && (
          <span className="font-bold text-xs bg-primary-100 text-primary border-round px-2 py-1 flex-shrink-0">
            {opcion.siglas}
          </span>
        )}
        <span className="font-semibold text-sm">{opcion.moduloNombre}</span>
      </div>
    );
  };

  // Plantilla visual para el valor seleccionado de Clase
  const plantillaValorClase = (opcion, props) => {
    if (opcion) {
      return (
        <div className="flex align-items-center gap-2">
          <span className="text-xs text-muted font-bold">{opcion.cursoNombre}</span>
          <span className="text-muted text-xs">/</span>
          {opcion.siglas && (
            <span className="font-bold text-xs bg-primary-100 text-primary border-round px-1 py-0 flex-shrink-0">
              {opcion.siglas}
            </span>
          )}
          <span className="text-sm font-semibold text-color">{opcion.moduloNombre}</span>
        </div>
      );
    }
    return <span>{props?.placeholder || ''}</span>;
  };

  // Renderizado del avatar de discente
  const plantillaAvatar = (rowData) => {
    const iniciales = `${rowData.nombre?.charAt(0) || ''}${rowData.apellidos?.charAt(0) || ''}`;
    return (
      <div className="flex align-items-center gap-2">
        {rowData.imagen ? (
          <Avatar image={rowData.imagen} shape="circle" size="normal" />
        ) : (
          <Avatar label={iniciales || 'AL'} shape="circle" size="normal" className="bg-primary text-white" />
        )}
        <div className="flex flex-column">
          <span className="font-bold text-sm">{rowData.nombre} {rowData.apellidos}</span>
          <span className="text-xs text-muted">{rowData.correo || 'Sin correo'}</span>
        </div>
      </div>
    );
  };

  // Renderizado de la columna de acciones para cada fila
  const plantillaAcciones = (rowData) => (
    <div className="flex justify-content-center">
      <Button
        icon="pi pi-user-minus"
        severity="danger"
        text
        rounded
        size="small"
        tooltip="Desmatricular alumno de esta clase"
        tooltipOptions={{ position: 'top' }}
        onClick={() => manejarDesmatricularDiscente(rowData)}
      />
    </div>
  );

  return (
    <div className="modificar-clase-container">
      <ConfirmDialog />

      <Card className="shadow-2 border-round surface-card">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-color m-0 flex align-items-center gap-2">
            <i className="pi pi-pencil text-primary text-2xl" />
            Modificar Clase: Matricular y Desmatricular Discentes
          </h2>
          <p className="text-muted text-sm m-0 mt-1">
            Seleccione una clase para consultar sus alumnos matriculados, dar de baja estudiantes o matricular nuevos discentes.
          </p>
        </div>

        {/* Selector de clase principal */}
        <div className="flex flex-column gap-2 mb-4">
          <label htmlFor="select_clase" className="font-semibold text-sm">
            Seleccionar Clase (Curso / Módulo)
          </label>
          <Dropdown
            id="select_clase"
            value={claseSeleccionadaId}
            options={opcionesClases}
            itemTemplate={plantillaOpcionClase}
            valueTemplate={plantillaValorClase}
            filterBy="label,cursoNombre,moduloNombre,siglas"
            onChange={(e) => setClaseSeleccionadaId(e.value)}
            placeholder="Seleccione una clase para gestionar"
            filter
            showClear
            loading={cargandoClases}
            className="w-full md:w-30rem"
          />
          {opcionesClases.length === 0 && !cargandoClases && (
            <Message
              severity="info"
              text="No existen clases configuradas aún. Utilice el asistente de 'Crear Clase' para dar de alta la primera."
              className="mt-2"
            />
          )}
        </div>

        {/* Panel de detalles y listado cuando hay una clase elegida */}
        {claseActual ? (
          <div className="flex flex-column gap-3">
            {/* Tarjeta de información de la clase */}
            <div className="surface-ground border-round p-3 border-1 surface-border">
              <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
                <div>
                  <div className="font-bold text-lg text-color">{claseActual.nombre}</div>
                  <div className="text-xs text-muted flex flex-wrap gap-3 mt-1">
                    <span><strong>Centro:</strong> {claseActual.curso?.centro || 'No especificado'}</span>
                    <span><strong>Ciclo:</strong> {claseActual.ciclo?.nombre || 'General'}</span>
                    <span><strong>Siglas Módulo:</strong> {claseActual.modulo?.siglas || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex align-items-center gap-2">
                  <Tag
                    severity={discentesMatriculados.length > 0 ? 'success' : 'warning'}
                    value={`${discentesMatriculados.length} Matriculados`}
                    className="text-sm px-3 py-1 font-bold"
                  />
                  <Button
                    type="button"
                    label="Matricular Alumnos"
                    icon="pi pi-user-plus"
                    severity="primary"
                    size="small"
                    onClick={abrirModalMatricular}
                  />
                  <Button
                    type="button"
                    icon="pi pi-refresh"
                    severity="secondary"
                    outlined
                    size="small"
                    tooltip="Recargar listado"
                    onClick={cargarMatriculados}
                  />
                </div>
              </div>
            </div>

            {/* Cabecera y buscador de la tabla */}
            <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-2 mt-2">
              <div className="font-bold text-base text-color">
                Alumnos Actualmente Matriculados ({discentesMatriculados.length})
              </div>
              <div className="p-input-icon-left w-full md:w-20rem">
                <i className="pi pi-search" />
                <InputText
                  type="search"
                  value={filtroMatriculados}
                  onChange={(e) => setFiltroMatriculados(e.target.value)}
                  placeholder="Buscar discente matriculado..."
                  className="p-inputtext-sm w-full"
                />
              </div>
            </div>

            {/* Tabla de discentes matriculados */}
            <DataTable
              value={discentesMatriculados}
              loading={cargandoDiscentes}
              dataKey="id_discente"
              globalFilter={filtroMatriculados}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              emptyMessage="No hay discentes matriculados en esta clase."
              className="p-datatable-sm shadow-1 border-round"
              responsiveLayout="scroll"
              stripedRows
            >
              <Column header="Discente" body={plantillaAvatar} sortable sortField="nombre" />
              <Column field="NIA" header="NIA" sortable style={{ width: '130px' }} />
              <Column field="localidad" header="Localidad" sortable style={{ width: '140px' }} />
              <Column
                header="Desmatricular"
                body={plantillaAcciones}
                exportable={false}
                style={{ width: '110px', textAlign: 'center' }}
              />
            </DataTable>
          </div>
        ) : (
          opcionesClases.length > 0 && (
            <div className="p-5 text-center surface-ground border-round border-1 surface-border">
              <i className="pi pi-info-circle text-4xl text-muted mb-2" />
              <div className="text-muted font-medium">
                Por favor, elija una clase del desplegable superior para ver y gestionar sus discentes.
              </div>
            </div>
          )
        )}

        {/* Diálogo modal para matricular nuevos discentes */}
        <Dialog
          visible={modalMatricularVisible}
          onHide={() => setModalMatricularVisible(false)}
          header={
            <div className="flex align-items-center gap-2">
              <i className="pi pi-user-plus text-primary text-xl" />
              <span className="font-bold">Matricular Alumnos en {claseActual?.nombre}</span>
            </div>
          }
          style={{ width: '720px', maxWidth: '95vw' }}
          modal
          className="p-fluid"
          footer={
            <div className="flex justify-content-end gap-2">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                severity="secondary"
                outlined
                size="small"
                disabled={guardandoMatricula}
                onClick={() => setModalMatricularVisible(false)}
              />
              <Button
                label={`Matricular (${discentesParaMatricular.length})`}
                icon="pi pi-check"
                severity="primary"
                size="small"
                loading={guardandoMatricula}
                disabled={discentesParaMatricular.length === 0}
                onClick={manejarGuardarNuevosMatriculados}
              />
            </div>
          }
        >
          <div className="flex flex-column gap-3 pt-2">
            <div className="text-sm text-muted">
              Seleccione los alumnos activos disponibles que desea matricular en esta clase:
            </div>

            <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-2">
              <div className="p-input-icon-left w-full md:w-20rem">
                <i className="pi pi-search" />
                <InputText
                  type="search"
                  value={filtroNuevosDiscentes}
                  onChange={(e) => setFiltroNuevosDiscentes(e.target.value)}
                  placeholder="Buscar discente disponible..."
                  className="p-inputtext-sm w-full"
                />
              </div>
              <div className="flex align-items-center gap-2">
                <Tag
                  severity={discentesParaMatricular.length > 0 ? 'success' : 'info'}
                  value={`${discentesParaMatricular.length} a matricular`}
                  className="font-bold"
                />
                <Button
                  type="button"
                  label="Todos"
                  size="small"
                  severity="secondary"
                  outlined
                  onClick={() => setDiscentesParaMatricular(discentesDisponibles)}
                />
              </div>
            </div>

            <DataTable
              value={discentesDisponibles}
              selection={discentesParaMatricular}
              onSelectionChange={(e) => setDiscentesParaMatricular(e.value)}
              dataKey="id_discente"
              globalFilter={filtroNuevosDiscentes}
              paginator
              rows={5}
              rowsPerPageOptions={[5, 10]}
              emptyMessage="Todos los discentes activos ya se encuentran matriculados en esta clase."
              className="p-datatable-sm shadow-1 border-round"
              responsiveLayout="scroll"
              stripedRows
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
              <Column header="Discente" body={plantillaAvatar} sortable sortField="nombre" />
              <Column field="NIA" header="NIA" sortable style={{ width: '130px' }} />
              <Column field="localidad" header="Localidad" sortable style={{ width: '130px' }} />
            </DataTable>
          </div>
        </Dialog>
      </Card>
    </div>
  );
};

export default ModificarClase;

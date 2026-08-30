import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import useClases from '../../hooks/useClases.js';
import useToast from '../../hooks/useToast.js';

// Componente para la eliminación segura y en cascada de clases y cursos
const EliminarClase = ({ alEliminarExito = () => {} }) => {
  const { mostrarExito, mostrarError, mostrarInfo } = useToast();

  const {
    clases,
    cargando: cargandoClases,
    borrarClase,
    borrarCurso
  } = useClases();

  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Se localiza la clase seleccionada
  const claseActual = (clases || []).find((c) => c.clave === claseSeleccionadaId);

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

  // Se ejecuta la eliminación en cascada de la clase seleccionada
  const ejecutarEliminacionClase = async () => {
    if (!claseActual) return;
    setEliminando(true);
    mostrarInfo('Eliminando clase', 'Borrando registros en cascada...');

    try {
      const res = await borrarClase(claseActual.id_curso, claseActual.id_modulo);

      if (res.exito) {
        mostrarExito(
          'Clase eliminada',
          `Se ha eliminado la clase "${claseActual.nombre}" y todos sus registros asociados en cascada.`
        );
        setClaseSeleccionadaId(null);
        alEliminarExito();
      } else {
        mostrarError('Error al eliminar clase', res.error || 'No se pudo completar el borrado.');
      }
    } catch (err) {
      console.error('Error al eliminar clase:', err);
      mostrarError('Error', err.message || 'Fallo durante la eliminación.');
    } finally {
      setEliminando(false);
    }
  };

  // Se ejecuta la eliminación en cascada del curso completo
  const ejecutarEliminacionCurso = async () => {
    if (!claseActual) return;
    setEliminando(true);
    mostrarInfo('Eliminando curso', 'Borrando curso y todas sus dependencias...');

    try {
      const res = await borrarCurso(claseActual.id_curso);

      if (res.exito) {
        mostrarExito(
          'Curso eliminado',
          `Se ha eliminado el curso "${claseActual.curso?.nombre}" y todas sus clases en cascada.`
        );
        setClaseSeleccionadaId(null);
        alEliminarExito();
      } else {
        mostrarError('Error al eliminar curso', res.error || 'No se pudo completar el borrado.');
      }
    } catch (err) {
      console.error('Error al eliminar curso:', err);
      mostrarError('Error', err.message || 'Fallo durante la eliminación del curso.');
    } finally {
      setEliminando(false);
    }
  };

  // Se solicita confirmación estricta antes de eliminar la clase
  const confirmarEliminarClase = () => {
    confirmDialog({
      message: `¿Está absolutamente seguro de que desea eliminar la clase "${claseActual?.nombre}"? Esta acción eliminará permanentemente las evaluaciones, notas en evaluan y matriculaciones en imparte asociadas a este módulo.`,
      header: 'Confirmar Eliminación de Clase en Cascada',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar clase',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-secondary p-button-text',
      accept: ejecutarEliminacionClase
    });
  };

  // Se solicita confirmación estricta antes de eliminar el curso completo
  const confirmarEliminarCurso = () => {
    confirmDialog({
      message: `¿Está seguro de que desea eliminar TODO el curso académico "${claseActual?.curso?.nombre}"? Se borrarán todos los módulos, evaluaciones, notas y asignaciones del curso en todas las tablas.`,
      header: 'Confirmar Eliminación Completa de Curso',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar curso completo',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      rejectClassName: 'p-button-secondary p-button-text',
      accept: ejecutarEliminacionCurso
    });
  };

  return (
    <div className="eliminar-clase-container">
      <ConfirmDialog />

      <Card className="shadow-2 border-round surface-card">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-color m-0 flex align-items-center gap-2">
            <i className="pi pi-trash text-red-500 text-2xl" />
            Eliminar Clase y Borrado en Cascada
          </h2>
          <p className="text-muted text-sm m-0 mt-1">
            Seleccione la clase que desea dar de baja. Se eliminarán en cascada todos los registros en las tablas afectadas (imparte, Evaluaciones, evaluan).
          </p>
        </div>

        {/* Selector de clase */}
        <div className="flex flex-column gap-2 mb-4">
          <label htmlFor="select_clase_eliminar" className="font-semibold text-sm">
            Seleccionar Clase a Eliminar
          </label>
          <Dropdown
            id="select_clase_eliminar"
            value={claseSeleccionadaId}
            options={opcionesClases}
            itemTemplate={plantillaOpcionClase}
            valueTemplate={plantillaValorClase}
            filterBy="label,cursoNombre,moduloNombre,siglas"
            onChange={(e) => setClaseSeleccionadaId(e.value)}
            placeholder="Seleccione la clase que desea eliminar"
            filter
            showClear
            loading={cargandoClases}
            className="w-full md:w-30rem"
          />
          {opcionesClases.length === 0 && !cargandoClases && (
            <Message
              severity="info"
              text="No existen clases configuradas en el sistema para eliminar."
              className="mt-2"
            />
          )}
        </div>

        {/* Panel de confirmación y advertencia cuando se selecciona una clase */}
        {claseActual ? (
          <div className="flex flex-column gap-4">
            <div className="p-4 border-round border-1 border-red-300 bg-red-50 dark:bg-red-950">
              <div className="flex align-items-start gap-3">
                <i className="pi pi-exclamation-triangle text-red-600 text-3xl mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-700 dark:text-red-300 text-lg m-0 mb-1">
                    Advertencia de Borrado en Cascada
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400 m-0 line-height-3">
                    La eliminación de esta clase es irreversible. Al confirmar se llevarán a cabo automáticamente las siguientes operaciones en la base de datos:
                  </p>

                  <ul className="text-sm text-red-700 dark:text-red-300 pl-3 my-2 line-height-3">
                    <li>
                      Se eliminarán todas las calificaciones registradas en la tabla <code>evaluan</code> para esta clase.
                    </li>
                    <li>
                      Se borrarán los registros de periodos de evaluación en la tabla <code>Evaluaciones</code>.
                    </li>
                    <li>
                      Se desvincularán los <strong>{claseActual.totalDiscentes} discentes</strong> matriculados en la tabla <code>imparte</code>.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ficha resumen de la clase a eliminar */}
            <div className="surface-ground border-round p-3 border-1 surface-border">
              <div className="grid">
                <div className="col-12 md:col-6">
                  <div className="text-xs uppercase font-bold text-muted">Clase</div>
                  <div className="font-bold text-color text-base mt-1">{claseActual.nombre}</div>
                  <div className="text-xs text-muted mt-1">
                    Centro: {claseActual.curso?.centro || 'No especificado'}
                  </div>
                </div>

                <div className="col-12 md:col-6 flex md:justify-content-end align-items-center gap-2">
                  <Tag
                    severity="danger"
                    value={`${claseActual.totalDiscentes} Alumnos Matriculados`}
                    className="font-bold text-sm px-3 py-1"
                  />
                  <Tag
                    severity="warning"
                    value="4 Evaluaciones"
                    className="font-bold text-sm px-3 py-1"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top-1 surface-border">
              <Button
                label="Cancelar Selección"
                icon="pi pi-times"
                severity="secondary"
                outlined
                disabled={eliminando}
                onClick={() => setClaseSeleccionadaId(null)}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  label="Eliminar Esta Clase"
                  icon="pi pi-trash"
                  severity="danger"
                  loading={eliminando}
                  onClick={confirmarEliminarClase}
                />
                <Button
                  label="Eliminar Todo el Curso"
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  loading={eliminando}
                  tooltip="Elimina el curso completo y todos sus módulos asociados"
                  onClick={confirmarEliminarCurso}
                />
              </div>
            </div>
          </div>
        ) : (
          opcionesClases.length > 0 && (
            <div className="p-5 text-center surface-ground border-round border-1 surface-border">
              <i className="pi pi-shield text-4xl text-muted mb-2" />
              <div className="text-muted font-medium">
                Seleccione una clase del desplegable superior para iniciar el proceso de eliminación.
              </div>
            </div>
          )
        )}
      </Card>
    </div>
  );
};

export default EliminarClase;

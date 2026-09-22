import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import SelectorCurso from '../common/SelectorCurso.jsx';
import BotonAccion from '../common/BotonAccion.jsx';
import { confirmarBorrado } from '../common/ModalConfirmacion.jsx';

// Panel presentacional para la eliminación completa y en cascada de cursos y clases.
const EliminarClasePanel = ({
  cursos = [],
  cursoSeleccionadoId,
  onSeleccionarCursoId,
  eliminando = false,
  onEliminarCurso
}) => {
  const cursoActual = cursos.find((c) => c.id_curso === cursoSeleccionadoId) || null;

  // Disparo del diálogo modal de confirmación crítica estandarizado.
  const solicitarConfirmacionBorrado = () => {
    if (!cursoActual) return;

    confirmarBorrado({
      message: `¿Estás seguro de que deseas eliminar definitivamente el curso "${cursoActual.nombre}" (${cursoActual.anyo})? Esta operación eliminará en cascada todas las matrículas, evaluaciones, calificaciones y programaciones asociadas. No se podrá recuperar.`,
      header: 'Confirmar Eliminación Crítica en Cascada',
      acceptLabel: 'Sí, eliminar todo',
      rejectLabel: 'Cancelar',
      onAceptar: () => onEliminarCurso(cursoActual.id_curso)
    });
  };

  return (
    <div className="surface-card border-round shadow-1 p-4 border-1 surface-border flex flex-column gap-3">
      <div>
        <h3 className="m-0 text-xl font-bold text-800 flex align-items-center gap-2">
          <i className="pi pi-trash text-red-500" />
          Eliminación de Curso y Clases
        </h3>
        <p className="text-secondary text-sm m-0 mt-1">
          Elimina por completo un curso académico y purga en cascada todas las tablas vinculadas en la base de datos.
        </p>
      </div>

      <div className="field mb-0">
        <label htmlFor="selectorCursoEliminar" className="font-semibold text-sm mb-2 block">
          Seleccionar Curso a Eliminar <span className="text-red-500">*</span>
        </label>
        <SelectorCurso
          id="selectorCursoEliminar"
          value={cursoSeleccionadoId}
          options={cursos}
          onChange={(e) => onSeleccionarCursoId(e.value)}
          placeholder="Selecciona el curso que deseas eliminar..."
          className="w-full"
        />
      </div>

      {cursoActual && (
        <>
          <Card className="surface-50 border-1 border-red-200 shadow-none">
            <div className="flex flex-column gap-3">
              <div className="flex align-items-center justify-content-between">
                <div>
                  <span className="font-bold text-red-900 text-lg block">{cursoActual.nombre}</span>
                  <span className="text-secondary text-sm">
                    Año lectivo: <strong>{cursoActual.anyo}</strong> • Centro: <strong>{cursoActual.centro}</strong>
                  </span>
                </div>
                <Tag value="Acción Destructiva" severity="danger" icon="pi pi-shield" />
              </div>

              <div className="border-left-3 border-red-500 pl-3 py-1 bg-red-50 text-red-900 text-sm">
                <span className="font-bold block mb-1">
                  El borrado en cascada eliminará automáticamente los siguientes registros:
                </span>
                <ul className="m-0 pl-3 text-xs line-height-3">
                  <li>Matrículas de alumnos en la tabla <span className="font-mono font-bold">imparte</span></li>
                  <li>Períodos y fechas de la tabla <span className="font-mono font-bold">Evaluaciones</span></li>
                  <li>Calificaciones y actas registradas en la tabla <span className="font-mono font-bold">evaluan</span></li>
                  <li>Prácticas, enunciados y criterios en <span className="font-mono font-bold">Versiones</span> y <span className="font-mono font-bold">trabajan</span></li>
                  <li>Planificación temporal de unidades en la tabla <span className="font-mono font-bold">Temporizacion</span></li>
                  <li>Ponderaciones de resultados y criterios en <span className="font-mono font-bold">ra_curso</span> y <span className="font-mono font-bold">ce_curso</span></li>
                  <li>Horarios, sesiones y festivos vinculados a este curso académico</li>
                  <li>El registro principal del curso en la tabla <span className="font-mono font-bold">Cursos</span></li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="flex justify-content-end gap-3 mt-2 pt-3 border-top-1 surface-border">
            <BotonAccion
              tipo="eliminar"
              label="Eliminar Curso y Datos en Cascada"
              onClick={solicitarConfirmacionBorrado}
              loading={eliminando}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EliminarClasePanel;

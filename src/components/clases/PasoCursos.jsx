import React from 'react';
import { Card } from 'primereact/card';
import { RadioButton } from 'primereact/radiobutton';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import SelectorCurso from '../common/SelectorCurso.jsx';

// Paso 1: Selección de curso existente o creación integrada de un curso nuevo.
const PasoCursos = ({
  cursos = [],
  modoCurso = 'existente',
  onCambiarModoCurso,
  cursoSeleccionadoId,
  onSeleccionarCursoId,
  datosNuevoCurso,
  onCambiarDatosNuevoCurso
}) => {
  const cursoActual = cursos.find((c) => c.id_curso === cursoSeleccionadoId) || null;

  return (
    <div className="flex flex-column gap-3 py-2">
      <div>
        <h3 className="m-0 text-xl font-bold text-800">Curso Académico</h3>
        <p className="text-secondary text-sm m-0 mt-1">
          Indica si deseas asociar la clase a un curso académico existente o crear un nuevo curso en el sistema.
        </p>
      </div>

      {/* Selector de modo: Curso existente o Curso nuevo */}
      <div className="flex flex-column sm:flex-row gap-3 mt-1">
        <div
          className={`flex align-items-center gap-3 p-3 border-1 border-round cursor-pointer flex-1 transition-colors ${
            modoCurso === 'existente' ? 'surface-100 border-primary' : 'surface-card surface-border'
          }`}
          onClick={() => onCambiarModoCurso('existente')}
        >
          <RadioButton
            inputId="modoExistente"
            name="modoCurso"
            value="existente"
            checked={modoCurso === 'existente'}
            onChange={(e) => onCambiarModoCurso(e.value)}
          />
          <label htmlFor="modoExistente" className="cursor-pointer font-semibold text-900 m-0">
            Selección de un curso existente
          </label>
        </div>

        <div
          className={`flex align-items-center gap-3 p-3 border-1 border-round cursor-pointer flex-1 transition-colors ${
            modoCurso === 'nuevo' ? 'surface-100 border-primary' : 'surface-card surface-border'
          }`}
          onClick={() => onCambiarModoCurso('nuevo')}
        >
          <RadioButton
            inputId="modoNuevo"
            name="modoCurso"
            value="nuevo"
            checked={modoCurso === 'nuevo'}
            onChange={(e) => onCambiarModoCurso(e.value)}
          />
          <label htmlFor="modoNuevo" className="cursor-pointer font-semibold text-900 m-0">
            Creación de un curso nuevo
          </label>
        </div>
      </div>

      {/* Caso A: Selección de curso existente */}
      {modoCurso === 'existente' && (
        <div className="flex flex-column gap-3 mt-2">
          <div className="field mb-0">
            <label htmlFor="selectorCurso" className="font-semibold text-sm mb-2 block">
              Curso Académico <span className="text-red-500">*</span>
            </label>
            <SelectorCurso
              id="selectorCurso"
              value={cursoSeleccionadoId}
              options={cursos}
              onChange={(e) => onSeleccionarCursoId(e.value)}
              placeholder="Selecciona un curso académico existente..."
              className="w-full"
            />
          </div>

          {cursoActual && (
            <Card className="surface-50 border-1 surface-border shadow-none">
              <div className="flex flex-column gap-2">
                <div className="flex align-items-center justify-content-between">
                  <span className="text-xl font-bold text-900">{cursoActual.nombre}</span>
                  <span className="text-secondary font-bold text-sm">Año lectivo: {cursoActual.anyo}</span>
                </div>
                <div className="text-secondary text-sm flex align-items-center gap-2">
                  <i className="pi pi-building" />
                  <span>Centro educativo: <strong>{cursoActual.centro}</strong></span>
                </div>
                {cursoActual.descripcion && (
                  <p className="text-700 text-sm m-0 mt-1 font-italic">
                    {cursoActual.descripcion}
                  </p>
                )}
                {(cursoActual.fecha_inicio || cursoActual.fecha_fin) && (
                  <div className="text-500 text-xs mt-1">
                    Período lectivo: {cursoActual.fecha_inicio || 'Indefinido'} — {cursoActual.fecha_fin || 'Indefinido'}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Caso B: Formulario integrado de creación de nuevo curso */}
      {modoCurso === 'nuevo' && (
        <div className="surface-card border-1 surface-border border-round p-3 mt-2">
          <span className="font-bold text-base text-900 block mb-3">
            Datos del Nuevo Curso Académico
          </span>

          <div className="field mb-3">
            <label htmlFor="nombreNuevoCurso" className="font-semibold text-sm mb-1 block">
              Nombre del Curso <span className="text-red-500">*</span>
            </label>
            <InputText
              id="nombreNuevoCurso"
              value={datosNuevoCurso?.nombre || ''}
              onChange={(e) => onCambiarDatosNuevoCurso('nombre', e.target.value)}
              placeholder="Ej: 2º Desarrollo de Aplicaciones Web"
              className="w-full"
            />
          </div>

          <div className="formgrid grid mb-3">
            <div className="field col-12 md:col-6 mb-0">
              <label htmlFor="anyoNuevoCurso" className="font-semibold text-sm mb-1 block">
                Año Lectivo <span className="text-red-500">*</span>
              </label>
              <InputText
                id="anyoNuevoCurso"
                value={datosNuevoCurso?.anyo || ''}
                onChange={(e) => onCambiarDatosNuevoCurso('anyo', e.target.value)}
                placeholder="Ej: 2024/2025"
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6 mb-0">
              <label htmlFor="centroNuevoCurso" className="font-semibold text-sm mb-1 block">
                Centro Educativo <span className="text-red-500">*</span>
              </label>
              <InputText
                id="centroNuevoCurso"
                value={datosNuevoCurso?.centro || ''}
                onChange={(e) => onCambiarDatosNuevoCurso('centro', e.target.value)}
                placeholder="Ej: IES Tecnológico"
                className="w-full"
              />
            </div>
          </div>

          <div className="formgrid grid mb-3">
            <div className="field col-12 md:col-6 mb-0">
              <label htmlFor="fechaIniNuevo" className="font-semibold text-sm mb-1 block">
                Fecha de Inicio (Opcional)
              </label>
              <InputText
                id="fechaIniNuevo"
                type="date"
                value={datosNuevoCurso?.fecha_inicio || ''}
                onChange={(e) => onCambiarDatosNuevoCurso('fecha_inicio', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="field col-12 md:col-6 mb-0">
              <label htmlFor="fechaFinNuevo" className="font-semibold text-sm mb-1 block">
                Fecha de Fin (Opcional)
              </label>
              <InputText
                id="fechaFinNuevo"
                type="date"
                value={datosNuevoCurso?.fecha_fin || ''}
                onChange={(e) => onCambiarDatosNuevoCurso('fecha_fin', e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="field mb-0">
            <label htmlFor="descNuevoCurso" className="font-semibold text-sm mb-1 block">
              Descripción o Anotaciones
            </label>
            <InputTextarea
              id="descNuevoCurso"
              value={datosNuevoCurso?.descripcion || ''}
              onChange={(e) => onCambiarDatosNuevoCurso('descripcion', e.target.value)}
              rows={2}
              autoResize
              placeholder="Detalles sobre el plan formativo, grupo o departamento..."
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PasoCursos;

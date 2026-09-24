import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

// Paso 1: Formulario para la creación obligatoria de una clase desde cero con sugerencias predeterminadas.
const PasoCursos = ({
  datosClase,
  onCambiarDatosClase,
  datosNuevoCurso,
  onCambiarDatosNuevoCurso
}) => {
  // Compatibilidad con props anteriores para asegurar resiliencia en invocaciones.
  const datos = datosClase || datosNuevoCurso || {};
  const manejarCambio = onCambiarDatosClase || onCambiarDatosNuevoCurso;

  return (
    <div className="flex flex-column gap-3 py-2">
      <div>
        <h3 className="m-0 text-xl font-bold text-800">Datos de la Clase</h3>
        <p className="text-secondary text-sm m-0 mt-1">
          Introduce la información identificativa para dar de alta la clase o grupo de discentes.
        </p>
      </div>

      <div className="surface-card border-1 surface-border border-round p-4 mt-1">
        <span className="font-bold text-base text-900 block mb-3">
          Información General de la Clase
        </span>

        {/* Nombre de la clase o grupo */}
        <div className="field mb-3">
          <label htmlFor="nombreClase" className="font-semibold text-sm mb-1 block">
            Nombre de la Clase <span className="text-red-500">*</span>
          </label>
          <InputText
            id="nombreClase"
            value={datos.nombre || ''}
            onChange={(e) => manejarCambio?.('nombre', e.target.value)}
            placeholder="Ej: 1º SMR - Grupo A"
            className="w-full"
          />
        </div>

        {/* Año lectivo y Centro educativo sugeridos */}
        <div className="formgrid grid mb-3">
          <div className="field col-12 md:col-6 mb-0">
            <label htmlFor="anyoClase" className="font-semibold text-sm mb-1 block">
              Año Lectivo <span className="text-red-500">*</span>
            </label>
            <InputText
              id="anyoClase"
              value={datos.anyo || ''}
              onChange={(e) => manejarCambio?.('anyo', e.target.value)}
              placeholder="Ej: 2026"
              className="w-full"
            />
          </div>

          <div className="field col-12 md:col-6 mb-0">
            <label htmlFor="centroClase" className="font-semibold text-sm mb-1 block">
              Centro Educativo <span className="text-red-500">*</span>
            </label>
            <InputText
              id="centroClase"
              value={datos.centro || ''}
              onChange={(e) => manejarCambio?.('centro', e.target.value)}
              placeholder="Ej: IES Poeta Paco Mollà (Petrer)"
              className="w-full"
            />
          </div>
        </div>

        {/* Fechas obligatorias de inicio y fin */}
        <div className="formgrid grid mb-3">
          <div className="field col-12 md:col-6 mb-0">
            <label htmlFor="fechaInicioClase" className="font-semibold text-sm mb-1 block">
              Fecha de Inicio <span className="text-red-500">*</span>
            </label>
            <InputText
              id="fechaInicioClase"
              type="date"
              value={datos.fecha_inicio || ''}
              onChange={(e) => manejarCambio?.('fecha_inicio', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="field col-12 md:col-6 mb-0">
            <label htmlFor="fechaFinClase" className="font-semibold text-sm mb-1 block">
              Fecha de Fin <span className="text-red-500">*</span>
            </label>
            <InputText
              id="fechaFinClase"
              type="date"
              value={datos.fecha_fin || ''}
              onChange={(e) => manejarCambio?.('fecha_fin', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Descripción o anotaciones opcionales */}
        <div className="field mb-0">
          <label htmlFor="descClase" className="font-semibold text-sm mb-1 block">
            Descripción o Anotaciones
          </label>
          <InputTextarea
            id="descClase"
            value={datos.descripcion || ''}
            onChange={(e) => manejarCambio?.('descripcion', e.target.value)}
            rows={2}
            autoResize
            placeholder="Anotaciones sobre el grupo, turno, aula o particularidades organizativas..."
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PasoCursos;

import React, { useMemo } from 'react';
import { RadioButton } from 'primereact/radiobutton';
import { Card } from 'primereact/card';
import SelectorCurso from '../common/SelectorCurso.jsx';

// Paso 5: Opciones mediante botones de radio verticales para empezar desde cero o heredar programación didáctica.
const PasoProgramacion = ({
  cursos = [],
  cursoActualId,
  clonarProgramacion,
  onCambiarClonarProgramacion,
  cursoOrigenId,
  onSeleccionarCursoOrigenId
}) => {
  // Clases o cursos disponibles para clonar (excluyendo la clase actual si ya estuviera guardada).
  const cursosDisponiblesOrigen = useMemo(() => {
    return cursos.filter((c) => c.id_curso !== cursoActualId);
  }, [cursos, cursoActualId]);

  const cursoOrigen = cursos.find((c) => c.id_curso === cursoOrigenId) || null;

  return (
    <div className="flex flex-column gap-3 py-2">
      <div>
        <h3 className="m-0 text-xl font-bold text-800">Importación de Programación Didáctica</h3>
        <p className="text-secondary text-sm m-0 mt-1">
          Indica si deseas reutilizar la configuración curricular y de prácticas de una clase previa.
        </p>
      </div>

      {/* Opciones con RadioButton verticales (una encima de la otra con breve descripción) */}
      <div className="flex flex-column gap-3 mt-1">
        {/* Opción 1: Empezar desde cero */}
        <div
          className={`flex align-items-start gap-3 p-3 border-1 border-round cursor-pointer transition-colors ${
            !clonarProgramacion ? 'surface-100 border-primary' : 'surface-card surface-border'
          }`}
          onClick={() => onCambiarClonarProgramacion(false)}
        >
          <RadioButton
            inputId="opcionDesdeCero"
            name="opcionProgramacion"
            value={false}
            checked={!clonarProgramacion}
            onChange={(e) => onCambiarClonarProgramacion(e.value)}
            className="mt-1"
          />
          <label htmlFor="opcionDesdeCero" className="cursor-pointer">
            <span className="font-bold text-900 block text-base">Empezar desde cero</span>
            <span className="text-secondary text-sm block mt-1 line-height-2">
              Configura la clase con una planificación curricular limpia. Las unidades de trabajo y prácticas se definirán manualmente.
            </span>
          </label>
        </div>

        {/* Opción 2: Heredar programación de una clase anterior */}
        <div
          className={`flex align-items-start gap-3 p-3 border-1 border-round cursor-pointer transition-colors ${
            clonarProgramacion ? 'surface-100 border-primary' : 'surface-card surface-border'
          }`}
          onClick={() => onCambiarClonarProgramacion(true)}
        >
          <RadioButton
            inputId="opcionHeredar"
            name="opcionProgramacion"
            value={true}
            checked={clonarProgramacion}
            onChange={(e) => onCambiarClonarProgramacion(e.value)}
            className="mt-1"
          />
          <label htmlFor="opcionHeredar" className="cursor-pointer">
            <span className="font-bold text-900 block text-base">Heredar programación de una clase anterior</span>
            <span className="text-secondary text-sm block mt-1 line-height-2">
              Clona automáticamente las unidades de trabajo, temporizaciones, ponderaciones de RA/CE y versiones de prácticas registradas en una clase previa.
            </span>
          </label>
        </div>
      </div>

      {/* Dropdown condicional de clases/cursos origen sin Tags */}
      {clonarProgramacion && (
        <div className="flex flex-column gap-3 mt-2">
          <div className="field mb-0">
            <label htmlFor="cursoOrigen" className="font-semibold text-sm mb-2 block">
              Seleccionar Clase Origen para Clonar <span className="text-red-500">*</span>
            </label>
            <SelectorCurso
              id="cursoOrigen"
              value={cursoOrigenId}
              options={cursosDisponiblesOrigen}
              onChange={(e) => onSeleccionarCursoOrigenId(e.value)}
              placeholder="Elige la clase de la cual clonar la programación..."
              className="w-full"
            />
          </div>

          <Card className="surface-50 border-1 surface-border shadow-none">
            <div className="flex flex-column gap-2">
              <span className="font-bold text-900 flex align-items-center gap-2">
                <i className="pi pi-info-circle text-primary" />
                Registros que se clonarán automáticamente:
              </span>
              <ul className="m-0 pl-4 text-700 text-sm line-height-3">
                <li>
                  <strong>Versiones:</strong> Prácticas y enunciados configurados en la clase origen con sus ponderaciones.
                </li>
                <li>
                  <strong>Temporización:</strong> Unidades de trabajo planificadas con orden y fechas previstas.
                </li>
                <li>
                  <strong>Ponderaciones RA y CE:</strong> Pesos porcentuales de Resultados de Aprendizaje (<span className="font-mono">ra_curso</span>) y Criterios de Evaluación (<span className="font-mono">ce_curso</span>).
                </li>
                <li>
                  <strong>Cobertura de Criterios:</strong> Relaciones de prácticas con criterios en la tabla <span className="font-mono">trabajan</span>.
                </li>
              </ul>
              {cursoOrigen && (
                <div className="mt-2 text-sm text-green-700 bg-green-50 p-2 border-round">
                  <i className="pi pi-check mr-2" />
                  Se clonará la programación de la clase: <strong>{cursoOrigen.nombre} ({cursoOrigen.anyo})</strong>.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PasoProgramacion;

import React, { useRef, useState, useMemo } from 'react';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Button } from 'primereact/button';
import PasoCursos from './PasoCursos.jsx';
import PasoModulos from './PasoModulos.jsx';
import PasoDiscentes from './PasoDiscentes.jsx';
import PasoEvaluaciones from './PasoEvaluaciones.jsx';
import PasoProgramacion from './PasoProgramacion.jsx';
import PasoConfirmacion from './PasoConfirmacion.jsx';

// Obtención del año en curso para los valores sugeridos por defecto.
const anioActual = new Date().getFullYear().toString();

// Datos iniciales para el formulario de creación de una nueva clase.
const DATOS_CLASE_INICIALES = {
  nombre: '',
  anyo: anioActual,
  centro: 'IES Poeta Paco Mollà (Petrer)',
  fecha_inicio: '',
  fecha_fin: '',
  descripcion: ''
};

// Componente orquestador del asistente por pasos para crear una nueva clase.
const CrearClaseStepper = ({
  cursos = [],
  ciclos = [],
  modulos = [],
  discentes = [],
  cargando = false,
  onGuardarClaseCompleta,
  mostrarAviso
}) => {
  const stepperRef = useRef(null);
  const [pasoActivo, setPasoActivo] = useState(0);

  // Estados de los datos de la nueva clase y selecciones del asistente
  const [datosClase, setDatosClase] = useState(DATOS_CLASE_INICIALES);
  const [cicloSeleccionadoId, setCicloSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [discentesSeleccionados, setDiscentesSeleccionados] = useState([]);
  const [clonarProgramacion, setClonarProgramacion] = useState(false);
  const [cursoOrigenId, setCursoOrigenId] = useState(null);

  // Objeto reactivo representativo de la clase en proceso de creación
  const claseSeleccionada = useMemo(() => ({
    nombre: datosClase.nombre || 'Nueva Clase',
    anyo: datosClase.anyo || anioActual,
    centro: datosClase.centro || 'IES Poeta Paco Mollà (Petrer)',
    fecha_inicio: datosClase.fecha_inicio,
    fecha_fin: datosClase.fecha_fin,
    descripcion: datosClase.descripcion,
    esNuevo: true
  }), [datosClase]);

  const cicloSeleccionado = ciclos.find((c) => c.id_ciclo === cicloSeleccionadoId) || null;
  const moduloSeleccionado = modulos.find((m) => m.id_modulo === moduloSeleccionadoId) || null;
  const cursoOrigenSeleccionado = cursos.find((c) => c.id_curso === cursoOrigenId) || null;

  // Actualización de campos individuales del formulario de la clase
  const manejarCambioDatosClase = (campo, valor) => {
    setDatosClase((prev) => ({ ...prev, [campo]: valor }));
  };

  // Validación rigurosa de cada paso antes de permitir avanzar
  const avanzarPaso = (indiceActual) => {
    if (indiceActual === 0) {
      if (
        !datosClase.nombre.trim() ||
        !datosClase.anyo.trim() ||
        !datosClase.centro.trim() ||
        !datosClase.fecha_inicio ||
        !datosClase.fecha_fin
      ) {
        mostrarAviso('Completa todos los campos obligatorios de la clase (Nombre, Año lectivo, Centro educativo, Fecha de inicio y Fecha de fin).');
        return;
      }
      if (datosClase.fecha_inicio > datosClase.fecha_fin) {
        mostrarAviso('La fecha de inicio de la clase no puede ser posterior a la fecha de fin.');
        return;
      }
    }

    if (indiceActual === 1) {
      if (!cicloSeleccionadoId) {
        mostrarAviso('Debes seleccionar un ciclo formativo antes de continuar.');
        return;
      }
      if (!moduloSeleccionadoId) {
        mostrarAviso('Debes seleccionar un módulo profesional antes de continuar.');
        return;
      }
    }

    if (indiceActual === 4 && clonarProgramacion && !cursoOrigenId) {
      mostrarAviso('Selecciona la clase o curso origen del cual heredar la programación.');
      return;
    }

    if (stepperRef.current) {
      stepperRef.current.nextCallback();
    }
  };

  // Retroceso al paso anterior
  const retrocederPaso = () => {
    if (stepperRef.current) {
      stepperRef.current.prevCallback();
    }
  };

  // Reiniciar todos los campos del asistente a sus valores predeterminados
  const reiniciarAsistente = () => {
    setDatosClase(DATOS_CLASE_INICIALES);
    setCicloSeleccionadoId(null);
    setModuloSeleccionadoId(null);
    setDiscentesSeleccionados([]);
    setClonarProgramacion(false);
    setCursoOrigenId(null);
    if (stepperRef.current) {
      stepperRef.current.setActiveStep(0);
    }
    setPasoActivo(0);
  };

  // Confirmación y guardado completo en la base de datos
  const manejarGuardadoCompleto = async () => {
    const datos = {
      cursoId: null,
      cursoNuevo: datosClase,
      moduloId: moduloSeleccionadoId,
      discentesSeleccionados,
      clonarProgramacion,
      cursoOrigenId: clonarProgramacion ? cursoOrigenId : null
    };

    const exito = await onGuardarClaseCompleta(datos);
    if (exito) {
      reiniciarAsistente();
    }
  };

  const paso1Valido = Boolean(
    datosClase.nombre.trim() &&
    datosClase.anyo.trim() &&
    datosClase.centro.trim() &&
    datosClase.fecha_inicio &&
    datosClase.fecha_fin &&
    datosClase.fecha_inicio <= datosClase.fecha_fin
  );

  return (
    <div className="surface-card border-round shadow-1 p-4 border-1 surface-border">
      <Stepper
        ref={stepperRef}
        activeStep={pasoActivo}
        onChangeStep={(e) => setPasoActivo(e.index)}
        linear
      >
        {/* Paso 1: Clase */}
        <StepperPanel header="Clase">
          <PasoCursos
            datosClase={datosClase}
            onCambiarDatosClase={manejarCambioDatosClase}
          />
          <div className="flex pt-4 justify-content-end">
            <Button
              label="Siguiente"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={() => avanzarPaso(0)}
              disabled={!paso1Valido}
            />
          </div>
        </StepperPanel>

        {/* Paso 2: Módulos */}
        <StepperPanel header="Módulos">
          <PasoModulos
            ciclos={ciclos}
            modulos={modulos}
            cicloSeleccionadoId={cicloSeleccionadoId}
            onSeleccionarCicloId={setCicloSeleccionadoId}
            moduloSeleccionadoId={moduloSeleccionadoId}
            onSeleccionarModuloId={setModuloSeleccionadoId}
          />
          <div className="flex pt-4 justify-content-between">
            <Button
              label="Anterior"
              severity="secondary"
              icon="pi pi-arrow-left"
              onClick={retrocederPaso}
            />
            <Button
              label="Siguiente"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={() => avanzarPaso(1)}
              disabled={!moduloSeleccionadoId}
            />
          </div>
        </StepperPanel>

        {/* Paso 3: Discentes */}
        <StepperPanel header="Discentes">
          <PasoDiscentes
            discentes={discentes}
            discentesSeleccionados={discentesSeleccionados}
            onCambiarSeleccion={setDiscentesSeleccionados}
          />
          <div className="flex pt-4 justify-content-between">
            <Button
              label="Anterior"
              severity="secondary"
              icon="pi pi-arrow-left"
              onClick={retrocederPaso}
            />
            <Button
              label="Siguiente"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={() => avanzarPaso(2)}
            />
          </div>
        </StepperPanel>

        {/* Paso 4: Evaluaciones */}
        <StepperPanel header="Evaluaciones">
          <PasoEvaluaciones
            claseNombre={claseSeleccionada?.nombre}
            moduloNombre={moduloSeleccionado?.nombre}
          />
          <div className="flex pt-4 justify-content-between">
            <Button
              label="Anterior"
              severity="secondary"
              icon="pi pi-arrow-left"
              onClick={retrocederPaso}
            />
            <Button
              label="Siguiente"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={() => avanzarPaso(3)}
            />
          </div>
        </StepperPanel>

        {/* Paso 5: Programación */}
        <StepperPanel header="Programación">
          <PasoProgramacion
            cursos={cursos}
            cursoActualId={null}
            clonarProgramacion={clonarProgramacion}
            onCambiarClonarProgramacion={setClonarProgramacion}
            cursoOrigenId={cursoOrigenId}
            onSeleccionarCursoOrigenId={setCursoOrigenId}
          />
          <div className="flex pt-4 justify-content-between">
            <Button
              label="Anterior"
              severity="secondary"
              icon="pi pi-arrow-left"
              onClick={retrocederPaso}
            />
            <Button
              label="Siguiente"
              icon="pi pi-arrow-right"
              iconPos="right"
              onClick={() => avanzarPaso(4)}
              disabled={clonarProgramacion && !cursoOrigenId}
            />
          </div>
        </StepperPanel>

        {/* Paso 6: Confirmación */}
        <StepperPanel header="Confirmación">
          <PasoConfirmacion
            clase={claseSeleccionada}
            ciclo={cicloSeleccionado}
            modulo={moduloSeleccionado}
            discentesSeleccionados={discentesSeleccionados}
            clonarProgramacion={clonarProgramacion}
            cursoOrigen={cursoOrigenSeleccionado}
            guardando={cargando}
            onGuardar={manejarGuardadoCompleto}
            onCancelar={reiniciarAsistente}
          />
          <div className="flex pt-3 justify-content-start">
            <Button
              label="Anterior"
              severity="secondary"
              icon="pi pi-arrow-left"
              onClick={retrocederPaso}
              disabled={cargando}
            />
          </div>
        </StepperPanel>
      </Stepper>
    </div>
  );
};

export default CrearClaseStepper;

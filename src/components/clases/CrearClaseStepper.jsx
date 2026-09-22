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

// Datos iniciales para el formulario integrado de creación de un curso nuevo.
const DATOS_CURSO_INICIALES = {
  nombre: '',
  anyo: '2024/2025',
  centro: '',
  descripcion: '',
  fecha_inicio: '',
  fecha_fin: ''
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

  // Estados del asistente
  const [modoCurso, setModoCurso] = useState('existente'); // 'existente' | 'nuevo'
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [datosNuevoCurso, setDatosNuevoCurso] = useState(DATOS_CURSO_INICIALES);
  const [cicloSeleccionadoId, setCicloSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [discentesSeleccionados, setDiscentesSeleccionados] = useState([]);
  const [clonarProgramacion, setClonarProgramacion] = useState(false);
  const [cursoOrigenId, setCursoOrigenId] = useState(null);

  // Búsqueda o construcción del objeto de curso seleccionado para visualización
  const cursoSeleccionado = useMemo(() => {
    if (modoCurso === 'existente') {
      return cursos.find((c) => c.id_curso === cursoSeleccionadoId) || null;
    }
    return {
      nombre: datosNuevoCurso.nombre || 'Nuevo Curso',
      anyo: datosNuevoCurso.anyo || '2024/2025',
      centro: datosNuevoCurso.centro || 'Sin centro asignado',
      descripcion: datosNuevoCurso.descripcion,
      fecha_inicio: datosNuevoCurso.fecha_inicio,
      fecha_fin: datosNuevoCurso.fecha_fin,
      esNuevo: true
    };
  }, [modoCurso, cursos, cursoSeleccionadoId, datosNuevoCurso]);

  const cicloSeleccionado = ciclos.find((c) => c.id_ciclo === cicloSeleccionadoId) || null;
  const moduloSeleccionado = modulos.find((m) => m.id_modulo === moduloSeleccionadoId) || null;
  const cursoOrigenSeleccionado = cursos.find((c) => c.id_curso === cursoOrigenId) || null;

  // Actualización de campos individuales del nuevo curso en edición integrada
  const manejarCambioDatosNuevoCurso = (campo, valor) => {
    setDatosNuevoCurso((prev) => ({ ...prev, [campo]: valor }));
  };

  // Validación y avance al siguiente paso
  const avanzarPaso = (indiceActual) => {
    if (indiceActual === 0) {
      if (modoCurso === 'existente' && !cursoSeleccionadoId) {
        mostrarAviso('Debes seleccionar un curso académico antes de continuar.');
        return;
      }
      if (modoCurso === 'nuevo') {
        if (!datosNuevoCurso.nombre.trim() || !datosNuevoCurso.anyo.trim() || !datosNuevoCurso.centro.trim()) {
          mostrarAviso('Completa los campos obligatorios del nuevo curso (Nombre, Año y Centro).');
          return;
        }
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
      mostrarAviso('Selecciona el curso origen del cual heredar la programación.');
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

  // Reiniciar todos los campos del asistente
  const reiniciarAsistente = () => {
    setModoCurso('existente');
    setCursoSeleccionadoId(null);
    setDatosNuevoCurso(DATOS_CURSO_INICIALES);
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
      cursoId: modoCurso === 'existente' ? cursoSeleccionadoId : null,
      cursoNuevo: modoCurso === 'nuevo' ? datosNuevoCurso : null,
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

  const paso1Valido =
    modoCurso === 'existente'
      ? Boolean(cursoSeleccionadoId)
      : Boolean(datosNuevoCurso.nombre.trim() && datosNuevoCurso.anyo.trim() && datosNuevoCurso.centro.trim());

  return (
    <div className="surface-card border-round shadow-1 p-4 border-1 surface-border">
      <Stepper
        ref={stepperRef}
        activeStep={pasoActivo}
        onChangeStep={(e) => setPasoActivo(e.index)}
        linear
      >
        {/* Paso 1: Cursos */}
        <StepperPanel header="Curso">
          <PasoCursos
            cursos={cursos}
            modoCurso={modoCurso}
            onCambiarModoCurso={setModoCurso}
            cursoSeleccionadoId={cursoSeleccionadoId}
            onSeleccionarCursoId={setCursoSeleccionadoId}
            datosNuevoCurso={datosNuevoCurso}
            onCambiarDatosNuevoCurso={manejarCambioDatosNuevoCurso}
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

        {/* Paso 4: Auto-Evaluaciones */}
        <StepperPanel header="Evaluaciones">
          <PasoEvaluaciones
            cursoNombre={cursoSeleccionado?.nombre}
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

        {/* Paso 5: Importar Programación */}
        <StepperPanel header="Programación">
          <PasoProgramacion
            cursos={cursos}
            cursoActualId={cursoSeleccionadoId}
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
            curso={cursoSeleccionado}
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

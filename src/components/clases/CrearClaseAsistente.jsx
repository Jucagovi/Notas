import React, { useState, useRef } from 'react';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Avatar } from 'primereact/avatar';
import { Message } from 'primereact/message';
import useCursoSetup from '../../hooks/useCursoSetup.js';
import useToast from '../../hooks/useToast.js';
import { plantillaOpcionModulo, plantillaValorModulo } from '../../utils/plantillasDropdown.jsx';

// Componente de asistente por pasos para la creación y configuración completa de una clase
const CrearClaseAsistente = ({ alFinalizarExito = () => {} }) => {
  const stepperRef = useRef(null);
  const { mostrarExito, mostrarError, mostrarInfo } = useToast();

  const {
    cursos,
    ciclos,
    discentesActivos,
    modulosCiclo,
    evaluacionesReglamentarias,
    cargandoModulos,
    guardando,
    cargarModulosPorCiclo,
    ejecutarCreacionClase,
    recargar
  } = useCursoSetup();

  // Estados del Paso 1: Curso (existente o nuevo)
  const [modoCurso, setModoCurso] = useState('existente'); // 'existente' | 'nuevo'
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);
  const [nuevoCursoForm, setNuevoCursoForm] = useState({
    nombre: '',
    anyo: '',
    centro: '',
    descripcion: ''
  });
  const [erroresPaso1, setErroresPaso1] = useState({});

  // Estados del Paso 2: Ciclo y Módulo
  const [cicloSeleccionadoId, setCicloSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);
  const [erroresPaso2, setErroresPaso2] = useState({});

  // Estados del Paso 3: Discentes seleccionados
  const [discentesSeleccionados, setDiscentesSeleccionados] = useState([]);
  const [filtroDiscentes, setFiltroDiscentes] = useState('');

  // Se maneja el cambio de ciclo formativo para filtrar módulos
  const manejarCambioCiclo = async (idCiclo) => {
    setCicloSeleccionadoId(idCiclo);
    setModuloSeleccionadoId(null);
    setErroresPaso2({});
    if (idCiclo) {
      await cargarModulosPorCiclo(idCiclo);
    }
  };

  // Se valida el Paso 1 antes de avanzar al siguiente
  const validarPaso1 = () => {
    const errores = {};
    if (modoCurso === 'existente') {
      if (!cursoSeleccionadoId) {
        errores.curso = 'Debe seleccionar un curso académico de la lista.';
      }
    } else {
      if (!nuevoCursoForm.nombre.trim()) {
        errores.nombre = 'El nombre del curso es obligatorio.';
      }
      if (!nuevoCursoForm.anyo.trim()) {
        errores.anyo = 'El año académico es obligatorio (ej. 2025/2026).';
      }
    }
    setErroresPaso1(errores);
    return Object.keys(errores).length === 0;
  };

  // Se valida el Paso 2 antes de avanzar
  const validarPaso2 = () => {
    const errores = {};
    if (!cicloSeleccionadoId) {
      errores.ciclo = 'Debe seleccionar un ciclo formativo.';
    }
    if (!moduloSeleccionadoId) {
      errores.modulo = 'Debe seleccionar un módulo para la clase.';
    }
    setErroresPaso2(errores);
    return Object.keys(errores).length === 0;
  };

  // Se avanza del Paso 1 al Paso 2
  const avanzarPaso1 = () => {
    if (validarPaso1()) {
      stepperRef.current.nextCallback();
    } else {
      mostrarError('Datos incompletos', 'Por favor, revise los campos obligatorios del curso.');
    }
  };

  // Se avanza del Paso 2 al Paso 3
  const avanzarPaso2 = () => {
    if (validarPaso2()) {
      stepperRef.current.nextCallback();
    } else {
      mostrarError('Datos incompletos', 'Por favor, seleccione el ciclo y el módulo correspondientes.');
    }
  };

  // Se avanza del Paso 3 al Paso 4
  const avanzarPaso3 = () => {
    stepperRef.current.nextCallback();
  };

  // Se avanza del Paso 4 al Paso 5
  const avanzarPaso4 = () => {
    stepperRef.current.nextCallback();
  };

  // Se reinicia el formulario del asistente
  const reiniciarAsistente = () => {
    setModoCurso('existente');
    setCursoSeleccionadoId(null);
    setNuevoCursoForm({ nombre: '', anyo: '', centro: '', descripcion: '' });
    setCicloSeleccionadoId(null);
    setModuloSeleccionadoId(null);
    setDiscentesSeleccionados([]);
    setErroresPaso1({});
    setErroresPaso2({});
    setFiltroDiscentes('');
    if (stepperRef.current) {
      stepperRef.current.setActiveStep(0);
    }
  };

  // Se procesa el guardado final en la base de datos tras la confirmación en el Paso 5
  const manejarGuardarClase = async () => {
    mostrarInfo('Procesando clase', 'Guardando curso, matriculaciones y generando evaluaciones...');

    const payload = {
      cursoId: modoCurso === 'existente' ? cursoSeleccionadoId : null,
      nuevoCurso: modoCurso === 'nuevo' ? nuevoCursoForm : null,
      moduloId: moduloSeleccionadoId,
      discentesIds: discentesSeleccionados.map((d) => d.id_discente)
    };

    const respuesta = await ejecutarCreacionClase(payload);

    if (respuesta.exito) {
      mostrarExito(
        'Clase creada con éxito',
        `Se ha configurado la clase con ${respuesta.totalDiscentesMatriculados} discentes y 4 evaluaciones reglamentarias.`
      );
      reiniciarAsistente();
      alFinalizarExito();
      recargar();
    } else {
      mostrarError('Error al crear clase', respuesta.error || 'No se pudo completar el asistente.');
    }
  };

  // Se preparan las opciones para el desplegable de Cursos existentes
  const opcionesCursos = (cursos || []).map((c) => ({
    label: `${c.nombre}${c.anyo ? ` (${c.anyo})` : ''}${c.centro ? ` - ${c.centro}` : ''}`,
    value: c.id_curso
  }));

  // Se preparan las opciones para el desplegable de Ciclos
  const opcionesCiclos = (ciclos || []).map((ci) => ({
    label: `${ci.nombre}${ci.siglas ? ` (${ci.siglas})` : ''}`,
    value: ci.id_ciclo
  }));

  // Se preparan las opciones para el desplegable de Módulos
  const opcionesModulos = (modulosCiclo || []).map((m) => ({
    label: `${m.siglas ? `[${m.siglas}] ` : ''}${m.nombre}`,
    value: m.id_modulo,
    siglas: m.siglas,
    nombre: m.nombre
  }));

  // Objetos seleccionados para el informe de confirmación
  const cursoElegido = modoCurso === 'existente'
    ? (cursos || []).find((c) => c.id_curso === cursoSeleccionadoId)
    : nuevoCursoForm;

  const cicloElegido = (ciclos || []).find((c) => c.id_ciclo === cicloSeleccionadoId);
  const moduloElegido = (modulosCiclo || []).find((m) => m.id_modulo === moduloSeleccionadoId);

  // Renderizado del avatar de discente en la tabla
  const plantillaAvatarDiscente = (rowData) => {
    const iniciales = `${rowData.nombre?.charAt(0) || ''}${rowData.apellidos?.charAt(0) || ''}`;
    return (
      <div className="flex align-items-center gap-3 py-1">
        {rowData.imagen ? (
          <Avatar image={rowData.imagen} shape="circle" size="normal" />
        ) : (
          <Avatar label={iniciales || 'AL'} shape="circle" size="normal" className="bg-primary text-white font-bold" />
        )}
        <div className="flex flex-column">
          <span className="font-bold text-sm text-color">{rowData.nombre} {rowData.apellidos}</span>
          <span className="text-xs text-muted mt-1">{rowData.correo || 'Sin correo registrado'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="asistente-crear-clase">
      <Card className="shadow-1 border-round surface-card p-2 md:p-3">
        {/* Cabecera del asistente */}
        <div className="asistente-main-header">
          <div className="flex align-items-center gap-3">
            <div className="asistente-header-icon-box">
              <i className="pi pi-plus-circle text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-color m-0">
                Asistente de Creación de Clases y Evaluaciones
              </h2>
              <p className="text-muted text-sm m-0 mt-1">
                Configure el curso, asigne módulos, matricule discentes y genere las evaluaciones reglamentarias en 5 pasos guiados.
              </p>
            </div>
          </div>
        </div>

        <Stepper ref={stepperRef} linear>
          {/* ===================== PASO 1: CURSO ===================== */}
          <StepperPanel header="Curso Académico">
            <div className="asistente-step-container">
              {/* Encabezado de la sección */}
              <div className="asistente-step-header">
                <div className="step-title">
                  <i className="pi pi-calendar text-primary" />
                  <span>Paso 1: Configurar el Curso Académico</span>
                </div>
                <div className="step-subtitle">
                  Seleccione un curso registrado en el centro o dé de alta un nuevo grupo escolar.
                </div>
              </div>

              {/* Selector de modo en tarjetas interactivas */}
              <div className="grid">
                <div className="col-12 md:col-6">
                  <div
                    className={`asistente-option-card ${modoCurso === 'existente' ? 'asistente-option-card-active' : ''}`}
                    onClick={() => {
                      setModoCurso('existente');
                      setErroresPaso1({});
                    }}
                  >
                    <RadioButton
                      inputId="modo_existente"
                      name="modoCurso"
                      value="existente"
                      onChange={(e) => {
                        setModoCurso(e.value);
                        setErroresPaso1({});
                      }}
                      checked={modoCurso === 'existente'}
                    />
                    <div className="flex-1">
                      <label htmlFor="modo_existente" className="cursor-pointer font-bold text-sm text-color block m-0">
                        Seleccionar curso existente
                      </label>
                      <span className="text-xs text-muted block mt-1">
                        Elegir de la lista de cursos académicos ya dados de alta
                      </span>
                    </div>
                    <i className="pi pi-list text-primary text-xl" />
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div
                    className={`asistente-option-card ${modoCurso === 'nuevo' ? 'asistente-option-card-active' : ''}`}
                    onClick={() => {
                      setModoCurso('nuevo');
                      setErroresPaso1({});
                    }}
                  >
                    <RadioButton
                      inputId="modo_nuevo"
                      name="modoCurso"
                      value="nuevo"
                      onChange={(e) => {
                        setModoCurso(e.value);
                        setErroresPaso1({});
                      }}
                      checked={modoCurso === 'nuevo'}
                    />
                    <div className="flex-1">
                      <label htmlFor="modo_nuevo" className="cursor-pointer font-bold text-sm text-color block m-0">
                        Crear un nuevo curso
                      </label>
                      <span className="text-xs text-muted block mt-1">
                        Registrar un nuevo grupo, año académico y centro
                      </span>
                    </div>
                    <i className="pi pi-plus-circle text-primary text-xl" />
                  </div>
                </div>
              </div>

              {/* Bloque de formulario */}
              {modoCurso === 'existente' ? (
                <div className="asistente-form-box">
                  <div className="form-field-group">
                    <label htmlFor="select_curso" className="form-field-label">
                      Curso Académico Disponible <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      id="select_curso"
                      value={cursoSeleccionadoId}
                      options={opcionesCursos}
                      onChange={(e) => {
                        setCursoSeleccionadoId(e.value);
                        setErroresPaso1({});
                      }}
                      placeholder="Seleccione un curso académico de la lista"
                      filter
                      showClear
                      className={`w-full ${erroresPaso1.curso ? 'p-invalid' : ''}`}
                    />
                    {erroresPaso1.curso && <small className="p-error block mt-1">{erroresPaso1.curso}</small>}
                    {opcionesCursos.length === 0 && (
                      <div className="text-sm text-muted mt-2">
                        No hay cursos disponibles actualmente. Seleccione la opción "Crear un nuevo curso" para registrar uno.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="asistente-form-box">
                  <div className="grid formgrid">
                    <div className="col-12 md:col-6 form-field-group">
                      <label htmlFor="nuevo_nombre" className="form-field-label">
                        Nombre del curso <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        id="nuevo_nombre"
                        value={nuevoCursoForm.nombre}
                        onChange={(e) =>
                          setNuevoCursoForm((prev) => ({ ...prev, nombre: e.target.value }))
                        }
                        placeholder="Ej. 2º DAW, 1º ASIR, 2º DAM"
                        className={`w-full ${erroresPaso1.nombre ? 'p-invalid' : ''}`}
                      />
                      {erroresPaso1.nombre && <small className="p-error block mt-1">{erroresPaso1.nombre}</small>}
                    </div>

                    <div className="col-12 md:col-6 form-field-group">
                      <label htmlFor="nuevo_anyo" className="form-field-label">
                        Año académico <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        id="nuevo_anyo"
                        value={nuevoCursoForm.anyo}
                        onChange={(e) =>
                          setNuevoCursoForm((prev) => ({ ...prev, anyo: e.target.value }))
                        }
                        placeholder="Ej. 2025/2026"
                        className={`w-full ${erroresPaso1.anyo ? 'p-invalid' : ''}`}
                      />
                      {erroresPaso1.anyo && <small className="p-error block mt-1">{erroresPaso1.anyo}</small>}
                    </div>

                    <div className="col-12 md:col-6 form-field-group">
                      <label htmlFor="nuevo_centro" className="form-field-label">
                        Centro educativo
                      </label>
                      <InputText
                        id="nuevo_centro"
                        value={nuevoCursoForm.centro}
                        onChange={(e) =>
                          setNuevoCursoForm((prev) => ({ ...prev, centro: e.target.value }))
                        }
                        placeholder="Ej. IES San Vicente"
                        className="w-full"
                      />
                    </div>

                    <div className="col-12 md:col-6 form-field-group">
                      <label htmlFor="nuevo_desc" className="form-field-label">
                        Descripción u observaciones
                      </label>
                      <InputTextarea
                        id="nuevo_desc"
                        value={nuevoCursoForm.descripcion}
                        onChange={(e) =>
                          setNuevoCursoForm((prev) => ({ ...prev, descripcion: e.target.value }))
                        }
                        rows={1}
                        autoResize
                        placeholder="Observaciones adicionales"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botonera de navegación */}
              <div className="asistente-actions-bar">
                <div />
                <Button
                  label="Siguiente (Módulos)"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  severity="primary"
                  onClick={avanzarPaso1}
                />
              </div>
            </div>
          </StepperPanel>

          {/* ===================== PASO 2: MÓDULOS ===================== */}
          <StepperPanel header="Módulos y Ciclo">
            <div className="asistente-step-container">
              {/* Encabezado de la sección */}
              <div className="asistente-step-header">
                <div className="step-title">
                  <i className="pi pi-book text-primary" />
                  <span>Paso 2: Asignación de Ciclo y Módulo</span>
                </div>
                <div className="step-subtitle">
                  Seleccione el ciclo formativo para filtrar y vincular la materia correspondiente.
                </div>
              </div>

              {/* Selectores de Ciclo y Módulo */}
              <div className="asistente-form-box">
                <div className="grid formgrid">
                  <div className="col-12 md:col-6 form-field-group">
                    <label htmlFor="select_ciclo" className="form-field-label">
                      1. Ciclo Formativo <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      id="select_ciclo"
                      value={cicloSeleccionadoId}
                      options={opcionesCiclos}
                      onChange={(e) => manejarCambioCiclo(e.value)}
                      placeholder="Seleccione el ciclo formativo"
                      filter
                      showClear
                      className={`w-full ${erroresPaso2.ciclo ? 'p-invalid' : ''}`}
                    />
                    {erroresPaso2.ciclo && <small className="p-error block mt-1">{erroresPaso2.ciclo}</small>}
                    <small className="text-muted block mt-1">
                      Al elegir un ciclo se filtrarán automáticamente los módulos asociados.
                    </small>
                  </div>

                  <div className="col-12 md:col-6 form-field-group">
                    <label htmlFor="select_modulo" className="form-field-label">
                      2. Módulo / Asignatura <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      id="select_modulo"
                      value={moduloSeleccionadoId}
                      options={opcionesModulos}
                      itemTemplate={plantillaOpcionModulo}
                      valueTemplate={plantillaValorModulo}
                      filterBy="label,siglas,nombre"
                      onChange={(e) => {
                        setModuloSeleccionadoId(e.value);
                        setErroresPaso2((prev) => ({ ...prev, modulo: null }));
                      }}
                      placeholder={
                        !cicloSeleccionadoId
                          ? 'Primero seleccione un ciclo'
                          : cargandoModulos
                          ? 'Cargando módulos...'
                          : 'Seleccione el módulo'
                      }
                      disabled={!cicloSeleccionadoId || cargandoModulos}
                      filter
                      showClear
                      className={`w-full ${erroresPaso2.modulo ? 'p-invalid' : ''}`}
                    />
                    {erroresPaso2.modulo && <small className="p-error block mt-1">{erroresPaso2.modulo}</small>}
                    {cicloSeleccionadoId && opcionesModulos.length === 0 && !cargandoModulos && (
                      <small className="text-orange-500 block mt-1">
                        No se encontraron módulos registrados para este ciclo.
                      </small>
                    )}
                  </div>
                </div>
              </div>

              {/* Ficha del módulo seleccionado */}
              {moduloElegido && (
                <div className="asistente-selected-module-card">
                  <div className="asistente-module-icon-box">
                    <i className="pi pi-book text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-color text-base">{moduloElegido.nombre}</div>
                    <div className="text-xs text-muted mt-1 flex flex-wrap gap-2 align-items-center">
                      <Tag severity="info" value={moduloElegido.siglas || 'MOD'} className="text-xs" />
                      <span>{moduloElegido.descripcion || 'Sin descripción adicional registrada.'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Botonera de navegación */}
              <div className="asistente-actions-bar">
                <Button
                  label="Anterior"
                  icon="pi pi-arrow-left"
                  severity="secondary"
                  outlined
                  onClick={() => stepperRef.current.prevCallback()}
                />
                <Button
                  label="Siguiente (Discentes)"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  severity="primary"
                  onClick={avanzarPaso2}
                />
              </div>
            </div>
          </StepperPanel>

          {/* ===================== PASO 3: DISCENTES ===================== */}
          <StepperPanel header="Discentes">
            <div className="asistente-step-container">
              {/* Encabezado de la sección */}
              <div className="asistente-step-header">
                <div className="step-title">
                  <i className="pi pi-users text-primary" />
                  <span>Paso 3: Selección de Discentes a Matricular</span>
                </div>
                <div className="step-subtitle">
                  Marque las casillas de los estudiantes que formarán parte de la clase.
                </div>
              </div>

              {/* Barra de control y búsqueda */}
              <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
                <div className="p-input-icon-left w-full md:w-22rem">
                  <i className="pi pi-search" />
                  <InputText
                    type="search"
                    value={filtroDiscentes}
                    onChange={(e) => setFiltroDiscentes(e.target.value)}
                    placeholder="Buscar discente por nombre, NIA..."
                    className="p-inputtext-sm w-full"
                  />
                </div>

                <div className="flex align-items-center gap-2">
                  <Tag
                    severity={discentesSeleccionados.length > 0 ? 'success' : 'info'}
                    value={`${discentesSeleccionados.length} Seleccionados`}
                    className="text-sm px-3 py-1 font-bold"
                  />
                  {discentesSeleccionados.length > 0 && (
                    <Button
                      type="button"
                      label="Limpiar"
                      icon="pi pi-times"
                      size="small"
                      severity="secondary"
                      text
                      onClick={() => setDiscentesSeleccionados([])}
                    />
                  )}
                  <Button
                    type="button"
                    label="Seleccionar Todos"
                    icon="pi pi-check-square"
                    size="small"
                    severity="secondary"
                    outlined
                    onClick={() => setDiscentesSeleccionados(discentesActivos)}
                  />
                </div>
              </div>

              {/* Tabla de discentes */}
              <div className="asistente-table-wrapper">
                <DataTable
                  value={discentesActivos}
                  selection={discentesSeleccionados}
                  onSelectionChange={(e) => setDiscentesSeleccionados(e.value)}
                  dataKey="id_discente"
                  globalFilter={filtroDiscentes}
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  emptyMessage="No hay discentes activos disponibles."
                  className="p-datatable-sm"
                  responsiveLayout="scroll"
                  stripedRows
                >
                  <Column selectionMode="multiple" headerStyle={{ width: '3.5rem' }} />
                  <Column header="Discente" body={plantillaAvatarDiscente} sortable sortField="nombre" />
                  <Column field="NIA" header="NIA" sortable style={{ width: '150px' }} />
                  <Column field="localidad" header="Localidad" sortable style={{ width: '150px' }} />
                </DataTable>
              </div>

              {/* Botonera de navegación */}
              <div className="asistente-actions-bar">
                <Button
                  label="Anterior"
                  icon="pi pi-arrow-left"
                  severity="secondary"
                  outlined
                  onClick={() => stepperRef.current.prevCallback()}
                />
                <Button
                  label="Siguiente (Auto-Evaluaciones)"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  severity="primary"
                  onClick={avanzarPaso3}
                />
              </div>
            </div>
          </StepperPanel>

          {/* ===================== PASO 4: AUTO-EVALUACIONES ===================== */}
          <StepperPanel header="Auto-Evaluaciones">
            <div className="asistente-step-container">
              {/* Encabezado de la sección */}
              <div className="asistente-step-header">
                <div className="step-title">
                  <i className="pi pi-check-square text-primary" />
                  <span>Paso 4: Generación Automática de Evaluaciones</span>
                </div>
                <div className="step-subtitle">
                  El sistema dará de alta silenciosamente los 5 periodos reglamentarios vinculados al curso y módulo.
                </div>
              </div>

              <Message
                severity="info"
                text="Se crearán automáticamente 5 registros en la tabla Evaluaciones para estructurar el seguimiento académico del curso."
                className="w-full"
              />

              {/* Cuadrícula de 5 tarjetas de evaluaciones */}
              <div className="grid">
                {evaluacionesReglamentarias.map((ev, index) => (
                  <div key={ev.nombre} className="col-12 sm:col-6 md:col-4 lg:col">
                    <div className="asistente-eval-card">
                      <div className="asistente-eval-badge">
                        {index + 1}
                      </div>
                      <div className="font-bold text-color text-base">{ev.nombre}</div>
                      <div className="text-xs text-muted mt-1 text-center">{ev.descripcion}</div>
                      <Tag severity="success" value="Reglamentaria" className="text-xs mt-2 font-semibold" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="asistente-info-banner">
                <i className="pi pi-info-circle text-primary text-xl" />
                <span className="text-sm text-color line-height-3">
                  Estos periodos permitirán asignar notas a las prácticas y evaluar a los alumnos en el módulo de calificación.
                </span>
              </div>

              {/* Botonera de navegación */}
              <div className="asistente-actions-bar">
                <Button
                  label="Anterior"
                  icon="pi pi-arrow-left"
                  severity="secondary"
                  outlined
                  onClick={() => stepperRef.current.prevCallback()}
                />
                <Button
                  label="Siguiente (Confirmación)"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  severity="primary"
                  onClick={avanzarPaso4}
                />
              </div>
            </div>
          </StepperPanel>

          {/* ===================== PASO 5: CONFIRMACIÓN ===================== */}
          <StepperPanel header="Confirmación">
            <div className="asistente-step-container">
              {/* Encabezado de la sección */}
              <div className="asistente-step-header">
                <div className="step-title">
                  <i className="pi pi-file-check text-primary" />
                  <span>Paso 5: Resumen y Confirmación Final</span>
                </div>
                <div className="step-subtitle">
                  Revise los datos de la nueva clase antes de guardar los registros en la base de datos.
                </div>
              </div>

              {/* Ficha técnica estructurada */}
              <div className="asistente-summary-container">
                <div className="grid">
                  {/* Bloque Curso */}
                  <div className="col-12 md:col-6">
                    <div className="asistente-summary-box">
                      <div className="asistente-summary-label">Curso Académico</div>
                      <div className="font-bold text-base text-color">
                        {cursoElegido?.nombre || 'No definido'}
                      </div>
                      <div className="text-sm text-muted mt-2">
                        Año académico: <strong className="text-color">{cursoElegido?.anyo || 'N/A'}</strong>
                      </div>
                      {cursoElegido?.centro && (
                        <div className="text-sm text-muted mt-1">
                          Centro: <strong className="text-color">{cursoElegido.centro}</strong>
                        </div>
                      )}
                      <div className="mt-3">
                        <Tag
                          severity={modoCurso === 'nuevo' ? 'warning' : 'info'}
                          value={modoCurso === 'nuevo' ? 'Nuevo Curso a Crear' : 'Curso Existente'}
                          className="text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bloque Módulo y Ciclo */}
                  <div className="col-12 md:col-6">
                    <div className="asistente-summary-box">
                      <div className="asistente-summary-label">Módulo y Ciclo Formativo</div>
                      <div className="font-bold text-base text-color">
                        {moduloElegido?.nombre || 'No definido'}
                      </div>
                      <div className="text-sm text-muted mt-2">
                        Siglas: <strong className="text-color">{moduloElegido?.siglas || 'N/A'}</strong>
                      </div>
                      <div className="text-sm text-muted mt-1">
                        Ciclo: <strong className="text-color">{cicloElegido?.nombre || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bloque Discentes */}
                  <div className="col-12 md:col-6">
                    <div className="asistente-summary-box">
                      <div className="flex justify-content-between align-items-center mb-2">
                        <div className="asistente-summary-label m-0">Discentes a Matricular</div>
                        <Tag severity="success" value={`${discentesSeleccionados.length} Alumnos`} className="font-bold" />
                      </div>
                      {discentesSeleccionados.length > 0 ? (
                        <ul className="m-0 pl-3 text-sm text-white line-height-3 mt-1 max-h-15rem overflow-y-auto" style={{ color: '#ffffff' }}>
                          {discentesSeleccionados.map((d) => (
                            <li key={d.id_discente} className="text-white" style={{ color: '#ffffff' }}>
                              {d.nombre} {d.apellidos}{d.NIA ? ` (${d.NIA})` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-muted font-italic mt-2">
                           No se han seleccionado discentes (podrán matricularse posteriormente).
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bloque Evaluaciones */}
                  <div className="col-12 md:col-6">
                    <div className="asistente-summary-box">
                      <div className="flex justify-content-between align-items-center mb-2">
                        <div className="asistente-summary-label m-0">Evaluaciones Reglamentarias</div>
                        <Tag severity="info" value="4 Registros" className="font-bold" />
                      </div>
                      <ul className="m-0 pl-3 text-sm text-color line-height-3 mt-1">
                        {evaluacionesReglamentarias.map((ev) => (
                          <li key={ev.nombre}>
                            <strong>{ev.nombre}</strong>: {ev.descripcion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botonera final */}
              <div className="asistente-actions-bar">
                <Button
                  label="Anterior"
                  icon="pi pi-arrow-left"
                  severity="secondary"
                  outlined
                  disabled={guardando}
                  onClick={() => stepperRef.current.prevCallback()}
                />
                <div className="flex gap-2">
                  <Button
                    label="Cancelar"
                    icon="pi pi-times"
                    severity="secondary"
                    text
                    disabled={guardando}
                    onClick={reiniciarAsistente}
                  />
                  <Button
                    label="Aceptar y guardar"
                    icon="pi pi-check"
                    severity="primary"
                    loading={guardando}
                    onClick={manejarGuardarClase}
                  />
                </div>
              </div>
            </div>
          </StepperPanel>
        </Stepper>
      </Card>
    </div>
  );
};

export default CrearClaseAsistente;

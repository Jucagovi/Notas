import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import useClonadoCurso from '../hooks/useClonadoCurso.js';

// Componente principal de página para el clonado de cursos (rollover) y generación de evaluaciones
const ClonadoCurso = () => {
  const navigate = useNavigate();
  const [dialogoExitoVisible, setDialogoExitoVisible] = useState(false);

  const {
    cursos,
    cursoOrigenId,
    modulosOrigen,
    cargandoCursos,
    cargandoModulos,
    clonando,
    nuevoCurso,
    erroresValidacion,
    resultadoClonado,
    seleccionarCursoOrigen,
    actualizarCampoNuevoCurso,
    ejecutarClonado,
    reiniciarFormulario
  } = useClonadoCurso();

  // Plantilla para los elementos de la lista desplegable de cursos de origen
  const plantillaOpcionCurso = (opcion) => {
    if (!opcion) return null;
    const textoCurso = opcion.anyo ? `${opcion.anyo} ${opcion.nombre}` : opcion.nombre;

    return (
      <div className="flex flex-column py-1 w-full">
        <span className="font-semibold text-sm text-900">{textoCurso}</span>
        {opcion.centro && (
          <span className="text-xs text-muted">
            {opcion.centro}
          </span>
        )}
      </div>
    );
  };

  // Plantilla para el valor seleccionado en el Dropdown de cursos
  const plantillaValorCurso = (opcion, props) => {
    if (opcion) {
      const textoCurso = opcion.anyo ? `${opcion.anyo} ${opcion.nombre}` : opcion.nombre;
      return (
        <span className="font-semibold text-sm text-900">{textoCurso}</span>
      );
    }
    return <span className="text-muted">{props.placeholder}</span>;
  };

  // Se solicita confirmación antes de iniciar la transacción de clonado
  const confirmarClonado = () => {
    const totalModulos = modulosOrigen.length;
    const totalEvaluaciones = totalModulos * 4;

    confirmDialog({
      message: `Se creará el curso "${nuevoCurso.nombre}" y se generarán ${totalEvaluaciones} evaluaciones reglamentarias (${totalModulos} módulos × 4 convocatorias). ¿Desea proceder?`,
      header: 'Confirmar Clonado de Curso',
      icon: 'pi pi-copy text-primary',
      acceptLabel: 'Sí, clonar curso',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-primary font-bold',
      accept: async () => {
        const res = await ejecutarClonado();
        if (res && res.exito) {
          setDialogoExitoVisible(true);
        }
      }
    });
  };

  // Se calcula el número total de evaluaciones que se generarán
  const totalEvaluacionesCalculadas = (modulosOrigen.length || 0) * 4;

  return (
    <div className="page-container">
      <ConfirmDialog />

      {/* Cabecera principal de la página */}
      <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-2">
        <div>
          <h1 className="page-title m-0 flex align-items-center gap-2">
            <i className="pi pi-copy text-primary" />
            <span>Clonado de cursos (rollover)</span>
          </h1>
          <p className="text-muted m-0 mt-1">
            Automatiza la creación de un nuevo año académico basándote en la estructura de un curso previo. Se replicarán sus módulos y evaluaciones reglamentarias, dejándolo listo para matricular nuevos discentes.
          </p>
        </div>
      </div>

      <Divider />

      <div className="page-content flex justify-content-center">
        <div className="w-full" style={{ maxWidth: '1000px' }}>
          <Card className="shadow-2 border-1 surface-border">
            <div className="flex flex-column gap-5">

              {/* =========================================================================
                  SECCIÓN 1: Curso Origen (¿Qué copiamos?)
                 ========================================================================= */}
              <div>
                <div className="flex align-items-center gap-2 mb-3">
                  <div
                    className="flex align-items-center justify-content-center border-round"
                    style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary-color)'
                    }}
                  >
                    <span className="font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="m-0 text-lg font-bold">Curso de Origen</h3>
                    <p className="text-muted text-xs m-0">
                      Selecciona el curso académico cuya estructura de módulos deseas replicar.
                    </p>
                  </div>
                </div>

                <div className="surface-ground border-round p-4 border-1 surface-border flex flex-column gap-3">
                  <div>
                    <label htmlFor="selector-curso-origen" className="block text-sm font-bold mb-2">
                      Seleccionar curso origen *
                    </label>
                    <Dropdown
                      id="selector-curso-origen"
                      value={cursoOrigenId}
                      options={cursos}
                      optionValue="id_curso"
                      optionLabel={(opcion) => (opcion.anyo ? `${opcion.anyo} ${opcion.nombre}` : opcion.nombre)}
                      onChange={(e) => seleccionarCursoOrigen(e.value)}
                      placeholder={cargandoCursos ? 'Cargando cursos...' : 'Seleccione el curso a duplicar...'}
                      disabled={cargandoCursos || clonando}
                      itemTemplate={plantillaOpcionCurso}
                      valueTemplate={plantillaValorCurso}
                      filter
                      filterBy="anyo,nombre,centro"
                      showClear
                      className={`w-full ${erroresValidacion.cursoOrigen ? 'p-invalid' : ''}`}
                    />
                    {erroresValidacion.cursoOrigen && (
                      <small className="p-error block mt-1 font-semibold">
                        {erroresValidacion.cursoOrigen}
                      </small>
                    )}
                  </div>

                  {/* Visualización de los módulos encontrados en el curso origen */}
                  {cursoOrigenId && (
                    <div className="mt-2">
                      <div className="flex align-items-center justify-content-between mb-2">
                        <span className="text-sm font-semibold text-700 flex align-items-center gap-2">
                          <i className="pi pi-book text-primary" />
                          <span>Módulos impartidos en este curso:</span>
                        </span>
                        {cargandoModulos ? (
                          <div className="flex align-items-center gap-2 text-xs text-muted">
                            <ProgressSpinner style={{ width: '16px', height: '16px' }} strokeWidth="5" />
                            <span>Consultando módulos...</span>
                          </div>
                        ) : (
                          <Tag
                            value={`${modulosOrigen.length} ${modulosOrigen.length === 1 ? 'módulo' : 'módulos'}`}
                            severity={modulosOrigen.length > 0 ? 'success' : 'warning'}
                            className="text-xs"
                          />
                        )}
                      </div>

                      {cargandoModulos ? (
                        <div className="surface-card border-round p-4 text-center border-1 surface-border">
                          <ProgressSpinner style={{ width: '32px', height: '32px' }} strokeWidth="4" />
                          <p className="text-xs text-muted m-0 mt-2">Identificando módulos asociados...</p>
                        </div>
                      ) : modulosOrigen.length > 0 ? (
                        <div className="surface-card border-round p-3 border-1 surface-border">
                          <div className="grid">
                            {modulosOrigen.map((modulo) => (
                              <div key={modulo.id_modulo} className="col-12 sm:col-6 p-1">
                                <div className="flex align-items-center justify-content-between p-2 border-round surface-50 border-1 surface-border h-full">
                                  <div className="flex align-items-center gap-2 overflow-hidden">
                                    {modulo.siglas && (
                                      <Tag
                                        value={modulo.siglas}
                                        severity="primary"
                                        className="font-bold text-xs flex-shrink-0"
                                      />
                                    )}
                                    <span
                                      className="text-sm font-semibold text-900 text-overflow-ellipsis overflow-hidden white-space-nowrap"
                                      title={modulo.nombre}
                                    >
                                      {modulo.nombre}
                                    </span>
                                  </div>
                                  {modulo.Ciclos && (
                                    <span
                                      className="text-xs text-muted flex-shrink-0 ml-2"
                                      title={modulo.Ciclos.nombre}
                                    >
                                      {modulo.Ciclos.siglas || modulo.Ciclos.nombre}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Message
                          severity="warn"
                          text="El curso seleccionado no tiene módulos registrados en la tabla de asignaciones (imparte) ni en Evaluaciones. Se creará el registro del curso, pero no se generarán evaluaciones automáticas."
                          className="w-full text-xs"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* =========================================================================
                  SECCIÓN 2: Destino (Nuevo Curso)
                 ========================================================================= */}
              <div>
                <div className="flex align-items-center gap-2 mb-3">
                  <div
                    className="flex align-items-center justify-content-center border-round"
                    style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary-color)'
                    }}
                  >
                    <span className="font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="m-0 text-lg font-bold">Datos del Nuevo Curso</h3>
                    <p className="text-muted text-xs m-0">
                      Verifica o edita la información para el nuevo año académico (pre-rellenada inteligentemente).
                    </p>
                  </div>
                </div>

                <div className="surface-ground border-round p-4 border-1 surface-border flex flex-column gap-3">
                  <div className="grid">
                    {/* Campo: Nombre del nuevo curso */}
                    <div className="col-12 md:col-8">
                      <label htmlFor="nuevo-curso-nombre" className="block text-sm font-bold mb-2">
                        Nombre del nuevo curso *
                      </label>
                      <InputText
                        id="nuevo-curso-nombre"
                        value={nuevoCurso.nombre}
                        onChange={(e) => actualizarCampoNuevoCurso('nombre', e.target.value)}
                        placeholder="Ej. 1º DAW 2026/2027"
                        disabled={!cursoOrigenId || clonando}
                        className={`w-full ${erroresValidacion.nombre ? 'p-invalid' : ''}`}
                      />
                      {erroresValidacion.nombre && (
                        <small className="p-error block mt-1 font-semibold">
                          {erroresValidacion.nombre}
                        </small>
                      )}
                    </div>

                    {/* Campo: Año académico */}
                    <div className="col-12 md:col-4">
                      <label htmlFor="nuevo-curso-anyo" className="block text-sm font-bold mb-2">
                        Año académico *
                      </label>
                      <InputText
                        id="nuevo-curso-anyo"
                        value={nuevoCurso.anyo}
                        onChange={(e) => actualizarCampoNuevoCurso('anyo', e.target.value)}
                        placeholder="Ej. 2026/2027"
                        disabled={!cursoOrigenId || clonando}
                        className={`w-full ${erroresValidacion.anyo ? 'p-invalid' : ''}`}
                      />
                      {erroresValidacion.anyo && (
                        <small className="p-error block mt-1 font-semibold">
                          {erroresValidacion.anyo}
                        </small>
                      )}
                    </div>

                    {/* Campo: Centro educativo */}
                    <div className="col-12 md:col-6">
                      <label htmlFor="nuevo-curso-centro" className="block text-sm font-semibold mb-2">
                        Centro educativo
                      </label>
                      <InputText
                        id="nuevo-curso-centro"
                        value={nuevoCurso.centro}
                        onChange={(e) => actualizarCampoNuevoCurso('centro', e.target.value)}
                        placeholder="Ej. IES Severo Ochoa"
                        disabled={!cursoOrigenId || clonando}
                        className="w-full"
                      />
                    </div>

                    {/* Campo: Descripción opcional */}
                    <div className="col-12 md:col-6">
                      <label htmlFor="nuevo-curso-descripcion" className="block text-sm font-semibold mb-2">
                        Descripción o notas adicionales
                      </label>
                      <InputTextarea
                        id="nuevo-curso-descripcion"
                        value={nuevoCurso.descripcion}
                        onChange={(e) => actualizarCampoNuevoCurso('descripcion', e.target.value)}
                        placeholder="Ej. Curso académico 2026/2027"
                        disabled={!cursoOrigenId || clonando}
                        rows={2}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  SECCIÓN 3: Resumen y Vista Previa de la Operación
                 ========================================================================= */}
              {cursoOrigenId && (
                <div>
                  <div className="flex align-items-center gap-2 mb-3">
                    <div
                      className="flex align-items-center justify-content-center border-round"
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary-color)'
                      }}
                    >
                      <span className="font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="m-0 text-lg font-bold">Resumen de la Replicación</h3>
                      <p className="text-muted text-xs m-0">
                        Comprueba las entidades y registros que se darán de alta en la base de datos.
                      </p>
                    </div>
                  </div>

                  <div className="surface-card border-round p-4 border-1 surface-border">
                    <div className="grid">
                      <div className="col-12 md:col-4">
                        <div className="border-1 surface-border border-round p-3 text-center h-full flex flex-column justify-content-center">
                          <i className="pi pi-calendar text-2xl text-primary mb-2" />
                          <span className="text-xs text-muted font-bold uppercase mb-1">Nuevo Curso</span>
                          <span className="font-bold text-sm text-900 line-height-2">
                            {nuevoCurso.nombre || 'Nombre sin definir'}
                          </span>
                          <span className="text-xs text-muted mt-1">{nuevoCurso.anyo || '-'}</span>
                        </div>
                      </div>

                      <div className="col-12 md:col-4">
                        <div className="border-1 surface-border border-round p-3 text-center h-full flex flex-column justify-content-center">
                          <i className="pi pi-book text-2xl text-primary mb-2" />
                          <span className="text-xs text-muted font-bold uppercase mb-1">Módulos Vinculados</span>
                          <span className="font-bold text-2xl text-900">{modulosOrigen.length}</span>
                          <span className="text-xs text-muted mt-1">Estructura de materias</span>
                        </div>
                      </div>

                      <div className="col-12 md:col-4">
                        <div className="border-1 surface-border border-round p-3 text-center h-full flex flex-column justify-content-center">
                          <i className="pi pi-calendar-plus text-2xl text-primary mb-2" />
                          <span className="text-xs text-muted font-bold uppercase mb-1">Evaluaciones a Generar</span>
                          <span className="font-bold text-2xl text-primary">{totalEvaluacionesCalculadas}</span>
                          <span className="text-xs text-muted mt-1">4 por cada módulo</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-muted flex flex-column gap-1">
                      <div className="flex align-items-center gap-2">
                        <i className="pi pi-check text-green-500 font-bold" />
                        <span>
                          Se crearán automáticamente las evaluaciones reglamentarias: <strong>Primera, Segunda, Final y Extraordinaria</strong> para cada módulo.
                        </span>
                      </div>
                      <div className="flex align-items-center gap-2">
                        <i className="pi pi-info-circle text-blue-500" />
                        <span>
                          Los discentes y calificaciones no se transfieren, garantizando un año académico limpio listo para la importación del nuevo censo.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  BOTÓN DE ACCIÓN PRINCIPAL
                 ========================================================================= */}
              <div className="flex flex-column sm:flex-row align-items-center justify-content-between gap-3 pt-3 border-top-1 surface-border">
                <Button
                  type="button"
                  label="Limpiar Formulario"
                  icon="pi pi-refresh"
                  severity="secondary"
                  outlined
                  onClick={reiniciarFormulario}
                  disabled={!cursoOrigenId || clonando}
                  size="small"
                />

                <Button
                  type="button"
                  label={clonando ? 'Clonando y Creando Evaluaciones...' : 'Clonar Curso y Preparar Evaluaciones'}
                  icon={clonando ? 'pi pi-spin pi-spinner' : 'pi pi-copy'}
                  severity="primary"
                  size="large"
                  onClick={confirmarClonado}
                  disabled={!cursoOrigenId || !nuevoCurso.nombre?.trim() || clonando}
                  loading={clonando}
                  className="font-bold shadow-2 w-full sm:w-auto"
                />
              </div>

            </div>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          MODAL DE ÉXITO TRAS EL CLONADO
         ========================================================================= */}
      <Dialog
        visible={dialogoExitoVisible}
        onHide={() => setDialogoExitoVisible(false)}
        header="¡Curso Clonado con Éxito!"
        modal
        style={{ width: '90vw', maxWidth: '550px' }}
        footer={
          <div className="flex flex-wrap justify-content-end gap-2">
            <Button
              label="Clonar Otro Curso"
              icon="pi pi-plus"
              severity="secondary"
              outlined
              size="small"
              onClick={() => {
                setDialogoExitoVisible(false);
                reiniciarFormulario();
              }}
            />
            <Button
              label="Importar Alumnado"
              icon="pi pi-file-import"
              severity="secondary"
              size="small"
              onClick={() => {
                setDialogoExitoVisible(false);
                navigate('/herramientas/importacion');
              }}
            />
            <Button
              label="Ver Clases Creadas"
              icon="pi pi-arrow-right"
              iconPos="right"
              severity="primary"
              size="small"
              onClick={() => {
                setDialogoExitoVisible(false);
                navigate('/clases?pestanya=modificar');
              }}
            />
          </div>
        }
      >
        <div className="flex flex-column align-items-center text-center gap-3 py-2">
          <div
            className="flex align-items-center justify-content-center border-circle shadow-2"
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--green-100, #dcfce7)',
              color: 'var(--green-600, #16a34a)'
            }}
          >
            <i className="pi pi-check text-3xl font-bold" />
          </div>

          <div>
            <h3 className="m-0 text-xl font-bold text-900 mb-1">
              {resultadoClonado?.cursoCreado?.nombre || 'Nuevo Curso'}
            </h3>
            <p className="text-muted text-sm m-0">
              Se ha dado de alta el nuevo curso académico con su configuración completa.
            </p>
          </div>

          <div className="w-full surface-ground border-round p-3 text-left border-1 surface-border flex flex-column gap-2 text-sm">
            <div className="flex justify-content-between">
              <span className="text-muted">Año académico:</span>
              <span className="font-semibold">{resultadoClonado?.cursoCreado?.anyo || '-'}</span>
            </div>
            <div className="flex justify-content-between">
              <span className="text-muted">Centro:</span>
              <span className="font-semibold">{resultadoClonado?.cursoCreado?.centro || 'Sin centro'}</span>
            </div>
            <div className="flex justify-content-between">
              <span className="text-muted">Módulos replicados:</span>
              <span className="font-semibold text-green-600">{resultadoClonado?.totalModulos || 0}</span>
            </div>
            <div className="flex justify-content-between">
              <span className="text-muted">Evaluaciones creadas:</span>
              <span className="font-semibold text-primary">{resultadoClonado?.totalEvaluaciones || 0}</span>
            </div>
          </div>

          <p className="text-xs text-muted m-0">
            Ahora puedes matricular discentes en estas clases o importar masivamente los alumnos mediante la herramienta de importación CSV.
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default ClonadoCurso;

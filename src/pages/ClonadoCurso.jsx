import React from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { Divider } from 'primereact/divider';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import SelectorClase from '../components/common/SelectorClase.jsx';
import useClonadoCurso from '../hooks/useClonadoCurso.js';

// Página para la herramienta de rollover o clonación de cursos académicos y su estructura curricular.
const ClonadoCurso = () => {
  const {
    cursos,
    cargandoCursos,
    cursoOrigenId,
    setCursoOrigenId,
    modulosOrigen,
    cargandoModulos,
    clonando,
    nuevoCurso,
    actualizarCampoNuevoCurso,
    ejecutarClonado
  } = useClonadoCurso();

  // Se adaptan los cursos a la interfaz del componente común SelectorClase
  const opcionesClases = (cursos || []).map((c) => ({
    id: c.id_curso,
    cursoNombre: c.nombre,
    moduloSiglas: c.anyo || '',
    moduloNombre: c.centro || '',
    etiqueta: `${c.anyo ? `[${c.anyo}] ` : ''}${c.nombre} (${c.centro})`
  }));

  return (
    <div className="flex flex-column w-full gap-4">
      {/* Cabecera general de la página a ancho completo */}
      <HeaderPagina
        titulo="Clonado de Curso (Rollover)"
        descripcion="Automatiza la creación de un nuevo año lectivo replicando la estructura de módulos, evaluaciones y ponderaciones de un curso previo."
      />

      {/* Contenedor principal que aprovecha el 100% del ancho disponible */}
      <Card className="shadow-1 border-1 surface-border w-full">
        <div className="flex flex-column gap-4 w-full">
          {/* Sección 1: Clase o Curso de Origen */}
          <div>
            <h3 className="text-lg font-bold text-900 m-0 flex align-items-center gap-2 mb-2">
              <i className="pi pi-history text-primary" />
              <span>1. Seleccionar Clase / Curso Origen</span>
            </h3>
            <p className="text-secondary text-xs m-0 mb-3">
              Elija el curso del cual se tomarán como referencia las materias impartidas y su esquema de evaluación.
            </p>

            <div className="flex flex-column gap-2 w-full">
              <label htmlFor="curso-origen" className="font-semibold text-sm">
                Clase o Curso a clonar: <span className="text-red-500">*</span>
              </label>
              <SelectorClase
                id="curso-origen"
                value={cursoOrigenId}
                options={opcionesClases}
                onChange={(e) => setCursoOrigenId(e.value)}
                placeholder="Seleccione la clase o curso a clonar..."
                loading={cargandoCursos}
                disabled={clonando}
                className="w-full"
              />
            </div>

            {/* Módulos vinculados al curso origen */}
            {cursoOrigenId && (
              <div className="mt-3 p-3 surface-ground border-round w-full">
                <span className="text-xs font-semibold text-700 block mb-2">
                  Módulos identificados que se replicarán ({modulosOrigen.length}):
                </span>
                {cargandoModulos ? (
                  <span className="text-xs text-500 font-italic">Consultando módulos...</span>
                ) : modulosOrigen.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {modulosOrigen.map((m) => (
                      <Chip
                        key={m.id_modulo}
                        label={`${m.siglas ? `${m.siglas} - ` : ''}${m.nombre}`}
                        icon="pi pi-book"
                        className="text-xs"
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-500 font-italic">
                    No se detectaron módulos o evaluaciones previas para este curso.
                  </span>
                )}
              </div>
            )}
          </div>

          <Divider className="my-2" />

          {/* Sección 2: Configuración del Nuevo Curso */}
          <div>
            <h3 className="text-lg font-bold text-900 m-0 flex align-items-center gap-2 mb-2">
              <i className="pi pi-plus-circle text-primary" />
              <span>2. Configurar Nuevo Curso</span>
            </h3>
            <p className="text-secondary text-xs m-0 mb-3">
              Especifique los datos distintivos del nuevo año académico.
            </p>

            <div className="grid formgrid p-fluid">
              <div className="field col-12 md:col-3">
                <label htmlFor="nuevo-anyo" className="font-semibold text-sm">
                  Año Académico: *
                </label>
                <InputText
                  id="nuevo-anyo"
                  value={nuevoCurso.anyo}
                  onChange={(e) => actualizarCampoNuevoCurso('anyo', e.target.value)}
                  placeholder="Ej: 2025/2026"
                  disabled={clonando || !cursoOrigenId}
                />
              </div>

              <div className="field col-12 md:col-5">
                <label htmlFor="nuevo-nombre" className="font-semibold text-sm">
                  Nombre del Curso: *
                </label>
                <InputText
                  id="nuevo-nombre"
                  value={nuevoCurso.nombre}
                  onChange={(e) => actualizarCampoNuevoCurso('nombre', e.target.value)}
                  placeholder="Ej: 1º DAW Mañana (2025/2026)"
                  disabled={clonando || !cursoOrigenId}
                />
              </div>

              <div className="field col-12 md:col-4">
                <label htmlFor="nuevo-centro" className="font-semibold text-sm">
                  Centro Educativo: *
                </label>
                <InputText
                  id="nuevo-centro"
                  value={nuevoCurso.centro}
                  onChange={(e) => actualizarCampoNuevoCurso('centro', e.target.value)}
                  placeholder="Ej: IES Tecnológico"
                  disabled={clonando || !cursoOrigenId}
                />
              </div>

              <div className="field col-12">
                <label htmlFor="nuevo-descripcion" className="font-semibold text-sm">
                  Descripción (opcional):
                </label>
                <InputTextarea
                  id="nuevo-descripcion"
                  value={nuevoCurso.descripcion}
                  onChange={(e) => actualizarCampoNuevoCurso('descripcion', e.target.value)}
                  rows={2}
                  autoResize
                  placeholder="Observaciones o notas adicionales sobre la nueva edición"
                  disabled={clonando || !cursoOrigenId}
                />
              </div>
            </div>
          </div>

          {/* Botón de acción */}
          <div className="flex justify-content-end gap-2 pt-2 border-top-1 surface-border">
            <Button
              type="button"
              label="Clonar Curso y Estructura"
              icon="pi pi-copy"
              className="p-button-primary font-bold w-full sm:w-auto"
              loading={clonando}
              disabled={clonando || !cursoOrigenId}
              onClick={ejecutarClonado}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClonadoCurso;

import React from 'react';

/**
 * ManualUsoTaller - Subcomponente presentacional con una guía rápida de uso del Taller de Prácticas.
 *
 * Responsabilidad Única: Informar al docente sobre el flujo de trabajo para filtrar por año lectivo y clase,
 * administrar el catálogo base de actividades, crear y maquetar versiones con editor enriquecido y exportar a PDF.
 */
export const ManualUsoTaller = () => {
  return (
    <div className="surface-card border-round-xl border-1 surface-border p-4 shadow-1 flex flex-column gap-3 w-full mt-4">
      {/* Cabecera del manual */}
      <div className="flex align-items-center gap-2 pb-2 border-bottom-1 surface-border">
        <i className="pi pi-question-circle text-primary text-xl" />
        <h3 className="text-base font-bold text-900 m-0">
          ¿Cómo utilizar el Taller de Prácticas y Catálogo de Versiones?
        </h3>
      </div>

      {/* Cuadrícula de pasos de uso */}
      <div className="grid">
        {/* Paso 1: Selección de Año y Clase */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                1
              </span>
              <span className="font-bold text-900 text-sm">Año y Clase</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              Seleccione el <strong>Año Académico</strong> (ej. 2026/2027) para filtrar las clases impartidas en dicho curso lectivo. Al escoger una <strong>Clase</strong>, se contextualiza automáticamente el módulo formativo asociado.
            </p>
          </div>
        </div>

        {/* Paso 2: Catálogo de Prácticas */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                2
              </span>
              <span className="font-bold text-900 text-sm">Catálogo Maestro</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              En la columna izquierda gestione las prácticas base con <strong>"Nueva Práctica"</strong>. El módulo ya se conoce por la clase activa. Clasifique la modalidad entre Individual, Grupal, Examen o Proyecto.
            </p>
          </div>
        </div>

        {/* Paso 3: Versiones y Enunciados */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                3
              </span>
              <span className="font-bold text-900 text-sm">Versiones y Rúbricas</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              Al seleccionar una práctica, cree o edite sus <strong>Versiones</strong> en el panel derecho. Vincúlelas a una Unidad de Trabajo (UT), asigne peso porcentual y redacte el enunciado con el <strong>editor enriquecido</strong>.
            </p>
          </div>
        </div>

        {/* Paso 4: Clonación y PDF */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                4
              </span>
              <span className="font-bold text-900 text-sm">Clonar y Exportar PDF</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              Utilice el botón <strong>Clonar</strong> para duplicar instantáneamente cualquier enunciado en nuevos cursos o períodos. Pulse <strong>Exportar a PDF</strong> para generar un examen limpio y listo para entregar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualUsoTaller;

import React from 'react';

/**
 * GuiaUsoCalendario - Subcomponente presentacional con una guía rápida de uso del Master Planner.
 *
 * Responsabilidad Única: Informar al docente sobre el flujo de trabajo para configurar las fechas
 * del curso, utilizar la interacción ágil del OverlayPanel, codificación cromática y exportación a PDF.
 */
export const GuiaUsoCalendario = () => {
  return (
    <div className="surface-card border-round-xl border-1 surface-border p-4 shadow-1 flex flex-column gap-3 w-full">
      <div className="flex align-items-center gap-2 pb-2 border-bottom-1 surface-border">
        <i className="pi pi-question-circle text-primary text-xl" />
        <h3 className="text-base font-bold text-900 m-0">
          ¿Cómo utilizar el Calendario Escolar (Master Planner)?
        </h3>
      </div>

      <div className="grid">
        {/* Paso 1: Selección del año escolar */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                1
              </span>
              <span className="font-bold text-900 text-sm">Año Académico</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              Seleccione el <strong>Año Académico</strong> en el desplegable superior. El calendario mostrará los doce meses (de septiembre a agosto) aplicables a todos los cursos y clases.
            </p>
          </div>
        </div>

        {/* Paso 2: Interacción ágil con OverlayPanel */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                2
              </span>
              <span className="font-bold text-900 text-sm">Interacción Ágil</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              Haga clic en un día o <strong>arrastre un rango de días</strong> en el calendario para desplegar el <strong>panel flotante</strong> con la paleta de botones circulares y campo de motivo opcional.
            </p>
          </div>
        </div>

        {/* Paso 3: Colores y Lectividad */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                3
              </span>
              <span className="font-bold text-900 text-sm">Tipos de Evento</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              Distinga entre días <strong>no lectivos</strong> (Rojo: Festivo Nacional, Amarillo: Festivo Local, Azul: Vacaciones) y días <strong>lectivos</strong> (Verde Claro: Evaluación, Naranja: Examen, Morado: Anotación).
            </p>
          </div>
        </div>

        {/* Paso 4: Impresión en PDF y Tabla */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                4
              </span>
              <span className="font-bold text-900 text-sm">Impresión PDF</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              Use el botón <strong>"Imprimir PDF"</strong> para exportar el calendario en una sola página con la leyenda oficial al pie. También puede gestionar todos los eventos en la tabla inferior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuiaUsoCalendario;

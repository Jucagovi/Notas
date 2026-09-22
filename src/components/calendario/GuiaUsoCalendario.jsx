import React from 'react';

/**
 * GuiaUsoCalendario - Subcomponente presentacional con una guía rápida de uso del calendario escolar.
 *
 * Responsabilidad Única: Informar al docente sobre el flujo de trabajo para configurar las fechas
 * del curso, marcar festivos individuales o periodos y guardar la planificación.
 */
export const GuiaUsoCalendario = () => {
  return (
    <div className="surface-card border-round-xl border-1 surface-border p-4 shadow-1 flex flex-column gap-3 w-full">
      <div className="flex align-items-center gap-2 pb-2 border-bottom-1 surface-border">
        <i className="pi pi-question-circle text-primary text-xl" />
        <h3 className="text-base font-bold text-900 m-0">
          ¿Cómo utilizar la sección de Calendario Escolar?
        </h3>
      </div>

      <div className="grid">
        {/* Paso 1: Configuración de fechas del curso */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                1
              </span>
              <span className="font-bold text-900 text-sm">Fechas Oficiales</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              Seleccione el <strong>Curso Académico</strong> y establezca las fechas de <strong>Inicio</strong> y <strong>Fin de Clases</strong> mediante los selectores de fecha de la cabecera.
            </p>
          </div>
        </div>

        {/* Paso 2: Marcado interactivo de días */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                2
              </span>
              <span className="font-bold text-900 text-sm">Marcar Festivos</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              Haga clic sobre cualquier día laborable en la <strong>cuadrícula anual</strong> para marcarlo como festivo (rojo). Al volver a pulsar se desmarcará. Los fines de semana aparecen atenuados por defecto.
            </p>
          </div>
        </div>

        {/* Paso 3: Periodos y motivos */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                3
              </span>
              <span className="font-bold text-900 text-sm">Periodos y Motivos</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              Use <strong>"Añadir Periodo"</strong> para registrar vacaciones completas (ej. Navidad). En la tabla de días marcados puede escribir el nombre o motivo de cada festividad.
            </p>
          </div>
        </div>

        {/* Paso 4: Consolidar en base de datos */}
        <div className="col-12 md:col-6 lg:col-3">
          <div className="flex flex-column gap-2 p-3 surface-50 border-round h-full border-1 surface-border">
            <div className="flex align-items-center gap-2">
              <span className="w-2rem h-2rem border-circle bg-primary text-primary-contrast flex align-items-center justify-content-center font-bold text-sm">
                4
              </span>
              <span className="font-bold text-900 text-sm">Guardar Cambios</span>
            </div>
            <p className="text-secondary text-xs line-height-3 m-0">
              Pulse en <strong>"Guardar Calendario"</strong> para consolidar las fechas y festivos en la base de datos. El motor de temporización usará esta estructura para distribuir las sesiones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuiaUsoCalendario;

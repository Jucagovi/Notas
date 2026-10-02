import React from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import BotonAccion from '../common/BotonAccion.jsx';
import { formatearAnyoAcademico } from '../../hooks/useConfiguracionCurso.js';

// Paso 6: Informe resumen previo a la confirmación de la clase (sin componentes Tag para año y siglas).
const PasoConfirmacion = ({
  clase,
  curso,
  ciclo,
  modulo,
  esFlexibilizado = false,
  moduloFlexible = null,
  discentesSeleccionados = [],
  clonarProgramacion = false,
  cursoOrigen = null,
  guardando = false,
  onGuardar,
  onCancelar
}) => {
  // Soportar tanto prop clase como curso para máxima resiliencia.
  const claseActual = clase || curso;
  const anyoFormateado = formatearAnyoAcademico(claseActual?.anyo);
  const nombreCursoSecundario = moduloFlexible
    ? `${moduloFlexible.siglas || moduloFlexible.nombre} ${anyoFormateado}`.trim()
    : '';

  return (
    <div className="flex flex-column gap-3 py-2">
      <div>
        <h3 className="m-0 text-xl font-bold text-800">Informe de Configuración y Confirmación</h3>
        <p className="text-secondary text-sm m-0 mt-1">
          Revisa el resumen de las acciones que se ejecutarán en la base de datos antes de guardar los cambios.
        </p>
      </div>

      <div className="grid">
        {/* Resumen de la Clase y Módulo (Año y Siglas en texto plano, sin Tag) */}
        <div className="col-12 md:col-6">
          <Card title="Clase y Módulo" className="h-full border-1 surface-border shadow-none">
            <div className="flex flex-column gap-2 text-sm">
              <div>
                <span className="text-500 font-semibold block">Nombre de la Clase:</span>
                <span className="text-900 font-bold text-base">{claseActual?.nombre || 'No asignada'}</span>
                <div className="text-secondary mt-1">
                  Año lectivo: <strong className="text-900">{claseActual?.anyo || '-'}</strong>
                </div>
                <div className="text-secondary mt-1">
                  Centro educativo: <strong className="text-900">{claseActual?.centro || '-'}</strong>
                </div>
                {(claseActual?.fecha_inicio || claseActual?.fecha_fin) && (
                  <div className="text-secondary mt-1">
                    Período lectivo: <strong className="text-900">{claseActual?.fecha_inicio || '-'}</strong> al <strong className="text-900">{claseActual?.fecha_fin || '-'}</strong>
                  </div>
                )}
              </div>

              <Divider className="my-2" />

              <div>
                <span className="text-500 font-semibold block">Módulo Profesional Principal:</span>
                <span className="text-900 font-bold text-base">{modulo?.nombre || 'No seleccionado'}</span>
                <div className="text-secondary mt-1">
                  Siglas del módulo: <strong className="text-900">{modulo?.siglas || '-'}</strong>
                </div>
                <div className="text-secondary mt-1">
                  Ciclo Formativo: <strong className="text-900">{ciclo?.nombre || '-'}</strong>
                </div>

                {esFlexibilizado && moduloFlexible && (
                  <div className="mt-2 pt-2 border-top-1 surface-border">
                    <span className="text-primary font-semibold block flex align-items-center gap-1">
                      <i className="pi pi-link text-xs" />
                      Módulo Secundario Flexibilizado:
                    </span>
                    <span className="text-900 font-bold text-base">{moduloFlexible.nombre}</span>
                    <div className="text-secondary mt-1">
                      Siglas: <strong className="text-900">{moduloFlexible.siglas || '-'}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Resumen de Acciones a Realizar */}
        <div className="col-12 md:col-6">
          <Card title="Acciones a Realizar" className="h-full border-1 surface-border shadow-none">
            <div className="flex flex-column gap-3 text-sm">
              <div className="flex align-items-center justify-content-between">
                <div>
                  <span className="font-semibold block text-900">
                    {esFlexibilizado ? 'Cursos a Crear (Dual):' : 'Curso a Crear:'}
                  </span>
                  <span className="text-secondary text-xs">
                    {esFlexibilizado ? (
                      <span className="flex flex-column gap-1 mt-1">
                        <span>Principal: <strong className="text-900">{claseActual?.nombre}</strong></span>
                        <span>Secundario (automático): <strong className="text-900">{nombreCursoSecundario}</strong></span>
                      </span>
                    ) : (
                      '1 registro estándar en la tabla Cursos'
                    )}
                  </span>
                </div>
                <span className="font-bold text-primary text-base">
                  {esFlexibilizado ? '2 cursos' : '1 curso'}
                </span>
              </div>

              <div className="flex align-items-center justify-content-between">
                <div>
                  <span className="font-semibold block text-900">Alumnos a Matricular:</span>
                  <span className="text-secondary text-xs">
                    {esFlexibilizado
                      ? 'Matriculación idéntica en ambos cursos en imparte'
                      : 'Se registrarán en la tabla imparte'}
                  </span>
                </div>
                <span className="font-bold text-primary text-base">
                  {discentesSeleccionados.length} alumnos {esFlexibilizado ? '(en ambos)' : ''}
                </span>
              </div>

              <div className="flex align-items-center justify-content-between">
                <div>
                  <span className="font-semibold block text-900">Evaluaciones Reglamentarias:</span>
                  <span className="text-secondary text-xs">
                    {esFlexibilizado
                      ? '5 períodos independientes por módulo en Evaluaciones'
                      : '5 períodos oficiales en la tabla Evaluaciones'}
                  </span>
                </div>
                <span className="font-bold text-primary text-base">
                  {esFlexibilizado ? '10 evaluaciones' : '5 evaluaciones'}
                </span>
              </div>

              <div className="flex align-items-center justify-content-between">
                <div>
                  <span className="font-semibold block text-900">Programación Didáctica:</span>
                  <span className="text-secondary text-xs">
                    {clonarProgramacion && cursoOrigen
                      ? `Clonada desde ${cursoOrigen.nombre} (${cursoOrigen.anyo})`
                      : 'Inicio desde cero sin clonación'}
                  </span>
                </div>
                <span className="font-bold text-primary text-base">
                  {clonarProgramacion ? 'Clonada' : 'Desde cero'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Listado vertical de discentes seleccionados (solo texto plano, sin Tag) */}
      {discentesSeleccionados.length > 0 && (
        <Card className="surface-50 border-1 surface-border shadow-none">
          <span className="font-bold text-base text-900 block mb-2">
            Discentes seleccionados ({discentesSeleccionados.length}):
          </span>
          <div className="max-h-14rem overflow-y-auto pr-2">
            <ul className="list-none p-0 m-0 flex flex-column gap-1">
              {discentesSeleccionados.map((disc, indice) => (
                <li
                  key={disc.id_discente}
                  className="text-sm py-2 px-3 border-bottom-1 surface-border flex align-items-center justify-content-between surface-card border-round mb-1"
                >
                  <span className="text-900 font-medium">
                    {indice + 1}. {disc.apellidos}, {disc.nombre}
                  </span>
                  <span className="text-secondary text-xs">
                    {disc.NIA ? `NIA: ${disc.NIA}` : ''} {disc.correo ? `• ${disc.correo}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Botones de acción final */}
      <div className="flex justify-content-end gap-3 mt-3 pt-3 border-top-1 surface-border">
        <BotonAccion
          tipo="cancelar"
          label="Cancelar y Reiniciar"
          onClick={onCancelar}
          disabled={guardando}
        />
        <BotonAccion
          tipo="guardar"
          label="Aceptar y Guardar Clase"
          onClick={onGuardar}
          loading={guardando}
        />
      </div>
    </div>
  );
};

export default PasoConfirmacion;

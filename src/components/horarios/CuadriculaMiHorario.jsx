import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import EstadoVacio from '../common/EstadoVacio.jsx';
import TarjetaResumenHorario from './TarjetaResumenHorario.jsx';
import DialogoTareaNoLectiva from './DialogoTareaNoLectiva.jsx';
import {
  DIAS_SEMANA,
  formatearHoraParaMostrar,
  esSesionRecreo
} from './constantesHorarios.js';

// Asocia un icono representativo según el tipo de actividad no lectiva detectada.
const resolverIconoTarea = (texto = '') => {
  const t = String(texto).toLowerCase();
  if (t.includes('guardia')) return 'pi pi-shield';
  if (t.includes('reunión') || t.includes('reunion') || t.includes('departamento')) return 'pi pi-users';
  if (t.includes('tutor') || t.includes('familia') || t.includes('atención')) return 'pi pi-comments';
  return 'pi pi-briefcase';
};

/**
 * CuadriculaMiHorario - Componente presentacional para el horario personal del docente (Pestaña 1).
 *
 * Responsabilidad Única: Visualizar la plantilla semanal consolidada del docente titular, integrando
 * las clases lectivas de todos sus grupos y permitiendo crear/editar tareas no lectivas sin curso asociado.
 *
 * @param {Object} props
 * @param {Array<Object>} props.sesiones - Lista de tramos horarios configurados.
 * @param {Array<Object>} props.horarioDocente - Asignaciones consolidadas del docente titular.
 * @param {Map<string, Object>} props.mapaModulos - Diccionario de módulos para resolver siglas.
 * @param {Map<string, Object>} [props.mapaSesiones] - Diccionario de sesiones para mapeo entre cursos.
 * @param {Object} props.resumenDocente - Métricas calculadas de carga lectiva y no lectiva.
 * @param {Function} [props.onGuardarTareaNoLectiva] - Callback para persistir una tarea no lectiva.
 * @param {Function} [props.onEliminarTareaNoLectiva] - Callback para eliminar una tarea no lectiva.
 * @param {Function} props.onIrAGrupos - Callback para navegar a la pestaña de horario por cursos.
 * @param {Function} props.onIrATramos - Callback para navegar a la pestaña de tramos.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const CuadriculaMiHorario = ({
  sesiones = [],
  horarioDocente = [],
  mapaModulos,
  mapaSesiones,
  resumenDocente,
  onGuardarTareaNoLectiva,
  onEliminarTareaNoLectiva,
  onIrAGrupos,
  onIrATramos,
  guardando = false
}) => {
  const [dialogoTareaVisible, setDialogoTareaVisible] = useState(false);
  const [celdaActiva, setCeldaActiva] = useState(null);

  // Manejador para lanzar la impresión del horario semanal.
  const manejarImprimir = () => {
    window.print();
  };

  // Apertura del modal al hacer clic en una celda vacía para añadir tarea no lectiva.
  const manejarClickCeldaVacia = (sesion, dia) => {
    if (!onGuardarTareaNoLectiva) return;
    setCeldaActiva({
      sesion,
      dia,
      tarea: null
    });
    setDialogoTareaVisible(true);
  };

  // Apertura del modal al hacer clic en una tarea no lectiva existente para editarla o borrarla.
  const manejarClickEditarTarea = (sesion, dia, tarea) => {
    if (!onGuardarTareaNoLectiva) return;
    setCeldaActiva({
      sesion,
      dia,
      tarea
    });
    setDialogoTareaVisible(true);
  };

  // Manejador de confirmación de guardado proveniente del diálogo.
  const alConfirmarGuardarTarea = (datos) => {
    if (onGuardarTareaNoLectiva) {
      onGuardarTareaNoLectiva(datos);
    }
    setDialogoTareaVisible(false);
  };

  // Manejador de confirmación de eliminación proveniente del diálogo.
  const alConfirmarEliminarTarea = (idHorario) => {
    if (onEliminarTareaNoLectiva) {
      onEliminarTareaNoLectiva(idHorario);
    }
    setDialogoTareaVisible(false);
  };

  if (sesiones.length === 0) {
    return (
      <div className="surface-card p-4 border-round shadow-1">
        <EstadoVacio
          mensaje="No hay tramos horarios configurados"
          descripcion="Primero es necesario definir los tramos y sesiones horarias para poder construir tu horario semanal."
          icono="pi pi-calendar-times"
          accion={
            <Button
              label="Configurar Tramos"
              icon="pi pi-clock"
              onClick={onIrATramos}
            />
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-column gap-3 w-full">
      <Tooltip target="[data-pr-tooltip]" />

      {/* Métricas clave de carga docente semanal (lectiva + no lectiva) */}
      <TarjetaResumenHorario resumen={resumenDocente} />

      <div className="surface-card p-3 border-round shadow-1 overflow-x-auto">
        {/* Cabecera del panel de horario docente */}
        <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3 pb-3 border-bottom-1 surface-border">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-calendar text-primary text-xl" />
            <div className="flex flex-column">
              <span className="font-bold text-lg text-900">
                Mi Horario Docente (Global)
              </span>
              <span className="text-xs text-color-secondary">
                Consolidación de todas tus clases lectivas y tareas no lectivas (guardias, reuniones, tutorías).
              </span>
            </div>
          </div>
          <div className="flex align-items-center gap-2">
            <Button
              label="Imprimir Horario"
              icon="pi pi-print"
              severity="secondary"
              outlined
              size="small"
              onClick={manejarImprimir}
            />
          </div>
        </div>

        {horarioDocente.length === 0 ? (
          <div className="py-5">
            <EstadoVacio
              mensaje="Aún no tienes clases ni tareas registradas"
              descripcion="Puedes asignar clases en 'Horario por Cursos' o pulsar directamente en cualquier casilla vacía para registrar horas no lectivas (guardias, tutorías, reuniones)."
              icono="pi pi-calendar-plus"
              accion={
                <Button
                  label="Ir a Horario por Cursos"
                  icon="pi pi-th-large"
                  onClick={onIrAGrupos}
                />
              }
            />
          </div>
        ) : (
          /* Cuadrícula semanal global del docente */
          <table
            className="w-full border-collapse mt-3"
            style={{ minWidth: '720px', tableLayout: 'fixed' }}
          >
            <thead>
              <tr className="surface-100">
                <th
                  className="p-3 text-left font-bold text-sm text-700 border-1 surface-border"
                  style={{ width: '130px' }}
                >
                  Tramo / Hora
                </th>
                {DIAS_SEMANA.map((dia) => (
                  <th
                    key={dia.dia}
                    className="p-3 text-center font-bold text-sm text-700 border-1 surface-border"
                  >
                    {dia.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sesiones.map((sesion) => {
                const esRecreo = esSesionRecreo(sesion.descripcion);
                const horaInicioVisual = formatearHoraParaMostrar(sesion.hora_inicio);
                const horaFinVisual = formatearHoraParaMostrar(sesion.hora_fin);

                return (
                  <tr
                    key={sesion.id_sesion}
                    className={esRecreo ? 'surface-50' : ''}
                  >
                    {/* Tramo horario en la primera columna */}
                    <td className="p-2 border-1 surface-border align-middle">
                      <div className="flex flex-column gap-1">
                        <span className="font-bold text-xs text-900">
                          {sesion.descripcion || `${sesion.numero}ª Hora`}
                        </span>
                        <span className="text-xs text-color-secondary">
                          {horaInicioVisual} - {horaFinVisual}
                        </span>
                      </div>
                    </td>

                    {/* Días Lunes a Viernes */}
                    {DIAS_SEMANA.map((dia) => {
                      const clasesEnEsteTramo = horarioDocente.filter((h) => {
                        const coincideSesion =
                          h.id_sesion === sesion.id_sesion ||
                          mapaSesiones?.get(h.id_sesion)?.numero === sesion.numero;
                        const coincideDia = Number(h.dia_semana) === Number(dia.dia);
                        return coincideSesion && coincideDia;
                      });

                      const tieneClase = clasesEnEsteTramo.length > 0;

                      return (
                        <td
                          key={dia.dia}
                          className="p-2 border-1 surface-border text-center"
                          style={{ minHeight: '68px', verticalAlign: 'top' }}
                        >
                          {tieneClase ? (
                            <div className="flex flex-column gap-2">
                              {clasesEnEsteTramo.map((clase) => {
                                const esTareaNoLectiva = clase.id_curso === null || !clase.id_curso;

                                // Caso A: Tarea no lectiva personal (Guardia, Reunión, Tutoría).
                                if (esTareaNoLectiva) {
                                  const iconoTarea = resolverIconoTarea(clase.modulo_alt);
                                  return (
                                    <div
                                      key={clase.id_horario}
                                      onClick={() => manejarClickEditarTarea(sesion, dia, clase)}
                                      className="p-2 border-round text-left border-left-3 border-orange-500 bg-orange-50 text-orange-900 flex flex-column gap-1 shadow-1 cursor-pointer hover:shadow-2 transition-duration-150"
                                      data-pr-tooltip="Haz clic para editar o eliminar esta tarea no lectiva"
                                    >
                                      <div className="flex align-items-center justify-content-between gap-1">
                                        <div className="flex align-items-center gap-1 overflow-hidden">
                                          <i className={`${iconoTarea} text-xs text-orange-600 flex-shrink-0`} />
                                          <span className="font-bold text-xs line-height-1 text-overflow-ellipsis white-space-nowrap overflow-hidden">
                                            {clase.modulo_alt}
                                          </span>
                                        </div>
                                        <span className="text-xs bg-orange-200 px-1 border-round text-orange-900 font-semibold flex-shrink-0">
                                          No lectiva
                                        </span>
                                      </div>
                                      {clase.aula && (
                                        <div className="flex align-items-center gap-1 text-xs text-orange-800">
                                          <i className="pi pi-map-marker text-xs" />
                                          <span>{clase.aula}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }

                                // Caso B: Clase lectiva vinculada a un curso curricular.
                                const moduloInfo = clase.id_modulo && mapaModulos
                                  ? mapaModulos.get(clase.id_modulo)
                                  : null;

                                const siglas = moduloInfo
                                  ? moduloInfo.siglas || moduloInfo.nombre
                                  : clase.modulo_alt || 'Módulo';

                                const nombreCompleto = moduloInfo
                                  ? moduloInfo.nombre
                                  : clase.modulo_alt || '';

                                return (
                                  <div
                                    key={clase.id_horario}
                                    className="p-2 border-round text-left border-left-3 border-primary bg-primary-100 text-primary-900 flex flex-column gap-1 shadow-1"
                                  >
                                    <div className="flex align-items-center justify-content-between gap-1">
                                      <span
                                        className="font-bold text-xs line-height-1 text-overflow-ellipsis white-space-nowrap overflow-hidden"
                                        data-pr-tooltip={nombreCompleto}
                                      >
                                        {siglas}
                                      </span>
                                      <span className="font-semibold text-xs bg-primary-200 px-1 border-round text-primary-900">
                                        {clase.grupo}
                                      </span>
                                    </div>

                                    {nombreCompleto && (
                                      <span
                                        className="text-xs text-700 line-height-1 text-overflow-ellipsis white-space-nowrap overflow-hidden"
                                        data-pr-tooltip={nombreCompleto}
                                      >
                                        {nombreCompleto}
                                      </span>
                                    )}

                                    {clase.aula && (
                                      <div className="flex align-items-center gap-1 text-xs text-600 mt-1">
                                        <i className="pi pi-map-marker text-xs" />
                                        <span>{clase.aula}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : esRecreo ? (
                            <div
                              onClick={() => manejarClickCeldaVacia(sesion, dia)}
                              className="flex align-items-center justify-content-center h-full min-h-3rem text-orange-400 cursor-pointer hover:bg-orange-50 border-round transition-colors transition-duration-150"
                              data-pr-tooltip="Haz clic para asignar guardia de recreo u otra tarea no lectiva"
                            >
                              <span className="text-xs font-semibold text-orange-600">
                                Recreo
                              </span>
                            </div>
                          ) : (
                            <div
                              onClick={() => manejarClickCeldaVacia(sesion, dia)}
                              className="flex align-items-center justify-content-center h-full min-h-3rem text-400 cursor-pointer hover:surface-100 border-round transition-colors transition-duration-150"
                              data-pr-tooltip="Haz clic para añadir tarea no lectiva (guardia, reunión, tutoría...)"
                            >
                              <i className="pi pi-plus text-xs text-300 opacity-60 hover:opacity-100" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Diálogo modal para añadir o editar tareas no lectivas */}
      <DialogoTareaNoLectiva
        visible={dialogoTareaVisible}
        onHide={() => setDialogoTareaVisible(false)}
        onGuardar={alConfirmarGuardarTarea}
        onEliminar={alConfirmarEliminarTarea}
        celdaActiva={celdaActiva}
        guardando={guardando}
      />
    </div>
  );
};

export default CuadriculaMiHorario;

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import SelectorCurso from '../common/SelectorCurso.jsx';
import EstadoVacio from '../common/EstadoVacio.jsx';
import DialogoClaseHorario from './DialogoClaseHorario.jsx';
import {
  DIAS_SEMANA,
  formatearHoraParaMostrar,
  esSesionRecreo
} from './constantesHorarios.js';

/**
 * CuadriculaHorarioGrupo - Componente presentacional para el horario por cursos (Pestaña 2).
 *
 * Responsabilidad Única: Renderizar la cuadrícula semanal de clases del curso seleccionado
 * (días en columnas y tramos en filas), utilizando de forma estricta SelectorCurso para
 * identificar al grupo físico real de estudiantes.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.cursos=[]] - Listado de cursos académicos disponibles.
 * @param {string|null} [props.cursoId=null] - Identificador del curso seleccionado.
 * @param {Function} props.onSeleccionarCurso - Callback para alternar de curso académico.
 * @param {Array<Object>} props.sesiones - Lista de tramos horarios configurados para el curso.
 * @param {Array<Object>} props.horarios - Asignaciones lectivas del curso actual.
 * @param {Array<Object>} props.modulos - Módulos curriculares disponibles.
 * @param {Map<string, Object>} props.mapaModulos - Diccionario rápido de módulos indexados por id_modulo.
 * @param {Function} props.onGuardarClase - Callback para persistir una clase en la celda.
 * @param {Function} props.onEliminarClase - Callback para eliminar la clase de la celda.
 * @param {Function} props.onIrATramos - Callback para navegar a la pestaña de configuración de tramos.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const CuadriculaHorarioGrupo = ({
  cursos = [],
  cursoId = null,
  onSeleccionarCurso,
  sesiones = [],
  horarios = [],
  modulos = [],
  mapaModulos,
  onGuardarClase,
  onEliminarClase,
  onIrATramos,
  guardando = false
}) => {
  const [dialogoClaseVisible, setDialogoClaseVisible] = useState(false);
  const [celdaActiva, setCeldaActiva] = useState(null);

  // Obtención del objeto del curso académico actualmente seleccionado.
  const cursoActual = cursos.find((c) => c.id_curso === cursoId);

  // Apertura del modal al pulsar en una celda para asignar o editar una clase lectiva.
  const manejarClickCelda = (sesion, dia) => {
    if (!cursoId) return;

    // Se localiza si existe una clase asignada en este curso, tramo y día.
    const claseExistente = horarios.find(
      (h) =>
        h.id_curso === cursoId &&
        h.id_sesion === sesion.id_sesion &&
        Number(h.dia_semana) === Number(dia.dia)
    );

    setCeldaActiva({
      sesion,
      dia,
      clase: claseExistente || null
    });
    setDialogoClaseVisible(true);
  };

  // Manejador del guardado proveniente del diálogo con vinculación al curso y grupo actual.
  const alConfirmarGuardado = (datos) => {
    onGuardarClase({
      ...datos,
      id_curso: cursoId,
      grupo: cursoActual?.nombre || datos.grupo || 'Curso'
    });
    setDialogoClaseVisible(false);
  };

  // Manejador del borrado de asignación lectiva proveniente del diálogo.
  const alConfirmarEliminado = (idHorario) => {
    onEliminarClase(idHorario);
    setDialogoClaseVisible(false);
  };

  // Validación de precondición: deben existir tramos horarios configurados para este curso.
  if (sesiones.length === 0) {
    return (
      <div className="surface-card p-4 border-round shadow-1">
        <EstadoVacio
          mensaje="No hay tramos horarios configurados"
          descripcion="Para poder organizar la plantilla semanal de los alumnos de este curso, primero debes configurar sus tramos horarios."
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

      {/* Barra de control para seleccionar el curso mediante SelectorCurso */}
      <div className="surface-card p-3 border-round shadow-1 flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3">
        <div className="flex align-items-center gap-2 w-full sm:w-auto">
          <label htmlFor="selector-curso-horario-tab" className="font-bold text-sm text-900 white-space-nowrap">
            Curso (Grupo):
          </label>
          <div style={{ minWidth: '240px', maxWidth: '360px' }} className="w-full">
            <SelectorCurso
              id="selector-curso-horario-tab"
              value={cursoId}
              options={cursos}
              onChange={(e) => onSeleccionarCurso && onSeleccionarCurso(e.value)}
              placeholder="Seleccionar curso escolar..."
            />
          </div>
        </div>

        {cursos.length > 0 && (
          <div className="flex align-items-center gap-2 flex-wrap">
            <span className="text-xs text-color-secondary font-medium">
              Cursos disponibles:
            </span>
            {cursos.map((c) => (
              <Button
                key={c.id_curso}
                label={c.nombre}
                size="small"
                severity={c.id_curso === cursoId ? 'primary' : 'secondary'}
                outlined={c.id_curso !== cursoId}
                onClick={() => onSeleccionarCurso && onSeleccionarCurso(c.id_curso)}
                className="py-1 px-2 text-xs"
              />
            ))}
          </div>
        )}
      </div>

      {/* Estado si el usuario aún no ha seleccionado ningún curso académico */}
      {!cursoId ? (
        <div className="surface-card p-4 border-round shadow-1">
          <EstadoVacio
            mensaje="Selecciona un curso académico"
            descripcion="Elige un curso en el selector superior para visualizar la plantilla semanal completa de sus alumnos."
            icono="pi pi-users"
          />
        </div>
      ) : (
        /* Cuadrícula semanal del curso seleccionado */
        <div className="surface-card p-3 border-round shadow-1 overflow-x-auto">
          <div className="flex align-items-center justify-content-between pb-3 border-bottom-1 surface-border">
            <div className="flex align-items-center gap-2">
              <i className="pi pi-th-large text-primary text-xl" />
              <span className="font-bold text-lg text-900">
                Horario Semanal &mdash; {cursoActual?.nombre || 'Curso'}
              </span>
            </div>
            <span className="text-xs text-color-secondary">
              Pulsa en cualquier casilla para asignar o editar la clase lectiva de este grupo.
            </span>
          </div>

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
                    {/* Celda de cabecera de fila: Tramo horario */}
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

                    {/* Celdas correspondientes a los días Lunes a Viernes */}
                    {DIAS_SEMANA.map((dia) => {
                      const clase = horarios.find(
                        (h) =>
                          h.id_curso === cursoId &&
                          h.id_sesion === sesion.id_sesion &&
                          Number(h.dia_semana) === Number(dia.dia)
                      );

                      const esMiClase = clase && Boolean(
                        clase.id_modulo ||
                        (clase.profesor && clase.profesor.toLowerCase().includes('docente'))
                      );

                      const moduloInfo = clase?.id_modulo && mapaModulos
                        ? mapaModulos.get(clase.id_modulo)
                        : null;

                      const tituloClase = moduloInfo
                        ? moduloInfo.siglas || moduloInfo.nombre
                        : clase?.modulo_alt || 'Sin Asignar';

                      const nombreCompleto = moduloInfo ? moduloInfo.nombre : clase?.modulo_alt || '';

                      return (
                        <td
                          key={dia.dia}
                          onClick={() => manejarClickCelda(sesion, dia)}
                          className={`p-2 border-1 surface-border text-center cursor-pointer transition-colors transition-duration-150 ${
                            clase
                              ? esMiClase
                                ? 'bg-primary-50 hover:bg-primary-100'
                                : 'surface-100 hover:surface-200'
                              : 'hover:surface-100'
                          }`}
                          style={{ minHeight: '68px', verticalAlign: 'top' }}
                        >
                          {clase ? (
                            <div
                              className={`flex flex-column gap-1 p-2 border-round text-left h-full ${
                                esMiClase
                                  ? 'border-left-3 border-primary bg-primary-100 text-primary-900'
                                  : 'border-left-3 border-500 surface-card text-800 shadow-1'
                              }`}
                            >
                              <div className="flex align-items-center justify-content-between gap-1">
                                <span
                                  className="font-bold text-xs line-height-1 text-overflow-ellipsis white-space-nowrap overflow-hidden"
                                  data-pr-tooltip={nombreCompleto}
                                >
                                  {tituloClase}
                                </span>
                                {esMiClase && (
                                  <i
                                    className="pi pi-user text-xs text-primary"
                                    data-pr-tooltip="Impartido por ti"
                                  />
                                )}
                              </div>

                              {nombreCompleto && (
                                <span
                                  className="text-xs text-600 line-height-1 text-overflow-ellipsis white-space-nowrap overflow-hidden"
                                  data-pr-tooltip={nombreCompleto}
                                >
                                  {nombreCompleto}
                                </span>
                              )}

                              <div className="flex align-items-center justify-content-between gap-1 mt-1 text-xs text-500">
                                {clase.aula ? (
                                  <span className="flex align-items-center gap-1">
                                    <i className="pi pi-map-marker text-xs" />
                                    <span>{clase.aula}</span>
                                  </span>
                                ) : (
                                  <span />
                                )}
                                {!esMiClase && clase.profesor && (
                                  <span
                                    className="text-overflow-ellipsis white-space-nowrap overflow-hidden"
                                    data-pr-tooltip={`Profesor: ${clase.profesor}`}
                                  >
                                    {clase.profesor}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex align-items-center justify-content-center h-full min-h-3rem text-400 opacity-60 hover:opacity-100">
                              <i className="pi pi-plus text-xs" />
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
        </div>
      )}

      {/* Diálogo modal para asignar o editar una clase en la celda */}
      <DialogoClaseHorario
        visible={dialogoClaseVisible}
        onHide={() => setDialogoClaseVisible(false)}
        onGuardar={alConfirmarGuardado}
        onEliminar={alConfirmarEliminado}
        celdaActiva={celdaActiva}
        modulos={modulos}
        grupo={cursoActual?.nombre || 'Curso'}
        guardando={guardando}
      />
    </div>
  );
};

export const CuadriculaHorarioCurso = CuadriculaHorarioGrupo;
export default CuadriculaHorarioGrupo;

import React, { useState, useMemo } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Tooltip } from 'primereact/tooltip';
import EstadoVacio from '../common/EstadoVacio.jsx';
import BotonAccion from '../common/BotonAccion.jsx';
import DialogoClaseHorario from './DialogoClaseHorario.jsx';
import DialogoGenerarTramos from './DialogoGenerarTramos.jsx';
import DialogoNuevoTramo from './DialogoNuevoTramo.jsx';
import DialogoClonarTramos from './DialogoClonarTramos.jsx';
import {
  DIAS_SEMANA,
  formatearHoraParaMostrar,
  esSesionRecreo
} from './constantesHorarios.js';

/**
 * CuadriculaHorarioGrupo - Componente presentacional para el horario por clases (Pestaña 2).
 *
 * Responsabilidad Única: Renderizar la cuadrícula semanal de clases de la clase seleccionada
 * (días en columnas y tramos en filas), permitiendo gestionar sus tramos (generar, añadir manualmente,
 * clonar o eliminar todos) y asignar/editar clases lectivas en cada celda.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.cursos=[]] - Listado de clases académicas disponibles.
 * @param {string|null} [props.cursoId=null] - Identificador de la clase seleccionada.
 * @param {Function} props.onSeleccionarCurso - Callback para alternar de clase académica.
 * @param {Array<Object>} props.sesiones - Lista de tramos horarios configurados para la clase.
 * @param {Array<Object>} props.horarios - Asignaciones lectivas de la clase actual.
 * @param {Array<Object>} props.modulos - Módulos curriculares disponibles.
 * @param {Map<string, Object>} props.mapaModulos - Diccionario rápido de módulos indexados por id_modulo.
 * @param {Function} props.onGuardarClase - Callback para persistir una clase en la celda.
 * @param {Function} props.onEliminarClase - Callback para eliminar la clase de la celda.
 * @param {Function} [props.onCrearTramo] - Callback para añadir un tramo horario manualmente.
 * @param {Function} [props.onGenerarTramos] - Callback para generar tramos predeterminados o personalizados.
 * @param {Function} [props.onClonarTramos] - Callback para clonar los tramos de otra clase.
 * @param {Function} [props.onEliminarTodosLosTramos] - Callback para eliminar todos los tramos de la clase.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const CuadriculaHorarioGrupo = ({
  cursos = [],
  cursoId = null,
  onSeleccionarCurso,
  sesiones = [],
  horarios = [],
  modulos = [],
  modulosCiclo = [],
  moduloDefectoId = null,
  mapaCursosModulos,
  mapaModulos,
  onGuardarClase,
  onEliminarClase,
  onCrearTramo,
  onGenerarTramos,
  onClonarTramos,
  onEliminarTodosLosTramos,
  guardando = false
}) => {
  const [dialogoClaseVisible, setDialogoClaseVisible] = useState(false);
  const [dialogoGenerarVisible, setDialogoGenerarVisible] = useState(false);
  const [dialogoNuevoVisible, setDialogoNuevoVisible] = useState(false);
  const [dialogoClonarVisible, setDialogoClonarVisible] = useState(false);
  const [dialogoEliminarVisible, setDialogoEliminarVisible] = useState(false);
  const [celdaActiva, setCeldaActiva] = useState(null);

  // Obtención del objeto de la clase académica actualmente seleccionada.
  const cursoActual = cursos.find((c) => c.id_curso === cursoId);

  // Cálculo del siguiente número de orden sugerido para nuevo tramo.
  const siguienteNumero = sesiones.length > 0
    ? Math.max(...sesiones.map((s) => Number(s.numero) || 0)) + 1
    : 1;

  // Verificación de si existen otras clases en el centro para permitir clonación.
  const otrasClasesDisponibles = cursos.filter((c) => c.id_curso !== cursoId).length > 0;

  // Detección del id del módulo vinculado a la clase seleccionada
  const moduloVinculadoId = useMemo(() => {
    if (!cursoId) return null;
    if (moduloDefectoId) return moduloDefectoId;
    if (mapaCursosModulos && mapaCursosModulos.has(cursoId)) {
      return mapaCursosModulos.get(cursoId);
    }
    if (cursoActual?.id_modulo) {
      return cursoActual.id_modulo;
    }
    if (cursoActual?.nombre && modulos.length > 0) {
      const nombreNorm = cursoActual.nombre.toUpperCase();
      const porSiglas = modulos.find((m) => m.siglas && nombreNorm.includes(m.siglas.toUpperCase()));
      if (porSiglas) return porSiglas.id_modulo;
    }
    return null;
  }, [cursoId, moduloDefectoId, mapaCursosModulos, cursoActual, modulos]);

  // Lista de módulos filtrados por el ciclo formativo de la clase seleccionada
  const modulosFiltradosCiclo = useMemo(() => {
    if (modulosCiclo && modulosCiclo.length > 0) {
      return modulosCiclo;
    }
    if (moduloVinculadoId && modulos.length > 0) {
      const mod = modulos.find((m) => m.id_modulo === moduloVinculadoId);
      if (mod?.id_ciclo) {
        const filtrados = modulos.filter((m) => m.id_ciclo === mod.id_ciclo);
        if (filtrados.length > 0) return filtrados;
      }
    }
    return modulos;
  }, [modulosCiclo, moduloVinculadoId, modulos]);

  // Apertura del modal al pulsar en una celda para asignar o editar una clase lectiva.
  const manejarClickCelda = (sesion, dia) => {
    if (!cursoId) return;
    if (esSesionRecreo(sesion.descripcion)) return;

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

  // Manejador del guardado proveniente del diálogo con vinculación a la clase y grupo actual.
  const alConfirmarGuardado = (datos) => {
    onGuardarClase({
      ...datos,
      id_curso: cursoId,
      grupo: cursoActual?.nombre || datos.grupo || 'Clase'
    });
    setDialogoClaseVisible(false);
  };

  // Manejador del borrado de asignación lectiva proveniente del diálogo.
  const alConfirmarEliminado = (idHorario) => {
    onEliminarClase(idHorario);
    setDialogoClaseVisible(false);
  };

  return (
    <div className="flex flex-column gap-3 w-full">
      <Tooltip target="[data-pr-tooltip]" />

      {/* Barra de selección de clases del año escolar activo mediante botones */}
      <div className="surface-card p-3 border-round shadow-1 flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3">
        <div className="flex align-items-center gap-2 flex-wrap">
          <span className="text-sm text-900 font-semibold white-space-nowrap mr-1">
            Clases disponibles:
          </span>
          {cursos.length > 0 ? (
            cursos.map((c) => (
              <Button
                key={c.id_curso}
                label={c.nombre}
                size="small"
                severity={c.id_curso === cursoId ? 'primary' : 'secondary'}
                outlined={c.id_curso !== cursoId}
                onClick={() => onSeleccionarCurso && onSeleccionarCurso(c.id_curso)}
                className="py-1 px-3 text-sm font-semibold"
              />
            ))
          ) : (
            <span className="text-xs text-color-secondary italic">
              No hay clases registradas para este año académico.
            </span>
          )}
        </div>
      </div>

      {/* Estado si el usuario aún no ha seleccionado ninguna clase */}
      {!cursoId ? (
        <div className="surface-card p-4 border-round shadow-1">
          <EstadoVacio
            mensaje="Selecciona una clase"
            descripcion="Elige una clase en la fila superior para visualizar o configurar su horario semanal."
            icono="pi pi-users"
          />
        </div>
      ) : sesiones.length === 0 ? (
        /* Caso: La clase seleccionada aún no tiene tramos horarios */
        <div className="surface-card p-4 border-round shadow-1">
          <EstadoVacio
            mensaje={`No hay tramos horarios configurados para ${cursoActual?.nombre || 'esta clase'}`}
            descripcion="Para poder organizar el horario semanal de los alumnos de esta clase, primero debes configurar sus tramos horarios."
            icono="pi pi-calendar-times"
            accion={
              <div className="flex gap-2 flex-wrap justify-content-center mt-2">
                <Button
                  label="Configurar Tramos"
                  icon="pi pi-bolt"
                  severity="primary"
                  onClick={() => setDialogoGenerarVisible(true)}
                  loading={guardando}
                />
                <Button
                  label="Añadir Manualmente"
                  icon="pi pi-plus"
                  outlined
                  onClick={() => setDialogoNuevoVisible(true)}
                  disabled={guardando}
                />
                {otrasClasesDisponibles && (
                  <Button
                    label="Clonar de Otra Clase"
                    icon="pi pi-copy"
                    severity="secondary"
                    outlined
                    onClick={() => setDialogoClonarVisible(true)}
                    disabled={guardando}
                  />
                )}
              </div>
            }
          />
        </div>
      ) : (
        /* Caso: La clase seleccionada tiene tramos horarios configurados */
        <div className="surface-card p-3 border-round shadow-1 overflow-x-auto">
          {/* Cabecera / barra de acciones de la cuadrícula */}
          <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3 pb-3 border-bottom-1 surface-border">
            <div className="flex flex-column gap-1">
              <div className="flex align-items-center gap-2">
                <i className="pi pi-th-large text-primary text-xl" />
                <span className="font-bold text-lg text-900">
                  Horario Semanal &mdash; {cursoActual?.nombre || 'Clase'}
                </span>
              </div>
              <span className="text-xs text-color-secondary">
                Pulsa en cualquier casilla para asignar o editar la clase lectiva de este grupo.
              </span>
            </div>

            {/* Botones de gestión de tramos de la clase */}
            <div className="flex align-items-center gap-2 flex-wrap">
              <Button
                label="Añadir Manualmente"
                icon="pi pi-plus"
                size="small"
                outlined
                onClick={() => setDialogoNuevoVisible(true)}
                disabled={guardando}
              />
              <Button
                label="Configurar Tramos"
                icon="pi pi-bolt"
                size="small"
                outlined
                severity="primary"
                onClick={() => setDialogoGenerarVisible(true)}
                disabled={guardando}
              />
              {otrasClasesDisponibles && (
                <Button
                  label="Clonar Tramos"
                  icon="pi pi-copy"
                  size="small"
                  outlined
                  severity="secondary"
                  onClick={() => setDialogoClonarVisible(true)}
                  disabled={guardando}
                />
              )}
              <Button
                label="Eliminar todos los tramos"
                icon="pi pi-trash"
                size="small"
                severity="danger"
                outlined
                onClick={() => setDialogoEliminarVisible(true)}
                disabled={guardando}
              />
            </div>
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
                    className={esRecreo ? 'celda-recreo' : ''}
                  >
                    {/* Celda de cabecera de fila: Tramo horario */}
                    <td className={`p-2 border-1 surface-border align-middle ${esRecreo ? 'celda-recreo' : ''}`}>
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
                      if (esRecreo) {
                        return (
                          <td
                            key={dia.dia}
                            className="p-2 border-1 surface-border text-center celda-recreo"
                            style={{ minHeight: '68px', verticalAlign: 'middle' }}
                          >
                            <div className="flex align-items-center justify-content-center text-center w-full h-full py-2 select-none">
                              <span className="text-sm font-medium text-color-secondary">Recreo</span>
                            </div>
                          </td>
                        );
                      }

                      const clase = horarios.find(
                        (h) =>
                          h.id_curso === cursoId &&
                          h.id_sesion === sesion.id_sesion &&
                          Number(h.dia_semana) === Number(dia.dia)
                      );

                      const esMiClase = clase && Boolean(
                        (clase.profesor && clase.profesor.toLowerCase().includes('docente')) ||
                        (!clase.profesor && clase.id_modulo)
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
                          style={{ minHeight: '68px', verticalAlign: clase ? 'top' : 'middle' }}
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
                            <div className="flex align-items-center justify-content-center text-center w-full h-full text-500 opacity-60 hover:opacity-100 py-3">
                              <i className="pi pi-plus text-base" />
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
        modulosCiclo={modulosFiltradosCiclo}
        moduloDefectoId={moduloVinculadoId}
        grupo={cursoActual?.nombre || 'Clase'}
        guardando={guardando}
      />

      {/* Diálogo modal para calcular o regenerar tramos horarios */}
      <DialogoGenerarTramos
        visible={dialogoGenerarVisible}
        onHide={() => setDialogoGenerarVisible(false)}
        onConfirmar={(tramosCalculados) => {
          if (onGenerarTramos) {
            onGenerarTramos(tramosCalculados);
          }
          setDialogoGenerarVisible(false);
        }}
        tieneTramosPrevios={sesiones.length > 0}
        guardando={guardando}
      />

      {/* Diálogo modal para añadir manualmente un nuevo tramo */}
      <DialogoNuevoTramo
        visible={dialogoNuevoVisible}
        onHide={() => setDialogoNuevoVisible(false)}
        onGuardar={(datosNuevoTramo) => {
          if (onCrearTramo) {
            onCrearTramo(datosNuevoTramo);
          }
          setDialogoNuevoVisible(false);
        }}
        siguienteNumero={siguienteNumero}
        guardando={guardando}
      />

      {/* Diálogo modal para clonar tramos desde otra clase */}
      {otrasClasesDisponibles && (
        <DialogoClonarTramos
          visible={dialogoClonarVisible}
          onHide={() => setDialogoClonarVisible(false)}
          onConfirmarClonado={(claseOrigenId) => {
            if (onClonarTramos) {
              onClonarTramos(claseOrigenId);
            }
            setDialogoClonarVisible(false);
          }}
          cursos={cursos}
          cursoDestinoId={cursoId}
          tieneTramosActuales={sesiones.length > 0}
          guardando={guardando}
        />
      )}

      {/* Modal de confirmación para eliminar todos los tramos de la clase */}
      <Dialog
        visible={dialogoEliminarVisible}
        onHide={() => setDialogoEliminarVisible(false)}
        header="Eliminar todos los tramos"
        style={{ width: '90vw', maxWidth: '480px' }}
        modal
        footer={
          <div className="flex justify-content-end gap-2">
            <BotonAccion
              tipo="cancelar"
              label="Cancelar"
              onClick={() => setDialogoEliminarVisible(false)}
              disabled={guardando}
            />
            <BotonAccion
              tipo="eliminar"
              label="Eliminar Tramos"
              onClick={async () => {
                if (onEliminarTodosLosTramos) {
                  await onEliminarTodosLosTramos();
                }
                setDialogoEliminarVisible(false);
              }}
              loading={guardando}
            />
          </div>
        }
      >
        <div className="flex align-items-center gap-3 pt-2">
          <i className="pi pi-exclamation-triangle text-red-500 text-3xl flex-shrink-0" />
          <div className="flex flex-column gap-1">
            <span className="font-semibold text-900">
              ¿Deseas eliminar todos los tramos horarios de {cursoActual?.nombre || 'esta clase'}?
            </span>
            <span className="text-sm text-color-secondary">
              Esta acción eliminará todos los tramos horarios configurados y las clases asignadas a este horario. No se puede deshacer.
            </span>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export const CuadriculaHorarioClase = CuadriculaHorarioGrupo;
export const CuadriculaHorarioCurso = CuadriculaHorarioGrupo;
export default CuadriculaHorarioGrupo;

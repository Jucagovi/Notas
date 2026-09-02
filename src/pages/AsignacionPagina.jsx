import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { Tooltip } from 'primereact/tooltip';
import { Message } from 'primereact/message';
import { ProgressBar } from 'primereact/progressbar';
import useAsignacionRA from '../hooks/useAsignacionRA.js';
import useToast from '../hooks/useToast.js';
import { plantillaOpcionModulo, plantillaValorModulo } from '../utils/plantillasDropdown.jsx';

// Componente principal para la asignación de Resultados de Aprendizaje (RA) a periodos de evaluación
const AsignacionPagina = () => {
  const navigate = useNavigate();
  const { mostrarExito, mostrarError, mostrarInfo } = useToast();

  const {
    cursos,
    modulosDisponibles,
    evaluacionesAsignables,
    evaluacionSeleccionada,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    moduloSeleccionadoId,
    setModuloSeleccionadoId,
    evaluacionSeleccionadaId,
    seleccionarEvaluacion,
    listaRA,
    rasConEstado,
    idsRAAsignados,
    sumaPesosAsignados,
    mapaAsignacionesPorEvaluacion,
    cargando,
    guardandoLote,
    alternarRA,
    asignarTodosRA,
    desasignarTodosRA,
    recargar
  } = useAsignacionRA();

  // Estados locales para filtrado y diálogo de detalle
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas'); // 'todas' | 'asignados' | 'no_asignados'
  const [raDetalle, setRaDetalle] = useState(null);
  const [dialogoDetalleVisible, setDialogoDetalleVisible] = useState(false);

  // Opciones para el desplegable de Cursos
  const opcionesCursos = useMemo(() => {
    return (cursos || []).map((c) => ({
      label: `${c.nombre} (${c.anyo || 'Curso lectivo'})`,
      value: c.id_curso
    }));
  }, [cursos]);

  // Opciones para el desplegable de Módulos
  const opcionesModulos = useMemo(() => {
    return (modulosDisponibles || []).map((m) => ({
      label: `${m.siglas ? `[${m.siglas}] ` : ''}${m.nombre}`,
      value: m.id_modulo,
      siglas: m.siglas,
      nombre: m.nombre
    }));
  }, [modulosDisponibles]);

  // Opciones para el desplegable de Evaluaciones (Primera, Segunda, Tercera, Extraordinaria)
  const opcionesEvaluaciones = useMemo(() => {
    return (evaluacionesAsignables || []).map((ev) => {
      const nombreLimpio = String(ev.nombre || '').trim();
      const sufijo = nombreLimpio.toLowerCase().includes('evaluación') || nombreLimpio.toLowerCase().includes('evaluacion')
        ? ''
        : ' evaluación';
      const asignadosCount = (mapaAsignacionesPorEvaluacion.get(ev.id_evaluacion)?.size) || 0;

      return {
        label: `${nombreLimpio}${sufijo} (${asignadosCount} RA)`,
        value: ev.id_evaluacion,
        nombre: nombreLimpio,
        asignadosCount
      };
    });
  }, [evaluacionesAsignables, mapaAsignacionesPorEvaluacion]);

  // Filtrado de Resultados de Aprendizaje según texto y estado de vinculación
  const rasFiltrados = useMemo(() => {
    return (rasConEstado || []).filter((ra) => {
      const coincideTexto =
        !filtroTexto.trim() ||
        (ra.nombre && ra.nombre.toLowerCase().includes(filtroTexto.toLowerCase())) ||
        (ra.numero !== undefined && String(ra.numero).includes(filtroTexto)) ||
        (ra.descripcion && ra.descripcion.toLowerCase().includes(filtroTexto.toLowerCase())) ||
        (ra.codigo && ra.codigo.toLowerCase().includes(filtroTexto.toLowerCase()));

      if (!coincideTexto) return false;

      if (filtroEstado === 'asignados') return ra.asignado;
      if (filtroEstado === 'no_asignados') return !ra.asignado;

      return true;
    });
  }, [rasConEstado, filtroTexto, filtroEstado]);

  // Manejo de la conmutación de estado de un RA en la evaluación con prevención de doble asignación
  const manejarCambioEstadoRA = async (ra) => {
    if (!ra.asignado && ra.asignadoAOtraEvaluacion) {
      mostrarError(
        'Asignación no permitida',
        `El ${ra.codigo || 'RA'} ya está asignado a la ${ra.nombreEvaluacionAsignada || 'otra evaluación'}. Un Resultado de Aprendizaje sólo puede pertenecer a un periodo evaluativo.`
      );
      return;
    }

    const mensajeProceso = ra.asignado
      ? `Desvinculando "${ra.codigo || 'RA'}" de la evaluación...`
      : `Vinculando "${ra.codigo || 'RA'}" a la evaluación...`;

    mostrarInfo('Actualizando asignación', mensajeProceso);

    const resultado = await alternarRA(ra);
    if (resultado.exito) {
      mostrarExito('Operación exitosa', resultado.mensaje);
    } else if (resultado.error) {
      mostrarError('Error en la asignación', resultado.error);
    }
  };

  // Manejo de la asignación masiva de todos los RA disponibles
  const manejarAsignarTodos = async () => {
    mostrarInfo('Asignación masiva', 'Vinculando todos los RA a la evaluación...');
    const resultado = await asignarTodosRA();
    if (resultado.exito) {
      mostrarExito('Asignación masiva completada', resultado.mensaje);
    } else {
      mostrarError('Error', resultado.error || 'No se pudieron vincular todos los RA.');
    }
  };

  // Manejo de la desvinculación masiva de todos los RA
  const manejarDesasignarTodos = async () => {
    mostrarInfo('Desasignación masiva', 'Desvinculando todos los RA de la evaluación...');
    const resultado = await desasignarTodosRA();
    if (resultado.exito) {
      mostrarExito('Desasignación completada', resultado.mensaje);
    } else {
      mostrarError('Error', resultado.error || 'No se pudieron desvincular los RA.');
    }
  };

  // Renderizado del pie del modal de detalle de RA
  const footerDialogoDetalle = (
    <div className="flex justify-content-end">
      <Button
        label="Cerrar"
        icon="pi pi-times"
        severity="secondary"
        text
        onClick={() => setDialogoDetalleVisible(false)}
      />
    </div>
  );

  return (
    <div className="page-container p-2">
      {/* Cabecera principal de la página */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Asignación de RA a Evaluaciones</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Vincule los Resultados de Aprendizaje (RA) que se evaluarán en cada periodo evaluativo (Primera, Segunda, Tercera y Extraordinaria) para calcular las notas trimestrales normalizadas.
          </p>
        </div>
        <div className="flex align-items-center gap-2">
          <Button
            type="button"
            label="Pesos RA y CE"
            icon="pi pi-sliders-h"
            size="small"
            severity="secondary"
            outlined
            onClick={() => navigate('/pesos-ra')}
            tooltip="Configurar los pesos porcentuales de los RA y Criterios"
            tooltipOptions={{ position: 'top' }}
          />
          <Button
            type="button"
            label="Acta por trimestres"
            icon="pi pi-table"
            size="small"
            severity="primary"
            onClick={() => navigate('/informes/evaluacion-modulo')}
            tooltip="Ver el boletín y las notas trimestrales normalizadas"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      <Divider />

      {/* Sección de Selección y Filtros Principales */}
      <div className="surface-card p-4 border-round shadow-1 mb-4 flex flex-column gap-3">
        <div className="grid align-items-center">
          {/* Desplegable de Curso */}
          <div className="col-12 md:col-4">
            <label htmlFor="filtro-curso-ra" className="block text-sm font-semibold mb-1 text-muted">
              <i className="pi pi-calendar mr-1" /> Curso Académico:
            </label>
            <Dropdown
              id="filtro-curso-ra"
              value={cursoSeleccionadoId}
              options={opcionesCursos}
              onChange={(e) => {
                setCursoSeleccionadoId(e.value);
                if (evaluacionSeleccionada && evaluacionSeleccionada.id_curso !== e.value) {
                  seleccionarEvaluacion(null);
                }
              }}
              placeholder="Seleccione un curso..."
              showClear
              filter
              className="w-full text-sm"
            />
          </div>

          {/* Desplegable de Módulo */}
          <div className="col-12 md:col-4">
            <label htmlFor="filtro-modulo-ra" className="block text-sm font-semibold mb-1 text-muted">
              <i className="pi pi-book mr-1" /> Módulo Profesional:
            </label>
            <Dropdown
              id="filtro-modulo-ra"
              value={moduloSeleccionadoId}
              options={opcionesModulos}
              itemTemplate={plantillaOpcionModulo}
              valueTemplate={plantillaValorModulo}
              filterBy="label,siglas,nombre"
              onChange={(e) => {
                setModuloSeleccionadoId(e.value);
                if (evaluacionSeleccionada && evaluacionSeleccionada.id_modulo !== e.value) {
                  seleccionarEvaluacion(null);
                }
              }}
              placeholder="Seleccione un módulo..."
              showClear
              filter
              className="w-full text-sm"
            />
          </div>

          {/* Desplegable Principal de Selección de Evaluación */}
          <div className="col-12 md:col-4">
            <label htmlFor="select-evaluacion-ra" className="block text-sm font-semibold mb-1 text-primary">
              <i className="pi pi-check-square mr-1" /> Periodo de Evaluación (*):
            </label>
            <Dropdown
              id="select-evaluacion-ra"
              value={evaluacionSeleccionadaId}
              options={opcionesEvaluaciones}
              onChange={(e) => seleccionarEvaluacion(e.value)}
              placeholder={
                opcionesEvaluaciones.length === 0
                  ? 'No hay evaluaciones disponibles'
                  : 'Seleccione una Evaluación...'
              }
              showClear
              filter
              className="w-full font-semibold"
            />
          </div>
        </div>

        {/* Barra de pestañas rápidas de periodos evaluativos */}
        {evaluacionesAsignables.length > 0 && (
          <div className="flex flex-wrap align-items-center gap-2 pt-2 border-top-1 surface-border">
            <span className="text-xs font-bold text-muted mr-1">Periodo activo:</span>
            {evaluacionesAsignables.map((ev) => {
              const esActiva = String(ev.id_evaluacion).toLowerCase() === String(evaluacionSeleccionadaId).toLowerCase();
              const asignados = mapaAsignacionesPorEvaluacion.get(ev.id_evaluacion)?.size || 0;
              const nombreLimpio = String(ev.nombre || '').trim();

              return (
                <Button
                  key={ev.id_evaluacion}
                  type="button"
                  label={`${nombreLimpio} (${asignados} RA)`}
                  size="small"
                  icon={esActiva ? 'pi pi-check-circle' : 'pi pi-calendar'}
                  severity={esActiva ? 'primary' : 'secondary'}
                  outlined={!esActiva}
                  className="text-xs py-1 px-3"
                  onClick={() => seleccionarEvaluacion(ev.id_evaluacion)}
                />
              );
            })}
          </div>
        )}

        {/* Resumen de estado de la evaluación seleccionada */}
        {evaluacionSeleccionada && (
          <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3 pt-3 border-top-1 surface-border">
            <div className="flex flex-wrap align-items-center gap-2">
              <Tag
                severity="info"
                icon="pi pi-bookmark"
                value={`${evaluacionSeleccionada.nombre} Evaluación`}
                className="font-bold text-sm px-2 py-1"
              />
              <Tag
                severity="secondary"
                icon="pi pi-book"
                value={evaluacionSeleccionada.Modulos?.nombre || 'Módulo'}
                className="text-sm px-2 py-1"
              />
              <Tag
                severity="success"
                icon="pi pi-check-circle"
                value={`${idsRAAsignados.size} de ${listaRA.length} RA Asignados`}
                className="font-bold text-sm px-2 py-1"
              />
              <Tag
                severity={sumaPesosAsignados > 0 ? 'warning' : 'danger'}
                icon="pi pi-percentage"
                value={`Peso conjunto: ${sumaPesosAsignados}% (Normalizado al 100%)`}
                className="font-bold text-sm px-2 py-1"
              />
            </div>

            <div className="flex align-items-center gap-2 justify-content-end">
              <Button
                type="button"
                label="Asignar todos"
                icon="pi pi-check"
                size="small"
                severity="success"
                text
                disabled={cargando || guardandoLote || listaRA.length === 0}
                loading={guardandoLote}
                onClick={manejarAsignarTodos}
              />
              <Button
                type="button"
                label="Deseleccionar todos"
                icon="pi pi-times"
                size="small"
                severity="danger"
                text
                disabled={cargando || guardandoLote || idsRAAsignados.size === 0}
                loading={guardandoLote}
                onClick={manejarDesasignarTodos}
              />
              <Button
                type="button"
                icon="pi pi-refresh"
                size="small"
                severity="secondary"
                text
                loading={cargando}
                onClick={recargar}
                tooltip="Recargar listado"
                tooltipOptions={{ position: 'top' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Nota informativa sobre el cálculo de la evaluación final y extraordinaria */}
      <div className="mb-4">
        <Message
          severity="info"
          text="Nota: La Evaluación Final Ordinaria calcula automáticamente la nota global con todos los RA del módulo. La Evaluación Extraordinaria permite asignar los RA a recuperar y se procesa de forma independiente."
          className="w-full"
        />
      </div>

      {/* Contenido Principal: Listado de Resultados de Aprendizaje */}
      {cargando ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          <span className="text-muted text-sm mt-3">Cargando Resultados de Aprendizaje y asignaciones...</span>
        </div>
      ) : !moduloSeleccionadoId ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <i className="pi pi-book text-6xl text-primary-300 mb-3" />
          <h3 className="text-xl font-bold m-0 mb-2">Seleccione un Módulo Profesional</h3>
          <p className="text-muted text-sm m-0 max-w-28rem mb-4">
            Utilice los desplegables superiores para elegir el curso y módulo. Se listarán los Resultados de Aprendizaje para que pueda asignarlos a cada evaluación.
          </p>
        </div>
      ) : !evaluacionSeleccionadaId ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <i className="pi pi-calendar-plus text-6xl text-primary-300 mb-3" />
          <h3 className="text-xl font-bold m-0 mb-2">Seleccione un Periodo de Evaluación</h3>
          <p className="text-muted text-sm m-0 max-w-28rem mb-4">
            Elija la evaluación correspondiente (Primera, Segunda, Tercera o Extraordinaria) para configurar sus Resultados de Aprendizaje asociados.
          </p>
        </div>
      ) : (
        <Card className="shadow-1">
          {/* Barra de herramientas para filtrar los RA de la tabla */}
          <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3 mb-3">
            <div className="p-input-icon-left w-full sm:w-20rem">
              <i className="pi pi-search" />
              <InputText
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar por código, número o texto..."
                className="w-full p-inputtext-sm"
              />
            </div>

            <div className="flex align-items-center gap-1">
              <span className="text-xs font-semibold text-muted mr-1">Mostrar:</span>
              <Button
                label={`Todos (${listaRA.length})`}
                size="small"
                text={filtroEstado !== 'todas'}
                severity={filtroEstado === 'todas' ? 'primary' : 'secondary'}
                className="p-1 px-2 text-xs"
                onClick={() => setFiltroEstado('todas')}
              />
              <Button
                label={`Asignados (${idsRAAsignados.size})`}
                size="small"
                text={filtroEstado !== 'asignados'}
                severity={filtroEstado === 'asignados' ? 'success' : 'secondary'}
                className="p-1 px-2 text-xs"
                onClick={() => setFiltroEstado('asignados')}
              />
              <Button
                label={`No asignados (${listaRA.length - idsRAAsignados.size})`}
                size="small"
                text={filtroEstado !== 'no_asignados'}
                severity={filtroEstado === 'no_asignados' ? 'warning' : 'secondary'}
                className="p-1 px-2 text-xs"
                onClick={() => setFiltroEstado('no_asignados')}
              />
            </div>
          </div>

          <Tooltip target=".ra-tooltip" position="top" />

          {/* Tabla de Resultados de Aprendizaje */}
          <DataTable
            value={rasFiltrados}
            dataKey="id_ra"
            emptyMessage={
              listaRA.length === 0
                ? 'No hay Resultados de Aprendizaje registrados para este módulo.'
                : 'No se encontraron RA con los filtros actuales.'
            }
            className="p-datatable-sm"
            responsiveLayout="scroll"
            stripedRows
          >
            {/* Columna de Asignación con InputSwitch */}
            <Column
              field="asignado"
              header="Incluir"
              style={{ width: '90px', textAlign: 'center' }}
              body={(rowData) => {
                let textoTooltip = 'Asignar a esta evaluación';
                if (rowData.asignado) {
                  textoTooltip = 'Quitar de esta evaluación';
                } else if (rowData.asignadoAOtraEvaluacion) {
                  textoTooltip = `Ya asignado a la ${rowData.nombreEvaluacionAsignada || 'otra evaluación'}`;
                }

                return (
                  <div className="flex align-items-center justify-content-center">
                    <InputSwitch
                      checked={Boolean(rowData.asignado)}
                      disabled={guardandoLote || rowData.asignadoAOtraEvaluacion}
                      onChange={() => manejarCambioEstadoRA(rowData)}
                      tooltip={textoTooltip}
                      tooltipOptions={{ position: 'top' }}
                    />
                  </div>
                );
              }}
            />

            {/* Columna de Código RA sin destacar */}
            <Column
              field="codigo"
              header="Código"
              style={{ width: '90px', textAlign: 'center' }}
              body={(rowData) => (
                <span className="font-semibold text-sm text-color">
                  {rowData.codigo || (rowData.numero !== undefined ? `RA ${rowData.numero}` : 'RA')}
                </span>
              )}
            />

            {/* Columna de Descripción del Resultado de Aprendizaje */}
            <Column
              field="descripcion"
              header="Resultado de Aprendizaje"
              body={(rowData) => (
                <span className="text-sm text-color py-1 block">
                  {rowData.descripcion || rowData.nombre || 'Sin descripción'}
                </span>
              )}
            />

            {/* Columna de Criterios (CE) en texto plano */}
            <Column
              field="totalCE"
              header="CE"
              style={{ width: '80px', textAlign: 'center' }}
              body={(rowData) => (
                <span className="font-semibold text-sm text-color">
                  {rowData.totalCE || (rowData.criterios || []).length}
                </span>
              )}
            />

            {/* Columna de Peso Ponderado en el Curso */}
            <Column
              field="peso"
              header="Peso Curso"
              style={{ width: '120px', textAlign: 'center' }}
              body={(rowData) => (
                <div className="flex flex-column align-items-center gap-1">
                  <span className="font-bold text-sm text-color">
                    {rowData.peso !== undefined ? `${rowData.peso}%` : '-'}
                  </span>
                  <ProgressBar
                    value={rowData.peso || 0}
                    showValue={false}
                    style={{ height: '5px', width: '60px' }}
                  />
                </div>
              )}
            />

            {/* Columna de Estado con indicador de evaluación asignada */}
            <Column
              field="asignado"
              header="Estado"
              style={{ minWidth: '180px', textAlign: 'center', whiteSpace: 'nowrap' }}
              body={(rowData) => {
                if (rowData.asignado) {
                  const nombreEv = evaluacionSeleccionada?.nombre
                    ? `${evaluacionSeleccionada.nombre} evaluación`
                    : 'Esta evaluación';
                  return (
                    <Tag
                      severity="success"
                      icon="pi pi-check"
                      value={`Asignado (${nombreEv})`}
                      className="text-xs font-semibold"
                    />
                  );
                }

                if (rowData.asignadoAOtraEvaluacion) {
                  return (
                    <Tag
                      severity="warning"
                      icon="pi pi-lock"
                      value={`Asignado (${rowData.nombreEvaluacionAsignada || 'Otra evaluación'})`}
                      className="text-xs font-semibold"
                      tooltip={`Este RA ya está asignado a la ${rowData.nombreEvaluacionAsignada || 'otra evaluación'} y no puede asignarse a varias`}
                      tooltipOptions={{ position: 'top' }}
                    />
                  );
                }

                return (
                  <Tag
                    severity="secondary"
                    icon="pi pi-minus"
                    value="No asignado"
                    className="text-xs font-semibold"
                  />
                );
              }}
            />

            {/* Columna de Acciones / Detalle */}
            <Column
              header="Detalle"
              style={{ width: '80px', textAlign: 'center' }}
              body={(rowData) => (
                <Button
                  type="button"
                  icon="pi pi-eye"
                  size="small"
                  severity="secondary"
                  text
                  onClick={() => {
                    setRaDetalle(rowData);
                    setDialogoDetalleVisible(true);
                  }}
                  tooltip="Ver criterios y competencias asociadas"
                  tooltipOptions={{ position: 'top' }}
                />
              )}
            />
          </DataTable>
        </Card>
      )}

      {/* Modal para ver detalles completos del Resultado de Aprendizaje */}
      <Dialog
        visible={dialogoDetalleVisible}
        onHide={() => {
          setDialogoDetalleVisible(false);
          setRaDetalle(null);
        }}
        header={
          raDetalle
            ? (raDetalle.codigo || (raDetalle.numero !== undefined ? `RA ${raDetalle.numero}` : 'RA'))
            : 'Detalles del Resultado de Aprendizaje'
        }
        footer={footerDialogoDetalle}
        style={{ width: '90vw', maxWidth: '650px' }}
        modal
      >
        {raDetalle && (
          <div className="flex flex-column gap-3 pt-1">
            <div className="flex flex-wrap gap-2 align-items-center">
              <Tag value={`Peso en Curso: ${raDetalle.peso || 0}%`} severity="info" />
              <Tag value={`${(raDetalle.criterios || []).length} Criterios de Evaluación`} severity="secondary" />
              <Tag
                severity={
                  idsRAAsignados.has(String(raDetalle.id_ra).toLowerCase())
                    ? 'success'
                    : raDetalle.asignadoAOtraEvaluacion
                    ? 'warning'
                    : 'secondary'
                }
                value={
                  idsRAAsignados.has(String(raDetalle.id_ra).toLowerCase())
                    ? `Asignado a ${evaluacionSeleccionada?.nombre ? `${evaluacionSeleccionada.nombre} evaluación` : 'esta evaluación'}`
                    : raDetalle.asignadoAOtraEvaluacion
                    ? `Asignado a ${raDetalle.nombreEvaluacionAsignada || 'otra evaluación'}`
                    : 'No asignado'
                }
              />
            </div>

            {raDetalle.descripcion && (
              <div>
                <span className="text-xs text-muted block font-semibold mb-1">Descripción:</span>
                <p className="text-sm text-color m-0 surface-ground p-3 border-round surface-border border-1">
                  {raDetalle.descripcion}
                </p>
              </div>
            )}

            {raDetalle.criterios && raDetalle.criterios.length > 0 && (
              <div>
                <span className="text-xs text-muted block font-semibold mb-2">Criterios de Evaluación (CE) vinculados:</span>
                <div className="flex flex-column gap-2 max-h-18rem overflow-y-auto pr-1">
                  {raDetalle.criterios.map((ce) => (
                    <div
                      key={ce.id_ce}
                      className="p-3 surface-ground border-round border-1 surface-border flex flex-column gap-1"
                    >
                      <span className="text-sm font-semibold text-color">
                        {ce.nombre || ce.descripcion}
                      </span>
                      {ce.descripcion && ce.descripcion !== ce.nombre && !ce.nombre?.includes(ce.descripcion) && (
                        <span className="text-xs text-muted">
                          {ce.descripcion}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default AsignacionPagina;

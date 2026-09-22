import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import SelectorCurso from '../common/SelectorCurso.jsx';
import { supabase } from '../../services/supabaseClient.js';
import { extraerAnioInicioCurso, formatearFechaEspanol } from '../../utils/fechas.js';

/**
 * DialogoCopiarFestivos - Modal para copiar los días festivos de un curso de origen al curso actual.
 *
 * Responsabilidad Única: Permitir al usuario seleccionar un curso de origen disponible, previsualizar
 * la cantidad de festivos que contiene y trasladarlos al curso activo con adaptación opcional de años y límites.
 */
export const DialogoCopiarFestivos = ({
  visible = false,
  onOcultar,
  onConfirmar,
  cursos = [],
  cursoActual = null,
  cargando = false
}) => {
  const [cursoOrigenId, setCursoOrigenId] = useState(null);
  const [festivosOrigen, setFestivosOrigen] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [reemplazar, setReemplazar] = useState(true);
  const [ajustarAnio, setAjustarAnio] = useState(true);
  const [copiarLimites, setCopiarLimites] = useState(false);

  // Se filtran los cursos disponibles para excluir el curso actual en el que se está trabajando.
  const cursosDisponibles = useMemo(() => {
    if (!cursoActual) return cursos;
    return cursos.filter((c) => c.id_curso !== cursoActual.id_curso);
  }, [cursos, cursoActual]);

  // Se busca el objeto del curso de origen seleccionado.
  const cursoOrigenObj = useMemo(() => {
    return cursos.find((c) => c.id_curso === cursoOrigenId) || null;
  }, [cursos, cursoOrigenId]);

  // Se calculan los años de inicio de ambos cursos para determinar si difieren.
  const anioOrigen = useMemo(() => {
    return cursoOrigenObj ? extraerAnioInicioCurso(cursoOrigenObj) : null;
  }, [cursoOrigenObj]);

  const anioDestino = useMemo(() => {
    return cursoActual ? extraerAnioInicioCurso(cursoActual) : null;
  }, [cursoActual]);

  const aniosDifieren = Boolean(anioOrigen && anioDestino && anioOrigen !== anioDestino);

  // Al abrir el modal o cambiar la visibilidad, se resetea la selección inicial.
  useEffect(() => {
    if (visible) {
      setCursoOrigenId(null);
      setFestivosOrigen([]);
      setReemplazar(true);
      setAjustarAnio(true);
      setCopiarLimites(false);
    }
  }, [visible]);

  // Al seleccionar un curso de origen, se consultan sus festivos registrados en la base de datos.
  useEffect(() => {
    if (!cursoOrigenId) {
      setFestivosOrigen([]);
      return;
    }

    let cancelado = false;
    const cargarFestivosCurso = async () => {
      setCargandoDetalle(true);
      try {
        const { data, error } = await supabase
          .from('Festivos')
          .select('id_festivo, fecha, descripcion')
          .eq('id_curso', cursoOrigenId)
          .order('fecha', { ascending: true });

        if (!cancelado) {
          if (error) throw error;
          setFestivosOrigen(data || []);
        }
      } catch (err) {
        if (!cancelado) {
          console.error('Error al consultar festivos del curso origen:', err);
          setFestivosOrigen([]);
        }
      } finally {
        if (!cancelado) setCargandoDetalle(false);
      }
    };

    cargarFestivosCurso();
    return () => {
      cancelado = true;
    };
  }, [cursoOrigenId]);

  // Manejador del botón de confirmación de copia.
  const manejarCopiar = () => {
    if (!cursoOrigenId || festivosOrigen.length === 0) return;
    onConfirmar(cursoOrigenId, {
      reemplazar,
      ajustarAnio,
      copiarLimites,
      cursoOrigenObj
    });
  };

  // Pie de acción del diálogo modal.
  const pieDialogo = (
    <div className="flex justify-content-end gap-2 pt-2">
      <Button
        type="button"
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={onOcultar}
        disabled={cargando}
      />
      <Button
        type="button"
        label="Copiar Festivos"
        icon="pi pi-copy"
        severity="primary"
        onClick={manejarCopiar}
        loading={cargando}
        disabled={!cursoOrigenId || festivosOrigen.length === 0 || cargandoDetalle || cargando}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onOcultar}
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-copy text-primary text-xl" />
          <span className="font-bold text-lg text-900">Copiar Festivos de Otro Curso</span>
        </div>
      }
      footer={pieDialogo}
      style={{ width: '95vw', maxWidth: '560px' }}
      modal
      className="p-fluid"
      closable={!cargando}
    >
      <div className="flex flex-column gap-4 py-2">
        {/* Descripción introductoria */}
        <p className="text-sm text-600 m-0">
          Seleccione el curso académico de origen cuyos días festivos desea copiar al curso actual{' '}
          <strong className="text-900">
            ({cursoActual?.nombre || 'Curso actual'}{cursoActual?.anyo ? ` — ${cursoActual.anyo}` : ''})
          </strong>.
        </p>

        {/* Desplegable reutilizable para elegir el curso de origen */}
        <div className="flex flex-column gap-1">
          <label htmlFor="selector-curso-origen" className="font-semibold text-sm text-900">
            Curso Académico de Origen <span className="text-red-500">*</span>
          </label>
          {cursosDisponibles.length === 0 ? (
            <Message
              severity="info"
              text="No existen otros cursos académicos registrados en el sistema para poder copiar sus festivos."
              className="w-full"
            />
          ) : (
            <SelectorCurso
              id="selector-curso-origen"
              value={cursoOrigenId}
              options={cursosDisponibles}
              onChange={(e) => setCursoOrigenId(e.value)}
              disabled={cargando || cargandoDetalle}
              placeholder="Seleccione el curso de origen..."
            />
          )}
        </div>

        {/* Resumen del curso de origen seleccionado */}
        {cursoOrigenId && (
          <div className="surface-50 border-round-lg border-1 surface-border p-3 flex flex-column gap-3">
            {cargandoDetalle ? (
              <div className="flex align-items-center gap-2 text-500 text-sm py-2">
                <i className="pi pi-spin pi-spinner text-primary" />
                <span>Consultando festivos registrados en el curso seleccionado...</span>
              </div>
            ) : festivosOrigen.length === 0 ? (
              <Message
                severity="warn"
                text="El curso seleccionado no tiene ningún día festivo registrado en su calendario escolar."
                className="w-full"
              />
            ) : (
              <>
                <div className="flex align-items-center justify-content-between flex-wrap gap-2">
                  <span className="font-bold text-sm text-900">Festivos a copiar:</span>
                  <Tag
                    severity="success"
                    value={`${festivosOrigen.length} ${festivosOrigen.length === 1 ? 'festivo' : 'festivos'}`}
                    icon="pi pi-check"
                  />
                </div>

                {/* Resumen de fechas de inicio y fin si existen en el origen */}
                {(cursoOrigenObj?.fecha_inicio || cursoOrigenObj?.fecha_fin) && (
                  <div className="text-xs text-600 flex align-items-center gap-1">
                    <i className="pi pi-calendar text-xs" />
                    <span>
                      Periodo lectivo origen:{' '}
                      {cursoOrigenObj.fecha_inicio ? formatearFechaEspanol(cursoOrigenObj.fecha_inicio) : '—'} a{' '}
                      {cursoOrigenObj.fecha_fin ? formatearFechaEspanol(cursoOrigenObj.fecha_fin) : '—'}
                    </span>
                  </div>
                )}

                {/* Opciones de configuración de la copia */}
                <div className="flex flex-column gap-2 pt-2 border-top-1 surface-border">
                  {/* Reemplazar vs Añadir */}
                  <div className="flex align-items-center gap-2">
                    <Checkbox
                      inputId="check-reemplazar-festivos"
                      checked={reemplazar}
                      onChange={(e) => setReemplazar(e.checked)}
                    />
                    <label htmlFor="check-reemplazar-festivos" className="text-sm text-800 cursor-pointer">
                      Reemplazar los festivos actuales del curso (si no se marca, se añadirán)
                    </label>
                  </div>

                  {/* Ajustar años cuando los cursos pertenecen a años lectivos distintos */}
                  {aniosDifieren && (
                    <div className="flex flex-column gap-1">
                      <div className="flex align-items-center gap-2">
                        <Checkbox
                          inputId="check-ajustar-anio"
                          checked={ajustarAnio}
                          onChange={(e) => setAjustarAnio(e.checked)}
                        />
                        <label htmlFor="check-ajustar-anio" className="text-sm font-semibold text-800 cursor-pointer">
                          Ajustar fechas al año lectivo actual ({anioDestino})
                        </label>
                      </div>
                      <span className="text-xs text-500 pl-4">
                        Se adaptarán los festivos de {anioOrigen}/{anioOrigen + 1} para ubicarlos en los mismos meses y días de {anioDestino}/{anioDestino + 1}.
                      </span>
                    </div>
                  )}

                  {/* Copiar también fechas oficiales de inicio y fin */}
                  {(cursoOrigenObj?.fecha_inicio || cursoOrigenObj?.fecha_fin) && (
                    <div className="flex align-items-center gap-2">
                      <Checkbox
                        inputId="check-copiar-limites"
                        checked={copiarLimites}
                        onChange={(e) => setCopiarLimites(e.checked)}
                      />
                      <label htmlFor="check-copiar-limites" className="text-sm text-800 cursor-pointer">
                        Copiar también las fechas oficiales de inicio y fin de clases
                      </label>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default DialogoCopiarFestivos;

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import BotonAccion from '../common/BotonAccion.jsx';
import { formatearNumeroUT } from '../../utils/formatoUT.js';

/**
 * DialogoUnidadTrabajo - Diálogo modal para la creación y edición de Unidades de Trabajo.
 *
 * Responsabilidad Única: Gestionar el formulario de alta y modificación de una unidad didáctica,
 * incluyendo la asociación explícita de Resultados de Aprendizaje (RA) y sus porcentajes de dedicación,
 * validar los campos requeridos y emitir los datos limpios al componente contenedor.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del modal.
 * @param {Object|null} props.unidad - Objeto de la unidad a editar o null para nueva creación.
 * @param {number} props.siguienteNumero - Número correlativo sugerido para nuevas unidades.
 * @param {Array<Object>} [props.listaRAs=[]] - Lista completa de Resultados de Aprendizaje del módulo.
 * @param {Array<Object>} [props.relacionesDesarrollan=[]] - Relaciones existentes en la tabla desarrollan.
 * @param {Array<Object>} [props.unidadesExistentes=[]] - Lista de unidades de trabajo existentes.
 * @param {boolean} props.guardando - Indicador de guardado en curso.
 * @param {Function} props.onGuardar - Callback invocado al someter datos válidos.
 * @param {Function} props.onOcultar - Callback para cerrar el diálogo.
 */
const DialogoUnidadTrabajo = ({
  visible,
  unidad = null,
  siguienteNumero = 1,
  listaRAs = [],
  relacionesDesarrollan = [],
  unidadesExistentes = [],
  guardando = false,
  onGuardar,
  onOcultar
}) => {
  const [numero, setNumero] = useState(1);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [rasSeleccionados, setRasSeleccionados] = useState({});
  const [errores, setErrores] = useState({});

  // Cálculo de los porcentajes asignados en otras UTs para informar al docente
  const obtenerInfoOtrasUTs = (id_ra) => {
    const vinculacionesOtras = (relacionesDesarrollan || []).filter(
      (d) => d.id_ra === id_ra && (!unidad || d.id_ut !== unidad.id_ut)
    );
    const totalAsignadoOtras = vinculacionesOtras.reduce(
      (acc, cur) => acc + (Number(cur.porcentaje) || 100),
      0
    );
    return {
      totalAsignadoOtras,
      restante: Math.max(0, 100 - totalAsignadoOtras),
      numOtrasUTs: vinculacionesOtras.length
    };
  };

  // Se inicializan los campos del formulario según sea modo edición o creación.
  useEffect(() => {
    if (visible) {
      if (unidad) {
        setNumero(unidad.numero || 1);
        setNombre(unidad.nombre || '');
        setDescripcion(unidad.descripcion || '');

        const estadoRAs = {};
        (listaRAs || []).forEach((ra) => {
          const vinc = (unidad.ras || []).find((r) => r.id_ra === ra.id_ra);
          if (vinc) {
            estadoRAs[ra.id_ra] = {
              seleccionado: true,
              porcentaje: vinc.porcentaje !== null && vinc.porcentaje !== undefined ? Number(vinc.porcentaje) : 100
            };
          } else {
            estadoRAs[ra.id_ra] = {
              seleccionado: false,
              porcentaje: 100
            };
          }
        });
        setRasSeleccionados(estadoRAs);
      } else {
        setNumero(siguienteNumero);
        setNombre('');
        setDescripcion('');

        const estadoRAs = {};
        (listaRAs || []).forEach((ra) => {
          estadoRAs[ra.id_ra] = {
            seleccionado: false,
            porcentaje: 100
          };
        });
        setRasSeleccionados(estadoRAs);
      }
      setErrores({});
    }
  }, [visible, unidad, siguienteNumero, listaRAs]);

  // Validación local del formulario antes de procesar el guardado.
  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!numero || numero < 1) {
      nuevosErrores.numero = 'El número de unidad debe ser igual o superior a 1.';
    }
    if (!nombre || !nombre.trim()) {
      nuevosErrores.nombre = 'El nombre de la unidad de trabajo es obligatorio.';
    } else if (nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe contener al menos 3 caracteres.';
    }

    let errorRAs = null;
    Object.entries(rasSeleccionados).forEach(([_, conf]) => {
      if (conf.seleccionado) {
        const val = Number(conf.porcentaje);
        if (isNaN(val) || val <= 0 || val > 100) {
          errorRAs = 'Todos los porcentajes de los RAs seleccionados deben situarse entre 1% y 100%.';
        }
      }
    });

    if (errorRAs) {
      nuevosErrores.ras = errorRAs;
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejador del envío del formulario.
  const manejarGuardar = (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const rasParaGuardar = Object.entries(rasSeleccionados)
      .filter(([_, conf]) => conf.seleccionado)
      .map(([id_ra, conf]) => ({
        id_ra,
        porcentaje: Number(conf.porcentaje) || 100
      }));

    if (typeof onGuardar === 'function') {
      onGuardar({
        numero,
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        ras: rasParaGuardar
      });
    }
  };

  // Pie del diálogo con botones de acción estándar y separación adecuada.
  const pieDialogo = (
    <div className="flex justify-content-end gap-2">
      <BotonAccion
        tipo="cancelar"
        onClick={onOcultar}
        disabled={guardando}
      />
      <BotonAccion
        tipo="guardar"
        label={unidad ? 'Guardar Cambios' : 'Crear Unidad'}
        icon={unidad ? 'pi pi-check' : 'pi pi-plus'}
        onClick={manejarGuardar}
        loading={guardando}
      />
    </div>
  );

  const esEdicion = Boolean(unidad);
  const etiquetaUT = formatearNumeroUT(numero);

  return (
    <Dialog
      visible={visible}
      style={{ width: '92vw', maxWidth: '640px' }}
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-folder text-primary text-xl" />
          <span className="font-bold text-lg">
            {esEdicion
              ? `Editar Unidad de Trabajo (${formatearNumeroUT(unidad?.numero)})`
              : 'Nueva Unidad de Trabajo'}
          </span>
        </div>
      }
      modal
      footer={pieDialogo}
      onHide={onOcultar}
      className="p-fluid"
    >
      <form onSubmit={manejarGuardar} className="flex flex-column gap-3 pt-2">
        {/* Campo Número de UT sin botones + y - */}
        <div className="field m-0">
          <label htmlFor="numero_ut" className="font-semibold text-sm text-900 block mb-1">
            Número de Unidad <span className="text-red-500">*</span>
          </label>
          <InputNumber
            id="numero_ut"
            value={numero}
            onValueChange={(e) => setNumero(e.value || 1)}
            min={1}
            max={99}
            className={errores.numero ? 'p-invalid' : ''}
            disabled={guardando}
          />
          {errores.numero && (
            <small className="p-error block mt-1">{errores.numero}</small>
          )}
        </div>

        {/* Campo Nombre de la UT */}
        <div className="field m-0">
          <label htmlFor="nombre_ut" className="font-semibold text-sm text-900 block mb-1">
            Nombre de la Unidad <span className="text-red-500">*</span>
          </label>
          <InputText
            id="nombre_ut"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder={`Ej: ${etiquetaUT}. Introducción al entorno de desarrollo`}
            className={errores.nombre ? 'p-invalid' : ''}
            disabled={guardando}
            autoFocus
          />
          {errores.nombre && (
            <small className="p-error block mt-1">{errores.nombre}</small>
          )}
        </div>

        {/* Campo Descripción opcional */}
        <div className="field m-0">
          <label htmlFor="descripcion_ut" className="font-semibold text-sm text-900 block mb-1">
            Descripción Curricular
          </label>
          <InputTextarea
            id="descripcion_ut"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={2}
            placeholder="Detalles sobre contenidos, objetivos o bloques temáticos..."
            disabled={guardando}
            autoResize
          />
        </div>

        {/* Sección de Resultados de Aprendizaje (RA) desarrollados en esta UT */}
        <div className="field m-0 pt-2 border-top-1 surface-border">
          <div className="flex align-items-center justify-content-between mb-1">
            <label className="font-semibold text-sm text-900 block m-0">
              Resultados de Aprendizaje y Ponderación
            </label>
            <span className="text-xs text-color-secondary">
              Ponderación explícita
            </span>
          </div>

          <p className="text-xs text-500 m-0 mb-2">
            Selecciona qué RAs se abordan en esta unidad didáctica e indica el porcentaje de cobertura que asume (del 1% al 100%).
          </p>

          {errores.ras && (
            <small className="p-error block mb-2">{errores.ras}</small>
          )}

          {listaRAs.length === 0 ? (
            <div className="surface-50 border-round p-3 text-center text-xs text-color-secondary border-1 surface-border">
              No se han encontrado Resultados de Aprendizaje registrados para este módulo profesional.
            </div>
          ) : (
            <div className="flex flex-column gap-2 max-h-15rem overflow-y-auto pr-1">
              {listaRAs.map((ra) => {
                const conf = rasSeleccionados[ra.id_ra] || { seleccionado: false, porcentaje: 100 };
                const infoOtras = obtenerInfoOtrasUTs(ra.id_ra);

                return (
                  <div
                    key={ra.id_ra}
                    className={`p-2 border-round-lg border-1 transition-colors transition-duration-150 flex align-items-center justify-content-between gap-2 ${
                      conf.seleccionado
                        ? 'surface-card border-primary shadow-1'
                        : 'surface-50 surface-border hover:surface-100'
                    }`}
                  >
                    <div className="flex align-items-center gap-2 overflow-hidden flex-1">
                      <Checkbox
                        inputId={`ra_${ra.id_ra}`}
                        checked={conf.seleccionado}
                        onChange={(e) => {
                          const estaMarcado = Boolean(e.checked);
                          setRasSeleccionados((prev) => ({
                            ...prev,
                            [ra.id_ra]: {
                              seleccionado: estaMarcado,
                              porcentaje:
                                estaMarcado && (!prev[ra.id_ra]?.porcentaje || prev[ra.id_ra]?.porcentaje === 100)
                                  ? infoOtras.restante > 0
                                    ? infoOtras.restante
                                    : 100
                                  : prev[ra.id_ra]?.porcentaje || 100
                            }
                          }));
                        }}
                        disabled={guardando}
                      />
                      <label
                        htmlFor={`ra_${ra.id_ra}`}
                        className="cursor-pointer text-xs font-semibold text-800 m-0 overflow-hidden flex flex-column min-w-0 flex-1"
                      >
                        <div className="flex align-items-center gap-1 overflow-hidden">
                          <span className="font-bold text-primary font-mono flex-shrink-0">
                            RA{ra.numero}:
                          </span>
                          <span className="linea-truncada" title={ra.nombre}>
                            {ra.nombre}
                          </span>
                        </div>
                        {infoOtras.numOtrasUTs > 0 && (
                          <span className="text-400 font-normal text-xs">
                            Otras UTs: {infoOtras.totalAsignadoOtras}% asignado (Restante: {infoOtras.restante}%)
                          </span>
                        )}
                      </label>
                    </div>

                    {conf.seleccionado && (
                      <div className="flex align-items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-color-secondary font-semibold">Cubre:</span>
                        <InputNumber
                          value={conf.porcentaje}
                          onValueChange={(e) => {
                            const val = e.value !== null && e.value !== undefined ? e.value : 1;
                            setRasSeleccionados((prev) => ({
                              ...prev,
                              [ra.id_ra]: {
                                ...prev[ra.id_ra],
                                porcentaje: Math.min(100, Math.max(1, val))
                              }
                            }));
                          }}
                          min={1}
                          max={100}
                          suffix=" %"
                          disabled={guardando}
                          className="p-inputtext-sm text-xs"
                          inputStyle={{ width: '4.8rem', textAlign: 'right', padding: '0.35rem 0.5rem' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </form>
    </Dialog>
  );
};

export default DialogoUnidadTrabajo;

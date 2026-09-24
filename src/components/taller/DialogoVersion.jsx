import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Editor } from 'primereact/editor';
import BotonAccion from '../common/BotonAccion.jsx';
import './taller.css';

/**
 * DialogoVersion - Diálogo modal ancho para la redacción y maquetación de una versión de práctica.
 *
 * Responsabilidad Única: Capturar el código de versión (sugiriendo el año académico de la clase)
 * y el enunciado maquetado con editor enriquecido (Quill), mostrando los metadatos contextuales
 * (clase, módulo, unidad de trabajo y evaluación) exclusivamente como datos de solo lectura en texto informativo.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del diálogo modal.
 * @param {Function} props.onHide - Manejador para cerrar el diálogo modal.
 * @param {Object|null} props.version - Versión en edición o null para nueva versión.
 * @param {Object} props.practica - Práctica activa a la que se vinculará la versión.
 * @param {Object|null} [props.claseActiva=null] - Objeto de la clase activa seleccionada.
 * @param {Object|null} [props.moduloActivo=null] - Módulo formativo asociado a la clase activa.
 * @param {string} [props.anioAcademicoNombre=''] - Nombre completo del año académico (ej. 2026/2027).
 * @param {Array<Object>} [props.unidadesTrabajo=[]] - Listado de UTs para resolver texto informativo.
 * @param {Array<Object>} [props.evaluaciones=[]] - Listado de evaluaciones para resolver texto informativo.
 * @param {Function} props.onGuardar - Callback para persistir los cambios introducidos.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const DialogoVersion = ({
  visible,
  onHide,
  version = null,
  practica = null,
  claseActiva = null,
  moduloActivo = null,
  anioAcademicoNombre = '',
  unidadesTrabajo = [],
  evaluaciones = [],
  onGuardar,
  guardando = false
}) => {
  // Cálculo del valor recomendado para el número/código de versión basado en el año escolar
  const codigoRecomendado = useMemo(() => {
    if (anioAcademicoNombre) return anioAcademicoNombre;
    if (claseActiva?.cursoAnyo) {
      const anyo = String(claseActiva.cursoAnyo);
      const match = anyo.match(/\b(20\d{2})\b/);
      if (match) {
        const a = parseInt(match[1], 10);
        return `${a}/${a + 1}`;
      }
      return anyo;
    }
    return '2026/2027';
  }, [anioAcademicoNombre, claseActiva]);

  const [numero, setNumero] = useState(codigoRecomendado);
  const [enunciado, setEnunciado] = useState('');
  const [errorNumero, setErrorNumero] = useState(false);

  // Sincronización de los campos al abrir el diálogo o cambiar la versión objetivo.
  useEffect(() => {
    if (version) {
      setNumero(version.numero || codigoRecomendado);
      setEnunciado(version.enunciado || '');
    } else {
      // Para una nueva versión se recomienda siempre el año académico de la clase
      setNumero(codigoRecomendado);
      setEnunciado(
        practica && practica.descripcion
          ? `<p>${practica.descripcion}</p><p><strong>Objetivos de la práctica:</strong></p><ul><li>Requerimiento 1</li><li>Requerimiento 2</li></ul>`
          : '<p>Redacta aquí las instrucciones y requerimientos de la práctica...</p>'
      );
    }
    setErrorNumero(false);
  }, [version, practica, codigoRecomendado, visible]);

  // Resolución de los textos informativos de solo lectura para UT y Evaluación
  const textoUT = useMemo(() => {
    if (version?.Unidades_Trabajo) {
      const ut = version.Unidades_Trabajo;
      return `UT ${ut.numero}: ${ut.nombre}`;
    }
    if (version?.id_ut && unidadesTrabajo.length > 0) {
      const encontrada = unidadesTrabajo.find((u) => u.id_ut === version.id_ut);
      if (encontrada) return `UT ${encontrada.numero}: ${encontrada.nombre}`;
    }
    return 'Sin asignar';
  }, [version, unidadesTrabajo]);

  const textoEvaluacion = useMemo(() => {
    if (version?.Evaluaciones) {
      return version.Evaluaciones.nombre;
    }
    if (version?.id_evaluacion && evaluaciones.length > 0) {
      const encontrada = evaluaciones.find((e) => e.id_evaluacion === version.id_evaluacion);
      if (encontrada) return encontrada.nombre;
    }
    return 'Sin asignar';
  }, [version, evaluaciones]);

  // Manejador del guardado con validación de obligatoriedad del código de versión
  const manejarGuardar = async () => {
    if (!numero || !String(numero).trim()) {
      setErrorNumero(true);
      return;
    }
    setErrorNumero(false);

    const idCursoEfectivo = claseActiva?.id_curso || version?.id_curso || null;

    const payload = {
      id_practica: practica ? practica.id_practica : null,
      id_curso: idCursoEfectivo,
      id_ut: version?.id_ut || null,
      id_evaluacion: version?.id_evaluacion || null,
      numero: String(numero).trim(),
      enunciado: enunciado || '',
      peso_evaluacion: version?.peso_evaluacion || 0
    };

    const exito = await onGuardar(payload);
    if (exito) {
      onHide();
    }
  };

  const pieDialogo = (
    <div className="flex justify-content-end gap-2 pt-2">
      <BotonAccion
        tipo="cancelar"
        label="Cancelar"
        onClick={onHide}
        disabled={guardando}
      />
      <BotonAccion
        tipo="guardar"
        label={version ? 'Actualizar Versión' : 'Crear Versión'}
        onClick={manejarGuardar}
        loading={guardando}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-file-edit text-primary text-xl" />
          <span className="font-bold">
            {version ? `Editar Versión: ${version.numero || ''}` : 'Nueva Versión de Práctica'}
          </span>
          {practica && (
            <span className="text-sm font-normal text-500 ml-2">
              ({practica.nombre})
            </span>
          )}
        </div>
      }
      footer={pieDialogo}
      style={{ width: '75vw', minWidth: '320px', maxWidth: '1100px' }}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-3 pt-2">
        {/* Panel de datos contextuales de solo lectura (sin dropdowns y sin Tag) */}
        <div className="surface-50 border-1 surface-border border-round-lg p-3">
          <div className="grid text-sm">
            {/* Clase asociada */}
            <div className="col-12 sm:col-6 lg:col-3 flex flex-column gap-1">
              <span className="text-xs text-500 font-semibold uppercase tracking-wider">
                Clase
              </span>
              <div className="flex align-items-center gap-2 text-900 font-medium">
                <i className="pi pi-graduation-cap text-primary" />
                <span>
                  {claseActiva?.cursoNombre || 'Clase seleccionada'}
                  {codigoRecomendado ? ` (${codigoRecomendado})` : ''}
                </span>
              </div>
            </div>

            {/* Módulo Formativo asociado */}
            <div className="col-12 sm:col-6 lg:col-3 flex flex-column gap-1">
              <span className="text-xs text-500 font-semibold uppercase tracking-wider">
                Módulo Formativo
              </span>
              <div className="flex align-items-center gap-2 text-900 font-medium">
                <i className="pi pi-book text-primary" />
                <span>
                  {moduloActivo?.siglas ? `${moduloActivo.siglas} — ` : ''}
                  {moduloActivo?.nombre || 'Módulo de la clase'}
                </span>
              </div>
            </div>

            {/* Unidad de Trabajo informativa */}
            <div className="col-12 sm:col-6 lg:col-3 flex flex-column gap-1">
              <span className="text-xs text-500 font-semibold uppercase tracking-wider">
                Unidad de Trabajo
              </span>
              <div className="flex align-items-center gap-2 text-800">
                <i className="pi pi-bookmark text-teal-600" />
                <span>{textoUT}</span>
              </div>
            </div>

            {/* Período de Evaluación informativo */}
            <div className="col-12 sm:col-6 lg:col-3 flex flex-column gap-1">
              <span className="text-xs text-500 font-semibold uppercase tracking-wider">
                Evaluación
              </span>
              <div className="flex align-items-center gap-2 text-800">
                <i className="pi pi-calendar text-orange-600" />
                <span>{textoEvaluacion}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Campo de Código de Versión con recomendación del año lectivo */}
        <div className="flex flex-column gap-1">
          <label htmlFor="numero-version" className="font-semibold text-sm text-800 flex align-items-center justify-content-between">
            <span>
              Número / Código de Versión <span className="text-red-500">*</span>
            </span>
            <span className="text-xs text-500 font-normal">
              Sugerencia automática: año académico de la clase ({codigoRecomendado})
            </span>
          </label>
          <InputText
            id="numero-version"
            value={numero}
            onChange={(e) => {
              setNumero(e.target.value);
              if (errorNumero && e.target.value.trim()) {
                setErrorNumero(false);
              }
            }}
            placeholder={`Ej: ${codigoRecomendado}`}
            className={errorNumero ? 'p-invalid' : ''}
          />
          {errorNumero && (
            <small className="p-error">El número o código de versión es obligatorio.</small>
          )}
        </div>

        {/* Editor de texto enriquecido (Rich Text Editor basado en Quill) */}
        <div className="flex flex-column gap-1 mt-1 editor-enunciado-contenedor">
          <label className="font-semibold text-sm text-800 flex align-items-center justify-content-between">
            <span>Enunciado y Requerimientos de la Actividad (Editor Enriquecido)</span>
            <span className="text-xs text-color-secondary font-normal">
              Permite negritas, listas, enlaces, encabezados y formato de código
            </span>
          </label>
          <Editor
            value={enunciado}
            onTextChange={(e) => setEnunciado(e.htmlValue || '')}
            style={{ height: '320px' }}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DialogoVersion;

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Editor } from 'primereact/editor';
import BotonAccion from '../common/BotonAccion.jsx';
import SelectorCurso from '../common/SelectorCurso.jsx';
import SelectorEvaluacion from '../common/SelectorEvaluacion.jsx';
import './taller.css';

/**
 * DialogoVersion - Diálogo modal ancho para la edición y maquetación de una versión de práctica.
 *
 * Responsabilidad Única: Gestionar los metadatos de la versión (código, curso escolar, unidad de trabajo,
 * período de evaluación y peso porcentual) y proporcionar un editor de texto enriquecido (Rich Text Editor
 * basado en Quill) para redactar el cuerpo y las instrucciones de la práctica.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del diálogo modal.
 * @param {Function} props.onHide - Manejador para cerrar el diálogo modal.
 * @param {Object|null} props.version - Versión en edición o null para nueva versión.
 * @param {Object} props.practica - Práctica activa a la que se vinculará la versión.
 * @param {Array<Object>} props.cursos - Cursos académicos disponibles en el sistema.
 * @param {Array<Object>} props.unidadesTrabajo - Unidades de Trabajo del módulo activo.
 * @param {Array<Object>} props.evaluaciones - Períodos de evaluación disponibles.
 * @param {Function} props.onGuardar - Callback para persistir los cambios introducidos.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en curso.
 */
export const DialogoVersion = ({
  visible,
  onHide,
  version = null,
  practica = null,
  cursos = [],
  unidadesTrabajo = [],
  evaluaciones = [],
  onGuardar,
  guardando = false
}) => {
  const [numero, setNumero] = useState('v1.0');
  const [idCurso, setIdCurso] = useState(null);
  const [idUt, setIdUt] = useState(null);
  const [idEvaluacion, setIdEvaluacion] = useState(null);
  const [pesoEvaluacion, setPesoEvaluacion] = useState(0);
  const [enunciado, setEnunciado] = useState('');

  const [errorNumero, setErrorNumero] = useState(false);
  const [errorCurso, setErrorCurso] = useState(false);

  // Sincronización de los campos al abrir el diálogo o cambiar la versión objetivo.
  useEffect(() => {
    if (version) {
      setNumero(version.numero || 'v1.0');
      setIdCurso(version.id_curso || null);
      setIdUt(version.id_ut || null);
      setIdEvaluacion(version.id_evaluacion || null);
      setPesoEvaluacion(version.peso_evaluacion || 0);
      setEnunciado(version.enunciado || '');
    } else {
      // Valor por defecto para una nueva versión
      setNumero('v1.0');
      setIdCurso(cursos.length > 0 ? cursos[0].id_curso : null);
      setIdUt(unidadesTrabajo.length > 0 ? unidadesTrabajo[0].id_ut : null);
      setIdEvaluacion(null);
      setPesoEvaluacion(10);
      setEnunciado(
        practica && practica.descripcion
          ? `<p>${practica.descripcion}</p><p><strong>Objetivos de la práctica:</strong></p><ul><li>Requerimiento 1</li><li>Requerimiento 2</li></ul>`
          : '<p>Redacta aquí las instrucciones y requerimientos de la práctica...</p>'
      );
    }
    setErrorNumero(false);
    setErrorCurso(false);
  }, [version, practica, cursos, unidadesTrabajo, visible]);

  // Manejador del guardado con validación de campos obligatorios.
  const manejarGuardar = async () => {
    let tieneErrores = false;

    if (!numero || !String(numero).trim()) {
      setErrorNumero(true);
      tieneErrores = true;
    } else {
      setErrorNumero(false);
    }

    if (!idCurso) {
      setErrorCurso(true);
      tieneErrores = true;
    } else {
      setErrorCurso(false);
    }

    if (tieneErrores) return;

    const payload = {
      id_practica: practica ? practica.id_practica : null,
      id_curso: idCurso,
      id_ut: idUt || null,
      id_evaluacion: idEvaluacion || null,
      numero: String(numero).trim(),
      enunciado: enunciado || '',
      peso_evaluacion: pesoEvaluacion !== null ? pesoEvaluacion : 0
    };

    const exito = await onGuardar(payload);
    if (exito) {
      onHide();
    }
  };

  // Opciones de unidades de trabajo formateadas con número correlativo y nombre.
  const opcionesUT = [
    { label: 'Sin asignar a ninguna UT', value: null },
    ...unidadesTrabajo.map((ut) => ({
      label: `UT ${ut.numero}: ${ut.nombre}`,
      value: ut.id_ut
    }))
  ];

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
        {/* Fila de metadatos 1: Código de versión y Curso escolar */}
        <div className="grid">
          <div className="col-12 md:col-6 flex flex-column gap-1">
            <label htmlFor="numero-version" className="font-semibold text-sm text-800">
              Número / Código de Versión <span className="text-red-500">*</span>
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
              placeholder="Ej: v1.0, 2024/2025-v1"
              className={errorNumero ? 'p-invalid' : ''}
            />
            {errorNumero && (
              <small className="p-error">El número de versión es obligatorio.</small>
            )}
          </div>

          <div className="col-12 md:col-6 flex flex-column gap-1">
            <label htmlFor="curso-version" className="font-semibold text-sm text-800">
              Curso Académico <span className="text-red-500">*</span>
            </label>
            <SelectorCurso
              id="curso-version"
              value={idCurso}
              options={cursos}
              onChange={(e) => {
                setIdCurso(e.value);
                if (errorCurso && e.value) {
                  setErrorCurso(false);
                }
              }}
              placeholder="Seleccione el curso..."
              className={errorCurso ? 'p-invalid w-full' : 'w-full'}
            />
            {errorCurso && (
              <small className="p-error">Debe vincular la versión a un curso académico.</small>
            )}
          </div>
        </div>

        {/* Fila de metadatos 2: Unidad de Trabajo, Evaluación y Peso */}
        <div className="grid">
          <div className="col-12 md:col-5 flex flex-column gap-1">
            <label htmlFor="ut-version" className="font-semibold text-sm text-800">
              Unidad de Trabajo Curricular
            </label>
            <Dropdown
              id="ut-version"
              value={idUt}
              options={opcionesUT}
              onChange={(e) => setIdUt(e.value)}
              placeholder="Seleccione la UT asociada..."
              showClear
              filter
            />
          </div>

          <div className="col-12 md:col-4 flex flex-column gap-1">
            <label htmlFor="evaluacion-version" className="font-semibold text-sm text-800">
              Período de Evaluación
            </label>
            <SelectorEvaluacion
              id="evaluacion-version"
              value={idEvaluacion}
              options={evaluaciones}
              onChange={(e) => setIdEvaluacion(e.value)}
              placeholder="Evaluación opcional..."
              showClear
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-3 flex flex-column gap-1">
            <label htmlFor="peso-version" className="font-semibold text-sm text-800">
              Peso en Evaluación (%)
            </label>
            <InputNumber
              id="peso-version"
              value={pesoEvaluacion}
              onValueChange={(e) => setPesoEvaluacion(e.value)}
              min={0}
              max={100}
              suffix=" %"
              placeholder="0"
            />
          </div>
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
            style={{ height: '300px' }}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DialogoVersion;

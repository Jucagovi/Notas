import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import BotonAccion from '../common/BotonAccion.jsx';

/**
 * DialogoUnidadTrabajo - Diálogo modal para la creación y edición de Unidades de Trabajo.
 *
 * Responsabilidad Única: Gestionar el formulario de alta y modificación de una unidad didáctica,
 * validar los campos requeridos y emitir los datos limpios al componente contenedor.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del modal.
 * @param {Object|null} props.unidad - Objeto de la unidad a editar o null para nueva creación.
 * @param {number} props.siguienteNumero - Número correlativo sugerido para nuevas unidades.
 * @param {boolean} props.guardando - Indicador de guardado en curso.
 * @param {Function} props.onGuardar - Callback invocado al someter datos válidos.
 * @param {Function} props.onOcultar - Callback para cerrar el diálogo.
 */
const DialogoUnidadTrabajo = ({
  visible,
  unidad = null,
  siguienteNumero = 1,
  guardando = false,
  onGuardar,
  onOcultar
}) => {
  const [numero, setNumero] = useState(1);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [errores, setErrores] = useState({});

  // Se inicializan los campos del formulario según sea modo edición o creación.
  useEffect(() => {
    if (visible) {
      if (unidad) {
        setNumero(unidad.numero || 1);
        setNombre(unidad.nombre || '');
        setDescripcion(unidad.descripcion || '');
      } else {
        setNumero(siguienteNumero);
        setNombre('');
        setDescripcion('');
      }
      setErrores({});
    }
  }, [visible, unidad, siguienteNumero]);

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
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Manejador del envío del formulario.
  const manejarGuardar = (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    if (typeof onGuardar === 'function') {
      onGuardar({
        numero,
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null
      });
    }
  };

  // Pie del diálogo con botones de acción estándar.
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

  return (
    <Dialog
      visible={visible}
      style={{ width: '90vw', maxWidth: '520px' }}
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-folder text-primary text-xl" />
          <span className="font-bold text-lg">
            {esEdicion ? 'Editar Unidad de Trabajo' : 'Nueva Unidad de Trabajo'}
          </span>
        </div>
      }
      modal
      footer={pieDialogo}
      onHide={onOcultar}
      className="p-fluid"
    >
      <form onSubmit={manejarGuardar} className="flex flex-column gap-3 pt-2">
        {/* Campo Número de UT */}
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
            showButtons
            buttonLayout="horizontal"
            decrementButtonClassName="p-button-secondary"
            incrementButtonClassName="p-button-secondary"
            incrementButtonIcon="pi pi-plus"
            decrementButtonIcon="pi pi-minus"
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
            placeholder="Ej: UT 1. Introducción al entorno de desarrollo"
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
            rows={3}
            placeholder="Detalles sobre contenidos, objetivos o bloques temáticos..."
            disabled={guardando}
            autoResize
          />
        </div>
      </form>
    </Dialog>
  );
};

export default DialogoUnidadTrabajo;

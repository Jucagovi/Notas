import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import BotonAccion from '../common/BotonAccion.jsx';

// Formulario modal para registrar un nuevo Curso Académico en la tabla Cursos.
const DialogoNuevoCurso = ({ visible, onOcultar, onGuardarNuevoCurso, cargando = false }) => {
  const [nombre, setNombre] = useState('');
  const [anyo, setAnyo] = useState('2024/2025');
  const [centro, setCentro] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [errorValidacion, setErrorValidacion] = useState('');

  // Limpieza del formulario al cerrar o cancelar.
  const limpiarFormulario = () => {
    setNombre('');
    setAnyo('2024/2025');
    setCentro('');
    setDescripcion('');
    setFechaInicio('');
    setFechaFin('');
    setErrorValidacion('');
  };

  const manejarOcultar = () => {
    limpiarFormulario();
    onOcultar();
  };

  const manejarGuardar = async () => {
    if (!nombre.trim() || !anyo.trim() || !centro.trim()) {
      setErrorValidacion('Por favor, completa los campos obligatorios (Nombre, Año y Centro).');
      return;
    }

    setErrorValidacion('');
    const datosCurso = {
      nombre: nombre.trim(),
      anyo: anyo.trim(),
      centro: centro.trim(),
      descripcion: descripcion.trim() || null,
      fecha_inicio: fechaInicio || null,
      fecha_fin: fechaFin || null
    };

    const exito = await onGuardarNuevoCurso(datosCurso);
    if (exito) {
      limpiarFormulario();
      onOcultar();
    }
  };

  const pieDialogo = (
    <div className="flex justify-content-end gap-2">
      <BotonAccion
        tipo="cancelar"
        label="Cancelar"
        onClick={manejarOcultar}
        disabled={cargando}
      />
      <BotonAccion
        tipo="guardar"
        label="Guardar Curso"
        onClick={manejarGuardar}
        loading={cargando}
      />
    </div>
  );

  return (
    <Dialog
      header="Crear Nuevo Curso Académico"
      visible={visible}
      style={{ width: '35rem' }}
      onHide={manejarOcultar}
      footer={pieDialogo}
      modal
      className="p-fluid"
    >
      {errorValidacion && (
        <div className="p-message p-message-error mb-3 py-2 px-3 text-sm">
          {errorValidacion}
        </div>
      )}

      <div className="field mb-3">
        <label htmlFor="nombreCurso" className="font-semibold text-sm">
          Nombre del Curso <span className="text-red-500">*</span>
        </label>
        <InputText
          id="nombreCurso"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: 2º Desarrollo de Aplicaciones Web"
          autoFocus
        />
      </div>

      <div className="formgrid grid mb-3">
        <div className="field col-12 md:col-6 mb-0">
          <label htmlFor="anyoCurso" className="font-semibold text-sm">
            Año Lectivo <span className="text-red-500">*</span>
          </label>
          <InputText
            id="anyoCurso"
            value={anyo}
            onChange={(e) => setAnyo(e.target.value)}
            placeholder="Ej: 2024/2025"
          />
        </div>

        <div className="field col-12 md:col-6 mb-0">
          <label htmlFor="centroCurso" className="font-semibold text-sm">
            Centro Educativo <span className="text-red-500">*</span>
          </label>
          <InputText
            id="centroCurso"
            value={centro}
            onChange={(e) => setCentro(e.target.value)}
            placeholder="Ej: IES Tecnológico"
          />
        </div>
      </div>

      <div className="formgrid grid mb-3">
        <div className="field col-12 md:col-6 mb-0">
          <label htmlFor="fechaInicioCurso" className="font-semibold text-sm">
            Fecha Inicio (Opcional)
          </label>
          <InputText
            id="fechaInicioCurso"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </div>

        <div className="field col-12 md:col-6 mb-0">
          <label htmlFor="fechaFinCurso" className="font-semibold text-sm">
            Fecha Fin (Opcional)
          </label>
          <InputText
            id="fechaFinCurso"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
      </div>

      <div className="field mb-1">
        <label htmlFor="descripcionCurso" className="font-semibold text-sm">
          Descripción o Notas
        </label>
        <InputTextarea
          id="descripcionCurso"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          autoResize
          placeholder="Anotaciones curriculares o detalles del grupo..."
        />
      </div>
    </Dialog>
  );
};

export default DialogoNuevoCurso;

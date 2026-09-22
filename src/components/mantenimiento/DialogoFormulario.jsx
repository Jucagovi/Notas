import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import BotonAccion from '../common/BotonAccion.jsx';

// Componente presentacional del modal de formulario para creación y edición de registros.
const DialogoFormulario = ({
  visible,
  registro,
  campos = [],
  opcionesReferencia = {},
  cargando = false,
  onGuardar,
  onOcultar,
  etiquetaSingular = 'Registro'
}) => {
  const [valores, setValores] = useState({});
  const [errores, setErrores] = useState({});

  // Inicializa el formulario al abrir el diálogo con los datos del registro o valores predeterminados.
  useEffect(() => {
    if (visible) {
      setErrores({});
      if (registro) {
        const valoresIniciales = { ...registro };
        // Conversión de cadenas de fecha a objetos Date para el componente Calendar
        campos.forEach((campo) => {
          if (campo.tipo === 'fecha' && valoresIniciales[campo.campo]) {
            valoresIniciales[campo.campo] = new Date(valoresIniciales[campo.campo]);
          }
        });
        setValores(valoresIniciales);
      } else {
        const valoresDefecto = {};
        campos.forEach((campo) => {
          if (campo.tipo === 'booleano') {
            valoresDefecto[campo.campo] = campo.predeterminado ?? true;
          } else {
            valoresDefecto[campo.campo] = null;
          }
        });
        setValores(valoresDefecto);
      }
    }
  }, [visible, registro, campos]);

  const manejarCambio = (campo, valor) => {
    setValores((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: null }));
    }
  };

  // Valida campos requeridos antes de emitir los datos para su almacenamiento.
  const manejarEnvio = () => {
    const nuevosErrores = {};
    campos.forEach((campo) => {
      if (campo.requerido) {
        const val = valores[campo.campo];
        if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
          nuevosErrores[campo.campo] = `El campo ${campo.etiqueta} es obligatorio.`;
        }
      }
    });

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // Normalización de fechas a formato YYYY-MM-DD para Supabase
    const datosNormalizados = { ...valores };
    campos.forEach((campo) => {
      if (campo.tipo === 'fecha' && datosNormalizados[campo.campo] instanceof Date) {
        const d = datosNormalizados[campo.campo];
        const anyo = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        datosNormalizados[campo.campo] = `${anyo}-${mes}-${dia}`;
      }
    });

    onGuardar(datosNormalizados);
  };

  // Renderiza el componente de entrada específico según la definición del campo.
  const renderizarEntrada = (campo) => {
    const valor = valores[campo.campo];
    const tieneError = Boolean(errores[campo.campo]);

    switch (campo.tipo) {
      case 'area_texto':
        return (
          <InputTextarea
            id={campo.campo}
            value={valor || ''}
            onChange={(e) => manejarCambio(campo.campo, e.target.value)}
            rows={3}
            placeholder={campo.marcador}
            className={`w-full ${tieneError ? 'p-invalid' : ''}`}
          />
        );

      case 'numero':
        return (
          <InputNumber
            id={campo.campo}
            value={valor !== null && valor !== undefined ? Number(valor) : null}
            onValueChange={(e) => manejarCambio(campo.campo, e.value)}
            min={campo.min}
            max={campo.max}
            className={`w-full ${tieneError ? 'p-invalid' : ''}`}
          />
        );

      case 'fecha':
        return (
          <Calendar
            id={campo.campo}
            value={valor}
            onChange={(e) => manejarCambio(campo.campo, e.value)}
            dateFormat="yy-mm-dd"
            showIcon
            locale="es"
            firstDayOfWeek={1}
            placeholder="Seleccionar fecha"
            className={`w-full ${tieneError ? 'p-invalid' : ''}`}
          />
        );

      case 'booleano':
        return (
          <div className="flex align-items-center gap-2 pt-1">
            <InputSwitch
              id={campo.campo}
              checked={Boolean(valor)}
              onChange={(e) => manejarCambio(campo.campo, e.value)}
            />
            <span className="text-sm font-medium">{valor ? 'Activo' : 'Inactivo'}</span>
          </div>
        );

      case 'desplegable': {
        const opciones = opcionesReferencia[campo.tablaReferencia] || [];
        return (
          <Dropdown
            id={campo.campo}
            value={valor}
            options={opciones}
            onChange={(e) => manejarCambio(campo.campo, e.value)}
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar elemento..."
            filter
            className={`w-full ${tieneError ? 'p-invalid' : ''}`}
          />
        );
      }

      case 'opciones_fijas':
        return (
          <Dropdown
            id={campo.campo}
            value={valor}
            options={campo.opciones || []}
            onChange={(e) => manejarCambio(campo.campo, e.value)}
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccionar opción..."
            className={`w-full ${tieneError ? 'p-invalid' : ''}`}
          />
        );

      case 'texto':
      default:
        return (
          <InputText
            id={campo.campo}
            value={valor || ''}
            onChange={(e) => manejarCambio(campo.campo, e.target.value)}
            placeholder={campo.marcador}
            className={`w-full ${tieneError ? 'p-invalid' : ''}`}
          />
        );
    }
  };

  const pieDialogo = (
    <div className="flex justify-content-end gap-2">
      <BotonAccion
        tipo="cancelar"
        label="Cancelar"
        onClick={onOcultar}
        disabled={cargando}
      />
      <BotonAccion
        tipo="guardar"
        label={registro ? 'Actualizar' : 'Guardar'}
        onClick={manejarEnvio}
        loading={cargando}
      />
    </div>
  );

  const titulo = registro ? `Editar ${etiquetaSingular}` : `Nuevo ${etiquetaSingular}`;

  return (
    <Dialog
      visible={visible}
      style={{ width: '90vw', maxWidth: '550px' }}
      header={titulo}
      modal
      className="p-fluid"
      footer={pieDialogo}
      onHide={onOcultar}
    >
      <div className="flex flex-column gap-3 pt-2">
        {campos.map((campo) => (
          <div key={campo.campo} className="field mb-0">
            <label htmlFor={campo.campo} className="font-semibold block mb-1">
              {campo.etiqueta}
              {campo.requerido && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderizarEntrada(campo)}
            {errores[campo.campo] && (
              <small className="p-error block mt-1">{errores[campo.campo]}</small>
            )}
          </div>
        ))}
      </div>
    </Dialog>
  );
};

export default DialogoFormulario;

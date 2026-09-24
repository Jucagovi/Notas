import React, { useState, useEffect, useMemo } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import BotonAccion from '../common/BotonAccion.jsx';

// Opciones estándar para la tipología de prácticas
const OPCIONES_TIPO_PRACTICA = [
  { label: 'Individual', value: 'Individual' },
  { label: 'Grupal', value: 'Grupal' },
  { label: 'Examen', value: 'Examen' },
  { label: 'Proyecto', value: 'Proyecto' }
];

/**
 * DialogoPractica - Diálogo modal para la creación y edición de prácticas base en el catálogo.
 *
 * Responsabilidad Única: Capturar y validar los campos requeridos (nombre, tipo de práctica y descripción)
 * asociando automáticamente el módulo formativo conocido a partir de la clase activa seleccionada.
 *
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del modal.
 * @param {Function} props.onHide - Manejador para cerrar el diálogo.
 * @param {Object|null} props.practica - Práctica en modo edición o null para nueva alta.
 * @param {string|null} props.idModuloPorDefecto - Identificador del módulo asociado a la clase activa.
 * @param {Object|null} props.moduloActual - Objeto completo del módulo formativo activo.
 * @param {Array<Object>} [props.modulos=[]] - Lista de módulos disponibles de respaldo.
 * @param {Function} props.onGuardar - Callback para persistir los datos introducidos.
 * @param {boolean} [props.guardando=false] - Indicador de estado de persistencia en proceso.
 */
export const DialogoPractica = ({
  visible,
  onHide,
  practica = null,
  idModuloPorDefecto = null,
  moduloActual = null,
  modulos = [],
  onGuardar,
  guardando = false
}) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idTipoPractica, setIdTipoPractica] = useState('Individual');
  const [idModulo, setIdModulo] = useState(null);
  const [errorNombre, setErrorNombre] = useState(false);

  // Sincronización de los campos del formulario al abrir el diálogo o cambiar la práctica a editar.
  useEffect(() => {
    if (practica) {
      setNombre(practica.nombre || '');
      setDescripcion(practica.descripcion || '');
      setIdTipoPractica(practica.id_tipopractica || 'Individual');
      setIdModulo(practica.id_modulo || idModuloPorDefecto || null);
    } else {
      setNombre('');
      setDescripcion('');
      setIdTipoPractica('Individual');
      setIdModulo(idModuloPorDefecto || null);
    }
    setErrorNombre(false);
  }, [practica, idModuloPorDefecto, visible]);

  // Resolución del objeto del módulo para visualización informativa
  const moduloMostrado = useMemo(() => {
    if (moduloActual) return moduloActual;
    const moduloIdEfectivo = idModulo || idModuloPorDefecto;
    if (moduloIdEfectivo && modulos && modulos.length > 0) {
      return modulos.find((m) => m.id_modulo === moduloIdEfectivo) || null;
    }
    return null;
  }, [moduloActual, idModulo, idModuloPorDefecto, modulos]);

  // Manejador del envío del formulario con validación de obligatoriedad.
  const manejarGuardar = async () => {
    if (!nombre.trim()) {
      setErrorNombre(true);
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      id_tipopractica: idTipoPractica,
      id_modulo: idModulo || idModuloPorDefecto || moduloMostrado?.id_modulo
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
        label={practica ? 'Guardar Cambios' : 'Crear Práctica'}
        onClick={manejarGuardar}
        loading={guardando}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={practica ? 'Editar Práctica Base' : 'Nueva Práctica'}
      footer={pieDialogo}
      style={{ width: '90vw', maxWidth: '560px' }}
      modal
      className="p-fluid"
    >
      <div className="flex flex-column gap-3 pt-2">
        {/* Campo Nombre de la práctica */}
        <div className="flex flex-column gap-1">
          <label htmlFor="nombre-practica" className="font-semibold text-sm text-800">
            Título / Nombre de la Práctica <span className="text-red-500">*</span>
          </label>
          <InputText
            id="nombre-practica"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (errorNombre && e.target.value.trim()) {
                setErrorNombre(false);
              }
            }}
            placeholder="Ej: Práctica 1 - Estructura semántica en HTML"
            className={errorNombre ? 'p-invalid' : ''}
            autoFocus
          />
          {errorNombre && (
            <small className="p-error">El nombre de la práctica es un campo requerido.</small>
          )}
        </div>

        {/* Módulo Formativo: ya conocido puesto que cada clase está asociada a un módulo */}
        <div className="flex flex-column gap-1">
          <label className="font-semibold text-sm text-800">
            Módulo Formativo (Asociado a la clase)
          </label>
          <div className="surface-100 border-1 surface-border border-round p-2 flex align-items-center gap-2">
            <i className="pi pi-book text-primary text-base" />
            <span className="text-sm font-semibold text-900">
              {moduloMostrado?.siglas ? `${moduloMostrado.siglas} — ` : ''}
              {moduloMostrado?.nombre || 'Módulo asignado a la clase activa'}
            </span>
          </div>
        </div>

        {/* Campo Tipo de Práctica */}
        <div className="flex flex-column gap-1">
          <label htmlFor="tipo-practica" className="font-semibold text-sm text-800">
            Tipo de Práctica <span className="text-red-500">*</span>
          </label>
          <Dropdown
            id="tipo-practica"
            value={idTipoPractica}
            options={OPCIONES_TIPO_PRACTICA}
            onChange={(e) => setIdTipoPractica(e.value)}
            placeholder="Seleccione la modalidad"
          />
        </div>

        {/* Campo Descripción breve */}
        <div className="flex flex-column gap-1">
          <label htmlFor="descripcion-practica" className="font-semibold text-sm text-800">
            Descripción breve u objetivo
          </label>
          <InputTextarea
            id="descripcion-practica"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            autoResize
            placeholder="Resumen didáctico sobre los objetivos de esta práctica genérica..."
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DialogoPractica;


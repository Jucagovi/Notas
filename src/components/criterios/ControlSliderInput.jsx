import React, { useState, useEffect } from 'react';
import { Slider } from 'primereact/slider';
import { InputText } from 'primereact/inputtext';
import './criterios.css';

/**
 * ControlSliderInput - Componente presentacional que unifica un campo numérico superior
 * y un deslizador (Slider) en su base inferior con sincronización bidireccional.
 *
 * Responsabilidad Única: Renderizar una caja de texto con bordes redondeados y un control
 * Slider adherido a su borde inferior, respetando los colores del tema de la aplicación
 * (modo claro y oscuro) y permitiendo ajustes mediante teclado o arrastre.
 *
 * @param {Object} props
 * @param {number} [props.value=0] - Valor numérico actual del porcentaje (0-100).
 * @param {Function} props.onChange - Callback invocado al modificar el valor numérico.
 * @param {number} [props.min=0] - Valor mínimo permitido.
 * @param {number} [props.max=100] - Valor máximo permitido.
 * @param {number} [props.step=5] - Tamaño del paso para el deslizador.
 * @param {boolean} [props.disabled=false] - Indica si el control está deshabilitado.
 * @param {string} [props.ariaLabel=''] - Etiqueta accesible para lectores de pantalla.
 * @param {string} [props.width='140px'] - Ancho visual del control unificado.
 */
export const ControlSliderInput = ({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 5,
  disabled = false,
  ariaLabel = '',
  width = '140px'
}) => {
  // Estado local para gestionar la edición fluida del texto sin bloqueos
  const [textoLocal, setTextoLocal] = useState(String(value ?? 0));
  const [estaEnfocado, setEstaEnfocado] = useState(false);

  // Se sincroniza el texto local cuando cambia la propiedad externa y el campo no está en foco
  useEffect(() => {
    if (!estaEnfocado) {
      setTextoLocal(String(value ?? 0));
    }
  }, [value, estaEnfocado]);

  // Manejador del cambio en el campo de texto
  const manejarCambioTexto = (e) => {
    const textoIngresado = e.target.value.replace(/[^0-9]/g, '');
    setTextoLocal(textoIngresado);

    if (textoIngresado !== '') {
      const numero = Math.min(max, Math.max(min, parseInt(textoIngresado, 10)));
      if (onChange) {
        onChange(numero);
      }
    }
  };

  // Manejador de la pérdida de foco para normalizar el valor final
  const manejarPerdidaFoco = () => {
    setEstaEnfocado(false);
    if (textoLocal === '') {
      setTextoLocal('0');
      if (onChange) {
        onChange(0);
      }
    } else {
      const numero = Math.min(max, Math.max(min, parseInt(textoLocal, 10)));
      setTextoLocal(String(numero));
      if (onChange) {
        onChange(numero);
      }
    }
  };

  // Manejador del cambio mediante el control Slider
  const manejarCambioSlider = (e) => {
    const nuevoValor = Number(e.value);
    setTextoLocal(String(nuevoValor));
    if (onChange) {
      onChange(nuevoValor);
    }
  };

  const valorSlider = Math.min(max, Math.max(min, Number(value) || 0));

  return (
    <div
      className={`control-slider-input ${disabled ? 'control-slider-input--deshabilitado' : ''}`}
      style={{ width }}
    >
      {/* Caja superior con el campo de texto editable */}
      <div
        className={`control-slider-input__caja ${estaEnfocado ? 'control-slider-input__caja--enfocado' : ''}`}
      >
        <InputText
          value={textoLocal}
          onChange={manejarCambioTexto}
          onFocus={(e) => {
            setEstaEnfocado(true);
            e.target.select();
          }}
          onBlur={manejarPerdidaFoco}
          disabled={disabled}
          className="control-slider-input__input text-center"
          aria-label={ariaLabel || 'Porcentaje'}
        />
      </div>

      {/* Contenedor del Slider adherido directamente a la base de la caja */}
      <div className="control-slider-input__slider-contenedor">
        <Slider
          value={valorSlider}
          onChange={manejarCambioSlider}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="control-slider-input__slider"
        />
      </div>
    </div>
  );
};

export default ControlSliderInput;

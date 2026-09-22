import React, { useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

// Componente presentacional para permitir al usuario copiar y pegar filas tabulares directamente desde hojas de cálculo.
const ZonaPegadoTexto = ({ onProcesarTexto, deshabilitado = false }) => {
  const [texto, setTexto] = useState('');

  // Notifica al componente padre el texto introducido para proceder a su parseo
  const manejarProcesar = () => {
    if (texto && texto.trim()) {
      onProcesarTexto(texto);
    }
  };

  // Limpia el área de texto
  const manejarLimpiar = () => {
    setTexto('');
  };

  return (
    <div className="flex flex-column gap-3 w-full">
      <div className="flex flex-column gap-1">
        <label htmlFor="area-pegado-csv" className="font-semibold text-900 text-sm">
          Copiar y pegar datos desde Excel o LibreOffice Calc:
        </label>
        <span className="text-xs text-500">
          Selecciona las celdas en tu hoja de cálculo (incluyendo la fila de cabeceras), cópialas (Ctrl+C) y pégalas directamente a continuación.
        </span>
      </div>

      <InputTextarea
        id="area-pegado-csv"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={7}
        autoResize
        className="w-full font-monospace text-sm"
        placeholder={`nombre\tapellidos\tNIA\tcorreo\tfecha_nac\tlocalidad\tactivo\nLaura\tGómez\t10458923\tlgomez@instituto.es\t2005-03-15\tValencia\ttrue`}
        disabled={deshabilitado}
      />

      <div className="flex justify-content-end gap-2">
        <Button
          type="button"
          label="Limpiar texto"
          icon="pi pi-times"
          className="p-button-text p-button-secondary"
          onClick={manejarLimpiar}
          disabled={deshabilitado || !texto.trim()}
        />
        <Button
          type="button"
          label="Procesar datos"
          icon="pi pi-play"
          className="p-button-primary"
          onClick={manejarProcesar}
          disabled={deshabilitado || !texto.trim()}
        />
      </div>
    </div>
  );
};

export default ZonaPegadoTexto;

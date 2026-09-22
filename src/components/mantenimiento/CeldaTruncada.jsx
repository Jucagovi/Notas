import React, { useRef } from 'react';
import { Tooltip } from 'primereact/tooltip';

// Componente presentacional para truncar texto en una sola línea con Tooltip al posar el cursor.
const CeldaTruncada = ({ valor, anchoMaximo = '100%' }) => {
  const celdaRef = useRef(null);
  const texto = valor !== null && valor !== undefined ? String(valor) : '';

  if (!texto) {
    return <span className="text-400 font-italic">-</span>;
  }

  // Genera un identificador único para asociar el tooltip de PrimeReact
  const claseObjetivo = `tooltip-celda-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <>
      <Tooltip target={`.${claseObjetivo}`} position="top" content={texto} />
      <div
        ref={celdaRef}
        className={`${claseObjetivo} cursor-pointer`}
        style={{
          maxWidth: anchoMaximo,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: 'block'
        }}
      >
        {texto}
      </div>
    </>
  );
};

export default CeldaTruncada;

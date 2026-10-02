import React, { useId } from 'react';
import { Tooltip } from 'primereact/tooltip';

// Componente presentacional para truncar texto en una sola línea con Tooltip al posar el cursor.
const CeldaTruncada = ({ valor, anchoMaximo = '100%' }) => {
  const idUnico = useId().replace(/:/g, '');
  const texto = valor !== null && valor !== undefined ? String(valor) : '';

  if (!texto) {
    return <span className="text-400 font-italic">-</span>;
  }

  // Identificador estable para asociar el tooltip de PrimeReact sin fugas en re-renderizados
  const claseObjetivo = `tooltip-celda-${idUnico}`;

  return (
    <>
      <Tooltip target={`.${claseObjetivo}`} position="top" content={texto} />
      <div
        className={`${claseObjetivo} cursor-pointer`}
        style={{
          maxWidth: anchoMaximo,
          width: '100%',
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


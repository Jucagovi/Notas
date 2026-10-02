import React from 'react';
import { Tag } from 'primereact/tag';

/**
 * BadgeModuloFlexibilizado - Subcomponente visual informativo para indicar la flexibilización de módulos.
 *
 * Responsabilidad Única: Renderizar una etiqueta destacada mediante Tag de PrimeReact indicando
 * la relación de flexibilización y el nombre del módulo secundario vinculado a la clase.
 *
 * @param {Object} props
 * @param {string} [props.nombreModuloSecundario] - Denominación oficial del módulo secundario.
 * @param {string} [props.siglasModuloSecundario] - Siglas curriculares del módulo secundario.
 * @param {string} [props.className=''] - Clases CSS complementarias.
 */
const BadgeModuloFlexibilizado = ({
  nombreModuloSecundario = '',
  siglasModuloSecundario = '',
  className = ''
}) => {
  const etiquetaTexto = nombreModuloSecundario
    ? `Módulo flexibilizado con ${nombreModuloSecundario}${
        siglasModuloSecundario ? ` (${siglasModuloSecundario})` : ''
      }`
    : 'Módulo flexibilizado con otro módulo';

  return (
    <div
      className={`inline-flex align-items-center gap-1 ${className}`}
      title="Bolsa horaria unificada para la distribución temporal de unidades de trabajo"
    >
      <Tag
        severity="info"
        icon="pi pi-link"
        value={etiquetaTexto}
        className="px-2 py-1 text-xs border-round font-medium shadow-none"
      />
    </div>
  );
};

export default BadgeModuloFlexibilizado;

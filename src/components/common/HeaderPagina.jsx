import React from 'react';

/**
 * HeaderPagina - Componente presentacional para la cabecera estándar de las páginas.
 *
 * Responsabilidad Única: Renderizar de forma coherente el título principal,
 * descripción secundaria opcional y el bloque de acciones a la derecha.
 *
 * @param {Object} props
 * @param {string} props.titulo - Título principal de la página.
 * @param {string} [props.descripcion] - Subtítulo o descripción explicativa opcional.
 * @param {React.ReactNode} [props.acciones] - Botones o controles de acción a la derecha.
 * @param {React.ReactNode} [props.children] - Contenido adicional inferior opcional.
 * @param {string} [props.className] - Clases CSS adicionales.
 */
export const HeaderPagina = ({
  titulo,
  descripcion,
  acciones,
  children,
  className = ''
}) => {
  return (
    <header className={`flex flex-column gap-3 mb-4 ${className}`.trim()}>
      <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
        <div className="flex flex-column gap-1">
          <h1 className="text-2xl md:text-3xl font-bold text-900 m-0 line-height-2">
            {titulo}
          </h1>
          {descripcion && (
            <p className="text-color-secondary text-sm md:text-base m-0 line-height-3">
              {descripcion}
            </p>
          )}
        </div>

        {acciones && (
          <div className="flex align-items-center gap-2 flex-wrap">
            {acciones}
          </div>
        )}
      </div>

      {children && (
        <div className="w-full mt-2">
          {children}
        </div>
      )}
    </header>
  );
};

export default HeaderPagina;

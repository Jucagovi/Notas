import React from 'react';

/**
 * ListaIndiceManual - Componente presentacional del índice lateral de temas sin bordes blancos.
 *
 * Responsabilidad Única: Renderizar la lista seleccionable de artículos del manual
 * técnico con diseño limpio, sin bordes blancos perimetrales y con realce sutil del elemento activo.
 */
const ListaIndiceManual = ({
  temas = [],
  temaSeleccionadoId,
  onSeleccionarTema
}) => {
  return (
    <div className="flex flex-column gap-2 w-full">
      <div className="text-xs uppercase font-bold text-color-secondary px-2 mb-1">
        Temas y Guías Técnicas ({temas.length})
      </div>

      <div className="flex flex-column gap-1">
        {temas.map((tema) => {
          const estaSeleccionado = tema.id === temaSeleccionadoId;

          return (
            <div
              key={tema.id}
              onClick={() => onSeleccionarTema(tema.id)}
              className={`p-3 border-round cursor-pointer transition-all flex align-items-center justify-content-between gap-3 border-none ${
                estaSeleccionado
                  ? 'font-bold shadow-1'
                  : 'surface-ground hover:surface-hover text-700'
              }`}
              style={
                estaSeleccionado
                  ? {
                      backgroundColor: 'var(--primary-light, #e8f4fc)',
                      color: 'var(--primary-color, #1174c0)',
                      borderLeft: '4px solid var(--primary-color, #1174c0)'
                    }
                  : {
                      borderLeft: '4px solid transparent'
                    }
              }
            >
              <div className="flex align-items-center gap-3">
                <i
                  className={`${tema.icono} text-lg ${
                    estaSeleccionado ? 'text-primary font-bold' : 'text-color-secondary'
                  }`}
                />
                <div className="flex flex-column gap-1">
                  <span
                    className={`text-sm ${
                      estaSeleccionado ? 'font-bold text-900' : 'font-medium text-700'
                    }`}
                  >
                    {tema.titulo}
                  </span>
                  <span className="text-xs text-color-secondary font-normal">
                    {tema.categoria}
                  </span>
                </div>
              </div>

              <i
                className={`pi pi-chevron-right text-xs ${
                  estaSeleccionado ? 'text-primary font-bold' : 'text-400'
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListaIndiceManual;

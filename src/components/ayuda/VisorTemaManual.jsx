import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import BadgeNota from '../common/BadgeNota.jsx';

/**
 * VisorTemaManual - Componente presentacional para la lectura detallada de un concepto del manual.
 *
 * Responsabilidad Única: Renderizar el artículo completo del tema técnico seleccionado,
 * formateando sus secciones, reglas, bloques comparativos y escalas oficiales de notas,
 * asegurando un espaciado y padding generoso en los botones de acción.
 */
const VisorTemaManual = ({ tema }) => {
  const navigate = useNavigate();

  if (!tema) {
    return (
      <div className="surface-card border-round shadow-1 p-5 border-1 surface-border text-center text-color-secondary">
        <i className="pi pi-book text-4xl mb-3 text-300" />
        <p className="m-0 text-base">Seleccione un tema del índice para consultar su manual técnico.</p>
      </div>
    );
  }

  return (
    <article className="surface-card border-round shadow-1 p-4 md:p-5 border-1 surface-border flex flex-column gap-4 w-full">
      {/* Cabecera del tema con botón espaciado */}
      <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 pb-3 border-bottom-1 surface-border">
        <div className="flex align-items-start gap-3">
          <div
            className="flex align-items-center justify-content-center border-round flex-shrink-0"
            style={{
              width: '3.2rem',
              height: '3.2rem',
              backgroundColor: 'var(--primary-light, rgba(17, 116, 192, 0.12))'
            }}
          >
            <i className={`${tema.icono} text-2xl text-primary font-bold`} />
          </div>

          <div className="flex flex-column gap-1">
            <span className="text-primary font-bold text-xs uppercase tracking-wider">
              {tema.categoria}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-900 m-0 line-height-2">
              {tema.tituloLargo || tema.titulo}
            </h2>
          </div>
        </div>

        {tema.ruta && (
          <div className="align-self-start md:align-self-center my-1">
            <Button
              label={tema.textoBoton || 'Acceder al módulo'}
              icon="pi pi-external-link"
              iconPos="right"
              onClick={() => navigate(tema.ruta)}
              className="p-button-outlined p-button-primary font-semibold px-4 py-2"
            />
          </div>
        )}
      </div>

      {/* Resumen explicativo en caja destacada */}
      <div className="surface-ground border-round p-3 md:p-4 border-left-3 border-primary flex align-items-start gap-3">
        <i className="pi pi-info-circle text-primary text-xl flex-shrink-0 mt-1" />
        <p className="text-700 text-sm md:text-base line-height-3 m-0">
          <span className="font-bold text-900 mr-1">Concepto clave:</span>
          {tema.resumen}
        </p>
      </div>

      {/* Secciones del artículo */}
      <div className="flex flex-column gap-4">
        {tema.secciones.map((seccion, idxSec) => (
          <section key={idxSec} className="flex flex-column gap-3">
            <h3 className="text-base md:text-lg font-bold text-900 m-0 pb-2 border-bottom-1 surface-border">
              {seccion.subtitulo}
            </h3>

            {seccion.texto && (
              <p className="text-700 text-sm md:text-base line-height-3 m-0">
                {seccion.texto}
              </p>
            )}

            {/* Lista de pasos o reglas */}
            {seccion.pasos && (
              <ul className="list-none p-0 m-0 flex flex-column gap-2 mt-1">
                {seccion.pasos.map((paso, idxPaso) => (
                  <li
                    key={idxPaso}
                    className="surface-ground p-3 border-round border-1 surface-border flex align-items-start gap-3 text-sm text-700 line-height-3"
                  >
                    <i className="pi pi-check text-primary font-bold mt-1 flex-shrink-0" />
                    <span>{paso}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Bloques de detalles en columnas */}
            {seccion.detalles && (
              <div className="grid mt-1">
                {seccion.detalles.map((det, idxDet) => (
                  <div key={idxDet} className="col-12 md:col-6">
                    <div className="surface-ground p-3 md:p-4 border-round border-1 surface-border h-full flex flex-column gap-2">
                      <span className="font-bold text-sm text-900">
                        {det.etiqueta}
                      </span>
                      <p className="text-color-secondary text-xs md:text-sm line-height-3 m-0">
                        {det.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Escala cromática de calificaciones oficial con BadgeNota */}
            {seccion.escalas && (
              <div className="grid mt-1">
                {seccion.escalas.map((esc, idxEsc) => (
                  <div key={idxEsc} className="col-12 sm:col-6 md:col">
                    <div className="surface-ground p-3 border-round border-1 surface-border text-center flex flex-column align-items-center justify-content-center gap-2">
                      <BadgeNota nota={esc.notaEjemplo} />
                      <span className="font-bold text-sm text-900">{esc.rango}</span>
                      <span className="text-xs text-color-secondary font-semibold">{esc.texto}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </article>
  );
};

export default VisorTemaManual;

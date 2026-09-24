import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

/**
 * CuadriculaTarjetasManual - Componente presentacional alternativo en formato Hub / Grid.
 *
 * Responsabilidad Única: Presentar el catálogo de dudas complejas en una cuadrícula
 * de tarjetas homogéneas con botones espaciados y con el estilo del catálogo de herramientas.
 */
const CuadriculaTarjetasManual = ({ temas = [], onVerTema }) => {
  return (
    <div className="grid w-full">
      {temas.map((tema) => {
        const pieTarjeta = (
          <div className="flex justify-content-end pt-3">
            <Button
              label="Consultar manual"
              icon="pi pi-arrow-right"
              iconPos="right"
              outlined
              size="small"
              onClick={() => onVerTema(tema.id)}
              className="w-full px-4 py-2 font-semibold"
            />
          </div>
        );

        return (
          <div key={tema.id} className="col-12 sm:col-6 lg:col-4">
            <Card
              className="shadow-1 hover:shadow-3 transition-duration-200 border-1 surface-border h-full flex flex-column justify-content-between surface-card"
              footer={pieTarjeta}
            >
              <div className="flex flex-column gap-2">
                <div className="flex align-items-center justify-content-between mb-1">
                  <div
                    className="flex align-items-center justify-content-center border-round"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      backgroundColor: 'var(--primary-light, rgba(17, 116, 192, 0.12))'
                    }}
                  >
                    <i className={`${tema.icono} text-xl text-primary font-bold`} />
                  </div>
                  <span className="text-xs font-semibold text-color-secondary uppercase">
                    {tema.categoria}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-900 m-0 line-height-2">
                  {tema.titulo}
                </h3>

                <p className="text-secondary text-sm m-0 line-height-3">
                  {tema.resumen}
                </p>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default CuadriculaTarjetasManual;

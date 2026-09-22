import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { BlockUI } from 'primereact/blockui';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import useCopiasSeguridad from '../hooks/useCopiasSeguridad.js';

// Página para la gestión y descarga de copias de seguridad completas o individuales en formatos JSON y CSV.
const CopiasSeguridad = () => {
  const {
    tablas,
    cargandoCompleto,
    cargandoCompletoJSON,
    cargandoCompletoCSV,
    cargandoTabla,
    cargandoTablaCSV,
    exportarCopiaCompleta,
    exportarCopiaCompletaCSV,
    exportarTablaIndividual,
    exportarTablaIndividualCSV
  } = useCopiasSeguridad();

  return (
    <BlockUI blocked={cargandoCompleto}>
      <div className="flex flex-column w-full gap-4">
        {/* Cabecera general de la página */}
        <HeaderPagina
          titulo="Copias de Seguridad"
          descripcion="Descarga de la información de la base de datos en formatos JSON y CSV para respaldos históricos y portabilidad."
        />

        {/* Sección 1: Copia de Seguridad Completa */}
        <div className="flex flex-column gap-2">
          <h2 className="text-xl font-bold m-0 text-900 flex align-items-center gap-2">
            <i className="pi pi-database text-primary" />
            <span>Copia de Seguridad Completa</span>
          </h2>
          <p className="text-secondary text-sm m-0">
            Descarga integral de todo el esquema de la base de datos en un archivo JSON consolidado o en un archivo ZIP con todos los CSVs tabulares.
          </p>

          <Card className="shadow-2 border-1 surface-border mt-2">
            <div className="flex flex-column lg:flex-row lg:align-items-center lg:justify-content-between gap-4">
              <div className="flex align-items-center gap-3">
                <div
                  className="flex align-items-center justify-content-center border-round bg-primary text-white"
                  style={{ width: '56px', height: '56px' }}
                >
                  <i className="pi pi-cloud-download text-2xl" />
                </div>
                <div className="flex flex-column gap-1">
                  <span className="text-lg font-bold text-900">
                    Exportación Total del Sistema ({tablas.length} tablas)
                  </span>
                  <span className="text-sm text-600">
                    Incluye todas las tablas maestras, estructuras curriculares, calificaciones y calendarios escolares.
                  </span>
                </div>
              </div>

              <div className="flex flex-column sm:flex-row align-items-stretch gap-2 flex-shrink-0">
                <Button
                  type="button"
                  label="Descargar Copia Completa (JSON)"
                  icon="pi pi-download"
                  className="p-button-primary p-button-raised w-full sm:w-auto"
                  loading={cargandoCompletoJSON}
                  disabled={cargandoCompleto}
                  onClick={exportarCopiaCompleta}
                />
                <Button
                  type="button"
                  label="Descargar Copia Completa (CSV)"
                  icon="pi pi-file-excel"
                  className="p-button-success p-button-raised w-full sm:w-auto"
                  loading={cargandoCompletoCSV}
                  disabled={cargandoCompleto}
                  onClick={exportarCopiaCompletaCSV}
                  tooltip="Genera un archivo ZIP con los CSVs de todas las tablas con delimitación por comas y entrecomillado seguro."
                  tooltipOptions={{ position: 'top' }}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sección 2: Exportación Granular por Tablas */}
        <div className="flex flex-column gap-2 mt-2">
          <h2 className="text-xl font-bold m-0 text-900 flex align-items-center gap-2">
            <i className="pi pi-th-large text-primary" />
            <span>Exportación Granular por Tablas</span>
          </h2>
          <p className="text-secondary text-sm m-0">
            Descarga conjuntos de datos específicos de forma individualizada en formato JSON estructurado o CSV compatible con hojas de cálculo.
          </p>

          <div className="grid mt-1">
            {tablas.map((tabla) => {
              const estaCargandoJSON = Boolean(cargandoTabla[tabla.id]);
              const estaCargandoCSV = Boolean(cargandoTablaCSV[tabla.id]);

              return (
                <div key={tabla.id} className="col-12 sm:col-6 lg:col-4 xl:col-3 p-2">
                  <Card className="h-full shadow-1 border-1 surface-border flex flex-column justify-content-between">
                    <div className="flex flex-column gap-2">
                      <div className="flex align-items-center justify-content-between">
                        <i className={`${tabla.icono} text-xl text-primary`} />
                        <span className="text-xs font-semibold px-2 py-1 bg-gray-100 border-round text-600">
                          {tabla.id}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-900 m-0 mt-1">
                        {tabla.nombre}
                      </h3>
                      <p className="text-xs text-600 m-0 line-height-2" style={{ minHeight: '32px' }}>
                        {tabla.descripcion}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-3 pt-2 border-top-1 surface-border">
                      <Button
                        type="button"
                        label="JSON"
                        icon="pi pi-download"
                        className="p-button-outlined p-button-secondary p-button-sm w-full"
                        loading={estaCargandoJSON}
                        disabled={cargandoCompleto || estaCargandoJSON || estaCargandoCSV}
                        onClick={() => exportarTablaIndividual(tabla.id, tabla.nombre)}
                        tooltip="Exportar en formato JSON con metadatos"
                        tooltipOptions={{ position: 'top' }}
                      />
                      <Button
                        type="button"
                        label="CSV"
                        icon="pi pi-file-excel"
                        className="p-button-outlined p-button-success p-button-sm w-full"
                        loading={estaCargandoCSV}
                        disabled={cargandoCompleto || estaCargandoJSON || estaCargandoCSV}
                        onClick={() => exportarTablaIndividualCSV(tabla.id, tabla.nombre)}
                        tooltip="Exportar en formato CSV estándar (delimitador coma con entrecomillado seguro)"
                        tooltipOptions={{ position: 'top' }}
                      />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </BlockUI>
  );
};

export default CopiasSeguridad;

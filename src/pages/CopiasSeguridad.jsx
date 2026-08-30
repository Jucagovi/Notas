import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';
import useCopiasSeguridad from '../hooks/useCopiasSeguridad.js';

// Componente de página principal para la gestión y descarga de copias de seguridad de la base de datos
const CopiasSeguridad = () => {
  const {
    tablas,
    cargandoCompleto,
    cargandoTabla,
    exportarCopiaCompleta,
    exportarTablaIndividual
  } = useCopiasSeguridad();

  return (
    <div className="page-container">
      {/* Cabecera de la página */}
      <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 mb-2">
        <div>
          <h1 className="page-title m-0">Copias de Seguridad</h1>
          <p className="text-muted m-0 mt-1">
            Exportación y descarga de la información de la base de datos en formato JSON para garantizar la portabilidad y resguardo de datos.
          </p>
        </div>
      </div>

      <Divider />

      <div className="page-content flex flex-column gap-5">
        {/* =========================================================================
            SECCIÓN 1: Copia de Seguridad Completa (Tarjeta destacada)
           ========================================================================= */}
        <div>
          <div className="mb-3">
            <h2 className="text-xl font-bold m-0 flex align-items-center gap-2">
              <i className="pi pi-database text-primary" />
              <span>Copia de Seguridad Completa</span>
            </h2>
            <p className="text-muted text-sm m-0 mt-1">
              Descarga integral de todo el esquema de la base de datos en un único archivo consolidado.
            </p>
          </div>

          <Card
            className="shadow-2 border-1 surface-border"
            style={{
              background: 'linear-gradient(135deg, var(--surface-card) 0%, var(--primary-light) 100%)',
              borderLeft: '5px solid var(--primary-color)'
            }}
          >
            <div className="flex flex-column lg:flex-row lg:align-items-center justify-content-between gap-4">
              <div className="flex align-items-start gap-4">
                <div
                  className="flex align-items-center justify-content-center border-round shadow-1 flex-shrink-0"
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: 'var(--primary-color)',
                    color: '#ffffff'
                  }}
                >
                  {cargandoCompleto ? (
                    <ProgressSpinner
                      style={{ width: '36px', height: '36px' }}
                      strokeWidth="4"
                      animationDuration=".8s"
                    />
                  ) : (
                    <i className="pi pi-cloud-download text-3xl" />
                  )}
                </div>

                <div className="flex flex-column gap-2">
                  <div className="flex flex-wrap align-items-center gap-2">
                    <span className="text-xl font-bold text-900">
                      Exportación Total de la Base de Datos
                    </span>
                    <Tag severity="info" value="Recomendado" icon="pi pi-star-fill" />
                    <Tag severity="secondary" value="JSON nativo" />
                  </div>

                  <p className="text-muted text-sm m-0 line-height-3" style={{ maxWidth: '750px' }}>
                    Esta opción consulta todas las tablas del sistema (Ciclos, Cursos, Discentes, Módulos, Evaluaciones, Prácticas, RA, CE, Calificaciones, Matriculaciones y Ponderaciones) de forma concurrente y las empaqueta con sus metadatos en un archivo descargable.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted">
                    <span className="flex align-items-center gap-1">
                      <i className="pi pi-check text-green-500 font-bold" /> {tablas.length} tablas incluidas
                    </span>
                    <span className="flex align-items-center gap-1">
                      <i className="pi pi-check text-green-500 font-bold" /> Relaciones e identificadores íntegros
                    </span>
                    <span className="flex align-items-center gap-1">
                      <i className="pi pi-check text-green-500 font-bold" /> Formato UTF-8
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-column sm:flex-row lg:flex-column align-items-stretch justify-content-center flex-shrink-0 gap-2">
                <Button
                  label="Descargar Copia Completa (JSON)"
                  icon="pi pi-download"
                  size="large"
                  severity="primary"
                  loading={cargandoCompleto}
                  disabled={cargandoCompleto}
                  onClick={exportarCopiaCompleta}
                  className="p-button-raised font-bold"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* =========================================================================
            SECCIÓN 2: Exportación Granular por Tablas
           ========================================================================= */}
        <div>
          <div className="mb-3">
            <h2 className="text-xl font-bold m-0 flex align-items-center gap-2">
              <i className="pi pi-th-large text-primary" />
              <span>Exportación Granular por Tablas</span>
            </h2>
            <p className="text-muted text-sm m-0 mt-1">
              Descargue conjuntos de datos específicos de forma individualizada según sus necesidades de consulta o respaldo.
            </p>
          </div>

          <div className="grid">
            {tablas.map((tabla) => {
              const estaCargando = !!cargandoTabla[tabla.id];

              return (
                <div key={tabla.id} className="col-12 sm:col-6 lg:col-4 xl:col-3 p-2">
                  <Card
                    className="h-full border-1 surface-border hover:shadow-2 transition-duration-200 flex flex-column justify-content-between"
                    style={{ borderRadius: '10px' }}
                  >
                    <div className="flex flex-column gap-3">
                      {/* Cabecera de la tarjeta con icono distintivo y código de tabla */}
                      <div className="flex align-items-center justify-content-between">
                        <div
                          className="flex align-items-center justify-content-center border-round"
                          style={{
                            width: '42px',
                            height: '42px',
                            backgroundColor: `${tabla.color}15`,
                            color: tabla.color
                          }}
                        >
                          <i className={`${tabla.icono} text-xl`} />
                        </div>
                        <Tag
                          value={tabla.id}
                          severity="secondary"
                          className="font-mono text-xs"
                        />
                      </div>

                      {/* Título y descripción de la tabla */}
                      <div>
                        <h3 className="m-0 text-base font-bold text-900 mb-1">
                          {tabla.nombre}
                        </h3>
                        <p
                          className="text-muted text-xs m-0 line-height-3"
                          style={{ minHeight: '36px' }}
                        >
                          {tabla.descripcion}
                        </p>
                      </div>
                    </div>

                    <Divider className="my-3" />

                    {/* Botón de exportación individual con indicador de estado */}
                    <div>
                      <Button
                        label={`Exportar ${tabla.id}`}
                        icon="pi pi-download"
                        size="small"
                        outlined
                        severity="secondary"
                        loading={estaCargando}
                        disabled={cargandoCompleto || estaCargando}
                        onClick={() => exportarTablaIndividual(tabla.id, tabla.nombre)}
                        className="w-full font-semibold"
                      />
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopiasSeguridad;

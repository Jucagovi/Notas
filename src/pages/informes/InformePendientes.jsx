import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { TabView, TabPanel } from 'primereact/tabview';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import useInformePendientes from '../../hooks/useInformePendientes.js';
import InformePendientesFiltros from '../../components/informes/InformePendientesFiltros.jsx';
import InformePendientesTabla from '../../components/informes/InformePendientesTabla.jsx';

// Página principal del informe de control de calificaciones pendientes
const InformePendientes = () => {
  const navigate = useNavigate();

  const {
    cursos,
    cursoSeleccionadoId,
    setCursoSeleccionadoId,
    cursoSeleccionado,
    modulos,
    indiceModuloActivo,
    setIndiceModuloActivo,
    moduloActivo,
    listaPendientesModulo,
    totalPendientesModuloOriginal,
    totalPendientesCurso,
    terminoBusqueda,
    setTerminoBusqueda,
    cargando,
    exportandoPDF,
    error,
    recargar,
    irACalificar,
    descargarPDF
  } = useInformePendientes();

  // Función para filtrar los pendientes de un módulo específico con el término de búsqueda
  const obtenerFilasFiltradasModulo = (mod) => {
    if (!terminoBusqueda || !terminoBusqueda.trim()) {
      return mod.pendientes || [];
    }

    const termino = terminoBusqueda.trim().toLowerCase();

    return (mod.pendientes || []).filter((fila) => {
      const coincideDiscente =
        (fila.nombreDiscente && fila.nombreDiscente.toLowerCase().includes(termino)) ||
        (fila.apellidosDiscente && fila.apellidosDiscente.toLowerCase().includes(termino)) ||
        (fila.nombreCompletoDiscente && fila.nombreCompletoDiscente.toLowerCase().includes(termino)) ||
        (fila.discenteNia && fila.discenteNia.toLowerCase().includes(termino));

      const coincidePractica =
        (fila.nombrePractica && fila.nombrePractica.toLowerCase().includes(termino)) ||
        (fila.numeroPractica && fila.numeroPractica.toString().toLowerCase().includes(termino)) ||
        (fila.textoPractica && fila.textoPractica.toLowerCase().includes(termino));

      const coincideEvaluacion =
        fila.nombreEvaluacion && fila.nombreEvaluacion.toLowerCase().includes(termino);

      return coincideDiscente || coincidePractica || coincideEvaluacion;
    });
  };

  // Plantilla visual para el encabezado de cada pestaña de módulo en el TabView
  const plantillaEncabezadoPestaña = (mod) => {
    const etiqueta = mod.siglas || mod.nombre || 'Módulo';

    return (
      <div className="flex align-items-center gap-2 py-1">
        <i className="pi pi-book text-xs text-primary" />
        <span className="font-bold text-sm">{etiqueta}</span>
        <Badge
          value={mod.totalPendientes}
          severity={mod.totalPendientes > 0 ? 'warning' : 'success'}
          className="ml-1"
        />
      </div>
    );
  };

  return (
    <div className="page-container p-2">
      {/* 1. Cabecera principal de la página */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Control de Calificaciones Pendientes</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Detección de discentes con prácticas sin calificar agrupadas por módulo y evaluación para prevenir actas vacías.
          </p>
        </div>

        <div className="flex align-items-center gap-2 flex-shrink-0">
          <Button
            type="button"
            label="Calificar Prácticas"
            icon="pi pi-pencil"
            size="small"
            severity="secondary"
            outlined
            className="white-space-nowrap px-3"
            style={{ minWidth: '170px' }}
            onClick={() => navigate('/calificar')}
            tooltip="Ir al módulo de calificación de prácticas"
            tooltipOptions={{ position: 'top' }}
          />

          <Button
            type="button"
            label="Exportar PDF"
            icon="pi pi-file-pdf"
            size="small"
            severity="primary"
            className="white-space-nowrap px-3"
            style={{ minWidth: '145px' }}
            onClick={descargarPDF}
            loading={exportandoPDF}
            disabled={cargando || !cursoSeleccionadoId || !moduloActivo}
            tooltip="Descargar informe del módulo activo en PDF"
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      <Divider />

      {/* 2. Filtro único por Curso Académico y búsqueda integrada */}
      <InformePendientesFiltros
        cursos={cursos}
        cursoSeleccionadoId={cursoSeleccionadoId}
        setCursoSeleccionadoId={setCursoSeleccionadoId}
        terminoBusqueda={terminoBusqueda}
        setTerminoBusqueda={setTerminoBusqueda}
        totalPendientesCurso={totalPendientesCurso}
        cargando={cargando}
        exportandoPDF={exportandoPDF}
        recargar={recargar}
        descargarPDF={descargarPDF}
      />

      {/* Mensaje de error si la consulta a base de datos falló */}
      {error && (
        <Message
          severity="error"
          text={`Error al consultar la base de datos: ${error}`}
          className="w-full mb-3"
        />
      )}

      {/* 3. Contenido condicional según el estado de los datos */}
      {cargando ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          <span className="text-muted text-sm mt-3">Consultando actas y calificaciones en Supabase...</span>
        </div>
      ) : !cursoSeleccionadoId ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-calendar text-6xl text-primary-300" />
            <h3 className="text-xl font-bold text-color m-0">Seleccione un Curso Académico</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              Elija un curso académico en el desplegable superior para auditar las calificaciones pendientes de sus módulos.
            </p>
          </div>
        </Card>
      ) : modulos.length === 0 ? (
        <Card className="shadow-1 text-center py-6">
          <div className="flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-folder-open text-6xl text-muted" />
            <h3 className="text-xl font-bold text-color m-0">Sin módulos registrados</h3>
            <p className="text-muted text-sm max-w-28rem m-0">
              No se encontraron módulos profesionales vinculados al curso {cursoSeleccionado?.nombre || 'seleccionado'}.
            </p>
          </div>
        </Card>
      ) : (
        /* 4. Sistema de pestañas por módulo (TabView) */
        <TabView
          activeIndex={indiceModuloActivo}
          onTabChange={(e) => setIndiceModuloActivo(e.index)}
          className="shadow-1 border-round surface-card"
        >
          {modulos.map((mod) => {
            const filasModulo = obtenerFilasFiltradasModulo(mod);

            return (
              <TabPanel
                key={mod.id_modulo}
                header={plantillaEncabezadoPestaña(mod)}
              >
                <div className="flex flex-column gap-3 pt-2">
                  {/* Cabecera contextual del módulo: título en la primera línea y etiquetas por evaluación justo debajo */}
                  <div className="surface-ground p-3 border-round border-1 surface-border">
                    <div className="flex flex-column gap-2">
                      <div className="flex align-items-center gap-2">
                        <i className="pi pi-book text-primary text-base" />
                        <h3 className="text-base font-bold m-0 text-color">
                          {mod.nombre} {mod.siglas ? `(${mod.siglas})` : ''}
                        </h3>
                      </div>

                      {/* Información de calificaciones pendientes por evaluación en la línea inferior */}
                      {mod.desgloseEvaluaciones && mod.desgloseEvaluaciones.length > 0 && (
                        <div className="flex flex-wrap gap-2 align-items-center">
                          {mod.desgloseEvaluaciones.map((item) => (
                            <Tag
                              key={item.evaluacion.id_evaluacion}
                              value={`${item.evaluacion.nombre}: ${item.totalPendientes === 0 ? 'Al día' : `${item.totalPendientes} pendiente${item.totalPendientes === 1 ? '' : 's'}`}`}
                              severity={item.totalPendientes === 0 ? 'success' : 'warning'}
                              icon={item.totalPendientes === 0 ? 'pi pi-check' : 'pi pi-clock'}
                              className="text-xs"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {mod.totalPendientes === 0 ? (
                    /* Mensaje de éxito si el módulo está completamente al día */
                    <div className="surface-card p-6 border-round shadow-1 text-center border-1 surface-border">
                      <div className="flex flex-column align-items-center justify-content-center gap-3">
                        <div
                          className="flex align-items-center justify-content-center border-round-circle"
                          style={{ width: '4.5rem', height: '4.5rem', backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                        >
                          <i className="pi pi-check-circle text-green-600 text-4xl" />
                        </div>

                        <Message
                          severity="success"
                          text="¡Todo al día! No hay calificaciones pendientes para este módulo."
                          className="w-full text-base font-bold shadow-1"
                          style={{ padding: '1rem' }}
                        />

                        <p className="text-muted text-sm max-w-30rem m-0 mt-2">
                          Todos los discentes matriculados en{' '}
                          <span className="font-semibold text-color">
                            {mod.nombre}
                          </span>{' '}
                          cuentan con nota registrada en todas las prácticas de sus convocatorias evaluativas.
                        </p>

                        <div className="flex gap-2 mt-3">
                          <Button
                            label="Ver Calificaciones en Calificar"
                            icon="pi pi-pencil"
                            size="small"
                            severity="secondary"
                            outlined
                            onClick={() =>
                              navigate('/calificar', {
                                state: {
                                  idCurso: cursoSeleccionadoId,
                                  idModulo: mod.id_modulo
                                }
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Tabla interactiva con filas agrupadas por evaluación */
                    <InformePendientesTabla
                      filas={filasModulo}
                      cargando={cargando}
                      alCalificar={irACalificar}
                    />
                  )}
                </div>
              </TabPanel>
            );
          })}
        </TabView>
      )}
    </div>
  );
};

export default InformePendientes;

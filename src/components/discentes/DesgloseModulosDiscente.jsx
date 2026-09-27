import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import EstadoVacio from '../common/EstadoVacio.jsx';
import BadgeNota from '../common/BadgeNota.jsx';
import TablaEvaluacionesDiscente from './TablaEvaluacionesDiscente.jsx';
import GraficosRendimientoDiscente from './GraficosRendimientoDiscente.jsx';

/**
 * DesgloseModulosDiscente - Subcomponente presentacional para el desglose modular y por clases del estudiante.
 *
 * Responsabilidad Única: Renderizar un sistema de pestañas TabView donde cada pestaña representa
 * una clase matriculada en el año académico seleccionado, mostrando su tabla de calificaciones y gráficos 360º.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.clases=[]] - Lista de clases matriculadas en el año académico activo.
 * @param {Array<Object>} [props.modulos] - Alias retrocompatible de clases.
 * @param {string} [props.anioEtiqueta=''] - Etiqueta textual del año académico (ej. '2026/2027').
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 * @param {boolean} [props.guardando=false] - Indicador de guardado en base de datos.
 * @param {Function} props.onGuardarNota - Manejador para persistir notas (idVersion, idEvaluacion, nuevaNota).
 * @param {Function} [props.onError] - Manejador para avisos de validación o error.
 */
export const DesgloseModulosDiscente = ({
  clases = [],
  modulos = [],
  anioEtiqueta = '',
  cargando = false,
  guardando = false,
  onGuardarNota,
  onError
}) => {
  const [indicePestanyaActiva, setIndicePestanyaActiva] = useState(0);

  const listaClases = (clases && clases.length > 0) ? clases : modulos;

  if (!listaClases || listaClases.length === 0) {
    return (
      <div className="surface-card p-4 border-round-xl border-1 surface-border shadow-1">
        <EstadoVacio
          mensaje="Sin clases matriculadas"
          descripcion={
            anioEtiqueta
              ? `El discente no figura matriculado en ninguna clase durante el año académico ${anioEtiqueta}.`
              : 'El discente no figura matriculado en ninguna clase para el periodo seleccionado.'
          }
          icono="pi pi-book"
        />
      </div>
    );
  }

  // Plantilla de cabecera personalizada para cada pestaña de clase matriculada
  const renderizarCabeceraPestanya = (clase) => {
    const titulo = clase.tituloPestanya || clase.siglas || clase.nombre;
    const media = clase.estadisticas?.notaMedia;

    return (
      <div className="flex align-items-center gap-2 py-1">
        <i className="pi pi-graduation-cap text-primary" />
        <span className="font-semibold text-900">{titulo}</span>
        {media !== null && media !== undefined && (
          <BadgeNota
            nota={media}
            redondear
            className="text-xs ml-1"
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-column gap-3">
      <TabView
        activeIndex={indicePestanyaActiva}
        onTabChange={(e) => setIndicePestanyaActiva(e.index)}
        className="w-full shadow-1 border-round-xl surface-card p-2 md:p-3 border-1 surface-border"
      >
        {listaClases.map((clase, idx) => {
          const { estadisticas = {}, actividades = [] } = clase;
          const { totalActividades = 0, calificadas = 0, notaMedia = null } = estadisticas;
          const claveUnica = clase.id_clase || clase.id_modulo || `clase-${idx}`;

          return (
            <TabPanel
              key={claveUnica}
              headerTemplate={() => renderizarCabeceraPestanya(clase)}
            >
              {/* Barra resumen de métricas de la clase */}
              <div className="grid mb-4 mt-1">
                <div className="col-12 sm:col-4">
                  <div className="surface-ground p-3 border-round border-1 surface-border flex align-items-center justify-content-between">
                    <div className="flex flex-column">
                      <span className="text-xs text-color-secondary font-medium">
                        Total Actividades
                      </span>
                      <span className="text-xl font-bold text-900">
                        {totalActividades}
                      </span>
                    </div>
                    <i className="pi pi-briefcase text-2xl text-primary" />
                  </div>
                </div>

                <div className="col-12 sm:col-4">
                  <div className="surface-ground p-3 border-round border-1 surface-border flex align-items-center justify-content-between">
                    <div className="flex flex-column">
                      <span className="text-xs text-color-secondary font-medium">
                        Calificadas
                      </span>
                      <span className="text-xl font-bold text-900">
                        {calificadas} / {totalActividades}
                      </span>
                    </div>
                    <i className="pi pi-check-circle text-2xl text-green-500" />
                  </div>
                </div>

                <div className="col-12 sm:col-4">
                  <div className="surface-ground p-3 border-round border-1 surface-border flex align-items-center justify-content-between">
                    <div className="flex flex-column">
                      <span className="text-xs text-color-secondary font-medium">
                        Nota Media
                      </span>
                      <div className="mt-1">
                        {notaMedia !== null ? (
                          <BadgeNota
                            nota={notaMedia}
                            redondear
                            className="text-base px-2 py-1"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-color-secondary">
                            Sin calificar
                          </span>
                        )}
                      </div>
                    </div>
                    <i className="pi pi-calculator text-2xl text-yellow-500" />
                  </div>
                </div>
              </div>

              {/* 1. Tabla de Evaluaciones con edición en línea */}
              <TablaEvaluacionesDiscente
                actividades={actividades}
                cargando={cargando}
                guardando={guardando}
                onGuardarNota={onGuardarNota}
                onError={onError}
              />

              {/* 2. Visualización gráfica interactiva (Líneas y Circular) */}
              <GraficosRendimientoDiscente
                actividades={actividades}
                estadisticas={estadisticas}
              />
            </TabPanel>
          );
        })}
      </TabView>
    </div>
  );
};

export default DesgloseModulosDiscente;

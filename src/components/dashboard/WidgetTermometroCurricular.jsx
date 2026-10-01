import React from 'react';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import EstadoVacio from '../common/EstadoVacio.jsx';
import { formatearFechaEspanol } from '../../utils/fechas.js';

/**
 * WidgetTermometroCurricular - Componente presentacional del Dashboard para monitorizar desviaciones.
 *
 * Responsabilidad Única: Renderizar una tarjeta con el termómetro curricular de cada módulo
 * impartido en el curso activo, mostrando la Unidad de Trabajo vigente, su indicador de desviación
 * y un acceso directo con icono de engranaje para realizar ajustes en Temporización (Caso de Uso 19).
 *
 * @param {Object} props
 * @param {Array<Object>} [props.modulos=[]] - Lista de módulos con su unidad activa y desviación.
 * @param {boolean} [props.cargando=false] - Indicador de estado de carga.
 */
export const WidgetTermometroCurricular = ({ modulos = [], cargando = false }) => {
  const navigate = useNavigate();

  // Redirección directa al Caso de Uso 19 (Temporización) parametrizando curso y módulo.
  const manejarIrATemporizacion = (idCurso, idModulo) => {
    navigate('/temporizacion', {
      state: {
        id_curso: idCurso,
        id_modulo: idModulo,
        cursoId: idCurso,
        moduloId: idModulo
      }
    });
  };

  // Cabecera estilizada de la tarjeta con título e icono representativo.
  const encabezado = (
    <div className="flex align-items-center justify-content-between p-3 pb-2 border-bottom-1 surface-border flex-wrap gap-2">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-sliders-v text-primary text-xl" />
        <div>
          <h2 className="text-lg font-bold text-900 m-0">Termómetro Curricular</h2>
          <span className="text-xs text-color-secondary">
            Ritmo de impartición frente a la planificación prevista
          </span>
        </div>
      </div>
      <Button
        label="Progreso Curricular"
        icon="pi pi-chart-line"
        size="small"
        text
        onClick={() => navigate('/informes/progreso')}
        tooltip="Ver informe completo de progreso"
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );

  return (
    <Card header={encabezado} className="shadow-1 border-1 surface-border border-round h-full">
      {cargando ? (
        <div className="flex align-items-center justify-content-center p-4">
          <i className="pi pi-spin pi-spinner text-primary text-2xl mr-2" />
          <span className="text-sm text-color-secondary">Comprobando temporización curricular...</span>
        </div>
      ) : modulos.length === 0 ? (
        <EstadoVacio
          mensaje="Sin módulos en el curso actual"
          descripcion="No constan módulos con unidades temporizadas asignadas al curso académico activo."
          icono="pi pi-calendar-times"
          className="my-2 p-3"
        />
      ) : (
        <div className="flex flex-column gap-3">
          {modulos.map((item) => {
            const ut = item.utActiva;
            const desv = item.desviacion;

            return (
              <div
                key={item.id_modulo}
                className="p-3 border-round surface-50 border-1 surface-border flex flex-column md:flex-row md:align-items-center justify-content-between gap-3"
              >
                {/* Información del módulo */}
                <div className="flex align-items-center gap-2" style={{ minWidth: '180px' }}>
                  <i className="pi pi-book text-primary text-lg" />
                  <div className="flex flex-column">
                    <span className="font-bold text-sm text-900">
                      {item.siglas || item.nombre}
                    </span>
                    <span className="text-xs text-color-secondary line-height-2">
                      {item.nombre}
                    </span>
                  </div>
                </div>

                {/* Unidad de Trabajo activa en el periodo actual */}
                <div className="flex flex-column flex-1">
                  {ut ? (
                    <div className="flex flex-column gap-1">
                      <div className="flex align-items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-primary bg-primary-50 px-2 py-1 border-round border-1 surface-border">
                          {ut.numUT}
                        </span>
                        <span className="font-medium text-xs text-900" title={ut.nombreUT}>
                          {ut.nombreUT}
                        </span>
                      </div>
                      {ut.fecha_ini_prevista && ut.fecha_fin_prevista && (
                        <span className="text-xs text-color-secondary">
                          Previsto: {formatearFechaEspanol(ut.fecha_ini_prevista)} — {formatearFechaEspanol(ut.fecha_fin_prevista)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-color-secondary italic">
                      Sin unidades activas en este periodo
                    </span>
                  )}
                </div>

                {/* Indicador de Desviación y botón de ajuste rápido */}
                <div className="flex align-items-center gap-2 justify-content-between md:justify-content-end">
                  {/* Badge e icono representativo de desviación */}
                  <div className="flex align-items-center gap-2">
                    <i
                      className={`${desv.icono} ${
                        desv.enRetraso ? 'text-red-500' : 'text-green-500'
                      } text-base`}
                    />
                    <Badge
                      value={desv.texto}
                      severity={desv.severidad}
                      className="font-bold text-xs"
                    />
                  </div>

                  {/* Botón con icono de engranaje para redirigir a Temporización (Caso de Uso 19) */}
                  <Button
                    icon="pi pi-cog"
                    rounded
                    text
                    severity="secondary"
                    tooltip="Ajustar temporización en Caso de Uso 19"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => manejarIrATemporizacion(item.id_curso, item.id_modulo)}
                    aria-label={`Ajustar temporización de ${item.nombre}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default WidgetTermometroCurricular;

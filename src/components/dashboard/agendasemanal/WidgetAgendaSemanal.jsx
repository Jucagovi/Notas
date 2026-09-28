import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import CabeceraAgendaSemanal from './CabeceraAgendaSemanal.jsx';
import ListaAgendaSemanal from './ListaAgendaSemanal.jsx';
import CargadorSeccion from '../../common/CargadorSeccion.jsx';

/**
 * WidgetAgendaSemanal - Componente presentacional principal del Caso de Uso 27.
 *
 * Responsabilidad Única: Actuar como tarjeta contenedora Card de PrimeReact en el Panel de Control,
 * integrando la cabecera interactiva con navegación de semanas, la visualización de módulos mediante
 * DataView y el pie con métricas de síntesis y accesos directos.
 *
 * @param {Object} props
 * @param {Array<Object>} props.modulosConAgenda - Módulos con sus unidades de trabajo programadas.
 * @param {number} props.totalUnidades - Total acumulado de unidades a impartir esta semana.
 * @param {boolean} props.cargando - Estado de carga de las consultas asíncronas.
 * @param {string|null} props.error - Mensaje de error en caso de fallo en la sincronización.
 * @param {string} props.fechaInicio - Fecha formateada del inicio de la semana (lunes).
 * @param {string} props.fechaFin - Fecha formateada del final de la semana (domingo).
 * @param {boolean} props.esSemanaActual - Indicador de correspondencia con la semana real en curso.
 * @param {Function} props.onSemanaAnterior - Desplazamiento a la semana precedente.
 * @param {Function} props.onSemanaSiguiente - Desplazamiento a la semana posterior.
 * @param {Function} props.onSemanaActual - Retorno directo a la semana actual.
 * @param {Function} props.onModuloClick - Acción al interactuar con un módulo específico.
 * @param {Function} [props.onIrTemporizacion] - Acción para abrir el informe/gestor completo de temporización.
 */
const WidgetAgendaSemanal = ({
  modulosConAgenda = [],
  totalUnidades = 0,
  cargando = false,
  error = null,
  fechaInicio,
  fechaFin,
  esSemanaActual = true,
  onSemanaAnterior,
  onSemanaSiguiente,
  onSemanaActual,
  onModuloClick,
  onIrTemporizacion
}) => {
  // Construcción de la cabecera del Card.
  const cabecera = (
    <CabeceraAgendaSemanal
      fechaInicio={fechaInicio}
      fechaFin={fechaFin}
      esSemanaActual={esSemanaActual}
      onSemanaAnterior={onSemanaAnterior}
      onSemanaSiguiente={onSemanaSiguiente}
      onSemanaActual={onSemanaActual}
      onIrTemporizacion={onIrTemporizacion}
    />
  );

  // Construcción del pie del Card con métricas de resumen y enlace directo.
  const pie = (
    <div className="pt-2 border-top-1 surface-border flex flex-column sm:flex-row justify-content-between align-items-center gap-2">
      <span className="text-xs text-color-secondary">
        {modulosConAgenda.length}{' '}
        {modulosConAgenda.length === 1 ? 'módulo activo' : 'módulos activos'} ·{' '}
        {totalUnidades}{' '}
        {totalUnidades === 1 ? 'unidad a impartir' : 'unidades a impartir'}
      </span>

      {onIrTemporizacion && (
        <Button
          label="Gestor de Temporización"
          icon="pi pi-arrow-right"
          iconPos="right"
          text
          size="small"
          onClick={onIrTemporizacion}
          className="p-0 text-xs"
        />
      )}
    </div>
  );

  return (
    <Card
      header={cabecera}
      footer={pie}
      className="surface-card border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between"
      pt={{
        body: { className: 'p-3 flex-1 flex flex-column justify-content-between' },
        content: { className: 'p-0 flex-1' }
      }}
    >
      {/* Contenido principal: esqueleto durante la carga o listado mediante DataView */}
      {cargando ? (
        <div className="py-2">
          <CargadorSeccion cargando={true} tipo="tarjetas" filas={3} columnas={1} />
        </div>
      ) : (
        <ListaAgendaSemanal
          modulosConAgenda={modulosConAgenda}
          onModuloClick={onModuloClick}
          onIrTemporizacion={onIrTemporizacion}
        />
      )}
    </Card>
  );
};

export default WidgetAgendaSemanal;

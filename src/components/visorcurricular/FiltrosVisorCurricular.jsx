import React, { useMemo } from 'react';
import { Button } from 'primereact/button';
import SelectorCiclo from '../common/SelectorCiclo.jsx';

/**
 * FiltrosVisorCurricular - Componente presentacional para los filtros del Visor Curricular.
 *
 * Responsabilidad Única: Renderizar el selector de Ciclo Formativo, los módulos del ciclo
 * en formato de tarjetas con siglas y tooltip en title, y el botón de exportación a PDF.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.ciclos=[]] - Lista de ciclos formativos disponibles.
 * @param {string|null} [props.cicloSeleccionadoId=null] - Identificador del ciclo formativo seleccionado.
 * @param {Function} props.onSeleccionarCicloId - Manejador al seleccionar un ciclo formativo.
 * @param {Array<Object>} [props.modulos=[]] - Lista completa de módulos profesionales.
 * @param {string|null} [props.moduloSeleccionadoId=null] - Identificador del módulo seleccionado.
 * @param {Function} props.onSeleccionarModuloId - Manejador al seleccionar un módulo profesional.
 * @param {boolean} [props.cargando=false] - Indicador de consulta de datos en curso.
 * @param {Function} props.onExportarPDF - Callback para generar y descargar el currículo en PDF.
 * @param {boolean} [props.puedeExportar=false] - Si está habilitado el botón de exportación.
 * @param {boolean} [props.exportandoPDF=false] - Indicador de generación de PDF en progreso.
 */
export const FiltrosVisorCurricular = ({
  ciclos = [],
  cicloSeleccionadoId = null,
  onSeleccionarCicloId,
  modulos = [],
  moduloSeleccionadoId = null,
  onSeleccionarModuloId,
  cargando = false,
  onExportarPDF,
  puedeExportar = false,
  exportandoPDF = false
}) => {
  // Filtrado reactivo de módulos pertenecientes exclusivamente al ciclo seleccionado
  const modulosFiltrados = useMemo(() => {
    if (!cicloSeleccionadoId) return [];
    return modulos.filter((m) => m.id_ciclo === cicloSeleccionadoId);
  }, [modulos, cicloSeleccionadoId]);

  return (
    <div className="surface-card border-round p-3 md:p-4 border-1 surface-border shadow-1 mb-4 flex flex-column gap-3">
      {/* Fila superior: Selector de Ciclo Formativo y Botón de Exportar PDF */}
      <div className="grid align-items-end">
        <div className="col-12 md:col-6 lg:col-5">
          <label htmlFor="selectorCicloCurriculo" className="block text-900 font-semibold text-sm mb-2">
            <i className="pi pi-briefcase text-primary mr-1" />
            Ciclo Formativo
          </label>
          <SelectorCiclo
            id="selectorCicloCurriculo"
            value={cicloSeleccionadoId}
            options={ciclos}
            onChange={(e) => {
              onSeleccionarCicloId(e.value);
              onSeleccionarModuloId(null);
            }}
            loading={cargando}
            placeholder="Selecciona un ciclo formativo..."
            className="w-full"
          />
        </div>

        <div className="col-12 md:col-6 lg:col-7 flex justify-content-start md:justify-content-end align-items-end mt-2 md:mt-0">
          <Button
            type="button"
            label="Exportar PDF"
            icon="pi pi-file-pdf"
            severity="danger"
            className="p-button-sm font-semibold"
            onClick={onExportarPDF}
            disabled={!puedeExportar || exportandoPDF}
            loading={exportandoPDF}
            tooltip={
              !puedeExportar
                ? 'Selecciona un módulo con currículo para exportar'
                : 'Descargar currículo oficial en PDF'
            }
            tooltipOptions={{ position: 'top' }}
          />
        </div>
      </div>

      {/* Fila inferior: Tarjetas de módulos profesionales correspondientes al ciclo */}
      {cicloSeleccionadoId && (
        <div className="flex flex-column gap-2 pt-2 border-top-1 surface-border">
          <label className="text-xs font-semibold text-color-secondary uppercase tracking-wider">
            Módulos Profesionales del Ciclo:
          </label>

          {modulosFiltrados.length > 0 ? (
            <div className="flex align-items-center gap-2 flex-wrap">
              {modulosFiltrados.map((m) => {
                const esActivo = m.id_modulo === moduloSeleccionadoId;
                const siglasModulo = m.siglas || m.nombre;
                const nombreCompleto = m.nombre;

                return (
                  <Button
                    key={m.id_modulo}
                    type="button"
                    label={siglasModulo}
                    icon={esActivo ? 'pi pi-check' : 'pi pi-book'}
                    severity={esActivo ? 'primary' : 'secondary'}
                    outlined={!esActivo}
                    onClick={() => onSeleccionarModuloId(m.id_modulo)}
                    disabled={cargando}
                    title={nombreCompleto}
                    tooltip={nombreCompleto}
                    tooltipOptions={{ position: 'top' }}
                    className={`p-button-sm transition-all transition-duration-150 ${
                      esActivo ? 'shadow-2 font-bold' : ''
                    }`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="surface-ground p-2 border-round text-color-secondary text-sm font-italic">
              No se encontraron módulos profesionales registrados para el ciclo seleccionado.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FiltrosVisorCurricular;

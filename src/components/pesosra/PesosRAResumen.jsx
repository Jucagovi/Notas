import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { Dialog } from 'primereact/dialog';

// Panel de validación y control de acciones para la ponderación de Resultados de Aprendizaje y Criterios de Evaluación
const PesosRAResumen = ({
  sumaTotalPesosRA = 0,
  esSumaRABalanceada = false,
  rasConInconsistencias = [],
  esValidoGlobal = false,
  hayCambiosSinGuardar = false,
  guardando = false,
  repartirEquitativamenteRA = () => {},
  repartirEquitativamenteTodosCE = () => {},
  repartirEquitativamenteCE = () => {},
  restablecerValores = () => {},
  guardarPonderacion = () => {}
}) => {
  // Estado para el modal de confirmación al guardar ponderaciones incompletas
  const [dialogoConfirmacionVisible, setDialogoConfirmacionVisible] = useState(false);

  // Se verifica si todos los CEs de cada RA están balanceados al 100%
  const estanCEsBalanceados = rasConInconsistencias.length === 0;

  // Se gestiona la acción de guardado, abriendo confirmación si la ponderación es incompleta
  const manejarClickGuardar = () => {
    if (esValidoGlobal) {
      guardarPonderacion();
    } else {
      setDialogoConfirmacionVisible(true);
    }
  };

  // Se confirma el guardado incompleto cerrando el diálogo y ejecutando la persistencia
  const confirmarGuardadoIncompleto = async () => {
    setDialogoConfirmacionVisible(false);
    await guardarPonderacion();
  };

  return (
    <div className="surface-card p-3 border-round shadow-1 mb-4 flex flex-column gap-3">
      {/* 1. Indicador de Ponderación global del módulo con barra de progreso debajo del título */}
      <div
        className={`surface-card p-3 border-round border-1 ${
          esSumaRABalanceada ? 'border-green-500' : 'border-red-500'
        } flex flex-column gap-2`}
      >
        <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
          <div className="flex flex-wrap align-items-center gap-2">
            <i
              className={`pi ${
                esSumaRABalanceada
                  ? 'pi-check-circle text-green-400'
                  : 'pi-exclamation-circle text-red-400'
              } text-base`}
            />
            <span className="text-sm font-bold text-white" style={{ color: '#ffffff' }}>
              Ponderación global del módulo (Suma de RAs):
            </span>
            <span className="text-xs text-white" style={{ color: '#ffffff' }}>
              {esSumaRABalanceada
                ? 'La suma de los Resultados de Aprendizaje es exactamente del 100%.'
                : sumaTotalPesosRA > 100
                ? `La suma supera el 100% (exceso de ${sumaTotalPesosRA - 100}%).`
                : `La suma es insuficiente (falta un ${100 - sumaTotalPesosRA}% para completar el 100%).`}
            </span>
          </div>

          <span
            className={`text-sm font-bold ${
              esSumaRABalanceada ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {sumaTotalPesosRA}% / 100%
          </span>
        </div>

        {/* Barra de progreso de ponderación global debajo del título */}
        <ProgressBar
          value={Math.min(100, sumaTotalPesosRA)}
          showValue={false}
          color={esSumaRABalanceada ? 'var(--green-500, #22c55e)' : 'var(--red-500, #ef4444)'}
          style={{ height: '6px' }}
        />
      </div>

      {/* 2. Indicador de Ponderación de criterios y listado de RA incompletos */}
      <div
        className={`surface-card p-3 border-round border-1 ${
          estanCEsBalanceados ? 'border-green-500' : 'border-red-500'
        } flex flex-column gap-2`}
      >
        <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
          <div className="flex flex-wrap align-items-center gap-2">
            <i
              className={`pi ${
                estanCEsBalanceados
                  ? 'pi-verified text-green-400'
                  : 'pi-exclamation-triangle text-red-400'
              } text-base`}
            />
            <span className="text-sm font-bold text-white" style={{ color: '#ffffff' }}>
              Ponderación de criterios (CE en cada RA):
            </span>
            <span className="text-xs text-white" style={{ color: '#ffffff' }}>
              {estanCEsBalanceados
                ? 'Todos los Resultados de Aprendizaje tienen sus criterios sumando el 100%.'
                : `Existen ${rasConInconsistencias.length} Resultado${
                    rasConInconsistencias.length === 1 ? '' : 's'
                  } de Aprendizaje con ponderación de criterios incompleta.`}
            </span>
          </div>

          <span
            className={`text-sm font-bold ${
              estanCEsBalanceados ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {estanCEsBalanceados
              ? 'CEs Balanceados'
              : `${rasConInconsistencias.length} RA Pendiente${
                  rasConInconsistencias.length === 1 ? '' : 's'
                }`}
          </span>
        </div>

        {/* Listado de RA incompletos mostrando número y descripción del RA truncada con tooltip */}
        {!estanCEsBalanceados && (
          <div className="pt-2 border-top-1 border-red-500 flex flex-column gap-2">
            <span className="text-xs font-bold text-white" style={{ color: '#ffffff' }}>
              Resultados de Aprendizaje pendientes de ajustar:
            </span>
            {rasConInconsistencias.map((item) => {
              const diferencia = item.sumaCE - 100;
              const mensajeDetalle =
                item.sumaCE > 100
                  ? `Suma actual: ${item.sumaCE}% (exceso de ${diferencia}%)`
                  : `Suma actual: ${item.sumaCE}% (falta un ${100 - item.sumaCE}%)`;

              // Se muestra prioritariamente la descripción del RA
              const descripcionRA = item.descripcion || item.nombre || `Resultado de Aprendizaje ${item.numero}`;

              return (
                <div
                  key={item.id_ra}
                  className="flex align-items-center justify-content-between surface-card p-2 px-3 border-round border-1 border-red-500 gap-3"
                  style={{ minWidth: 0 }}
                >
                  <div
                    className="flex align-items-center gap-2"
                    style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}
                  >
                    <span
                      className="font-bold text-xs bg-primary text-white border-round px-2 py-1 flex-shrink-0"
                      style={{ color: '#ffffff' }}
                    >
                      RA {item.numero}
                    </span>
                    <span
                      className="text-xs text-white font-medium cursor-help"
                      style={{
                        color: '#ffffff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        maxWidth: '100%'
                      }}
                      title={descripcionRA}
                    >
                      {descripcionRA}
                    </span>
                  </div>

                  <div className="flex align-items-center gap-2 flex-shrink-0 justify-content-end">
                    <span
                      className="text-xs font-semibold text-white flex align-items-center gap-1 flex-shrink-0"
                      style={{ color: '#ffffff' }}
                    >
                      <i className="pi pi-exclamation-circle text-red-400" />
                      {mensajeDetalle}
                    </span>
                    <Button
                      type="button"
                      label="Asignar % CE"
                      icon="pi pi-sliders-h"
                      size="small"
                      severity="secondary"
                      text
                      className="p-1 px-2 text-xs text-white flex-shrink-0"
                      onClick={() => repartirEquitativamenteCE(item.id_ra)}
                      tooltip={`Distribuir 100% equitativamente entre los ${item.totalCE} CE del RA ${item.numero}`}
                      tooltipOptions={{ position: 'top' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Barra inferior con botones alineados a la derecha y alerta de cambios pendientes debajo de Guardar */}
      <div className="flex flex-column sm:flex-row sm:align-items-start sm:justify-content-between gap-3 pt-2 border-top-1 surface-border">
        {/* Botón de restablecer a la izquierda */}
        <div>
          <Button
            type="button"
            label="Restablecer"
            icon="pi pi-undo"
            size="small"
            severity="secondary"
            text
            disabled={!hayCambiosSinGuardar}
            onClick={restablecerValores}
            tooltip="Restablecer a los valores guardados en la base de datos"
            tooltipOptions={{ position: 'top' }}
          />
        </div>

        {/* Botones de acción alineados a la derecha con el botón de guardar coloreado en rojo si hay cambios */}
        <div className="flex flex-column align-items-end gap-1">
          <div className="flex flex-wrap align-items-center gap-2 justify-content-end">
            <Button
              type="button"
              label="Asignar % RA"
              icon="pi pi-sliders-h"
              size="small"
              severity="secondary"
              outlined
              onClick={repartirEquitativamenteRA}
              tooltip="Distribuir el 100% equitativamente entre todos los Resultados de Aprendizaje"
              tooltipOptions={{ position: 'top' }}
            />

            <Button
              type="button"
              label="Asignar % CE"
              icon="pi pi-sitemap"
              size="small"
              severity="secondary"
              outlined
              onClick={repartirEquitativamenteTodosCE}
              tooltip="Distribuir el 100% equitativamente entre los CE de cada RA"
              tooltipOptions={{ position: 'top' }}
            />

            <Button
              type="button"
              label="Guardar ponderación"
              icon="pi pi-save"
              severity={hayCambiosSinGuardar ? 'danger' : 'secondary'}
              size="small"
              loading={guardando}
              disabled={guardando || !hayCambiosSinGuardar}
              onClick={manejarClickGuardar}
              tooltip={
                !hayCambiosSinGuardar
                  ? 'No hay cambios pendientes por guardar'
                  : !esValidoGlobal
                  ? 'La ponderación contiene inconsistencias (se solicitará confirmación al guardar)'
                  : 'Guardar la configuración de ponderación para este curso'
              }
              tooltipOptions={{ position: 'top' }}
            />
          </div>

          {/* Alerta de cambios pendientes mostrada debajo del botón guardar */}
          {hayCambiosSinGuardar && (
            <span className="text-xs text-orange-500 font-semibold flex align-items-center gap-1 mt-1">
              <i className="pi pi-info-circle" /> Cambios pendientes de guardar
            </span>
          )}
        </div>
      </div>

      {/* Modal de confirmación al guardar ponderación incompleta */}
      <Dialog
        header="Confirmar Guardado de Ponderación Incompleta"
        visible={dialogoConfirmacionVisible}
        onHide={() => setDialogoConfirmacionVisible(false)}
        style={{ width: '90vw', maxWidth: '34rem' }}
        modal
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              severity="secondary"
              text
              onClick={() => setDialogoConfirmacionVisible(false)}
            />
            <Button
              label="Guardar de todos modos"
              icon="pi pi-check"
              severity="warning"
              loading={guardando}
              onClick={confirmarGuardadoIncompleto}
            />
          </div>
        }
      >
        <div className="flex flex-column gap-3 pt-2">
          <div className="flex align-items-start gap-3">
            <i className="pi pi-exclamation-triangle text-4xl text-warning flex-shrink-0 mt-1" />
            <div className="flex flex-column gap-2 text-sm">
              <p className="m-0 font-semibold text-color">
                La ponderación actual no está completamente balanceada al 100%:
              </p>
              <ul className="m-0 pl-3 text-muted flex flex-column gap-1 text-xs">
                {!esSumaRABalanceada && (
                  <li>
                    La suma total de los Resultados de Aprendizaje es del <strong>{sumaTotalPesosRA}%</strong> (debe ser del 100%).
                  </li>
                )}
                {rasConInconsistencias.length > 0 && (
                  <li>
                    Existen <strong>{rasConInconsistencias.length}</strong> RA con criterios pendientes de balancear:{' '}
                    {rasConInconsistencias.map((r) => `RA ${r.numero} (${r.sumaCE}%)`).join(', ')}.
                  </li>
                )}
              </ul>
              <p className="m-0 text-muted text-xs">
                ¿Desea guardar esta configuración incompleta para poder continuar con la asignación más adelante?
              </p>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default PesosRAResumen;

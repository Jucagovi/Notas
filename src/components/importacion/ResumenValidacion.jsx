import React from 'react';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';

// Componente presentacional para exhibir el resumen numérico de validación y las acciones de importación masiva.
const ResumenValidacion = ({
  resumen,
  cargando = false,
  onImportar,
  onLimpiar
}) => {
  const { total, validos, invalidos } = resumen;

  return (
    <div className="surface-card p-4 shadow-1 border-round flex flex-column gap-3">
      <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
        {/* Contadores estadísticos */}
        <div className="flex align-items-center gap-3 flex-wrap">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-list text-primary font-bold" />
            <span className="text-sm text-700">Total detectados:</span>
            <strong className="text-base text-900">{total}</strong>
          </div>

          <div className="flex align-items-center gap-2">
            <i className="pi pi-check-circle text-green-600 font-bold" />
            <span className="text-sm text-700">Registros válidos:</span>
            <strong className="text-base text-green-600">{validos}</strong>
          </div>

          <div className="flex align-items-center gap-2">
            <i className="pi pi-exclamation-circle text-red-600 font-bold" />
            <span className="text-sm text-700">Con errores:</span>
            <strong className="text-base text-red-600">{invalidos}</strong>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex align-items-center gap-2">
          <Button
            type="button"
            label="Descartar datos"
            icon="pi pi-trash"
            className="p-button-outlined p-button-secondary p-button-sm"
            onClick={onLimpiar}
            disabled={cargando || total === 0}
          />
          <Button
            type="button"
            label={`Importar ${validos} registro${validos === 1 ? '' : 's'}`}
            icon="pi pi-database"
            className="p-button-success p-button-sm"
            onClick={onImportar}
            loading={cargando}
            disabled={cargando || validos === 0 || invalidos > 0}
          />
        </div>
      </div>

      {/* Alerta contextual en caso de existir errores de validación */}
      {invalidos > 0 && (
        <Message
          severity="error"
          className="w-full justify-content-start"
          content={
            <div className="flex align-items-center gap-2">
              <i className="pi pi-times-circle text-red-500 text-lg" />
              <span className="text-sm">
                Se han detectado <strong>{invalidos}</strong> fila(s) con datos erróneos o incompletos.
                Las celdas afectadas se encuentran señaladas en color rojo con un mensaje explicativo.
                Corrija el archivo CSV o el texto de origen y vuelva a procesarlo para proceder con la importación.
              </span>
            </div>
          }
        />
      )}
    </div>
  );
};

export default ResumenValidacion;

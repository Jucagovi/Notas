import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tooltip } from 'primereact/tooltip';

// Componente presentacional para previsualizar los registros procesados con marcado visual de errores de validación.
const TablaVistaPrevia = ({
  filas = [],
  configTabla,
  cargando = false
}) => {
  if (!configTabla || filas.length === 0) {
    return null;
  }

  // Plantilla para la columna de número de fila y estado de validación
  const plantillaEstado = (fila) => {
    const claseId = `tooltip-estado-${fila.numeroFila}`;
    const errores = Object.values(fila.erroresPorCampo || {});

    if (fila.esValida) {
      return (
        <div className="flex align-items-center gap-2">
          <i className="pi pi-check-circle text-green-600 text-sm" />
          <span className="font-semibold text-xs text-700">#{fila.numeroFila}</span>
        </div>
      );
    }

    return (
      <div className="flex align-items-center gap-2">
        <Tooltip target={`.${claseId}`} position="top" content={errores.join(' | ')} />
        <i className={`${claseId} pi pi-exclamation-triangle text-red-600 text-sm cursor-pointer`} />
        <span className="font-semibold text-xs text-red-700">#{fila.numeroFila}</span>
      </div>
    );
  };

  // Generador de plantilla para las celdas de datos con soporte de truncado y advertencia de error
  const crearPlantillaCelda = (campoConfig) => (fila) => {
    const error = fila.erroresPorCampo?.[campoConfig.campo];
    const valorLimpio = fila.datosLimpios?.[campoConfig.campo];
    const valorCrudo = fila.filaCruda?.[campoConfig.campo] ?? '';
    const claseId = `tooltip-celda-${fila.numeroFila}-${campoConfig.campo}`;

    // Si existe un error en esta celda específica, se destaca con fondo y borde rojo
    if (error) {
      const textoAMostrar = valorCrudo !== '' && valorCrudo !== null && valorCrudo !== undefined
        ? String(valorCrudo)
        : '(vacío)';

      return (
        <div className="w-full">
          <Tooltip target={`.${claseId}`} position="top" content={error} />
          <div
            className={`${claseId} flex align-items-center gap-1 bg-red-100 border-1 border-red-400 border-round px-2 py-1 text-red-900 cursor-pointer`}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%'
            }}
          >
            <i className="pi pi-times-circle text-red-600 text-xs flex-shrink-0" />
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {textoAMostrar}
            </span>
          </div>
        </div>
      );
    }

    // Formateo visual específico para booleanos
    if (campoConfig.tipo === 'booleano') {
      const esVerdadero = valorLimpio === true;
      return (
        <span className={`text-xs font-semibold px-2 py-1 border-round ${esVerdadero ? 'text-green-700 bg-green-50' : 'text-500 bg-gray-100'}`}>
          {esVerdadero ? 'Sí' : 'No'}
        </span>
      );
    }

    // Valores nulos o no suministrados
    if (valorLimpio === null || valorLimpio === undefined || valorLimpio === '') {
      return <span className="text-400 font-italic text-xs">-</span>;
    }

    const texto = String(valorLimpio);

    return (
      <div className="w-full">
        <Tooltip target={`.${claseId}`} position="top" content={texto} />
        <div
          className={`${claseId} text-sm text-900`}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            cursor: 'default'
          }}
        >
          {texto}
        </div>
      </div>
    );
  };

  // Clase CSS condicional por fila para distinguir aquellas con errores
  const filaClassName = (fila) => {
    return !fila.esValida ? 'bg-red-50' : '';
  };

  return (
    <div className="flex flex-column gap-3 w-full">
      <div className="flex align-items-center justify-content-between">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-eye text-primary" />
          <h3 className="text-base font-bold text-900 m-0">
            Vista previa de datos ({filas.length} registros)
          </h3>
        </div>
        <span className="text-xs text-500">
          Revisa que las columnas correspondan con los campos requeridos antes de guardar.
        </span>
      </div>

      <DataTable
        value={filas}
        loading={cargando}
        paginator
        paginatorPosition="top"
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        emptyMessage="No se han cargado datos para previsualizar."
        stripedRows
        responsiveLayout="scroll"
        className="p-datatable-sm"
        rowClassName={filaClassName}
      >
        <Column
          header="#"
          body={plantillaEstado}
          style={{ width: '90px', minWidth: '90px' }}
          frozen
        />
        {configTabla.campos.map((campo) => (
          <Column
            key={campo.campo}
            header={
              <span>
                {campo.etiqueta}
                {campo.requerido && <span className="text-red-500 font-bold ml-1">*</span>}
              </span>
            }
            body={crearPlantillaCelda(campo)}
            style={{ minWidth: campo.tipo === 'fecha' ? '140px' : campo.tipo === 'booleano' ? '100px' : '180px' }}
          />
        ))}
      </DataTable>
    </div>
  );
};

export default TablaVistaPrevia;

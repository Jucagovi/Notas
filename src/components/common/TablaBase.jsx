import React from 'react';
import { DataTable } from 'primereact/datatable';

/**
 * TablaBase - Componente presentacional contenedor para tablas de datos (DataTable).
 *
 * Responsabilidad Única: Centralizar la configuración predeterminada de DataTable
 * (paginador con 10 filas, opciones por página, mensaje de vacío, estado de carga y diseño responsivo).
 *
 * Uso:
 * ```jsx
 * <TablaBase data={misDatos} loading={cargando}>
 *   <Column field="nombre" header="Nombre" />
 *   <Column field="siglas" header="Siglas" />
 * </TablaBase>
 * ```
 *
 * @param {Object} props
 * @param {Array<Object>} [props.data] - Conjunto de datos a mostrar (alias de value).
 * @param {Array<Object>} [props.value] - Conjunto de datos a mostrar.
 * @param {boolean} [props.loading=false] - Indicador de estado de carga.
 * @param {boolean} [props.paginator=true] - Activar paginación.
 * @param {number} [props.rows=10] - Cantidad de filas por página por defecto.
 * @param {Array<number>} [props.rowsPerPageOptions=[5, 10, 20, 50]] - Opciones de paginación.
 * @param {string|React.ReactNode} [props.emptyMessage='No hay registros'] - Mensaje si no hay datos.
 * @param {boolean} [props.stripedRows=true] - Filas alternadas.
 * @param {string} [props.responsiveLayout='scroll'] - Modo de respuesta responsiva.
 * @param {string} [props.className='p-datatable-sm'] - Clases CSS complementarias.
 * @param {React.ReactNode} props.children - Elementos Column de PrimeReact u otros hijos válidos.
 */
export const TablaBase = ({
  data,
  value,
  loading = false,
  paginator = true,
  rows = 10,
  rowsPerPageOptions = [5, 10, 20, 50],
  emptyMessage = 'No hay registros',
  stripedRows = true,
  responsiveLayout = 'scroll',
  className = 'p-datatable-sm',
  children,
  ...restoProps
}) => {
  const datosEfectivos = data !== undefined ? data : (value || []);

  return (
    <DataTable
      value={datosEfectivos}
      loading={loading}
      paginator={paginator}
      rows={rows}
      rowsPerPageOptions={rowsPerPageOptions}
      emptyMessage={emptyMessage}
      stripedRows={stripedRows}
      responsiveLayout={responsiveLayout}
      className={className}
      {...restoProps}
    >
      {children}
    </DataTable>
  );
};

export default TablaBase;

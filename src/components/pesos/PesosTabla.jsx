import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Slider } from 'primereact/slider';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

// Componente de tabla para visualizar y modificar de forma interactiva el peso porcentual de cada práctica
const PesosTabla = ({
  practicas = [],
  actualizarPeso = () => {},
  repartirEquitativamente = () => {},
  restablecerValores = () => {},
  guardarBalanceo = () => {},
  sumaTotalPesos = 0,
  esGuardable = false,
  guardando = false,
  cargando = false
}) => {
  // Plantilla para la columna de numeración de la práctica mostrando texto simple sin etiqueta
  const plantillaNumero = (rowData) => {
    return (
      <span className="font-semibold text-sm text-color">
        {rowData.numero || '-'}
      </span>
    );
  };

  // Plantilla para la columna del título y descripción de la práctica
  const plantillaNombre = (rowData) => {
    return (
      <div className="flex flex-column gap-1">
        <span className="font-bold text-color">{rowData.nombre}</span>
        {rowData.descripcion && (
          <span className="text-xs text-muted line-clamp-1">{rowData.descripcion}</span>
        )}
      </div>
    );
  };

  // Plantilla para la columna de discentes asignados
  const plantillaDiscentes = (rowData) => {
    return (
      <div className="flex align-items-center gap-1">
        <i className="pi pi-users text-muted text-xs" />
        <span className="text-sm">{rowData.totalDiscentes || 0} alumnos</span>
      </div>
    );
  };

  // Plantilla para la columna de edición del peso combinando un Slider de paso 1 con un InputNumber directo
  const plantillaPesoInput = (rowData) => {
    const valor = rowData.peso !== undefined && rowData.peso !== null ? Number(rowData.peso) : 0;

    return (
      <div className="flex align-items-center gap-3 justify-content-center px-2">
        {/* Control deslizante Slider con avance de 1 en 1 */}
        <Slider
          value={valor}
          onChange={(e) => actualizarPeso(rowData.id_practica, e.value)}
          min={0}
          max={100}
          step={1}
          className="w-full"
          style={{ minWidth: '120px' }}
          disabled={guardando}
        />

        {/* Campo numérico para ajuste manual exacto */}
        <InputNumber
          value={valor}
          onValueChange={(e) => actualizarPeso(rowData.id_practica, e.value)}
          min={0}
          max={100}
          suffix="%"
          inputClassName="text-center font-bold text-sm"
          style={{ width: '75px', minWidth: '75px' }}
          disabled={guardando}
        />
      </div>
    );
  };

  // Barra de herramientas superior de la tabla con acciones de guardado y distribución
  const cabeceraTabla = (
    <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-3 p-2">
      <div className="flex align-items-center gap-2">
        <i className="pi pi-list text-primary text-xl" />
        <div>
          <span className="font-bold text-lg block text-color" style={{ color: 'var(--text-color)' }}>
            Prácticas Asignadas
          </span>
          <span className="text-xs text-color" style={{ color: 'var(--text-color)' }}>
            Ajuste el porcentaje con la barra deslizante (paso de 1%) o introduzca el valor exacto en el campo numérico.
          </span>
        </div>
      </div>

      <div className="flex flex-wrap align-items-center gap-2">
        {/* Botón para distribuir equitativamente el 100% */}
        <Button
          type="button"
          label="Repartir Equitativamente"
          icon="pi pi-sliders-h"
          size="small"
          onClick={repartirEquitativamente}
          disabled={practicas.length === 0 || guardando}
          className="boton-blanco-cabecera"
          tooltip="Distribuye el 100% de forma proporcional entre todas las prácticas"
          tooltipOptions={{ position: 'top' }}
        />

        {/* Botón para restablecer a los valores almacenados en BD */}
        <Button
          type="button"
          label="Restablecer"
          icon="pi pi-undo"
          size="small"
          onClick={restablecerValores}
          disabled={guardando}
          className="boton-blanco-cabecera"
          tooltip="Vuelve a los valores guardados actualmente en la base de datos"
          tooltipOptions={{ position: 'top' }}
        />

        {/* Botón principal de guardado masivo de balanceo */}
        <Button
          type="button"
          label="Guardar Balanceo"
          icon="pi pi-save"
          severity="success"
          size="small"
          loading={guardando}
          disabled={!esGuardable}
          onClick={guardarBalanceo}
          tooltip={
            esGuardable
              ? 'Guarda la asignación de pesos en la base de datos'
              : 'Solo se puede guardar cuando la suma total sea exactamente 100%'
          }
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    </div>
  );

  // Pie de la tabla con el resumen total acumulado respetando el esquema de colores del tema
  const pieTabla = (
    <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2 text-sm text-color font-semibold">
      <div className="flex align-items-center gap-2">
        <span>Total de prácticas: {practicas.length}</span>
      </div>

      <div className="flex align-items-center gap-3">
        <span className="text-muted">Suma total de pesos:</span>
        <Tag
          value={`${sumaTotalPesos}% / 100%`}
          severity={sumaTotalPesos === 100 ? 'success' : sumaTotalPesos > 100 ? 'danger' : 'warning'}
          className="text-base px-3 py-1 font-bold"
        />
      </div>
    </div>
  );

  return (
    <div className="surface-card border-round shadow-1 border-1 surface-border overflow-hidden">
      <DataTable
        value={practicas}
        header={cabeceraTabla}
        footer={pieTabla}
        loading={cargando || guardando}
        emptyMessage="No hay prácticas vinculadas a esta evaluación."
        responsiveLayout="stack"
        breakpoint="768px"
        stripedRows
        className="p-datatable-sm"
      >
        <Column
          field="numero"
          header="Nº"
          body={plantillaNumero}
          style={{ width: '70px', textAlign: 'center' }}
        />
        <Column
          field="nombre"
          header="Práctica"
          body={plantillaNombre}
          style={{ minWidth: '220px' }}
        />
        <Column
          field="totalDiscentes"
          header="Discentes"
          body={plantillaDiscentes}
          style={{ width: '130px' }}
        />
        <Column
          field="peso"
          header="Peso Asignado (%)"
          body={plantillaPesoInput}
          headerClassName="text-center"
          style={{ minWidth: '240px', width: '320px' }}
        />
      </DataTable>
    </div>
  );
};

export default PesosTabla;

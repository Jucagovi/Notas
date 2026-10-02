import React, { useState } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import TablaBase from '../common/TablaBase.jsx';
import BotonAccion from '../common/BotonAccion.jsx';
import BarraHerramientasTabla from './BarraHerramientasTabla.jsx';
import CeldaTruncada from './CeldaTruncada.jsx';

// Componente presentacional que renderiza la tabla de datos principal con ordenación, paginación y acciones.
const TablaMantenimiento = ({
  datos,
  columnas,
  cargando,
  opcionesReferencia = {},
  onNuevo,
  onEditar,
  onEliminar,
  onActualizar,
  etiquetaSingular = 'Registro'
}) => {
  const [filtroGlobal, setFiltroGlobal] = useState('');

  // Resuelve el texto descriptivo de campos con clave foránea mediante las referencias cargadas.
  const renderizarCelda = (fila, columna) => {
    const valor = fila[columna.campo];

    if (columna.tipo === 'booleano') {
      return (
        <Tag
          severity={valor ? 'success' : 'danger'}
          value={valor ? 'Activo' : 'Inactivo'}
        />
      );
    }

    if (columna.tipo === 'fecha') {
      if (!valor) return <span className="text-400 font-italic">-</span>;
      const fechaFormateada = new Date(valor).toLocaleDateString('es-ES');
      return <span>{fechaFormateada}</span>;
    }

    if (columna.tipo === 'relacion' && columna.tablaReferencia) {
      const opciones = opcionesReferencia[columna.tablaReferencia] || [];
      const encontrado = opciones.find((op) => op.value === valor);
      const textoAMostrar = encontrado ? encontrado.label : valor;
      return <CeldaTruncada valor={textoAMostrar} anchoMaximo="100%" />;
    }

    return <CeldaTruncada valor={valor} anchoMaximo="100%" />;
  };

  // Plantilla para la columna de botones de acción por cada fila.
  const plantillaAcciones = (fila) => {
    return (
      <div className="flex align-items-center justify-content-center gap-1">
        <Button
          icon="pi pi-pencil"
          severity="primary"
          text
          rounded
          onClick={() => onEditar(fila)}
          tooltip="Editar registro"
          tooltipOptions={{ position: 'top' }}
          aria-label="Editar"
        />
        <BotonAccion
          tipo="eliminar"
          icon="pi pi-trash"
          text
          rounded
          onClick={() => onEliminar(fila)}
          tooltip="Eliminar registro"
          tooltipOptions={{ position: 'top' }}
          aria-label="Eliminar"
        />
      </div>
    );
  };

  const cabecera = (
    <BarraHerramientasTabla
      filtroGlobal={filtroGlobal}
      onCambioFiltro={setFiltroGlobal}
      onNuevo={onNuevo}
      onActualizar={onActualizar}
      cargando={cargando}
      totalRegistros={datos ? datos.length : 0}
      etiquetaNuevo={`Nuevo ${etiquetaSingular}`}
    />
  );

  return (
    <div className="card border-round shadow-1 p-0 surface-card">
      <TablaBase
        data={datos}
        loading={cargando}
        paginator
        paginatorPosition="top"
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        globalFilter={filtroGlobal}
        header={cabecera}
        emptyMessage="No se han encontrado registros."
        responsiveLayout="scroll"
        stripedRows
        showGridlines
        tableStyle={{ minWidth: '100%' }}
      >
        {columnas.map((col) => (
          <Column
            key={col.campo}
            field={col.campo}
            header={col.encabezado}
            sortable={col.ordenar !== false}
            style={{ width: col.ancho || 'auto', minWidth: col.ancho || '80px' }}
            body={(fila) => renderizarCelda(fila, col)}
          />
        ))}

        <Column
          body={plantillaAcciones}
          header="Acciones"
          exportable={false}
          style={{ width: '80px', minWidth: '80px', textAlign: 'center' }}
        />
      </TablaBase>
    </div>
  );
};

export default TablaMantenimiento;

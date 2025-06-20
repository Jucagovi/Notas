import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import useDatos from "../../hooks/useDatos.js";

const CrearClaseDataTable = ({ valoresSeleccionados, setter }) => {
  const [filtros, setFiltros] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    apellidos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  // Para el formulario controlado de la búsqueda.
  const [valoresFiltro, setValoresFiltro] = useState("");

  const { discentes } = useDatos();

  const filtrarDatos = (e) => {
    const value = e.target.value;
    let _filtros = { ...filtros };
    _filtros["global"].value = value;
    setFiltros(_filtros);
    setValoresFiltro(value);
  };

  const limpiarFiltro = () => {
    setFiltros({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      apellidos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    });
    setValoresFiltro("");
  };

  const dibujarCabeceraBusqueda = () => {
    //className='flex justify-content-between'
    return (
      <div className='flex justify-content-end'>
        <IconField iconPosition='left'>
          <InputIcon className='pi pi-search' />
          <InputText
            value={valoresFiltro}
            onChange={(e) => {
              filtrarDatos(e);
            }}
            placeholder='Buscar...'
          />
        </IconField>
        <Button
          type='button'
          icon='pi pi-filter-slash'
          label=''
          text
          onClick={() => {
            limpiarFiltro();
          }}
        />
      </div>
    );
  };
  return (
    <DataTable
      paginator
      rows={10}
      value={discentes}
      selectionMode={null}
      selection={valoresSeleccionados}
      removableSort
      filters={filtros}
      globalFilterFields={["nombre", "apellidos"]}
      onSelectionChange={(e) => setter(e.value)}
      dataKey='id_discente'
      //tableStyle={{ minWidth: "50rem" }}
      header={dibujarCabeceraBusqueda}
      emptyMessage='No hay resultados'
    >
      <Column selectionMode='multiple' headerStyle={{ width: "3rem" }}></Column>
      <Column field='nombre' header='Nombre' sortable></Column>
      <Column field='apellidos' header='Apellidos' sortable></Column>
      <Column field='localidad' header='Localidad'></Column>
    </DataTable>
  );
};

export default CrearClaseDataTable;

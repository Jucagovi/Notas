import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { useNavigate } from "react-router-dom";
import useDatos from "../../hooks/useDatos.js";
import useEstilos from "../../hooks/useEstilos.js";

const DiscentesListadoDataTable = ({ referencia }) => {
  const { discentes } = useDatos();
  const { iconos, calcularEdad } = useEstilos();

  const navegar = useNavigate();

  const [filtros, setFiltros] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    apellidos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });
  const [valoresFiltro, setValoresFiltro] = useState(""); // Para el formulario controlado de la búsqueda.

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

  const mostrarNombreCompleto = (options) => {
    return (
      <div className='flex align-items-center gap-2'>
        <i className={iconos.usuario} style={{ fontSize: "1rem" }}></i>{" "}
        <span>
          {options.apellidos}, {options.nombre}
        </span>
      </div>
    );
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
    <>
      <DataTable
        value={discentes}
        ref={referencia}
        //showGridlines
        //size='small'
        loading={false}
        paginator
        paginatorPosition='top'
        rows={15}
        //resizableColumns
        removableSort
        dataKey='id_discente'
        columnResizeMode='expand'
        //tableStyle={{ maxWidth: "60rem" }}
        selectionMode='single'
        //selection={discente}
        onRowSelect={(e) => {
          navegar(`/detallediscente/${e.data.id_discente}`);
        }}
        filters={filtros}
        //filterDisplay='row'
        globalFilterFields={["nombre", "apellidos"]}
        header={dibujarCabeceraBusqueda()}
        emptyMessage='No hay resultados'
      >
        <Column
          field='apellidos'
          header='Nombre'
          sortable
          body={(options) => {
            return mostrarNombreCompleto(options);
          }}
        ></Column>
        <Column field='correo' header='Correo electrónico'></Column>
        <Column field='localidad' header='Localidad'></Column>
        <Column
          field='fecha_nac'
          header='Edad'
          sortable
          body={(options) => {
            return calcularEdad(options.fecha_nac);
          }}
          bodyStyle={{ textAlign: "center" }}
        ></Column>
      </DataTable>
    </>
  );
};

export default DiscentesListadoDataTable;

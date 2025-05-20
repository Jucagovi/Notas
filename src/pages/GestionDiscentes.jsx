import React, { useRef, useState } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import useEstilos from "../hooks/useEstilos.js";
import useDatos from "../hooks/useDatos.js";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { confirmDialog } from "primereact/confirmdialog";
import { useNavigate } from "react-router-dom";
import ValorEstado from "../components/complementos/ValorEstado.jsx";

const GestionDiscentes = () => {
  const { iconos, calcularEdad, exportarCSV } = useEstilos();
  const { discente, discentes } = useDatos();

  const [filtros, setFiltros] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    nombre: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    apellidos: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });
  const [valoresFiltro, setValoresFiltro] = useState(""); // Para el formulario controlado de la búsqueda.

  const dataTableRef = useRef(null);
  const navegar = useNavigate();

  /**********************************************
   * Funciones para los body de las columnas.
   */

  const mostrarAcciones = (options) => {
    return (
      <Button
        type='button'
        icon={iconos.archivo}
        onClick={() => {
          navegar(`/detallediscente/${options.id_discente}`);
        }}
        text
      />
    );
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

  /** Funciones para el formulario de búsqueda.
   *
   *
   */

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
  //p-inputgroup flex-1
  return (
    <ColumnaSimple>
      <div>
        <div className='flex justify-content-between'>
          <h2>
            <i className={iconos.usuario} style={{ fontSize: "1.2rem" }}></i>{" "}
            Gestión de discentes
          </h2>
          <Button
            type='button'
            icon={iconos.archivo}
            text
            severity='secondary'
            onClick={() => {
              exportarCSV(dataTableRef, false);
            }}
            tooltip='Exportar a CSV'
            tooltipOptions={{ position: "left" }}
          />
        </div>
        <DataTable
          value={discentes}
          ref={dataTableRef}
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
      </div>
    </ColumnaSimple>
  );
};

export default GestionDiscentes;

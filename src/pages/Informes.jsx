import React, { useEffect, useState } from "react";
import ColumnaSimple from "../layout/ColumnaSimple.jsx";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import ValorEstado from "../components/complementos/ValorEstado.jsx";

const Informes = () => {
  const listadoProductos = [
    {
      id: "1000",
      code: "f230fh0g3",
      name: "Bamboo Watch",
      description: "Product Description",
      image: "bamboo-watch.jpg",
      price: 65,
      category: "Accessories",
      quantity: 24,
      inventoryStatus: "INSTOCK",
      rating: 5,
    },
    {
      id: "1001",
      code: "f230fh0g3",
      name: "FEo1",
      description: "Product Description",
      image: "bamboo-watch.jpg",
      price: 65,
      category: "Accessories",
      quantity: 24,
      inventoryStatus: "INSTOCK",
      rating: 5,
    },
    {
      id: "1002",
      code: "f230fh0g3",
      name: "Feo2",
      description: "Product Description",
      image: "bamboo-watch.jpg",
      price: 65,
      category: "Accessories",
      quantity: 24,
      inventoryStatus: "INSTOCK",
      rating: 5,
    },
    {
      id: "1003",
      code: "f230fh0g3",
      name: "Feo3h",
      description: "Product Description",
      image: "bamboo-watch.jpg",
      price: 65,
      category: "Accessories",
      quantity: 24,
      inventoryStatus: "INSTOCK",
      rating: 5,
    },
    {
      id: "1004",
      code: "f230fh0g3",
      name: "Feo 4h",
      description: "Product Description",
      image: "bamboo-watch.jpg",
      price: 65,
      category: "Accessories",
      quantity: 24,
      inventoryStatus: "INSTOCK",
      rating: 5,
    },
  ];
  const [products, setProducts] = useState(listadoProductos);
  const [statuses, setStatuses] = useState([
    "INSTOCK",
    "LOWSTOCK",
    "OUTOFSTOCK",
  ]);

  const getSeverity = (value) => {
    switch (value) {
      case "INSTOCK":
        return "success";

      case "LOWSTOCK":
        return "warning";

      case "OUTOFSTOCK":
        return "danger";

      default:
        return null;
    }
  };

  const onRowEditComplete = (e) => {
    let _products = [...products];
    let { newData, index } = e;

    _products[index] = newData;

    setProducts(_products);
  };

  const textEditor = (options) => {
    return (
      <InputText
        type='text'
        value={options.value}
        onChange={(e) => options.editorCallback(e.target.value)}
      />
    );
  };

  const statusEditor = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={statuses}
        onChange={(e) => options.editorCallback(e.value)}
        placeholder='Select a Status'
        itemTemplate={(option) => {
          return <Tag value={option} severity={getSeverity(option)}></Tag>;
        }}
      />
    );
  };

  const priceEditor = (options) => {
    return (
      <InputNumber
        value={options.value}
        onValueChange={(e) => options.editorCallback(e.value)}
        mode='currency'
        currency='EUR'
        locale='es-ES'
      />
    );
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.inventoryStatus}
        severity={getSeverity(rowData.inventoryStatus)}
      ></Tag>
    );
  };

  const priceBodyTemplate = (rowData) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(rowData.price);
  };

  const allowEdit = (rowData) => {
    return rowData.name !== "Blue Band";
  };

  return (
    <div>
      <ColumnaSimple>
        <h2>Informes sobre las notas.</h2>
        <ColumnaSimple>
          <DataTable
            value={products}
            editMode='row'
            dataKey='id'
            onRowEditComplete={onRowEditComplete}
            tableStyle={{ minWidth: "50rem" }}
          >
            <Column
              field='code'
              header='Code'
              editor={(options) => textEditor(options)}
              style={{ width: "20%" }}
            ></Column>
            <Column
              field='name'
              header='Name'
              editor={(options) => textEditor(options)}
              style={{ width: "20%" }}
            ></Column>
            <Column
              field='inventoryStatus'
              header='Status'
              body={statusBodyTemplate}
              editor={(options) => statusEditor(options)}
              style={{ width: "20%" }}
            ></Column>
            <Column
              field='price'
              header='Price'
              body={priceBodyTemplate}
              editor={(options) => priceEditor(options)}
              style={{ width: "20%" }}
            ></Column>
            <Column
              rowEditor={allowEdit}
              headerStyle={{ width: "10%", minWidth: "8rem" }}
              bodyStyle={{ textAlign: "center" }}
            ></Column>
          </DataTable>
        </ColumnaSimple>
        <div>
          <ValorEstado estadoaMostrar={products} />
        </div>
      </ColumnaSimple>
    </div>
  );
};

export default Informes;

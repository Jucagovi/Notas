import React, { useState } from "react";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import useEstilos from "../../hooks/useEstilos.js";
import useDatos from "../../hooks/useDatos.js";

const FormCrearModulos = ({ funcion }) => {
  const { iconos } = useEstilos();
  const { modulo, cambiarModulo, actualizarFormulario, ciclos } = useDatos();

  //  REVISAR !!!!!!!!!!!!!!!!!!!!!!!!!
  //  El DropDown no muestra el valor seleccionado.
  const [siglasCiclo, setSiglasCiclo] = useState("");

  const mostrarSiglasCiclos = (evento) => {
    const ciclo = ciclos.filter((c) => c.id_ciclo === evento.target.value);
    setSiglasCiclo(ciclo[0].siglas);
  };

  return (
    <div className='card gap-3 m-1'>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.modulo}></i>
        </span>
        <FloatLabel>
          <InputText
            id='nombreModulo'
            className='p-inputtext-sm'
            name='nombre'
            value={modulo.nombre || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, modulo, cambiarModulo);
            }}
          />
          <label htmlFor='nombreModulo'>Nombre del módulo</label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.siglas}></i>
        </span>
        <FloatLabel>
          <InputText
            id='siglasModulo'
            name='siglas'
            value={modulo.siglas || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, modulo, cambiarModulo);
            }}
          />
          <label htmlFor='siglasModulo'>Siglas del módulo</label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.descripcion}></i>
        </span>
        <FloatLabel>
          <InputText
            id='descripcionModulo'
            name='descripcion'
            value={modulo.descripcion || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, modulo, cambiarModulo);
            }}
          />
          <label htmlFor='descripcionModulo'>Descripción del módulo</label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.ciclo}></i>
        </span>
        <FloatLabel>
          <Dropdown
            id='cicloModulo'
            name='id_ciclo'
            value={siglasCiclo}
            options={ciclos}
            optionLabel='siglas'
            onChange={(evento) => {
              // Cambio de value para evitar guardar el objeto entero
              // y no tener que modificar la función actualizarFormulario.
              evento.target.value = evento.target.value.id_ciclo;
              actualizarFormulario(evento, modulo, cambiarModulo);
              mostrarSiglasCiclos(evento);
            }}
            placeholder={siglasCiclo}
          />
          <label htmlFor='cicloModulo'>Ciclo donde se imparte el módulo</label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 justify-content-end herramientasModulos_input'>
        <Button
          label='Crear módulo'
          icon={iconos.aceptar}
          onClick={() => {
            funcion();
          }}
        />
      </div>
    </div>
  );
};

export default FormCrearModulos;

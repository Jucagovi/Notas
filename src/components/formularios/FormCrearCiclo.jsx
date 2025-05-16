import React, { useState } from "react";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import useEstilos from "../../hooks/useEstilos.js";
import useDatos from "../../hooks/useDatos.js";

const FormCrearCiclo = ({ funcion }) => {
  const { iconos } = useEstilos();
  const { ciclo, cambiarCiclo, actualizarFormulario } = useDatos();

  return (
    <div className='card gap-3 m-1'>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.ciclo}></i>
        </span>
        <FloatLabel>
          <InputText
            id='nombreModulo'
            className='p-inputtext-sm'
            name='nombre'
            value={ciclo.nombre || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, ciclo, cambiarCiclo);
            }}
          />
          <label htmlFor='nombreModulo'>Nombre del ciclo formativo</label>
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
            value={ciclo.siglas || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, ciclo, cambiarCiclo);
            }}
          />
          <label htmlFor='siglasModulo'>Siglas del ciclo formativo</label>
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
            value={ciclo.descripcion || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, ciclo, cambiarCiclo);
            }}
          />
          <label htmlFor='descripcionModulo'>
            Descripción del ciclo formativo
          </label>
        </FloatLabel>
      </div>

      <div className='p-inputgroup flex-1 justify-content-end herramientasModulos_input'>
        <Button
          label='Crear ciclo formativo'
          icon={iconos.aceptar}
          onClick={() => {
            funcion();
          }}
        />
      </div>
    </div>
  );
};

export default FormCrearCiclo;

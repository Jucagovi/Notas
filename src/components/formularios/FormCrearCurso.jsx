import React, { useState } from "react";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import useEstilos from "../../hooks/useEstilos.js";
import useDatos from "../../hooks/useDatos.js";

const FormCrearCurso = () => {
  const { iconos } = useEstilos();
  const { curso, cambiarCurso, actualizarFormulario } = useDatos();
  return (
    <div className='card gap-3'>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.curso}></i>
        </span>
        <FloatLabel>
          <InputText
            id='nombreModulo'
            className='p-inputtext-sm'
            name='nombre'
            value={curso.nombre || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, curso, cambiarCurso);
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
            value={curso.siglas || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, curso, cambiarCurso);
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
            value={curso.descripcion || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, curso, cambiarCurso);
            }}
          />
          <label htmlFor='descripcionModulo'>
            Descripción del curso formativo
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

export default FormCrearCurso;

import React from "react";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import useEstilos from "../../hooks/useEstilos.js";
import useDatos from "../../hooks/useDatos.js";

const FormCrearModulos = ({ funcion }) => {
  const { iconos } = useEstilos();
  const { modulo, cambiarModulo, actualizarFormulario, crearDato } = useDatos();

  return (
    <div className='card gap-3'>
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
          <InputText
            id='cicloModulo'
            name='id_ciclo'
            value={modulo.id_ciclo}
            onChange={(evento) => {
              actualizarFormulario(evento, modulo, cambiarModulo);
            }}
            // Crear un componente Dropdown (ver Informes.jsx).
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

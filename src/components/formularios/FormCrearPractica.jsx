import React, { useState } from "react";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import useEstilos from "../../hooks/useEstilos.js";
import useDatos from "../../hooks/useDatos.js";

const FormCrearPractica = ({ funcion }) => {
  const { iconos } = useEstilos();
  const { practica, cambiarPractica, actualizarFormulario, tipoPracticas } =
    useDatos();

  //  REVISAR !!!!!!!!!!!!!!!!!!!!!!!!!
  //  El DropDown no muestra el valor seleccionado.
  const [nombreTipoPractica, setNombreTipoPractica] = useState("");

  const mostrarNombreTipo = (evento) => {
    const tipo = tipoPracticas.filter(
      (t) => t.id_tipopractica === evento.target.value
    );
    setNombreTipoPractica(tipo[0].nombre);
  };

  return (
    <div className='card gap-3'>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.siglas}></i>
        </span>
        <FloatLabel>
          <InputText
            id='numeroPractica'
            className='p-inputtext-sm'
            name='numero'
            value={practica.numero || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, practica, cambiarPractica);
            }}
          />
          <label htmlFor='numeroPractica'>Número de la práctica</label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.modulo}></i>
        </span>
        <FloatLabel>
          <InputText
            id='nombrePractica'
            className='p-inputtext-sm'
            name='nombre'
            value={practica.nombre || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, practica, cambiarPractica);
            }}
          />
          <label htmlFor='nombrePractica'>Nombre de la práctica</label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.ciclo}></i>
        </span>
        <FloatLabel>
          <Dropdown
            id='tipoPractica'
            name='id_tipopractica'
            value={nombreTipoPractica}
            options={tipoPracticas}
            optionLabel='nombre'
            onChange={(evento) => {
              // Cambio de value para evitar guardar el objeto entero
              // y no tener que modificar la función actualizarFormulario.
              evento.target.value = evento.target.value.id_tipopractica;
              actualizarFormulario(evento, practica, cambiarPractica);
              mostrarNombreTipo(evento);
            }}
            placeholder={nombreTipoPractica}
          />
          <label htmlFor='tipoPractica'>Tipo de práctica</label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.texto}></i>
        </span>
        <FloatLabel>
          <InputText
            id='enunciadoPractica'
            name='enunciado'
            value={practica.enunciado || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, practica, cambiarPractica);
            }}
          />
          <label htmlFor='enunciadoPractica'>Enunciado de la práctica</label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.descripcion}></i>
        </span>
        <FloatLabel>
          <InputText
            id='descripcionPractica'
            name='descripcion'
            value={practica.descripcion || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, practica, cambiarPractica);
            }}
          />
          <label htmlFor='descripcionPractica'>
            Descripción de la práctica
          </label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 justify-content-end herramientasModulos_input'>
        <Button
          label='Crear práctica'
          icon={iconos.aceptar}
          onClick={() => {
            funcion();
          }}
        />
      </div>
    </div>
  );
};

export default FormCrearPractica;

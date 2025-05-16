import React, { useState, useEffect } from "react";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import useEstilos from "../../hooks/useEstilos.js";
import useDatos from "../../hooks/useDatos.js";
import ValorEstado from "../complementos/ValorEstado.jsx";

const FormCrearCurso = ({ funcion }) => {
  const { iconos } = useEstilos();
  const { curso, cursoActual, cambiarCurso, actualizarFormulario } = useDatos();

  /**
   * Se insertan los valores de forma automática.
   * Se hace aquí y no en el proveedor porque haste el momento
   * de crear el curso no es necesario colocar datos de froma automática.
   * Se ahorra hacer código de más y podibles interferencias con otros
   * componentes.
   */
  useEffect(() => {
    cambiarCurso({
      ...curso,
      ["anyo"]: new Date().getFullYear(),
      ["nombre"]: `Curso ${new Date().getFullYear()}/${
        new Date().getFullYear() + 1
      }`,
      ["centro"]: "IES Poeta Paco Mollà (Petrer)",
    });
  }, []);

  return (
    <div className='card gap-3 m-1'>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.calendario}></i>
        </span>
        <FloatLabel>
          <InputText
            id='anyoeCurso'
            className='p-inputtext-sm'
            name='anyo'
            value={curso.anyo || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, curso, cambiarCurso);
            }}
          />
          <label htmlFor='anyoCurso'>Año de inicio del curso</label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.curso}></i>
        </span>
        <FloatLabel>
          <InputText
            id='nombreCurso'
            className='p-inputtext-sm'
            name='nombre'
            value={curso.nombre || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, curso, cambiarCurso);
            }}
          />
          <label htmlFor='nombreCurso'>Nombre del curso</label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.centro}></i>
        </span>
        <FloatLabel>
          <InputText
            id='centroCurso'
            name='centro'
            value={curso.centro || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, curso, cambiarCurso);
            }}
          />
          <label htmlFor='centroCurso'>Centro del curso</label>
        </FloatLabel>
      </div>
      <div className='p-inputgroup flex-1 herramientasModulos_input'>
        <span className='p-inputgroup-addon'>
          <i className={iconos.descripcion}></i>
        </span>
        <FloatLabel>
          <InputText
            id='descripcionCurso'
            name='descripcion'
            value={curso.descripcion || ""}
            onChange={(evento) => {
              actualizarFormulario(evento, curso, cambiarCurso);
            }}
          />
          <label htmlFor='descripcionCurso'>Descripción del curso</label>
        </FloatLabel>
      </div>

      <div className='p-inputgroup flex-1 justify-content-end herramientasModulos_input'>
        <Button
          label='Crear curso'
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

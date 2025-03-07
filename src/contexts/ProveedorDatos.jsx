import React, { createContext, useState } from "react";
import supabase from "../config/config_supabase.js";

const contextoDatos = createContext();

const ProveedorDatos = ({ children }) => {
  /******************************************
   * Valores de inicialización
   * */

  const moduloInicial = {
    nombre: "",
    siglas: "",
    descripcion: "",
    id_ciclo: "",
  };

  /*******************************************************************
   * Estados generales
   * */
  const errorInicial = "";
  const [error, setError] = useState(errorInicial);
  const [modulo, setModulo] = useState(moduloInicial);
  const [modulos, setModulos] = useState([]);

  /*******************************************************************
   * Setters para exportar.
   */
  const cambiarError = (error) => {
    setError(error);
  };

  const cambiarModulo = (dato) => {
    setModulo(dato);
  };

  const cambiarModulos = (dato) => {
    setModulos(dato);
  };

  /*******************************************************************
   * Funciones generales
   * */

  const obtenerTodos = async (tabla, setter) => {
    setError(errorInicial);
    let { data, error } = await supabase.from(tabla).select("*");
    error ? setError(error.message) : setter(data);
  };

  const actualizarDato = async (tabla, identificador, dato) => {
    // Se intentan actualizar los datos.
    setError(errorInicial);
    console.log(dato);
    try {
      const { data, error } = await supabase
        .from(tabla)
        .update(dato)
        .eq(identificador, dato[identificador]);

      if (error) throw error;
    } catch (error) {
      setError(error.message);
    }
  };

  const borrarDato = async (tabla, identificador, dato) => {
    setError(errorInicial);
    try {
      const { data, error } = await supabase
        .from(tabla)
        .delete()
        .eq(identificador, dato[identificador]);

      if (error) throw error;
    } catch (error) {
      setError(error.message);
    }
  };

  // Hay que hacer una función para comprobar los datos del formulario (estado).
  const crearDato = async (tabla, dato) => {
    setError(errorInicial);
    try {
      const { data, error } = await supabase.from(tabla).insert(dato);
      if (error) throw error;
    } catch (error) {
      setError(error.message);
    }
  };

  /*******************************************************************
   * Función genérica para la actualización de los formularios.
   * Necesita:
   *  -> el evento para obtener el nombre de la columna y el dato,
   *  -> el estado a modificar (importado desde contexto) y
   *  -> el setter pata modificar el estado (importado también).
   */
  const actualizarFormulario = (evento, estado, setter) => {
    const { name, value } = evento.target;
    setter({ ...estado, [name]: value });
  };

  const datosAProveer = {
    actualizarFormulario,
    obtenerTodos,
    actualizarDato,
    borrarDato,
    crearDato,
    error,
    cambiarError,
    modulo,
    cambiarModulo,
    modulos,
    cambiarModulos,
  };

  return (
    <contextoDatos.Provider value={datosAProveer}>
      {children}
    </contextoDatos.Provider>
  );
};

export default ProveedorDatos;
export { contextoDatos };

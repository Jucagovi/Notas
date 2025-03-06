import React, { createContext, useState, useEffect } from "react";
import supabase from "../config/config_supabase.js";

const contextoDatos = createContext();

const ProveedorDatos = ({ children }) => {
  /******************************************
   * Valores de inicialización
   * */

  const moduloInicial = {};

  /******************************************
   * Estados generales
   * */
  const errorInicial = "";
  const [error, setError] = useState(errorInicial);
  const [modulo, setModulo] = useState(moduloInicial);

  /******************************************
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

  const lanzarError = (error) => {
    setError(error);
  };

  const actualizarFormulario = () => {};

  const datosAProveer = {
    obtenerTodos,
    actualizarDato,
    borrarDato,
    error,
    lanzarError,
    modulo,
  };

  return (
    <contextoDatos.Provider value={datosAProveer}>
      {children}
    </contextoDatos.Provider>
  );
};

export default ProveedorDatos;
export { contextoDatos };

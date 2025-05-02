import React, { createContext, useEffect, useState } from "react";
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

  const cicloInicial = {
    nombre: "",
    siglas: "",
    descripcion: "",
  };

  const practicaInicial = {
    nombre: "",
    numero: "",
    enunciado: "",
    descripcion: "",
    unidad: "",
    id_tipopractica: "",
  };

  const errorInicial = "";

  /*******************************************************************
   * Estados generales
   * */
  const [errorGeneral, setErrorGeneral] = useState(errorInicial);
  const [modulo, setModulo] = useState(moduloInicial);
  const [modulos, setModulos] = useState([]);
  const [ciclo, setCiclo] = useState(cicloInicial);
  const [ciclos, setCiclos] = useState([]);
  const [practica, setPractica] = useState(practicaInicial);
  const [practicas, setPracticas] = useState([]);
  const [tipoPracticas, setTipoPracticas] = useState([]);

  /*******************************************************************
   * Setters para exportar.
   */
  const cambiarErrorGeneral = (errorGeneral) => {
    setErrorGeneral(errorGeneral);
  };

  const cambiarModulo = (dato) => {
    setModulo(dato);
  };

  const cambiarModulos = (dato) => {
    setModulos(dato);
  };

  const cambiarCiclo = (dato) => {
    setCiclo(dato);
  };

  const cambiarCiclos = (dato) => {
    setCiclos(dato);
  };

  const cambiarPractica = (dato) => {
    setPractica(dato);
  };

  const cambiarPracticas = (dato) => {
    setPracticas(dato);
  };

  const cambiarTipoPracticas = (dato) => {
    setTipoPracticas(dato);
  };

  /*******************************************************************
   * Funciones generales
   * */

  // Obtiene datos de la tabla y utiliza el setter para actualizar el estado.
  // Todo en la misma función asíncrona para evitar repeticiones.
  const obtenerTodos = async (tabla, setter) => {
    setErrorGeneral(errorInicial);
    const { data, error } = await supabase.from(tabla).select("*");
    error ? setErrorGeneral(error.message) : setter(data);
  };

  const actualizarDato = async (tabla, identificador, dato) => {
    setErrorGeneral(errorInicial);
    const { data, error } = await supabase
      .from(tabla)
      .update(dato)
      .eq(identificador, dato[identificador]);
    console.log(error);
    console.log(data);
    if (error) setErrorGeneral(error.message);
  };

  const borrarDato = async (tabla, identificador, dato) => {
    setErrorGeneral(errorInicial);
    const { data, error } = await supabase
      .from(tabla)
      .delete()
      .eq(identificador, dato[identificador]);
    if (error) setErrorGeneral(error.message);
  };

  // Hay que hacer una función para comprobar los datos del formulario (estado).
  const insertarDato = async (tabla, dato) => {
    setErrorGeneral(errorInicial);
    const { data, error } = await supabase.from(tabla).insert(dato);
    if (error) setErrorGeneral(error.message);
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
    insertarDato,
    errorGeneral,
    cambiarErrorGeneral,
    modulo,
    cambiarModulo,
    modulos,
    cambiarModulos,
    ciclo,
    cambiarCiclo,
    ciclos,
    cambiarCiclos,
    practica,
    cambiarPractica,
    practicas,
    cambiarPracticas,
    tipoPracticas,
    cambiarTipoPracticas,
  };

  // Se obtienen los datos al cargar el contexto REVISAR.
  useEffect(() => {
    // Necesario para las herramientas de Módulo.
    obtenerTodos("Ciclos", cambiarCiclos);
    // Necesraio para las herramientas de Prácticas.
    obtenerTodos("TipoPracticas", cambiarTipoPracticas);
  }, []);

  return (
    <contextoDatos.Provider value={datosAProveer}>
      {children}
    </contextoDatos.Provider>
  );
};

export default ProveedorDatos;
export { contextoDatos };

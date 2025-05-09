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

  const discenteInicial = {
    nombre: "",
    apellidos: "",
    correo: "",
    fecha_nac: "",
    localidad: "",
  };

  const evaluanInicial = {
    id_evaluacion: "",
    id_discente: "",
    id_practica: "",
    peso: "",
    nota: "",
  };

  const cursoInicial = {
    centro: "",
    nombre: "",
    descripcion: "",
    anyo: "",
  };

  const errorInicial = "";

  /*******************************************************************
   * Estados para tablas generales.
   * */
  const [modulo, setModulo] = useState(moduloInicial);
  const [modulos, setModulos] = useState([]);
  const [ciclo, setCiclo] = useState(cicloInicial);
  const [ciclos, setCiclos] = useState([]);
  const [practica, setPractica] = useState(practicaInicial);
  const [practicas, setPracticas] = useState([]);
  const [tipoPracticas, setTipoPracticas] = useState([]);
  const [discente, setDiscente] = useState(discenteInicial);
  const [discentes, setDiscentes] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [evaluan, setEvaluan] = useState(evaluanInicial);
  const [curso, setCurso] = useState(cursoInicial);
  const [cursos, setCursos] = useState([]);

  /*******************************************************************
   * Estados para la comuninación con la API.
   */

  const [errorGeneral, setErrorGeneral] = useState(errorInicial);
  const [cargando, setCargando] = useState(false);

  /*******************************************************************
   * Estados para las consultas específicas.
   */

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

  const cambiarDiscente = (dato) => {
    setDiscente(dato);
  };

  const cambiarDiscentes = (dato) => {
    setDiscentes(dato);
  };

  const cambiarEvaluaciones = (dato) => {
    setEvaluaciones(dato);
  };

  const cambiarEvaluan = (dato) => {
    setEvaluan(dato);
  };

  const cambiarCurso = (dato) => {
    setCurso(dato);
  };

  const cambiarCursos = (dato) => {
    setCursos(dato);
  };

  /*******************************************************************
   * Funciones generales
   * */

  // Obtiene datos de la tabla y utiliza el setter para actualizar el estado.
  // Todo en la misma función asíncrona para evitar repeticiones.
  const obtenerTodos = async (tabla, setter) => {
    setErrorGeneral(errorInicial);
    setCargando(true);
    const { data, error } = await supabase.from(tabla).select("*");
    setCargando(false);
    error ? setErrorGeneral(error.message) : setter(data);
  };

  /***
   * Para parametrizar esta función un poro más, filtro es un objeto:
   * {
   *    columna: "nombre de la columna",
   *    valor: "valor de la columna"
   * }
   * La consulta siempre de hará con un .eq en Supabase.
   * */

  const obtenerConsulta = async (tabla, setter, filtro) => {
    setErrorGeneral(errorInicial);
    setter(""); // Evitar actualizar datos entre cargas (efecto visual). Se solcionará cuando se haga el hook para datos con estado Loading...
    const { data, error } = await supabase
      .from(tabla)
      .select("*")
      .eq(filtro.columna, filtro.valor);
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
    obtenerConsulta,
    actualizarDato,
    borrarDato,
    insertarDato,
    errorGeneral,
    cambiarErrorGeneral,
    cargando,
    setCargando,
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
    discente,
    cambiarDiscente,
    discentes,
    cambiarDiscentes,
    evaluaciones,
    cambiarEvaluaciones,
    evaluan,
    cambiarEvaluan,
    curso,
    cambiarCurso,
    cursos,
    cambiarCursos,
  };

  /**
   * Se obtienen los datos al cargar el contexto.
   * De esta forma se evita cargar los datos en cada carga del componente.
   * */
  useEffect(() => {
    obtenerTodos("Ciclos", cambiarCiclos);
    obtenerTodos("TipoPracticas", cambiarTipoPracticas);
    obtenerTodos("Discentes", cambiarDiscentes);
    obtenerTodos("Modulos", cambiarModulos);
    obtenerTodos("Evaluaciones", cambiarEvaluaciones);
  }, []);

  return (
    <contextoDatos.Provider value={datosAProveer}>
      {children}
    </contextoDatos.Provider>
  );
};

export default ProveedorDatos;
export { contextoDatos };

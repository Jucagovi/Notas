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
  const [cursoActual, setCursoActual] = useState(cursoInicial);
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
  const obtenerTodos = async (tabla, setter, orden = "created_at") => {
    setErrorGeneral(errorInicial);
    setCargando(true);
    const { data, error } = await supabase
      .from(tabla)
      .select("*")
      .order(orden, { ascending: true });
    setCargando(false);
    error ? setErrorGeneral(error.message) : setter(data);
  };

  const obtenerTodosReturn = async (tabla, orden = "created_at") => {
    setErrorGeneral(errorInicial);
    setCargando(true);
    const { data, error } = await supabase
      .from(tabla)
      .select("*")
      .order(orden, { ascending: true });
    setCargando(false);
    if (error) {
      setErrorGeneral(error.message);
    } else {
      return data;
    }
  };
  /***
   * Para parametrizar esta función un poco más, filtro es un array de objeto:
   * [
   *  {
   *    columna: "nombre de la columna0",
   *    valor: "valor de la columna0"
   *  },
   *  {
   *    columna: "nombre de la columna1",
   *    valor: "valor de la columna1"
   *  }
   * ]
   * La consulta siempre de hará con un .eq en Supabase.
   * */

  const obtenerConsulta_old = async (
    tabla,
    setter,
    filtro,
    orden = "created_at"
  ) => {
    setErrorGeneral(errorInicial);
    setCargando(true);
    setter(""); // Evitar actualizar datos entre cargas (efecto visual). Se solcionará cuando se haga el hook para datos con estado Loading...
    const { data, error } = await supabase
      .from(tabla)
      .select("*")
      .eq(filtro.columna, filtro.valor)
      .order(orden, { ascending: true });
    setCargando(false);
    error ? setErrorGeneral(error.message) : setter(data);
  };

  /**
   *
   * @param {Tabla donde se realiza la consulta.} tabla
   * @param {Setter para modificar el estado tras la consulta} setter
   * @param {Array de objetos {columna: valor} para añadir a la consulta} filtro
   * @param {Orden por el que se obtiene el resultado (por defecto "created_at")} orden
   */

  const obtenerConsulta = async (
    tabla,
    setter,
    filtro,
    orden = "created_at"
  ) => {
    setErrorGeneral(errorInicial);
    setCargando(true);
    setter(""); // Evitar actualizar datos entre cargas (efecto visual). Se solcionará cuando se haga el hook para datos con estado Loading...
    // Se genera el objeto para la consulta con la tabla y la selección de columnas.
    let consulta = supabase.from(tabla).select("*");
    // Se añaden los filtros pasados como parámetro (si existen).
    if (filtro?.length) {
      for (let i = 0; i < filtro.length; i++) {
        consulta = consulta.eq(filtro[i].columna, filtro[i].valor);
      }
    }
    // Se añade el orden de la consulta.
    consulta = consulta.order(orden, { ascending: true });
    // Se lanza la consulta (por fin).
    const { data, error } = await consulta;
    setCargando(false);
    error ? setErrorGeneral(error.message) : setter(data);
  };

  /**
   * Consulta parametrizada sin utilizar setter (devuelve el resultado de la consulta).
   */
  const obtenerConsultaReturn = async (tabla, filtro, orden = "created_at") => {
    setErrorGeneral(errorInicial);
    setCargando(true);
    let consulta = supabase.from(tabla).select("*");
    if (filtro?.length) {
      for (let i = 0; i < filtro.length; i++) {
        consulta = consulta.eq(filtro[i].columna, filtro[i].valor);
      }
    }
    consulta = consulta.order(orden, { ascending: true });
    const { data, error } = await consulta;
    setCargando(false);
    if (error) {
      setErrorGeneral(error.message);
    } else {
      return data;
    }
  };

  const actualizarDato = async (tabla, identificador, dato) => {
    setErrorGeneral(errorInicial);
    const { data, error } = await supabase
      .from(tabla)
      .update(dato)
      .eq(identificador, dato[identificador]);
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

  /*******************************************************************
   * Consultas especificas para un objeto en concreto
   * (revisar si convertirlas a parámetros).
   */

  // Usada en EditarClaseDataTable.jsx
  const consultaPracticasEvaluacion = async (datos) => {
    const { data, error } = await supabase
      .from("evaluan")
      .select("id_practica, id_evaluacion, peso")
      .in("id_evaluacion", datos);
    return data;
  };

  const datosAProveer = {
    actualizarFormulario,
    obtenerTodos,
    obtenerTodosReturn,
    obtenerConsulta,
    obtenerConsultaReturn,
    actualizarDato,
    borrarDato,
    insertarDato,
    cursoInicial,
    moduloInicial,
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
    cursoActual,
    consultaPracticasEvaluacion,
  };

  /**
   * Funciones asíncornas para la carga de la aplicación.
   */

  const cargarCursos = async () => {
    await obtenerTodos("Cursos", cambiarCursos);
    console.log(cursos);
    console.log(cursos.length);
    setCurso(cursos[cursos.length - 1]);
  };

  const cargarDiscentes = async () => {
    await obtenerTodos("Discentes", cambiarDiscentes);
    console.log(discentes);
    console.log(discentes.length);
    setCurso(discentes[discentes.length - 1]);
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
    obtenerTodos("Cursos", cambiarCursos);
    obtenerTodos("Practicas", cambiarPracticas);
  }, []);

  /**
   * Dependencias para la carga de los estados individuales iniciales.
   * Revisar si es necesario cargar el curso actual ya que el asistente
   * de creación de curso ya no es completo.
   */

  useEffect(() => {
    setCursoActual(cursos[cursos.length - 1]);
  }, [cursos]);

  return (
    <contextoDatos.Provider value={datosAProveer}>
      {children}
    </contextoDatos.Provider>
  );
};

export default ProveedorDatos;
export { contextoDatos };

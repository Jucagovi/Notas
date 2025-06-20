import React, { useEffect, useState } from "react";
import ColumnaSimple from "../../layout/ColumnaSimple";
import useDatos from "../../hooks/useDatos.js";
import useEstilos from "../../hooks/useEstilos.js";
import ValorEstado from "../complementos/ValorEstado.jsx";
import imagenDiscenteGenerica from "../../assets/img/user.png";
import Cargando from "../Cargando.jsx";

const DiscenteFicha = ({ identificador, modo = "basico" }) => {
  /**
   * "modo"   -> basico (muestra los datos básicos del/la discente).
   *          -> ampliado (muestra información ampliada).
   */
  const { obtenerTodos, obtenerConsulta, idDiscente } = useDatos();
  const { iconos, procesarFecha, calcularEdad } = useEstilos();

  const [datosPersonales, setdatosPersonales] = useState({});

  const anadirDatosPersonales = (datos) => {
    setdatosPersonales(datos[0]);
  };

  useEffect(() => {
    obtenerConsulta("Discentes", anadirDatosPersonales, {
      columna: "id_discente",
      valor: identificador,
    });
  }, []);

  return (
    <>
      {datosPersonales ? (
        <div className='flex'>
          <div>
            <img
              height='200px'
              src={
                datosPersonales.imagen
                  ? datosPersonales.iamgen
                  : imagenDiscenteGenerica
              }
            ></img>
          </div>
          <div className='mt-1'>
            <h2>
              {datosPersonales.nombre} {datosPersonales.apellidos} (
              {datosPersonales.NIA || "Sin NIA"})
            </h2>
            <h4>{datosPersonales.correo}</h4>
            <h4>
              Fecha de nacimiento{" "}
              {datosPersonales.fecha_nac &&
                procesarFecha(datosPersonales.fecha_nac)}{" "}
              ({" "}
              {datosPersonales.fecha_nac &&
                calcularEdad(datosPersonales.fecha_nac)}{" "}
              años ). Residente en {datosPersonales.localidad}
            </h4>
            <h4>
              {datosPersonales.activo ? (
                <span className='text-green-500'>
                  <i
                    className={iconos.boton}
                    style={{ fontSize: "1.0rem" }}
                  ></i>
                  {"  "}
                  EN ACTIVO
                </span>
              ) : (
                <span className='text-red-500'>
                  <i
                    className={iconos.boton}
                    style={{ fontSize: "1.0rem" }}
                  ></i>{" "}
                  DESACTIVADO
                </span>
              )}
            </h4>
          </div>
        </div>
      ) : (
        <Cargando />
      )}
    </>
  );
};

export default DiscenteFicha;

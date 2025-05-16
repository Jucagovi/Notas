import React, { createContext, useRef } from "react";

const contextoTostadas = createContext();

const ProveedorTostadas = ({ children }) => {
  const tostada = useRef(null);
  const duracionTostada = 5000;

  const mostrarTostadaInfo = ({ resumen, detalle }) => {
    tostada.current.show({
      severity: "info",
      summary: resumen,
      detail: detalle,
      life: duracionTostada,
      //sticky: true,
    });
  };

  const mostrarTostadaError = ({ resumen, detalle }) => {
    tostada.current.show({
      severity: "error",
      summary: resumen,
      detail: detalle,
      life: duracionTostada,
    });
  };

  const mostrarTostadaExito = ({ resumen, detalle }) => {
    tostada.current.show({
      severity: "success",
      summary: resumen,
      detail: detalle,
      life: duracionTostada,
    });
  };
  const datosAproveer = {
    tostada,
    mostrarTostadaInfo,
    mostrarTostadaError,
    mostrarTostadaExito,
  };
  return (
    <contextoTostadas.Provider value={datosAproveer}>
      {children}
    </contextoTostadas.Provider>
  );
};

export default ProveedorTostadas;
export { contextoTostadas };

import React from "react";
import useEstilos from "../hooks/useEstilos.js";
import ValorEstado from "./complementos/ValorEstado.jsx";

const Cargando = () => {
  const { iconos } = useEstilos();

  const frases = [
    "Compilando... o invocando a Cthulhu, nunca estamos seguros.",
    "Espera un momento... Gandalf está actualizando los drivers.",
    "Esto debería ser rápido... dijo nadie usando Java en un microondas.",
    "Conectando al servidor... nivel de dificultad: Dark Souls.",
    "El halcón milenario tardó menos en hacer el Kessel Run.",
    "Recalculando la matriz... Morfeo dice que tengas paciencia.",
    "Procesando... o jugando una partida secreta de DOOM.",
    "Estás esperando porque alguien escribió while(true){}.",
    "Calculando el sentido de la vida... por favor, espere.",
    "Convenciendo a los servidores de que trabajen...",
    "Limpiando los bits sucios...",
    "A esta velocidad, ya podrías haberte hecho un café.",
    "Insertando chistes malos... casi listo.",
    "Revisando los átomos del universo...",
    "Descongelando datos del siglo pasado...",
    "Exprimiendo bytes frescos...",
    "Respira hondo. El zen del loading te acompaña.",
    "Despertando al dragón de los servidores...",
    "Moviendo cosas de una caja a otra... sin razón aparente.",
    "Probando teorías cuánticas de carga.",
    "Guardando cosas que no sabías que existían...",
  ];

  /**
   * Clases.
   * opacity-40
   *
   */

  return (
    <>
      <div className='flex flex-column align-items-center justify-content-center opacity-40'>
        <span className='fadeinright animation-duration-500'>
          <i
            className={`${iconos.herramienta} pi-spin m-3 `}
            style={{ fontSize: "5rem" }}
          ></i>
        </span>
        <span className='fadeinleft animation-duration-500'>
          {frases[Math.floor(Math.random() * 21)]}
        </span>
      </div>
    </>
  );
};

export default Cargando;

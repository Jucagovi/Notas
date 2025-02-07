import React, { useEffect, useRef } from "react";
import { createSwapy } from "swapy";
import ColumnaSimple from "../layout/ColumnaSimple";

const HerramientasPracticas = () => {
  const arrastrable = useRef(null);
  const arrastrable2 = useRef(null);
  const contenedor = useRef(null);
  const contenedor2 = useRef(null);

  useEffect(() => {
    if (contenedor.current) {
      arrastrable.current = createSwapy(contenedor.current);
      arrastrable.current.onSwap((evento) => {
        console.log("swap", evento);
      });
    }

    if (contenedor2.current) {
      arrastrable2.current = createSwapy(contenedor2.current);
      arrastrable2.current.onSwap((evento) => {
        console.log("swap2", evento);
      });
    }

    return () => {
      arrastrable.current?.destroy();
      arrastrable2.current?.destroy();
    };
  }, []);
  return (
    <ColumnaSimple>
      <h2>Herramientas para prácticas.</h2>
      <div ref={contenedor}>
        <div data-swapy-slot='a'>
          <div data-swapy-item='a'>
            <div>A</div>
          </div>
        </div>

        <div data-swapy-slot='b'>
          <div data-swapy-item='b'>
            <div>B</div>
          </div>
        </div>
      </div>

      <div ref={contenedor2}>
        <div data-swapy-slot='1'>
          <div data-swapy-item='1'>
            <div>1</div>
          </div>
        </div>

        <div data-swapy-slot='2'>
          <div data-swapy-item='2'>
            <div>2</div>
          </div>
        </div>
      </div>
    </ColumnaSimple>
  );
};

export default HerramientasPracticas;

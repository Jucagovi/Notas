import React from "react";
import { Message } from "primereact/message";
import HeaderPagina from "../components/common/HeaderPagina.jsx";
import {
  TABLAS_MAESTRAS,
  TABLAS_RELACIONES,
} from "../components/mantenimiento/configuracionTablas.js";
import TarjetaTablaHub from "../components/mantenimiento/TarjetaTablaHub.jsx";

// Página central del módulo de Herramientas que presenta el catálogo técnico y acceso directo a cada tabla.
const HerramientasPagina = () => {
  const listaMaestras = Object.values(TABLAS_MAESTRAS);
  const listaRelaciones = Object.values(TABLAS_RELACIONES);

  return (
    <div className='flex flex-column w-full gap-4'>
      {/* Cabecera general */}
      <HeaderPagina
        titulo="Herramientas y Mantenimiento"
        descripcion="Panel de control técnico para la administración de tablas maestras, auditoría de relaciones y configuración curricular."
      />

      {/* Sección 1: Tablas Maestras */}
      <div className='flex flex-column gap-3'>
        <div className='flex align-items-center gap-2'>
          <i className='pi pi-database text-xl text-primary' />
          <h2 className='text-xl font-bold m-0 text-900'>
            Mantenimiento de Tablas Maestras
          </h2>
          <span className='text-xs text-500 font-semibold ml-2'>
            ({listaMaestras.length} tablas)
          </span>
        </div>
        <p className='text-secondary text-sm m-0'>
          Entidades base del sistema académico: ciclos, módulos, discentes y
          criterios de evaluación.
        </p>

        <div className='grid'>
          {listaMaestras.map((tabla) => (
            <div key={tabla.slug} className='col-12 sm:col-6 lg:col-4 xl:col-3'>
              <TarjetaTablaHub
                titulo={tabla.titulo}
                descripcion={tabla.descripcion}
                icono={tabla.icono}
                ruta={tabla.rutaBase}
                esRelacion={false}
                nombreTabla={tabla.nombreTabla}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sección 2: Tablas de Relación (Sensibles) */}
      <div className='flex flex-column gap-3'>
        <div className='flex align-items-center gap-2'>
          <i className='pi pi-shield text-xl text-orange-500' />
          <h2 className='text-xl font-bold m-0 text-900'>
            Auditoría de Tablas de Relación
          </h2>
          <span className='text-xs text-500 font-semibold ml-2'>
            ({listaRelaciones.length} tablas sensibles)
          </span>
        </div>

        <Message
          severity='warn'
          className='w-full justify-content-start'
          content={
            <div className='flex align-items-center gap-2 py-1'>
              <i className='pi pi-exclamation-triangle text-xl text-orange-500' />
              <span className='text-sm'>
                Estas tablas contienen vínculos referenciales entre entidades
                maestras (ponderaciones, matrículas y calificaciones). Se
                recomienda modificarlas con precaución.
              </span>
            </div>
          }
        />

        <div className='grid'>
          {listaRelaciones.map((tabla) => (
            <div key={tabla.slug} className='col-12 sm:col-6 lg:col-4 xl:col-3'>
              <TarjetaTablaHub
                titulo={tabla.titulo}
                descripcion={tabla.descripcion}
                icono={tabla.icono}
                ruta={tabla.rutaBase}
                esRelacion={true}
                nombreTabla={tabla.nombreTabla}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HerramientasPagina;

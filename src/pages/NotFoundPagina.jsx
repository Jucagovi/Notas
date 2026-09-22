import React from "react";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

// Página mostrada cuando no se encuentra la ruta solicitada.
const NotFoundPagina = () => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-column align-items-center justify-content-center py-6 w-full'>
      <h1 className='text-6xl font-bold text-primary m-0'>404</h1>
      <h2 className='text-2xl font-medium text-700 mt-2 mb-4'>
        Página no encontrada
      </h2>
      <p className='text-secondary mb-4'>
        La ruta a la que intenta acceder no existe o ha sido movida.
      </p>
      <Button
        label='Volver al Panel de Control'
        icon='pi pi-home'
        onClick={() => navigate("/")}
      />
    </div>
  );
};

export default NotFoundPagina;

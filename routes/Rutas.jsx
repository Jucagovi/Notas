import React from "react";

const Rutas = () => {
  return (
    <>
      <Routes>
        <Route index element={<Inicio />} />
        <Route path='/mantenimiento' element={<Mantenimiento />} />
      </Routes>
    </>
  );
};

export default Rutas;

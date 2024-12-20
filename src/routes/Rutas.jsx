import React from "react";
import { Routes, Route } from "react-router";
import Inicio from "../pages/Inicio.jsx";
import Herramientas from "../pages/Herramientas.jsx";
import AcercaDe from "../pages/AcercaDe.jsx";
import Informes from "../pages/Informes.jsx";
import Login from "../pages/Login.jsx";
import Notas from "../pages/Notas.jsx";
import Error from "../pages/Error.jsx";

const Rutas = () => {
  return (
    <>
      <Routes>
        <Route index element={<Inicio />} />
        <Route path='/herramientas' element={<Herramientas />} />
        <Route path='/acercade' element={<AcercaDe />} />
        <Route path='/informes' element={<Informes />} />
        <Route path='/login' element={<Login />} />
        <Route path='/notas' element={<Notas />} />
        <Route path='*' element={<Error />} />
      </Routes>
    </>
  );
};

export default Rutas;

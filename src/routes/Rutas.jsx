import React from "react";
import { Routes, Route } from "react-router";
import Inicio from "../pages/Inicio.jsx";
import HerramientasCiclos from "../pages/HerramientasCiclos.jsx";
import HerramientasModulos from "../pages/HerramientasModulos.jsx";
import HerramientasPracticas from "../pages/HerramientasPracticas.jsx";
import HerramientasDiscentes from "../pages/HerramientasDiscentes.jsx";
import HerramientasCursos from "../pages/HerramientasCursos.jsx";
import AcercaDe from "../pages/AcercaDe.jsx";
import Informes from "../pages/Informes.jsx";
import Login from "../pages/Login.jsx";
import Notas from "../pages/Notas.jsx";
import Error from "../pages/Error.jsx";
import GestionDiscentes from "../pages/GestionDiscentes.jsx";
import GestionPracticas from "../pages/GestionPracticas.jsx";
import DetalleDiscente from "../pages/DetalleDiscente.jsx";
import CreacionCurso from "../pages/CreacionCurso.jsx";
import InsercionDatosMasivos from "../pages/InsercionDatosMasivos.jsx";

const Rutas = () => {
  return (
    <>
      <Routes>
        <Route index element={<Inicio />} />
        <Route path='/herramientascursos' element={<HerramientasCursos />} />
        <Route path='/herramientasciclos' element={<HerramientasCiclos />} />
        <Route path='/herramientasmodulos' element={<HerramientasModulos />} />
        <Route
          path='/herramientaspracticas'
          element={<HerramientasPracticas />}
        />
        <Route path='/gestiondiscentes' element={<GestionDiscentes />} />
        <Route path='/gestionpracticas' element={<GestionPracticas />} />
        <Route path='/detallediscente/:id' element={<DetalleDiscente />} />
        <Route path='/creacioncurso' element={<CreacionCurso />} />
        <Route path='/inserciondatos' element={<InsercionDatosMasivos />} />
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

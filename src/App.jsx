import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import DashboardPagina from './pages/DashboardPagina.jsx';
import IniciarSesionPagina from './pages/IniciarSesionPagina.jsx';
import DiscentesPagina from './pages/DiscentesPagina.jsx';
import ClasesPagina from './pages/ClasesPagina.jsx';
import EvaluacionesPagina from './pages/EvaluacionesPagina.jsx';
import PracticasPagina from './pages/PracticasPagina.jsx';
import CalificarPagina from './pages/CalificarPagina.jsx';
import InformesPagina from './pages/InformesPagina.jsx';
import InformeCoberturaCE from './pages/informes/InformeCoberturaCE.jsx';
import InformePendientes from './pages/informes/InformePendientes.jsx';
import InformeDificultad from './pages/informes/InformeDificultad.jsx';
import InformeEvaluacion from './pages/informes/InformeEvaluacion.jsx';
import InformeEvaluacionRa from './pages/informes/InformeEvaluacionRa.jsx';
import InformeCompetencia from './pages/informes/InformeCompetencia.jsx';
import PesosPagina from './pages/PesosPagina.jsx';
import PesosRAPagina from './pages/PesosRAPagina.jsx';
import CriteriosPagina from './pages/CriteriosPagina.jsx';
import HerramientasPagina from './pages/HerramientasPagina.jsx';
import AcercaDePagina from './pages/AcercaDePagina.jsx';

import CopiasSeguridad from './pages/CopiasSeguridad.jsx';
import ImportacionPagina from './pages/ImportacionPagina.jsx';
import ClonadoCurso from './pages/ClonadoCurso.jsx';

// Páginas de mantenimiento específico de tablas del sistema
import CiclosMantenimientoPagina from './pages/mantenimiento/CiclosPagina.jsx';
import CursosMantenimientoPagina from './pages/mantenimiento/CursosPagina.jsx';
import ModulosMantenimientoPagina from './pages/mantenimiento/ModulosPagina.jsx';
import DiscentesMantenimientoPagina from './pages/mantenimiento/DiscentesPagina.jsx';
import EvaluacionesMantenimientoPagina from './pages/mantenimiento/EvaluacionesPagina.jsx';
import PracticasMantenimientoPagina from './pages/mantenimiento/PracticasPagina.jsx';
import RAMantenimientoPagina from './pages/mantenimiento/RAPagina.jsx';
import CEMantenimientoPagina from './pages/mantenimiento/CEPagina.jsx';

// Proveedores de contexto global, sesión y mantenimiento de tablas
import ToastContexto from './context/ToastContexto.jsx';
import SesionContexto from './context/SesionContexto.jsx';
import MantenimientoProveedores from './context/MantenimientoProveedores.jsx';

// Configuración principal del enrutador de la aplicación y sus subrutas
const App = () => {
  return (
    <ToastContexto>
      <SesionContexto>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas para inicio de sesión */}
            <Route path="/iniciar-sesion" element={<IniciarSesionPagina />} />
            <Route path="/login" element={<Navigate to="/iniciar-sesion" replace />} />

            {/* Rutas protegidas que requieren autenticación activa con Supabase */}
            <Route element={<RutaProtegida />}>
              <Route
                element={
                  <MantenimientoProveedores>
                    <Layout />
                  </MantenimientoProveedores>
                }
              >
                <Route path="/" element={<DashboardPagina />} />
                <Route path="discentes" element={<DiscentesPagina />} />
                <Route path="clases" element={<ClasesPagina />} />
                <Route path="evaluaciones" element={<CriteriosPagina />} />
                <Route path="criterios" element={<CriteriosPagina />} />
                <Route path="evaluacion/criterios" element={<Navigate to="/criterios" replace />} />
                <Route path="evaluaciones/criterios" element={<Navigate to="/criterios" replace />} />
                <Route path="asignacion-ce" element={<Navigate to="/criterios" replace />} />
                <Route path="calificar" element={<CalificarPagina />} />
                <Route path="practicas" element={<PracticasPagina />} />
                <Route path="pesos" element={<PesosPagina />} />
                <Route path="evaluacion/pesos" element={<Navigate to="/pesos" replace />} />
                <Route path="pesos-ra" element={<PesosRAPagina />} />
                <Route path="pesos-ra-ce" element={<Navigate to="/pesos-ra" replace />} />
                <Route path="evaluacion/pesos-ra" element={<Navigate to="/pesos-ra" replace />} />
                <Route path="evaluacion/pesos-ra-ce" element={<Navigate to="/pesos-ra" replace />} />
                <Route path="informes" element={<InformesPagina />} />
                <Route path="informes/competencia" element={<InformeCompetencia />} />
                <Route path="informes/competencias" element={<InformeCompetencia />} />
                <Route path="informes/competencia-individual" element={<InformeCompetencia />} />
                <Route path="informes/InformeCompetencia" element={<InformeCompetencia />} />
                <Route path="informes/InformeCompetencias" element={<InformeCompetencia />} />
                <Route path="competencia" element={<Navigate to="/informes/competencia" replace />} />
                <Route path="competencias" element={<Navigate to="/informes/competencia" replace />} />
                <Route path="informes/cobertura-ce" element={<InformeCoberturaCE />} />
                <Route path="informes/cobertura" element={<Navigate to="/informes/cobertura-ce" replace />} />
                <Route path="informes/coberturaCE" element={<Navigate to="/informes/cobertura-ce" replace />} />
                <Route path="cobertura-ce" element={<Navigate to="/informes/cobertura-ce" replace />} />
                <Route path="informes/calificaciones-pendientes" element={<InformePendientes />} />
                <Route path="informes/pendientes" element={<Navigate to="/informes/calificaciones-pendientes" replace />} />
                <Route path="calificaciones-pendientes" element={<Navigate to="/informes/calificaciones-pendientes" replace />} />
                <Route path="informes/dificultad" element={<InformeDificultad />} />
                <Route path="informes/analisis-dificultad" element={<Navigate to="/informes/dificultad" replace />} />
                <Route path="informes/dificultad-practicas" element={<Navigate to="/informes/dificultad" replace />} />
                <Route path="dificultad" element={<Navigate to="/informes/dificultad" replace />} />
                <Route path="informes/acta-evaluacion-ra" element={<InformeEvaluacionRa />} />
                <Route path="informes/acta-ra" element={<InformeEvaluacionRa />} />
                <Route path="informes/evaluacion-ra" element={<InformeEvaluacionRa />} />
                <Route path="informes/evaluacion-modulo-ra" element={<InformeEvaluacionRa />} />
                <Route path="acta-evaluacion-ra" element={<Navigate to="/informes/acta-evaluacion-ra" replace />} />
                <Route path="acta-ra" element={<Navigate to="/informes/acta-evaluacion-ra" replace />} />
                <Route path="informes/evaluacion-modulo" element={<InformeEvaluacion />} />
                <Route path="informes/evaluacion" element={<InformeEvaluacion />} />
                <Route path="informes/acta" element={<InformeEvaluacion />} />
                <Route path="informes/actas" element={<InformeEvaluacion />} />
                <Route path="informes/acta-evaluacion" element={<InformeEvaluacion />} />
                <Route path="informes/informe-evaluacion" element={<InformeEvaluacion />} />
                <Route path="informes/InformeEvaluacion" element={<InformeEvaluacion />} />
                <Route path="evaluacion-modulo" element={<InformeEvaluacion />} />
                <Route path="evaluacion/modulo" element={<InformeEvaluacion />} />
                <Route path="evaluacion" element={<Navigate to="/criterios" replace />} />
                <Route path="actas" element={<InformeEvaluacion />} />
                <Route path="acta" element={<InformeEvaluacion />} />

                {/* Módulo de Herramientas y Mantenimiento con subrutas */}
                <Route path="herramientas" element={<HerramientasPagina />}>
                  <Route path="copias-seguridad" element={<CopiasSeguridad />} />
                  <Route path="copia-seguridad" element={<Navigate to="/herramientas/copias-seguridad" replace />} />
                  <Route path="importacion" element={<ImportacionPagina />} />
                  <Route path="importacion-datos" element={<Navigate to="/herramientas/importacion" replace />} />
                  <Route path="clonado-curso" element={<ClonadoCurso />} />
                  <Route path="clonado" element={<Navigate to="/herramientas/clonado-curso" replace />} />
                  <Route path="clonar-curso" element={<Navigate to="/herramientas/clonado-curso" replace />} />
                  <Route path="mantenimiento/ciclos" element={<CiclosMantenimientoPagina />} />
                  <Route path="mantenimiento/cursos" element={<CursosMantenimientoPagina />} />
                  <Route path="mantenimiento/modulos" element={<ModulosMantenimientoPagina />} />
                  <Route path="mantenimiento/discentes" element={<DiscentesMantenimientoPagina />} />
                  <Route path="mantenimiento/evaluaciones" element={<EvaluacionesMantenimientoPagina />} />
                  <Route path="mantenimiento/practicas" element={<PracticasMantenimientoPagina />} />
                  <Route path="mantenimiento/ra" element={<RAMantenimientoPagina />} />
                  <Route path="mantenimiento/ce" element={<CEMantenimientoPagina />} />
                  <Route path="mantenimiento" element={<Navigate to="/herramientas" replace />} />
                </Route>

                <Route path="copias-seguridad" element={<Navigate to="/herramientas/copias-seguridad" replace />} />
                <Route path="copia-seguridad" element={<Navigate to="/herramientas/copias-seguridad" replace />} />
                <Route path="importacion" element={<Navigate to="/herramientas/importacion" replace />} />
                <Route path="importacion-datos" element={<Navigate to="/herramientas/importacion" replace />} />
                <Route path="clonado-curso" element={<Navigate to="/herramientas/clonado-curso" replace />} />
                <Route path="clonar-curso" element={<Navigate to="/herramientas/clonado-curso" replace />} />
                <Route path="clonado" element={<Navigate to="/herramientas/clonado-curso" replace />} />
                <Route path="acercaDe" element={<AcercaDePagina />} />
              </Route>
            </Route>

            {/* Redirección ante cualquier ruta no coincidente */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SesionContexto>
    </ToastContexto>
  );
};

export default App;

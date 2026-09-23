import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LayoutPrincipal from './components/LayoutPrincipal.jsx';

// Páginas de la aplicación
import PanelControl from './pages/PanelControl.jsx';
import DiscentesPagina from './pages/DiscentesPagina.jsx';
import ClasesPagina from './pages/ClasesPagina.jsx';
import UnidadesPagina from './pages/UnidadesPagina.jsx';
import TemporizacionPagina from './pages/planificacion/TemporizacionPagina.jsx';
import ProgramacionPagina from './pages/planificacion/ProgramacionPagina.jsx';
import CuadernoPagina from './pages/evaluacion/CuadernoPagina.jsx';
import CalificarPagina from './pages/CalificarPagina.jsx';
import PracticasPagina from './pages/evaluacion/PracticasPagina.jsx';
import PesosPagina from './pages/PesosPagina.jsx';
import PesosRAPagina from './pages/PesosRAPagina.jsx';
import CriteriosPagina from './pages/CriteriosPagina.jsx';
import DiarioPagina from './pages/evaluacion/DiarioPagina.jsx';
import InformesPagina from './pages/InformesPagina.jsx';
import MemoriaPagina from './pages/informes/MemoriaPagina.jsx';
import SeguimientoPagina from './pages/informes/SeguimientoPagina.jsx';
import ProgresoPagina from './pages/informes/ProgresoPagina.jsx';
import HerramientasPagina from './pages/HerramientasPagina.jsx';
import ExportadorPagina from './pages/herramientas/ExportadorPagina.jsx';
import CalendarioPagina from "./pages/CalendarioPagina.jsx";
import HorarioPagina from "./pages/HorarioPagina.jsx";
import MantenimientoPagina from './pages/herramientas/MantenimientoPagina.jsx';
import RelacionesPagina from './pages/herramientas/RelacionesPagina.jsx';
import CopiasSeguridad from "./pages/CopiasSeguridad.jsx";
import ImportacionPagina from "./pages/ImportacionPagina.jsx";
import ClonadoCurso from "./pages/ClonadoCurso.jsx";
import AcercaDePagina from './pages/AcercaDePagina.jsx';
import NotFoundPagina from './pages/NotFoundPagina.jsx';
import LoginPagina from './pages/LoginPagina.jsx';
import RutaPrivada from './components/autenticacion/RutaPrivada.jsx';


// Componente principal de la aplicación con configuración de rutas.
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública de acceso al sistema. */}
        <Route path='/login' element={<LoginPagina />} />
        <Route
          path='/iniciar-sesion'
          element={<Navigate to='/login' replace />}
        />

        {/* Rutas protegidas que requieren sesión activa. */}
        <Route
          path='/'
          element={
            <RutaPrivada>
              <LayoutPrincipal />
            </RutaPrivada>
          }
        >
          {/* Panel de control y Dashboard principal. */}
          <Route index element={<PanelControl />} />
          <Route path='dashboard' element={<PanelControl />} />
          <Route path='panel-control' element={<PanelControl />} />

          {/* Discentes */}
          <Route path='discentes' element={<DiscentesPagina />} />

          {/* Clases */}
          <Route path='clases' element={<ClasesPagina />} />

          {/* Planificación */}
          <Route
            path='calendario-escolar'
            element={
              <Navigate to='/planificacion/calendario-escolar' replace />
            }
          />
          <Route
            path='calendario'
            element={
              <Navigate to='/planificacion/calendario-escolar' replace />
            }
          />
          <Route path='horarios' element={<HorarioPagina />} />
          <Route
            path='horario'
            element={<Navigate to='/planificacion/horarios' replace />}
          />
          <Route path='unidades' element={<UnidadesPagina />} />
          <Route path='temporizacion' element={<TemporizacionPagina />} />
          <Route path='planificacion'>
            <Route
              index
              element={
                <Navigate to='/planificacion/calendario-escolar' replace />
              }
            />
            <Route
              path='calendario-escolar'
              element={<CalendarioPagina />}
            />
            <Route
              path='calendario'
              element={
                <Navigate to='/planificacion/calendario-escolar' replace />
              }
            />
            <Route path='horarios' element={<HorarioPagina />} />
            <Route
              path='horario'
              element={<Navigate to='/planificacion/horarios' replace />}
            />
            <Route path='temporizacion' element={<TemporizacionPagina />} />
            <Route path='programacion' element={<ProgramacionPagina />} />
            <Route path='unidades' element={<UnidadesPagina />} />
          </Route>

          {/* Evaluación y Calificación */}
          <Route path='calificar' element={<CalificarPagina />} />
          <Route path='practicas' element={<PracticasPagina />} />
          <Route path='pesos' element={<PesosPagina />} />
          <Route path='pesos-ra' element={<PesosRAPagina />} />
          <Route path='criterios' element={<CriteriosPagina />} />
          <Route path='evaluacion'>
            <Route index element={<Navigate to='/calificar' replace />} />
            <Route path='cuaderno' element={<CuadernoPagina />} />
            <Route path='diario' element={<DiarioPagina />} />
            <Route path='practicas' element={<PracticasPagina />} />
            <Route path='pesos' element={<PesosPagina />} />
            <Route path='pesos-ra' element={<PesosRAPagina />} />
            <Route path='criterios' element={<CriteriosPagina />} />
          </Route>

          {/* Informes */}
          <Route path='informes'>
            <Route index element={<InformesPagina />} />
            <Route path='acta-evaluacion-ra' element={<InformesPagina />} />
            <Route path='evaluacion-modulo' element={<InformesPagina />} />
            <Route path='competencia' element={<InformesPagina />} />
            <Route path='cobertura-ce' element={<InformesPagina />} />
            <Route
              path='calificaciones-pendientes'
              element={<InformesPagina />}
            />
            <Route path='dificultad' element={<InformesPagina />} />
            <Route path='memoria' element={<MemoriaPagina />} />
            <Route path='seguimiento' element={<SeguimientoPagina />} />
            <Route path='progreso' element={<ProgresoPagina />} />
          </Route>

          {/* Herramientas y Mantenimiento */}
          <Route path='herramientas'>
            <Route index element={<HerramientasPagina />} />
            <Route path='copias-seguridad' element={<CopiasSeguridad />} />
            <Route path='importacion' element={<ImportacionPagina />} />
            <Route path='clonado-curso' element={<ClonadoCurso />} />
            <Route path='exportador' element={<ExportadorPagina />} />
            <Route
              path='calendario'
              element={
                <Navigate to='/planificacion/calendario-escolar' replace />
              }
            />
            <Route
              path='calendario-escolar'
              element={
                <Navigate to='/planificacion/calendario-escolar' replace />
              }
            />
            <Route path='horarios' element={<HorarioPagina />} />
            <Route path='mantenimiento' element={<MantenimientoPagina />} />
            <Route
              path='mantenimiento/:tabla'
              element={<MantenimientoPagina />}
            />
            <Route path='relaciones' element={<RelacionesPagina />} />
            <Route path='relaciones/:tabla' element={<RelacionesPagina />} />
          </Route>

          {/* Rutas de acceso directo para el módulo de Seguridad */}
          <Route
            path='copias-seguridad'
            element={<Navigate to='/herramientas/copias-seguridad' replace />}
          />
          <Route
            path='importacion'
            element={<Navigate to='/herramientas/importacion' replace />}
          />
          <Route
            path='clonado-curso'
            element={<Navigate to='/herramientas/clonado-curso' replace />}
          />

          {/* Acerca de y Ayuda */}
          <Route path='acercaDe' element={<AcercaDePagina />} />
          <Route path='ayuda' element={<AcercaDePagina />} />

          {/* Página 404 */}
          <Route path='*' element={<NotFoundPagina />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

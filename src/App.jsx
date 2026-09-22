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
import CalendarioPagina from './pages/herramientas/CalendarioPagina.jsx';
import HorariosPagina from './pages/herramientas/HorariosPagina.jsx';
import MantenimientoPagina from './pages/herramientas/MantenimientoPagina.jsx';
import RelacionesPagina from './pages/herramientas/RelacionesPagina.jsx';
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
        <Route path="/login" element={<LoginPagina />} />
        <Route path="/iniciar-sesion" element={<Navigate to="/login" replace />} />

        {/* Rutas protegidas que requieren sesión activa. */}
        <Route
          path="/"
          element={
            <RutaPrivada>
              <LayoutPrincipal />
            </RutaPrivada>
          }
        >
          {/* Panel de control y Dashboard principal. */}
          <Route index element={<PanelControl />} />
          <Route path="dashboard" element={<PanelControl />} />
          <Route path="panel-control" element={<PanelControl />} />

          {/* Discentes */}
          <Route path="discentes" element={<DiscentesPagina />} />

          {/* Clases */}
          <Route path="clases" element={<ClasesPagina />} />

          {/* Planificación */}
          <Route path="unidades" element={<UnidadesPagina />} />
          <Route path="temporizacion" element={<TemporizacionPagina />} />
          <Route path="planificacion">
            <Route index element={<Navigate to="/temporizacion" replace />} />
            <Route path="temporizacion" element={<TemporizacionPagina />} />
            <Route path="programacion" element={<ProgramacionPagina />} />
            <Route path="unidades" element={<UnidadesPagina />} />
          </Route>

          {/* Evaluación y Calificación */}
          <Route path="calificar" element={<CalificarPagina />} />
          <Route path="practicas" element={<PracticasPagina />} />
          <Route path="pesos" element={<PesosPagina />} />
          <Route path="pesos-ra" element={<PesosRAPagina />} />
          <Route path="criterios" element={<CriteriosPagina />} />
          <Route path="evaluacion">
            <Route index element={<Navigate to="/calificar" replace />} />
            <Route path="cuaderno" element={<CuadernoPagina />} />
            <Route path="diario" element={<DiarioPagina />} />
            <Route path="practicas" element={<PracticasPagina />} />
            <Route path="pesos" element={<PesosPagina />} />
            <Route path="pesos-ra" element={<PesosRAPagina />} />
            <Route path="criterios" element={<CriteriosPagina />} />
          </Route>

          {/* Informes */}
          <Route path="informes">
            <Route index element={<InformesPagina />} />
            <Route path="acta-evaluacion-ra" element={<InformesPagina />} />
            <Route path="evaluacion-modulo" element={<InformesPagina />} />
            <Route path="competencia" element={<InformesPagina />} />
            <Route path="cobertura-ce" element={<InformesPagina />} />
            <Route path="calificaciones-pendientes" element={<InformesPagina />} />
            <Route path="dificultad" element={<InformesPagina />} />
            <Route path="memoria" element={<MemoriaPagina />} />
            <Route path="seguimiento" element={<SeguimientoPagina />} />
            <Route path="progreso" element={<ProgresoPagina />} />
          </Route>

          {/* Herramientas y Mantenimiento */}
          <Route path="herramientas">
            <Route index element={<HerramientasPagina />} />
            <Route path="copias-seguridad" element={<HerramientasPagina />} />
            <Route path="importacion" element={<HerramientasPagina />} />
            <Route path="clonado-curso" element={<HerramientasPagina />} />
            <Route path="exportador" element={<ExportadorPagina />} />
            <Route path="calendario" element={<CalendarioPagina />} />
            <Route path="horarios" element={<HorariosPagina />} />
            <Route path="mantenimiento" element={<MantenimientoPagina />} />
            <Route path="mantenimiento/:tabla" element={<MantenimientoPagina />} />
            <Route path="relaciones" element={<RelacionesPagina />} />
            <Route path="relaciones/:tabla" element={<RelacionesPagina />} />
          </Route>

          {/* Acerca de y Ayuda */}
          <Route path="acercaDe" element={<AcercaDePagina />} />
          <Route path="ayuda" element={<AcercaDePagina />} />

          {/* Página 404 */}
          <Route path="*" element={<NotFoundPagina />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

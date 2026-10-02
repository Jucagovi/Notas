import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LayoutPrincipal from './components/LayoutPrincipal.jsx';

// Páginas de la aplicación
import DashboardPagina from './pages/DashboardPagina.jsx';
import DiscentesPagina from './pages/DiscentesPagina.jsx';
import ClasesPagina from './pages/ClasesPagina.jsx';
import UnidadesPagina from './pages/UnidadesPagina.jsx';
import TemporizacionPagina from './pages/planificacion/TemporizacionPagina.jsx';
import ProgramacionPagina from './pages/planificacion/ProgramacionPagina.jsx';
import CuadernoPagina from './pages/evaluacion/CuadernoPagina.jsx';
import CalificarPagina from './pages/CalificarPagina.jsx';
import TallerPracticas from './pages/TallerPracticas.jsx';
import PesosRAPagina from './pages/PesosRAPagina.jsx';
import CriteriosPagina from './pages/CriteriosPagina.jsx';
import GestionEvaluacionesPagina from './pages/evaluacion/GestionEvaluacionesPagina.jsx';
import DiarioPagina from './pages/evaluacion/DiarioPagina.jsx';
import InformeEvaluacionRa from './pages/informes/InformeEvaluacionRa.jsx';
import InformeActaTrimestres from './pages/informes/InformeActaTrimestres.jsx';
import InformeCoberturaCE from './pages/informes/InformeCoberturaCE.jsx';
import InformePendientes from './pages/informes/InformePendientes.jsx';
import InformeDificultad from './pages/informes/InformeDificultad.jsx';
import InformeCompetencia from './pages/informes/InformeCompetencia.jsx';
import InformeMapaCalor from './pages/informes/InformeMapaCalor.jsx';
import InformeProgreso from './pages/informes/InformeProgreso.jsx';
import VisorCurricularPagina from './pages/VisorCurricularPagina.jsx';
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
import AyudaPagina from './pages/ayuda/AyudaPagina.jsx';
import NotFoundPagina from './pages/NotFoundPagina.jsx';
import LoginPagina from './pages/LoginPagina.jsx';
import RutaPrivada from './components/autenticacion/RutaPrivada.jsx';


// Componente principal de la aplicación con configuración de rutas.
// Ya ves.
const App = () => {
  return (
    <BrowserRouter basename='/Notas/'>
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
          <Route index element={<DashboardPagina />} />
          <Route path='dashboard' element={<DashboardPagina />} />
          <Route path='panel-control' element={<DashboardPagina />} />

          {/* Discentes */}
          <Route path='discentes' element={<DiscentesPagina />} />
          <Route path='discentes/:idDiscente' element={<DiscentesPagina />} />

          {/* Clases */}
          <Route path='clases' element={<ClasesPagina />} />

          {/* Agenda Escolar -> Redirige a Planificación -> Calendario Escolar */}
          <Route
            path='agenda-escolar'
            element={
              <Navigate to='/planificacion/calendario-escolar' replace />
            }
          />
          <Route
            path='agenda-curricular'
            element={
              <Navigate to='/planificacion/calendario-escolar' replace />
            }
          />
          <Route
            path='agenda'
            element={
              <Navigate to='/planificacion/calendario-escolar' replace />
            }
          />

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
            <Route path='calendario-escolar' element={<CalendarioPagina />} />
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
          <Route
            path='gestion-evaluaciones'
            element={<Navigate to='/evaluacion/gestion' replace />}
          />
          <Route path='evaluaciones' element={<GestionEvaluacionesPagina />} />
          <Route
            path='asignacion'
            element={<Navigate to='/evaluacion/gestion' replace />}
          />
          <Route path='taller-practicas' element={<TallerPracticas />} />
          <Route
            path='taller'
            element={<Navigate to='/taller-practicas' replace />}
          />
          <Route path='calificar' element={<CalificarPagina />} />
          <Route
            path='practicas'
            element={<Navigate to='/evaluacion/gestion' replace />}
          />
          <Route path='pesos' element={<Navigate to='/pesos-ra' replace />} />
          <Route path='pesos-ra' element={<PesosRAPagina />} />
          <Route path='criterios' element={<CriteriosPagina />} />
          <Route path='mapeo' element={<Navigate to='/criterios' replace />} />
          <Route path='evaluacion'>
            <Route index element={<Navigate to='/calificar' replace />} />
            <Route path='gestion' element={<GestionEvaluacionesPagina />} />
            <Route
              path='evaluaciones'
              element={<GestionEvaluacionesPagina />}
            />
            <Route
              path='asignacion'
              element={<Navigate to='/evaluacion/gestion' replace />}
            />
            <Route path='calificar' element={<CalificarPagina />} />
            <Route path='taller-practicas' element={<TallerPracticas />} />
            <Route
              path='taller'
              element={<Navigate to='/taller-practicas' replace />}
            />
            <Route path='cuaderno' element={<CuadernoPagina />} />
            <Route path='diario' element={<DiarioPagina />} />
            <Route
              path='practicas'
              element={<Navigate to='/evaluacion/gestion' replace />}
            />
            <Route path='pesos' element={<Navigate to='/pesos-ra' replace />} />
            <Route path='pesos-ra' element={<PesosRAPagina />} />
            <Route path='criterios' element={<CriteriosPagina />} />
            <Route path='cobertura-ce' element={<InformeCoberturaCE />} />
            <Route
              path='mapeo'
              element={<Navigate to='/criterios' replace />}
            />
            <Route path='acta-ra' element={<InformeEvaluacionRa />} />
            <Route
              path='acta-evaluacion-ra'
              element={<Navigate to='/evaluacion/acta-ra' replace />}
            />
            <Route path='acta-trimestres' element={<InformeActaTrimestres />} />
            <Route
              path='acta-por-trimestres'
              element={<Navigate to='/evaluacion/acta-trimestres' replace />}
            />
          </Route>

          {/* Accesos directos a Actas e Informes */}
          <Route
            path='visor-curricular'
            element={<Navigate to='/informes/visor-curricular' replace />}
          />
          <Route
            path='cobertura-ce'
            element={<Navigate to='/informes/cobertura-ce' replace />}
          />
          <Route
            path='acta-evaluacion-ra'
            element={<Navigate to='/evaluacion/acta-ra' replace />}
          />
          <Route
            path='acta-ra'
            element={<Navigate to='/evaluacion/acta-ra' replace />}
          />
          <Route
            path='acta-trimestres'
            element={<Navigate to='/evaluacion/acta-trimestres' replace />}
          />
          <Route
            path='acta-por-trimestres'
            element={<Navigate to='/evaluacion/acta-trimestres' replace />}
          />
          <Route
            path='calificaciones-pendientes'
            element={<Navigate to='/informes/pendientes' replace />}
          />
          <Route
            path='analisis-dificultad'
            element={<Navigate to='/informes/dificultad' replace />}
          />
          <Route
            path='informe-dificultad'
            element={<Navigate to='/informes/dificultad' replace />}
          />
          <Route
            path='competencia-individual'
            element={<Navigate to='/informes/competencia' replace />}
          />
          <Route
            path='radar-competencias'
            element={<Navigate to='/informes/competencia' replace />}
          />
          <Route
            path='mapa-calor'
            element={<Navigate to='/informes/mapa-calor' replace />}
          />
          <Route
            path='mapa-de-calor'
            element={<Navigate to='/informes/mapa-calor' replace />}
          />
          <Route
            path='progreso-curricular'
            element={<Navigate to='/informes/progreso' replace />}
          />
          <Route
            path='informe-progreso'
            element={<Navigate to='/informes/progreso' replace />}
          />
          <Route path='evaluaciones/calificar' element={<CalificarPagina />} />

          {/* Informes */}
          <Route path='informes'>
            <Route
              index
              element={<Navigate to='/informes/pendientes' replace />}
            />
            <Route path='pendientes' element={<InformePendientes />} />
            <Route
              path='calificaciones-pendientes'
              element={<Navigate to='/informes/pendientes' replace />}
            />
            <Route path='progreso' element={<InformeProgreso />} />
            <Route
              path='progreso-curricular'
              element={<Navigate to='/informes/progreso' replace />}
            />
            <Route path='dificultad' element={<InformeDificultad />} />
            <Route
              path='analisis-dificultad'
              element={<Navigate to='/informes/dificultad' replace />}
            />
            <Route path='competencia' element={<InformeCompetencia />} />
            <Route
              path='competencia-individual'
              element={<Navigate to='/informes/competencia' replace />}
            />
            <Route
              path='radar-competencias'
              element={<Navigate to='/informes/competencia' replace />}
            />
            <Route path='mapa-calor' element={<InformeMapaCalor />} />
            <Route
              path='mapa-de-calor'
              element={<Navigate to='/informes/mapa-calor' replace />}
            />
            <Route
              path='visor-curricular'
              element={<VisorCurricularPagina />}
            />
            <Route
              path='curriculo'
              element={<Navigate to='/informes/visor-curricular' replace />}
            />
            <Route path='cobertura-ce' element={<InformeCoberturaCE />} />
            <Route
              path='cobertura'
              element={<Navigate to='/informes/cobertura-ce' replace />}
            />
            <Route path='acta-trimestres' element={<InformeActaTrimestres />} />
            <Route
              path='acta-por-trimestres'
              element={<Navigate to='/evaluacion/acta-trimestres' replace />}
            />
            <Route path='evaluacion-ra' element={<InformeEvaluacionRa />} />
            <Route path='acta-ra' element={<InformeEvaluacionRa />} />
            <Route
              path='*'
              element={<Navigate to='/informes/pendientes' replace />}
            />
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
          <Route path='ayuda' element={<AyudaPagina />} />

          {/* Página 404 */}
          <Route path='*' element={<NotFoundPagina />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

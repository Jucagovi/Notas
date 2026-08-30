import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

// Lista de herramientas globales y utilidades del sistema
const HERRAMIENTAS_SISTEMA = [
  {
    id: 'copias-seguridad',
    titulo: 'Copias de Seguridad',
    descripcion: 'Exportación y descarga en formato JSON de la base de datos completa o granular por tablas.',
    icono: 'pi pi-database',
    color: 'var(--primary-color)',
    ruta: '/herramientas/copias-seguridad',
    etiqueta: 'Exportación JSON'
  },
  {
    id: 'importacion-datos',
    titulo: 'Importación de Datos',
    descripcion: 'Carga masiva de registros en tablas clave mediante archivos CSV o texto directo con validación previa.',
    icono: 'pi pi-file-import',
    color: '#10b981',
    ruta: '/herramientas/importacion',
    etiqueta: 'Carga CSV'
  },
  {
    id: 'clonado-curso',
    titulo: 'Clonado de Cursos',
    descripcion: 'Replicación ágil de la estructura de cursos, módulos y evaluaciones para un nuevo año académico.',
    icono: 'pi pi-copy',
    color: '#3b82f6',
    ruta: '/herramientas/clonado-curso',
    etiqueta: 'Rollover'
  }
];

// Lista descriptiva de tablas del sistema para el panel de mantenimiento
const TABLAS_MANTENIMIENTO = [
  {
    id: 'ciclos',
    titulo: 'Ciclos Formativos',
    descripcion: 'Gestión de ciclos formativos de FP (DAM, DAW, ASIR...)',
    icono: 'pi pi-graduation-cap',
    color: 'var(--primary-color)',
    ruta: '/herramientas/mantenimiento/ciclos'
  },
  {
    id: 'cursos',
    titulo: 'Cursos Académicos',
    descripcion: 'Gestión de grupos y años lectivos (1º DAW 2026/2027...)',
    icono: 'pi pi-calendar',
    color: '#0ea5e9',
    ruta: '/herramientas/mantenimiento/cursos'
  },
  {
    id: 'modulos',
    titulo: 'Módulos Profesionales',
    descripcion: 'Gestión de asignaturas y materias vinculadas a ciclos',
    icono: 'pi pi-book',
    color: '#8b5cf6',
    ruta: '/herramientas/mantenimiento/modulos'
  },
  {
    id: 'discentes',
    titulo: 'Discentes (Alumnado)',
    descripcion: 'Mantenimiento del censo de alumnos matriculados y sus datos',
    icono: 'pi pi-users',
    color: '#10b981',
    ruta: '/herramientas/mantenimiento/discentes'
  },
  {
    id: 'evaluaciones',
    titulo: 'Evaluaciones',
    descripcion: 'Convocatorias y periodos evaluativos de cursos y módulos',
    icono: 'pi pi-calendar-plus',
    color: '#f59e0b',
    ruta: '/herramientas/mantenimiento/evaluaciones'
  },
  {
    id: 'practicas',
    titulo: 'Prácticas y Tareas',
    descripcion: 'Catálogo de actividades y prácticas evaluables',
    icono: 'pi pi-file-edit',
    color: '#ec4899',
    ruta: '/herramientas/mantenimiento/practicas'
  },
  {
    id: 'ra',
    titulo: 'Resultados de Aprendizaje (RA)',
    descripcion: 'Objetivos y competencias oficiales por módulo profesional',
    icono: 'pi pi-check-circle',
    color: '#6366f1',
    ruta: '/herramientas/mantenimiento/ra'
  },
  {
    id: 'ce',
    titulo: 'Criterios de Evaluación (CE)',
    descripcion: 'Criterios evaluativos asociados a cada resultado de aprendizaje',
    icono: 'pi pi-list-check',
    color: '#14b8a6',
    ruta: '/herramientas/mantenimiento/ce'
  }
];

// Componente principal de la sección de Herramientas, Utilidades y Mantenimiento de Tablas
const HerramientasPagina = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Se determina si estamos en la vista raíz de herramientas o en una subpágina
  const esRutaHija = location.pathname !== '/herramientas';

  // Si nos encontramos en una subruta de herramientas, se renderiza directamente la página hija
  if (esRutaHija) {
    return <Outlet />;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Herramientas</h1>
      <Divider />

      <div className="page-content flex flex-column gap-5">
        {/* Sección de utilidades avanzadas y copias de seguridad */}
        <div>
          <div className="mb-3">
            <h3 className="text-xl font-semibold m-0 mb-1">Utilidades y Resguardo de Datos</h3>
            <p className="text-muted m-0 text-sm">
              Herramientas de respaldo, seguridad y administración avanzada del sistema.
            </p>
          </div>

          <div className="grid">
            {HERRAMIENTAS_SISTEMA.map((item) => (
              <div key={item.id} className="col-12 md:col-6 lg:col-4 p-2">
                <Card
                  className="cursor-pointer transition-transform hover:shadow-3 hover:-translate-y-1 h-full border-1 surface-border"
                  onClick={() => navigate(item.ruta)}
                >
                  <div className="flex align-items-center justify-content-between mb-3">
                    <div className="flex align-items-center gap-3">
                      <div
                        className="flex align-items-center justify-content-center border-round"
                        style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: `${item.color}15`,
                          color: item.color
                        }}
                      >
                        <i className={`${item.icono} text-2xl`} />
                      </div>
                      <div>
                        <h4 className="m-0 font-bold text-lg">{item.titulo}</h4>
                      </div>
                    </div>
                    {item.etiqueta && (
                      <Tag value={item.etiqueta} severity="info" />
                    )}
                  </div>
                  <p className="text-muted text-sm m-0 mb-3" style={{ minHeight: '40px' }}>
                    {item.descripcion}
                  </p>
                  <div className="flex justify-content-end">
                    <Button
                      label="Abrir Herramienta"
                      icon="pi pi-arrow-right"
                      iconPos="right"
                      size="small"
                      text
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(item.ruta);
                      }}
                    />
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Sección de mantenimiento CRUD de tablas */}
        <div>
          <div className="mb-3">
            <h3 className="text-xl font-semibold m-0 mb-1">Mantenimiento de Tablas del Sistema</h3>
            <p className="text-muted m-0 text-sm">
              Seleccione una tabla para realizar operaciones de consulta, creación, modificación y eliminación (CRUD) de registros con confirmación previa.
            </p>
          </div>

          <div className="grid-cards">
            {TABLAS_MANTENIMIENTO.map((tabla) => (
              <Card
                key={tabla.id}
                className="cursor-pointer transition-transform hover:shadow-3 hover:-translate-y-1"
                onClick={() => navigate(tabla.ruta)}
              >
                <div className="flex align-items-center gap-3 mb-3">
                  <div
                    className="flex align-items-center justify-content-center border-round"
                    style={{
                      width: '46px',
                      height: '46px',
                      backgroundColor: `${tabla.color}15`,
                      color: tabla.color
                    }}
                  >
                    <i className={`${tabla.icono} text-xl`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="m-0 font-bold text-lg">{tabla.titulo}</h4>
                  </div>
                </div>
                <p className="text-muted text-sm m-0 mb-3" style={{ minHeight: '40px' }}>
                  {tabla.descripcion}
                </p>
                <div className="flex justify-content-end">
                  <Button
                    label="Gestionar Tabla"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    size="small"
                    text
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(tabla.ruta);
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerramientasPagina;

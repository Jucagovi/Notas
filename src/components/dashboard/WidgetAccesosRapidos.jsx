import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * WidgetAccesosRapidos - Componente presentacional para navegación directa a pantallas clave.
 *
 * Responsabilidad Única: Renderizar botones iconográficos de gran tamaño para permitir
 * el salto ágil a las herramientas de uso intensivo (Cuaderno, Taller y Temporización).
 */
export const WidgetAccesosRapidos = () => {
  const navigate = useNavigate();

  const accesos = [
    {
      titulo: 'Cuaderno del Profesor',
      descripcion: 'Calificaciones centrales y actas de evaluación',
      icono: 'pi pi-book',
      colorFondo: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      iconoColor: 'text-blue-600',
      ruta: '/evaluacion/cuaderno'
    },
    {
      titulo: 'Taller de Prácticas',
      descripcion: 'Diseño de actividades y banco de versiones',
      icono: 'pi pi-briefcase',
      colorFondo: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      iconoColor: 'text-purple-600',
      ruta: '/taller-practicas'
    },
    {
      titulo: 'Master Planner',
      descripcion: 'Temporización y seguimiento temporal de UTs',
      icono: 'pi pi-calendar-times',
      colorFondo: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
      iconoColor: 'text-orange-600',
      ruta: '/temporizacion'
    },
    {
      titulo: 'Calificador Ágil',
      descripcion: 'Evaluación rápida de actividades y rúbricas',
      icono: 'pi pi-pencil',
      colorFondo: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      iconoColor: 'text-green-600',
      ruta: '/calificar'
    },
    {
      titulo: 'Diario de Aula',
      descripcion: 'Anotaciones diarias e incidencias de clase',
      icono: 'pi pi-file-edit',
      colorFondo: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
      iconoColor: 'text-teal-600',
      ruta: '/evaluacion/diario'
    },
    {
      titulo: 'Horario Semanal',
      descripcion: 'Cuadrícula lectiva y gestión de tramos',
      icono: 'pi pi-clock',
      colorFondo: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      iconoColor: 'text-indigo-600',
      ruta: '/planificacion/horarios'
    }
  ];

  return (
    <div className="surface-card p-4 border-round border-1 surface-border shadow-1 h-full flex flex-column justify-content-between">
      <div>
        {/* Cabecera del widget */}
        <div className="flex align-items-center justify-content-between mb-3 pb-2 border-bottom-1 surface-border">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-th-large text-primary text-xl" />
            <div>
              <h2 className="text-lg font-bold text-900 m-0">Accesos Rápidos</h2>
              <span className="text-xs text-color-secondary">Módulos de trabajo intensivo</span>
            </div>
          </div>
        </div>

        {/* Cuadrícula de tarjetas de acceso en una sola línea */}
        <div className="grid">
          {accesos.map((item, index) => (
            <div key={index} className="col-12 sm:col-6 md:col-4 lg:col-2 xl:col-2">
              <button
                type="button"
                onClick={() => navigate(item.ruta)}
                className={`w-full p-2 lg:p-3 border-round border-1 text-left cursor-pointer transition-colors transition-duration-150 flex align-items-center gap-2 lg:gap-3 ${item.colorFondo}`}
                style={{ outline: 'none' }}
              >
                <div className="surface-card p-2 border-round shadow-1 flex align-items-center justify-content-center flex-shrink-0">
                  <i className={`${item.icono} ${item.iconoColor} text-lg lg:text-xl`} />
                </div>
                <div className="flex flex-column gap-1 overflow-hidden min-w-0">
                  <span className="font-bold text-xs lg:text-sm text-900 line-height-2 truncate" title={item.titulo}>
                    {item.titulo}
                  </span>
                  <span className="text-xs text-color-secondary truncate" title={item.descripcion}>
                    {item.descripcion}
                  </span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pie informativo */}
      <div className="pt-2 mt-2 border-top-1 surface-border flex justify-between align-items-center text-xs text-color-secondary">
        <span>6 accesos estratégicos</span>
        <span className="font-medium">Gestión integral del aula</span>
      </div>
    </div>
  );
};

export default WidgetAccesosRapidos;

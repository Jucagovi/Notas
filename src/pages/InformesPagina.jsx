import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

// Componente de página principal para el catálogo general de Informes y Auditorías
const InformesPagina = () => {
  const navigate = useNavigate();

  const informesDisponibles = [
    {
      id: 'evaluacion-modulo',
      titulo: 'Acta Oficial de Evaluación (Boletín)',
      descripcion:
        'Genera el acta oficial de un módulo, calculando la nota final ponderada de cada periodo de evaluación para todos los discentes matriculados, con exportación a CSV y PDF.',
      icono: 'pi pi-file-edit',
      colorIcono: 'text-indigo-500',
      fondoIcono: 'rgba(99, 102, 241, 0.15)',
      ruta: '/informes/evaluacion',
      etiqueta: 'Acta Oficial',
      tipoEtiqueta: 'info',
      botonTexto: 'Generar Acta'
    },
    {
      id: 'calificaciones-pendientes',
      titulo: 'Control de Calificaciones Pendientes',
      descripcion:
        'Detecta qué discentes no tienen calificación en alguna de las prácticas asignadas a una evaluación específica, previniendo el cierre de actas con notas vacías.',
      icono: 'pi pi-clock',
      colorIcono: 'text-orange-500',
      fondoIcono: 'rgba(249, 115, 22, 0.15)',
      ruta: '/informes/calificaciones-pendientes',
      etiqueta: 'Control Docente',
      tipoEtiqueta: 'warning',
      botonTexto: 'Acceder al Control'
    },
    {
      id: 'cobertura-ce',
      titulo: 'Auditoría de Cobertura Curricular (CE)',
      descripcion:
        'Valida que todos los Criterios de Evaluación de cada módulo tengan asignadas prácticas cuya cobertura sume exactamente el 100%. Detecta vacíos curriculares o excesos de ponderación con alertas visuales y exportación a PDF.',
      icono: 'pi pi-verified',
      colorIcono: 'text-green-500',
      fondoIcono: 'rgba(34, 197, 94, 0.15)',
      ruta: '/informes/cobertura-ce',
      etiqueta: 'Calidad Curricular',
      tipoEtiqueta: 'success',
      botonTexto: 'Acceder a la Auditoría'
    },
    {
      id: 'competencia-individual',
      titulo: 'Mapa de Competencias Individual (Radar)',
      descripcion:
        'Visualiza el perfil competencial del discente en los Resultados de Aprendizaje (RA) mediante un gráfico de radar para detectar fortalezas y debilidades.',
      icono: 'pi pi-compass',
      colorIcono: 'text-cyan-500',
      fondoIcono: 'rgba(6, 182, 212, 0.15)',
      ruta: '/informes/competencia',
      etiqueta: 'Competencias',
      tipoEtiqueta: 'info',
      botonTexto: 'Ver Radar'
    },
    {
      id: 'dificultad',
      titulo: 'Análisis de Dificultad de Prácticas',
      descripcion:
        'Evalúa la distribución de calificaciones y el nivel de dificultad pedagógica de cada práctica mediante un histograma de frecuencias e indicadores de rendimiento.',
      icono: 'pi pi-chart-bar',
      colorIcono: 'text-blue-500',
      fondoIcono: 'rgba(59, 130, 246, 0.15)',
      ruta: '/informes/dificultad',
      etiqueta: 'Analítica Académica',
      tipoEtiqueta: 'info',
      botonTexto: 'Acceder al Análisis'
    }
  ];

  return (
    <div className="page-container p-2">
      {/* Cabecera principal */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Catálogo de Informes y Auditorías</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Informes analíticos, auditorías de cobertura curricular y exportación de documentación docente a formato PDF.
          </p>
        </div>
      </div>

      <Divider />

      {/* Listado de tarjetas de informes disponibles */}
      <div className="grid">
        {informesDisponibles.map((info) => (
          <div key={info.id} className="col-12 md:col-6 lg:col-5">
            <Card className="h-full surface-card shadow-1 border-1 surface-border flex flex-column justify-content-between">
              <div>
                <div className="flex justify-content-between align-items-start mb-3">
                  <div
                    className="flex align-items-center justify-content-center border-round"
                    style={{ width: '3rem', height: '3rem', backgroundColor: info.fondoIcono }}
                  >
                    <i className={`${info.icono} ${info.colorIcono} text-xl`} />
                  </div>
                  <Tag value={info.etiqueta} severity={info.tipoEtiqueta} className="text-xs" />
                </div>

                <h3 className="text-base font-bold text-color mb-2">{info.titulo}</h3>
                <p className="text-muted text-xs line-height-3 mb-4">{info.descripcion}</p>
              </div>

              <div className="pt-2 border-top-1 surface-border">
                <Button
                  label={info.botonTexto}
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  size="small"
                  className="w-full"
                  onClick={() => navigate(info.ruta)}
                />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InformesPagina;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

/**
 * TarjetaPasoGuia - Componente presentacional para el contenido del paso en el carril vertical.
 *
 * Responsabilidad Única: Renderizar a pantalla completa el título, descripción,
 * checklist de tareas, consejos y botón de acción con espaciado amplio y sin Tags.
 */
const TarjetaPasoGuia = ({ paso, totalPasos = 6 }) => {
  const navigate = useNavigate();

  // Se redirige al módulo correspondiente de la aplicación.
  const manejarNavegacion = () => {
    if (paso.ruta) {
      navigate(paso.ruta);
    }
  };

  return (
    <div className="surface-card border-round shadow-1 p-4 border-1 surface-border w-full flex flex-column gap-3">
      {/* Cabecera del paso a la derecha de la bola numerada */}
      <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3 pb-3 border-bottom-1 surface-border">
        <div className="flex align-items-start gap-3">
          <div
            className="flex align-items-center justify-content-center border-round flex-shrink-0"
            style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: 'var(--primary-light, rgba(17, 116, 192, 0.12))'
            }}
          >
            <i className={`${paso.icono} text-xl text-primary font-bold`} />
          </div>

          <div className="flex flex-column gap-1">
            <span className="text-primary font-bold text-xs uppercase tracking-wider">
              Paso {paso.numero} de {totalPasos} • {paso.subtitulo}
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-900 m-0 line-height-2">
              {paso.titulo}
            </h3>
          </div>
        </div>

        {paso.ruta && (
          <div className="align-self-start md:align-self-center my-1">
            <Button
              label={paso.textoBoton || 'Acceder al módulo'}
              icon="pi pi-external-link"
              iconPos="right"
              onClick={manejarNavegacion}
              className="p-button-primary font-semibold px-4 py-2"
            />
          </div>
        )}
      </div>

      {/* Descripción explicativa del paso */}
      <p className="text-700 text-base line-height-3 m-0">
        {paso.descripcion}
      </p>

      {/* Contenido en dos columnas adaptativas */}
      <div className="grid">
        {/* Columna 1: Checklist de tareas formativas */}
        <div className="col-12 lg:col-7">
          <div className="surface-ground border-round border-1 surface-border p-3 h-full flex flex-column gap-2">
            <span className="font-bold text-xs text-900 uppercase">
              Tareas clave de configuración:
            </span>
            <ul className="list-none p-0 m-0 flex flex-column gap-2 mt-1">
              {paso.tareas.map((tarea, idx) => (
                <li key={idx} className="flex align-items-start gap-2 text-sm text-700 line-height-3">
                  <i className="pi pi-check text-primary font-bold mt-1 flex-shrink-0" />
                  <span>{tarea}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Columna 2: Recomendación docente y tablas de base de datos */}
        <div className="col-12 lg:col-5">
          <div className="flex flex-column gap-3 h-full">
            {paso.consejo && (
              <div className="surface-ground border-round p-3 border-left-3 border-primary flex align-items-start gap-3">
                <i className="pi pi-lightbulb text-primary text-xl flex-shrink-0 mt-1" />
                <div className="text-sm text-700 line-height-3">
                  <span className="font-bold text-900 mr-1">Consejo:</span>
                  {paso.consejo}
                </div>
              </div>
            )}

            {paso.tablas && paso.tablas.length > 0 && (
              <div className="surface-ground border-round border-1 surface-border p-3 flex flex-column gap-2 mt-auto">
                <span className="text-xs font-semibold text-color-secondary uppercase">
                  Tablas afectadas:
                </span>
                <div className="flex align-items-center gap-2 flex-wrap">
                  {paso.tablas.map((tabla) => (
                    <span
                      key={tabla}
                      className="surface-card text-700 font-mono text-xs px-2 py-1 border-round border-1 surface-border font-semibold"
                    >
                      {tabla}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TarjetaPasoGuia;

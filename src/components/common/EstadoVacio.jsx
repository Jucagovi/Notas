import React from 'react';
import { Button } from 'primereact/button';

/**
 * EstadoVacio - Componente presentacional para indicar la ausencia de registros o contenido.
 *
 * Responsabilidad Única: Mostrar una vista atractiva y orientada a la acción cuando
 * una sección o tabla carece de elementos (ej: alumnos, prácticas o unidades).
 *
 * @param {Object} props
 * @param {string} [props.mensaje='Aún no hay elementos aquí'] - Título o mensaje principal.
 * @param {string} [props.descripcion] - Explicación detallada o contextual opcional.
 * @param {string|React.ReactNode} [props.icono='pi pi-inbox'] - Clase de icono PrimeIcons o nodo JSX.
 * @param {string} [props.botonLabel] - Texto del botón de acción (ej: "Crear la primera").
 * @param {string} [props.botonIcono='pi pi-plus'] - Icono del botón de acción.
 * @param {Function} [props.onAccion] - Manejador del click en el botón de acción.
 * @param {React.ReactNode} [props.accion] - Nodo React personalizado para sustituir el botón estándar.
 * @param {React.ReactNode} [props.children] - Contenido React adicional opcional.
 * @param {string} [props.className=''] - Clases CSS complementarias.
 */
export const EstadoVacio = ({
  mensaje = 'Aún no hay elementos aquí',
  descripcion,
  icono = 'pi pi-inbox',
  botonLabel,
  botonIcono = 'pi pi-plus',
  onAccion,
  accion,
  children,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-column align-items-center justify-content-center text-center p-6 surface-card border-round border-1 surface-border my-3 ${className}`.trim()}
    >
      <div className="surface-100 border-circle w-5rem h-5rem flex align-items-center justify-content-center mb-3">
        {typeof icono === 'string' ? (
          <i className={`${icono} text-4xl text-500`} />
        ) : (
          icono
        )}
      </div>

      <h3 className="text-xl font-bold text-900 m-0 mb-2">
        {mensaje}
      </h3>

      {descripcion && (
        <p className="text-color-secondary text-sm m-0 mb-4 max-w-28rem line-height-3">
          {descripcion}
        </p>
      )}

      {accion ? (
        <div className="mt-2">{accion}</div>
      ) : (
        botonLabel && onAccion && (
          <Button
            label={botonLabel}
            icon={botonIcono}
            onClick={onAccion}
            className="p-button-primary mt-2"
          />
        )
      )}

      {children && <div className="mt-3 w-full">{children}</div>}
    </div>
  );
};

export default EstadoVacio;

import React from 'react';
import { Button } from 'primereact/button';

// Mapeo semántico de tipos de acción a configuración estándar de PrimeReact
const CONFIG_TIPOS = {
  guardar: {
    severity: 'primary',
    iconoPredeterminado: 'pi pi-check',
    outlined: false,
    classNameExtra: ''
  },
  cancelar: {
    severity: 'secondary',
    iconoPredeterminado: 'pi pi-times',
    outlined: true,
    classNameExtra: 'p-button-outlined'
  },
  exportar: {
    severity: 'info',
    iconoPredeterminado: 'pi pi-download',
    outlined: true,
    classNameExtra: 'p-button-outlined'
  },
  eliminar: {
    severity: 'danger',
    iconoPredeterminado: 'pi pi-trash',
    outlined: false,
    classNameExtra: 'p-button-danger'
  }
};

/**
 * BotonAccion - Componente Button estandarizado según la semántica de la acción.
 *
 * Responsabilidad Única: Asignar de manera centralizada la severidad visual,
 * estilo de borde (outlined) e icono adecuado a los botones de acción del ERP.
 *
 * @param {Object} props
 * @param {string} [props.label] - Texto de la acción.
 * @param {string} [props.icon] - Icono PrimeIcon opcional (si se omite, se usa el predeterminado del tipo).
 * @param {Function} [props.onClick] - Manejador del evento click.
 * @param {'guardar'|'cancelar'|'exportar'|'eliminar'} [props.tipo='guardar'] - Tipo semántico de la acción.
 * @param {string} [props.className=''] - Clases CSS complementarias.
 * @param {boolean} [props.outlined] - Permite sobrescribir el estilo de borde.
 * @param {string} [props.severity] - Permite sobrescribir la severidad.
 * @param {React.ReactNode} [props.children] - Contenido hijo opcional.
 */
export const BotonAccion = ({
  label,
  icon,
  onClick,
  tipo = 'guardar',
  className = '',
  outlined,
  severity,
  children,
  ...restoProps
}) => {
  const config = CONFIG_TIPOS[tipo] || CONFIG_TIPOS.guardar;

  const severityEfectiva = severity !== undefined ? severity : config.severity;
  const outlinedEfectivo = outlined !== undefined ? outlined : config.outlined;
  const iconoEfectivo = icon !== undefined ? icon : config.iconoPredeterminado;

  const claseCompuesta = `${config.classNameExtra} ${className}`.trim();

  return (
    <Button
      label={label}
      icon={iconoEfectivo}
      onClick={onClick}
      severity={severityEfectiva}
      outlined={outlinedEfectivo}
      className={claseCompuesta}
      {...restoProps}
    >
      {children}
    </Button>
  );
};

export default BotonAccion;

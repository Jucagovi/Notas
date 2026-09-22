import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';

// Componente presentacional para el formulario de credenciales de acceso.
const FormularioLogin = ({
  correo,
  clave,
  alCambiarCorreo,
  alCambiarClave,
  alEnviar,
  cargando
}) => {
  return (
    <form onSubmit={alEnviar} className="flex flex-column gap-3">
      {/* Campo para el correo electrónico. */}
      <div className="flex flex-column gap-2">
        <label htmlFor="correo" className="font-semibold text-sm text-700">
          Correo electrónico
        </label>
        <div className="login-input-contenedor">
          <i className="pi pi-envelope login-icono-izquierda" />
          <InputText
            id="correo"
            type="email"
            value={correo}
            onChange={(e) => alCambiarCorreo(e.target.value)}
            placeholder="docente@centro.edu"
            className="w-full"
            style={{ width: '100%' }}
            disabled={cargando}
            autoFocus
            required
          />
        </div>
      </div>

      {/* Campo para la contraseña. */}
      <div className="flex flex-column gap-2">
        <label htmlFor="clave-input" className="font-semibold text-sm text-700">
          Contraseña
        </label>
        <div className="login-input-contenedor">
          <i className="pi pi-lock login-icono-izquierda" />
          <Password
            id="clave"
            inputId="clave-input"
            value={clave}
            onChange={(e) => alCambiarClave(e.target.value)}
            placeholder="••••••••"
            feedback={false}
            toggleMask
            className="w-full"
            style={{ width: '100%' }}
            inputClassName="w-full"
            inputStyle={{ width: '100%' }}
            pt={{
              root: { className: 'w-full', style: { width: '100%', display: 'flex' } },
              iconField: { root: { className: 'w-full', style: { width: '100%', display: 'flex' } } },
              input: { className: 'w-full', style: { width: '100%' } }
            }}
            disabled={cargando}
            required
          />
        </div>
      </div>

      {/* Botón de acción para el envío de credenciales. */}
      <Button
        type="submit"
        label={cargando ? 'Accediendo...' : 'Iniciar Sesión'}
        icon={cargando ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
        loading={cargando}
        className="w-full mt-2"
        severity="primary"
      />
    </form>
  );
};

export default FormularioLogin;

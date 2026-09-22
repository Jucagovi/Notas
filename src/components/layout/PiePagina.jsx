import React from 'react';
import { Button } from 'primereact/button';
import useTema from '../../hooks/useTema.js';

// Componente PiePagina (Footer) de la aplicación con conmutador de tema visual
const PiePagina = () => {
  const { esOscuro, alternarTema } = useTema();
  const anyoActual = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span>Administración Académica v1.0 - {anyoActual}</span>
        <Button
          type="button"
          icon={esOscuro ? 'pi pi-sun' : 'pi pi-moon'}
          label={esOscuro ? 'Modo Claro' : 'Modo Oscuro'}
          size="small"
          severity={esOscuro ? 'warning' : 'secondary'}
          text
          className="theme-toggle-btn"
          onClick={alternarTema}
          aria-label="Alternar tema claro y oscuro"
        />
      </div>
    </footer>
  );
};

export default PiePagina;

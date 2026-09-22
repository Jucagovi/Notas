import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ConfirmDialog } from 'primereact/confirmdialog';
import Cabecera from './layout/Cabecera.jsx';
import BarraLateral from './layout/BarraLateral.jsx';
import BarraLateralMovil from './layout/BarraLateralMovil.jsx';
import PiePagina from './layout/PiePagina.jsx';

// Componente principal de diseño (App Shell) que orquesta la cabecera, navegación y pie de página
const LayoutPrincipal = () => {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Se inicializan todos los submenús colapsados desde el inicio.
  const [menusExpandidos, setMenusExpandidos] = useState({});

  const manejarToggleMenu = (ruta) => {
    setMenusExpandidos((prev) => ({
      ...prev,
      [ruta]: !prev[ruta]
    }));
  };

  return (
    <div className="app-shell">
      {/* Diálogo global de confirmación */}
      <ConfirmDialog />

      {/* Cabecera superior fija */}
      <Cabecera onAbrirMenuMovil={() => setMenuMovilAbierto(true)} />

      {/* Estructura del cuerpo principal con barra lateral y contenido */}
      <div className="app-body">
        {/* Barra lateral de escritorio */}
        <BarraLateral
          menusExpandidos={menusExpandidos}
          onToggleMenu={manejarToggleMenu}
        />

        {/* Barra lateral móvil desplegable (Drawer) */}
        <BarraLateralMovil
          visible={menuMovilAbierto}
          onHide={() => setMenuMovilAbierto(false)}
          menusExpandidos={menusExpandidos}
          onToggleMenu={manejarToggleMenu}
        />

        {/* Área de contenido principal y pie de página */}
        <main className="app-main">
          <div className="main-content-wrapper">
            <Outlet />
          </div>
          <PiePagina />
        </main>
      </div>
    </div>
  );
};

export default LayoutPrincipal;

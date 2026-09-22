import React from 'react';
import NavegacionMenu from './NavegacionMenu.jsx';

// Componente BarraLateral (Sidebar) fijo para resolución de escritorio
const BarraLateral = ({ menusExpandidos, onToggleMenu }) => {
  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-section-header">Menú Principal</div>
      <NavegacionMenu
        menusExpandidos={menusExpandidos}
        onToggleMenu={onToggleMenu}
      />
    </aside>
  );
};

export default BarraLateral;

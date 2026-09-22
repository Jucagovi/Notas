import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Divider } from 'primereact/divider';
import NavegacionMenu from './NavegacionMenu.jsx';

// Componente BarraLateralMovil (Drawer) desplegable para pantallas móviles y tabletas
const BarraLateralMovil = ({ visible, onHide, menusExpandidos, onToggleMenu }) => {
  return (
    <Sidebar
      visible={visible}
      onHide={onHide}
      className="mobile-sidebar-drawer"
    >
      <div className="sidebar-header-custom">
        <div className="app-branding">
          <i className="pi pi-graduation-cap brand-icon"></i>
          <span className="brand-title">Administración Académica</span>
        </div>
      </div>
      <Divider />
      <div className="drawer-body">
        <NavegacionMenu
          menusExpandidos={menusExpandidos}
          onToggleMenu={onToggleMenu}
          onItemClick={onHide}
        />
      </div>
    </Sidebar>
  );
};

export default BarraLateralMovil;

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from './menuConfiguracion.js';

// Componente reutilizable para renderizar el menú jerárquico de navegación con submenús
const NavegacionMenu = ({ menusExpandidos, onToggleMenu, onItemClick = () => {} }) => {
  const location = useLocation();

  return (
    <nav className="nav-menu">
      {NAV_ITEMS.map((item) => {
        if (item.esDesplegable) {
          const coincideSubitem = (item.subItems || []).some((sub) => {
            const subUrl = new URL(sub.to, 'http://localhost');
            return location.pathname === subUrl.pathname;
          });
          const rutaBaseActiva = location.pathname.startsWith(item.to) || coincideSubitem;
          // Se comprueba si el submenú se encuentra expandido según el estado explícito.
          const estaAbierto = Boolean(menusExpandidos[item.to]);

          return (
            <div key={item.to} className="nav-group">
              <div
                className={`nav-item flex justify-content-between align-items-center cursor-pointer ${
                  rutaBaseActiva ? 'nav-item-active' : ''
                }`}
                onClick={() => onToggleMenu(item.to)}
              >
                <div className="flex align-items-center gap-2">
                  <i className={`${item.icon} nav-icon`}></i>
                  <span className="nav-label">{item.label}</span>
                </div>
                <i
                  className={`pi ${
                    estaAbierto ? 'pi-chevron-down' : 'pi-chevron-right'
                  } text-xs text-muted`}
                />
              </div>

              {/* Submenú desplegable */}
              {estaAbierto && (
                <div className="nav-submenu pl-3 py-1 flex flex-column gap-1">
                  {/* Se renderizan los enlaces específicos del módulo de Herramientas */}
                  {item.to === '/herramientas' ? (
                    <>
                      <NavLink
                        to="/herramientas"
                        end
                        className={({ isActive }) =>
                          `nav-subitem ${isActive && !location.search ? 'nav-subitem-active' : ''}`
                        }
                        onClick={onItemClick}
                      >
                        <i className="pi pi-th-large nav-subicon" />
                        <span>Panel Principal</span>
                      </NavLink>
                      <div className="text-xs uppercase font-bold text-muted px-2 pt-2 pb-1">
                        Seguridad
                      </div>
                      <NavLink
                        to="/herramientas/copias-seguridad"
                        className={({ isActive }) =>
                          `nav-subitem ${isActive ? 'nav-subitem-active' : ''}`
                        }
                        onClick={onItemClick}
                      >
                        <i className="pi pi-database nav-subicon" />
                        <span>Copia de seguridad</span>
                      </NavLink>
                      <NavLink
                        to="/herramientas/importacion"
                        className={({ isActive }) =>
                          `nav-subitem ${isActive ? 'nav-subitem-active' : ''}`
                        }
                        onClick={onItemClick}
                      >
                        <i className="pi pi-file-import nav-subicon" />
                        <span>Importación de datos</span>
                      </NavLink>
                      <NavLink
                        to="/herramientas/clonado-curso"
                        className={({ isActive }) =>
                          `nav-subitem ${isActive ? 'nav-subitem-active' : ''}`
                        }
                        onClick={onItemClick}
                      >
                        <i className="pi pi-copy nav-subicon" />
                        <span>Clonado curso</span>
                      </NavLink>
                      <div className="text-xs uppercase font-bold text-muted px-2 pt-2 pb-1">
                        Mantenimiento
                      </div>
                      {item.subItems
                        .filter((sub) => sub.to.includes('/mantenimiento/'))
                        .map((sub) => {
                          const subUrl = new URL(sub.to, 'http://localhost');
                          const coincideRuta = location.pathname === subUrl.pathname;
                          const subActivo = coincideRuta && !location.search;

                          return (
                            <NavLink
                              key={sub.to}
                              to={sub.to}
                              className={`nav-subitem ${subActivo ? 'nav-subitem-active' : ''}`}
                              onClick={onItemClick}
                            >
                              <i className={`${sub.icon} nav-subicon`} />
                              <span>{sub.label}</span>
                            </NavLink>
                          );
                        })}
                      <div className="text-xs uppercase font-bold text-muted px-2 pt-3 pb-1 flex align-items-center justify-content-between">
                        <span>Tablas de Relación</span>
                        <i
                          className="pi pi-shield text-xs text-orange-500"
                          title="Tablas sensibles del sistema"
                        />
                      </div>
                      {item.subItems
                        .filter((sub) => sub.to.includes('/relaciones/'))
                        .map((sub) => {
                          const subUrl = new URL(sub.to, 'http://localhost');
                          const coincideRuta = location.pathname === subUrl.pathname;
                          const subActivo = coincideRuta && !location.search;

                          return (
                            <NavLink
                              key={sub.to}
                              to={sub.to}
                              className={`nav-subitem ${subActivo ? 'nav-subitem-active' : ''}`}
                              onClick={onItemClick}
                            >
                              <i className={`${sub.icon} nav-subicon`} />
                              <span>{sub.label}</span>
                            </NavLink>
                          );
                        })}
                    </>
                  ) : (
                    item.subItems.map((sub) => {
                      const subUrl = new URL(sub.to, 'http://localhost');
                      const coincideRuta = location.pathname === subUrl.pathname;

                      let subActivo = false;
                      if (coincideRuta) {
                        if (subUrl.search) {
                          const paramsSub = new URLSearchParams(subUrl.search);
                          const paramsLoc = new URLSearchParams(location.search);
                          const pestanyaSub = paramsSub.get('pestanya');
                          const pestanyaLoc =
                            paramsLoc.get('pestanya') ||
                            (item.to === '/clases' ? 'crear' : null);
                          subActivo = pestanyaSub === pestanyaLoc;
                        } else {
                          subActivo = !location.search;
                        }
                      }

                      return (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          className={`nav-subitem ${subActivo ? 'nav-subitem-active' : ''}`}
                          onClick={onItemClick}
                        >
                          <i className={`${sub.icon} nav-subicon`} />
                          <span>{sub.label}</span>
                        </NavLink>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        }

        const isActive =
          location.pathname === item.to ||
          (item.to === '/panel-control' && location.pathname === '/');
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/' || item.to === '/panel-control'}
            className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
            onClick={onItemClick}
          >
            <i className={`${item.icon} nav-icon`}></i>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default NavegacionMenu;

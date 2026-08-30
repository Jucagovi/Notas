import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Divider } from "primereact/divider";
import { Sidebar } from "primereact/sidebar";
import useSesionContexto from "../hooks/useSesionContexto.js";
import useToast from "../hooks/useToast.js";

// Elementos del submenú Clases
const ELEMENTOS_CLASES = [
  {
    label: "Crear Clase",
    icon: "pi pi-plus-circle",
    to: "/clases?pestanya=crear",
  },
  {
    label: "Modificar Clase",
    icon: "pi pi-pencil",
    to: "/clases?pestanya=modificar",
  },
  {
    label: "Eliminar Clase",
    icon: "pi pi-trash",
    to: "/clases?pestanya=eliminar",
  },
];

// Elementos del submenú Evaluación
const ELEMENTOS_EVALUACION = [
  { label: "Asignación prácticas", icon: "pi pi-file-edit", to: "/practicas" },
  { label: "Asignación pesos", icon: "pi pi-percentage", to: "/pesos" },
  { label: "Asignación CE", icon: "pi pi-check-square", to: "/criterios" },
  { label: "Evaluación módulo", icon: "pi pi-file-edit", to: "/informes/evaluacion-modulo" },
];

// Elementos del submenú Informes
const ELEMENTOS_INFORMES = [
  { label: "Listado de informes", icon: "pi pi-list", to: "/informes" },
  { label: "Competencia individual", icon: "pi pi-compass", to: "/informes/competencia" },
  { label: "Evaluación módulo", icon: "pi pi-file-edit", to: "/informes/evaluacion-modulo" },
  { label: "Auditoría Cobertura CE", icon: "pi pi-verified", to: "/informes/cobertura-ce" },
  { label: "Calificaciones pendientes", icon: "pi pi-clock", to: "/informes/calificaciones-pendientes" },
  { label: "Análisis dificultad", icon: "pi pi-chart-bar", to: "/informes/dificultad" },
];

// Elementos de mantenimiento y utilidades dentro del submenú Herramientas
const ELEMENTOS_HERRAMIENTAS = [
  {
    label: "Copia de seguridad",
    icon: "pi pi-database",
    to: "/herramientas/copias-seguridad",
  },
  {
    label: "Importar datos",
    icon: "pi pi-file-import",
    to: "/herramientas/importacion",
  },
  {
    label: "Clonado curso",
    icon: "pi pi-copy",
    to: "/herramientas/clonado-curso",
  },
  {
    label: "Ciclos",
    icon: "pi pi-graduation-cap",
    to: "/herramientas/mantenimiento/ciclos",
  },
  {
    label: "Cursos",
    icon: "pi pi-calendar",
    to: "/herramientas/mantenimiento/cursos",
  },
  {
    label: "Módulos",
    icon: "pi pi-book",
    to: "/herramientas/mantenimiento/modulos",
  },
  {
    label: "Prácticas",
    icon: "pi pi-file-edit",
    to: "/herramientas/mantenimiento/practicas",
  },
  {
    label: "Discentes",
    icon: "pi pi-users",
    to: "/herramientas/mantenimiento/discentes",
  },
  {
    label: "RA (Resultados)",
    icon: "pi pi-check-circle",
    to: "/herramientas/mantenimiento/ra",
  },
  {
    label: "CE (Criterios)",
    icon: "pi pi-list-check",
    to: "/herramientas/mantenimiento/ce",
  },
  {
    label: "Evaluaciones",
    icon: "pi pi-calendar-plus",
    to: "/herramientas/mantenimiento/evaluaciones",
  },
];

// Elementos principales de la barra de navegación lateral
const NAV_ITEMS = [
  { label: "Panel de control", icon: "pi pi-home", to: "/" },
  { label: "Discentes", icon: "pi pi-users", to: "/discentes" },
  {
    label: "Clases",
    icon: "pi pi-building",
    to: "/clases",
    esDesplegable: true,
    subItems: ELEMENTOS_CLASES,
  },
  {
    label: "Evaluación",
    icon: "pi pi-calendar-plus",
    to: "/evaluacion",
    esDesplegable: true,
    subItems: ELEMENTOS_EVALUACION,
  },
  { label: "Calificar", icon: "pi pi-pencil", to: "/calificar" },
  {
    label: "Informes",
    icon: "pi pi-chart-bar",
    to: "/informes",
    esDesplegable: true,
    subItems: ELEMENTOS_INFORMES,
  },
  {
    label: "Herramientas",
    icon: "pi pi-wrench",
    to: "/herramientas",
    esDesplegable: true,
    subItems: ELEMENTOS_HERRAMIENTAS,
  },
  { label: "Acerca de", icon: "pi pi-info-circle", to: "/acercaDe" },
];

// Componente principal de diseño App Shell con soporte para temas y submenús desplegables
const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Se obtienen los datos del usuario y la función de cierre de sesión del contexto
  const { usuario, cerrarSesion } = useSesionContexto();
  const { mostrarInfo } = useToast();

  // Se formatea el identificador o correo del usuario actual
  const nombreUsuario =
    usuario?.user_metadata?.nombre || usuario?.email || "Docente";
  const rolUsuario = usuario?.user_metadata?.rol || "Docente / Administrador";
  const inicialesUsuario = usuario?.email
    ? usuario.email.substring(0, 2).toUpperCase()
    : "PR";

  // Se gestiona la acción de cierre de sesión
  const manejarCierreSesion = async () => {
    await cerrarSesion();
    mostrarInfo("Sesión finalizada", "Ha cerrado la sesión correctamente.");
    navigate("/iniciar-sesion", { replace: true });
  };

  // Control dinámico del estado desplegado de menús con subelementos
  const [menusExpandidos, setMenusExpandidos] = useState({});

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  const currentYear = new Date().getFullYear();

  // Sincronización del tema claro u oscuro con el DOM y almacenamiento local
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-theme");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Se conmuta el tema visual de la aplicación
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  // Renderizado del árbol de enlaces de navegación con soporte para submenús desplegables
  const renderNavLinks = (onItemClick = () => {}) => (
    <nav className='nav-menu'>
      {NAV_ITEMS.map((item) => {
        if (item.esDesplegable) {
          const coincideSubitem = (item.subItems || []).some((sub) => {
            const subUrl = new URL(sub.to, "http://localhost");
            return location.pathname === subUrl.pathname;
          });
          const rutaBaseActiva =
            location.pathname.startsWith(item.to) || coincideSubitem;
          const estaAbierto =
            menusExpandidos[item.to] !== undefined
              ? menusExpandidos[item.to]
              : rutaBaseActiva;

          return (
            <div key={item.to} className='nav-group'>
              <div
                className={`nav-item flex justify-content-between align-items-center cursor-pointer ${
                  rutaBaseActiva ? "nav-item-active" : ""
                }`}
                onClick={() =>
                  setMenusExpandidos((prev) => ({
                    ...prev,
                    [item.to]: !estaAbierto,
                  }))
                }
              >
                <div className='flex align-items-center gap-2'>
                  <i className={`${item.icon} nav-icon`}></i>
                  <span className='nav-label'>{item.label}</span>
                </div>
                <i
                  className={`pi ${
                    estaAbierto ? "pi-chevron-down" : "pi-chevron-right"
                  } text-xs text-muted`}
                />
              </div>

              {/* Submenú desplegable */}
              {estaAbierto && (
                <div className='nav-submenu pl-3 py-1 flex flex-column gap-1'>
                  {/* Se renderizan los enlaces específicos del módulo de Herramientas */}
                  {item.to === "/herramientas" ? (
                    <>
                      <NavLink
                        to='/herramientas'
                        end
                        className={({ isActive }) =>
                          `nav-subitem ${isActive && !location.search ? "nav-subitem-active" : ""}`
                        }
                        onClick={onItemClick}
                      >
                        <i className='pi pi-th-large nav-subicon' />
                        <span>Panel Principal</span>
                      </NavLink>
                      <div className='text-xs uppercase font-bold text-muted px-2 pt-2 pb-1'>
                        Seguridad
                      </div>
                      <NavLink
                        to='/herramientas/copias-seguridad'
                        className={({ isActive }) =>
                          `nav-subitem ${isActive ? "nav-subitem-active" : ""}`
                        }
                        onClick={onItemClick}
                      >
                        <i className='pi pi-database nav-subicon' />
                        <span>Copia de seguridad</span>
                      </NavLink>
                      <NavLink
                        to='/herramientas/importacion'
                        className={({ isActive }) =>
                          `nav-subitem ${isActive ? "nav-subitem-active" : ""}`
                        }
                        onClick={onItemClick}
                      >
                        <i className='pi pi-file-import nav-subicon' />
                        <span>Importar datos</span>
                      </NavLink>
                      <NavLink
                        to='/herramientas/clonado-curso'
                        className={({ isActive }) =>
                          `nav-subitem ${isActive ? "nav-subitem-active" : ""}`
                        }
                        onClick={onItemClick}
                      >
                        <i className='pi pi-copy nav-subicon' />
                        <span>Clonado curso</span>
                      </NavLink>
                      <div className='text-xs uppercase font-bold text-muted px-2 pt-2 pb-1'>
                        Mantenimiento
                      </div>
                      {item.subItems
                        .filter((sub) => sub.to.includes("/mantenimiento/"))
                        .map((sub) => {
                          const subUrl = new URL(sub.to, "http://localhost");
                          const coincideRuta =
                            location.pathname === subUrl.pathname;
                          const subActivo = coincideRuta && !location.search;

                          return (
                            <NavLink
                              key={sub.to}
                              to={sub.to}
                              className={`nav-subitem ${subActivo ? "nav-subitem-active" : ""}`}
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
                      const subUrl = new URL(sub.to, "http://localhost");
                      const coincideRuta =
                        location.pathname === subUrl.pathname;

                      // Para rutas con parámetros como ?pestanya=crear, si no hay search se considera activa la opción por defecto (crear)
                      let subActivo = false;
                      if (coincideRuta) {
                        if (subUrl.search) {
                          const paramsSub = new URLSearchParams(subUrl.search);
                          const paramsLoc = new URLSearchParams(
                            location.search,
                          );
                          const pestanyaSub = paramsSub.get("pestanya");
                          const pestanyaLoc =
                            paramsLoc.get("pestanya") ||
                            (item.to === "/clases" ? "crear" : null);
                          subActivo = pestanyaSub === pestanyaLoc;
                        } else {
                          subActivo = !location.search;
                        }
                      }

                      return (
                        <NavLink
                          key={sub.to}
                          to={sub.to}
                          className={`nav-subitem ${subActivo ? "nav-subitem-active" : ""}`}
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

        const isActive = location.pathname === item.to;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`nav-item ${isActive ? "nav-item-active" : ""}`}
            onClick={onItemClick}
          >
            <i className={`${item.icon} nav-icon`}></i>
            <span className='nav-label'>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className='app-shell'>
      {/* Cabecera superior / Header */}
      <header className='app-header'>
        <div className='header-start'>
          <button
            type='button'
            className='mobile-toggle-btn'
            onClick={() => setMobileMenuOpen(true)}
            aria-label='Abrir menú de navegación'
          >
            <i className='pi pi-bars'></i>
          </button>
          <div className='app-branding'>
            <i className='pi pi-book brand-icon'></i>
            <span className='brand-title'>Control de Notas</span>
          </div>
        </div>

        <div className='header-end'>
          <div className='user-profile'>
            <Avatar
              label={inicialesUsuario}
              icon={!usuario ? "pi pi-user" : undefined}
              shape='circle'
              className='user-avatar font-bold'
            />
            <div className='user-info'>
              <span className='user-name'>{nombreUsuario}</span>
              <span className='user-role'>{rolUsuario}</span>
            </div>
          </div>
          <Button
            type='button'
            icon='pi pi-sign-out'
            label='Salir'
            size='small'
            severity='secondary'
            text
            className='logout-btn'
            onClick={manejarCierreSesion}
          />
        </div>
      </header>

      {/* Estructura del cuerpo principal con barra lateral y contenido */}
      <div className='app-body'>
        {/* Barra lateral de escritorio */}
        <aside className='desktop-sidebar'>
          <div className='sidebar-section-header'>Menú Principal</div>
          {renderNavLinks()}
        </aside>

        {/* Barra lateral móvil en Drawer / Sidebar */}
        <Sidebar
          visible={mobileMenuOpen}
          onHide={() => setMobileMenuOpen(false)}
          className='mobile-sidebar-drawer'
        >
          <div className='sidebar-header-custom'>
            <div className='app-branding'>
              <i className='pi pi-book brand-icon'></i>
              <span className='brand-title'>Control de Notas</span>
            </div>
          </div>
          <Divider />
          <div className='drawer-body'>
            {renderNavLinks(() => setMobileMenuOpen(false))}
          </div>
        </Sidebar>

        {/* Área de contenido principal */}
        <main className='app-main'>
          <div className='main-content-wrapper'>
            <Outlet />
          </div>

          {/* Pie de página */}
          <footer className='app-footer'>
            <div className='footer-content'>
              <span>Control de Notas v1.0 - {currentYear}</span>
              <Button
                type='button'
                icon={isDarkMode ? "pi pi-sun" : "pi pi-moon"}
                label={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
                size='small'
                severity={isDarkMode ? "warning" : "secondary"}
                text
                className='theme-toggle-btn'
                onClick={toggleTheme}
                aria-label='Alternar tema claro y oscuro'
              />
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;

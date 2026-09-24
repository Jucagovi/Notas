import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import HeaderPagina from '../../components/common/HeaderPagina.jsx';
import useAyuda from '../../hooks/useAyuda.js';
import {
  BuscadorAyuda,
  GuiaInicioPasoAPaso,
  ManualModulosComplejos
} from '../../components/ayuda/index.js';

/**
 * AyudaPagina - Página orquestadora del Centro de Ayuda y Guía de Onboarding.
 *
 * Responsabilidad Única: Orquestar el estado de navegación de la vista,
 * renderizando la cabecera institucional y el componente TabView que divide
 * el carril vertical con numeración destacada y el manual de módulos complejos.
 */
const AyudaPagina = () => {
  const {
    indicePestanya,
    cambiarPestanya,
    terminoBusqueda,
    setTerminoBusqueda,
    categoriaSeleccionada,
    setCategoriaSeleccionada,
    categoriasDisponibles,
    pasosFiltrados,
    temasFiltrados,
    temaSeleccionadoId,
    setTemaSeleccionadoId,
    temaSeleccionado,
    modoVistaManual,
    setModoVistaManual,
    limpiarFiltros
  } = useAyuda();

  return (
    <div className="flex flex-column w-full pb-6">
      {/* Cabecera estándar institucional */}
      <HeaderPagina
        titulo="Centro de Ayuda y Guía de Onboarding"
        descripcion="Manual interactivo de configuración inicial para principio de curso y resolución de dudas técnicas complejas."
      />

      {/* Buscador y selector de categorías contextual */}
      <BuscadorAyuda
        terminoBusqueda={terminoBusqueda}
        onCambiarBusqueda={setTerminoBusqueda}
        onLimpiarBusqueda={limpiarFiltros}
        categoriaSeleccionada={categoriaSeleccionada}
        onSeleccionarCategoria={setCategoriaSeleccionada}
        categoriasDisponibles={categoriasDisponibles}
        mostrarCategorias={indicePestanya === 1}
        totalCoincidencias={
          indicePestanya === 0
            ? pasosFiltrados.length
            : temasFiltrados.length
        }
      />

      {/* Contenedor principal con pestañas */}
      <div className="surface-card border-round shadow-1 border-1 surface-border p-3 md:p-4 w-full">
        <TabView
          activeIndex={indicePestanya}
          onTabChange={(e) => cambiarPestanya(e.index)}
          className="w-full"
        >
          {/* Pestaña 1: Camino Feliz en carril vertical con numeración y descripción amplia */}
          <TabPanel
            header="Guía de Inicio (Paso a Paso)"
            leftIcon="pi pi-compass mr-2"
          >
            <GuiaInicioPasoAPaso
              pasos={pasosFiltrados}
              onRestablecerFiltros={limpiarFiltros}
            />
          </TabPanel>

          {/* Pestaña 2: Manual de Módulos Complejos en formato Maestro-Detalle / Cuadrícula */}
          <TabPanel
            header="Manual de Módulos Complejos"
            leftIcon="pi pi-book mr-2"
          >
            <ManualModulosComplejos
              temas={temasFiltrados}
              temaSeleccionadoId={temaSeleccionadoId}
              onSeleccionarTema={setTemaSeleccionadoId}
              temaSeleccionado={temaSeleccionado}
              modoVistaManual={modoVistaManual}
              onCambiarModoVista={setModoVistaManual}
              onRestablecerFiltros={limpiarFiltros}
            />
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default AyudaPagina;

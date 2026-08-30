import React, { useState, useEffect, useRef } from 'react';
import { createSwapy } from 'swapy';
import { Divider } from 'primereact/divider';
import { ProgressSpinner } from 'primereact/progressspinner';
import EvaluacionGestionContexto from '../context/EvaluacionGestionContexto.jsx';
import useEvaluacionGestionContexto from '../hooks/useEvaluacionGestionContexto.js';
import EvaluacionFiltros from '../components/evaluaciones/EvaluacionFiltros.jsx';
import PracticasColumna from '../components/evaluaciones/PracticasColumna.jsx';
import RACEAcordeon from '../components/evaluaciones/RACEAcordeon.jsx';
import DialogoPorcentajeCobertura from '../components/evaluaciones/DialogoPorcentajeCobertura.jsx';
import DialogoEditarPorcentaje from '../components/evaluaciones/DialogoEditarPorcentaje.jsx';
import DialogoDetallePractica from '../components/evaluaciones/DialogoDetallePractica.jsx';
import DialogoGestionEvaluacion from '../components/evaluaciones/DialogoGestionEvaluacion.jsx';

// Componente interno que orquesta los elementos visuales dentro del contexto de evaluación
const EvaluacionesContenido = () => {
  const {
    moduloSeleccionadoId,
    practicas,
    estructuraRA,
    cargando
  } = useEvaluacionGestionContexto();

  const swapyContainerRef = useRef(null);
  const swapyInstanceRef = useRef(null);

  // Estados para los distintos modales de diálogo
  const [dialogoAsignacionVisible, setDialogoAsignacionVisible] = useState(false);
  const [datosAsignacion, setDatosAsignacion] = useState(null); // { practica, ce }

  const [dialogoEdicionVisible, setDialogoEdicionVisible] = useState(false);
  const [asignacionAEditar, setAsignacionAEditar] = useState(null);

  const [dialogoDetalleVisible, setDialogoDetalleVisible] = useState(false);
  const [practicaDetalle, setPracticaDetalle] = useState(null);

  const [dialogoGestionEvaluacionVisible, setDialogoGestionEvaluacionVisible] = useState(false);

  // Inicialización y actualización de la instancia de Swapy para la interacción Drag & Drop
  useEffect(() => {
    if (!swapyContainerRef.current) return;

    // Se destruye la instancia previa si existía
    if (swapyInstanceRef.current) {
      swapyInstanceRef.current.destroy();
      swapyInstanceRef.current = null;
    }

    try {
      const swapy = createSwapy(swapyContainerRef.current, {
        animation: 'dynamic',
        swapMode: 'drop'
      });

      // Se captura el evento al finalizar un swap entre una práctica y un slot de CE
      swapy.onSwapEnd((event) => {
        if (event && event.hasChanged && event.slotItemMap) {
          const mapArray = event.slotItemMap.asArray || [];
          mapArray.forEach(({ slot, item }) => {
            if (slot && slot.startsWith('slot-ce-') && item && item.startsWith('practica-')) {
              const idCE = slot.replace('slot-ce-', '');
              const idPractica = item.replace('practica-', '');

              const practicaEncontrada = practicas.find((p) => p.id_practica === idPractica);
              let ceEncontrado = null;
              estructuraRA.forEach((ra) => {
                const ce = (ra.criterios || []).find((c) => c.id_ce === idCE);
                if (ce) ceEncontrado = ce;
              });

              if (practicaEncontrada && ceEncontrado) {
                setDatosAsignacion({ practica: practicaEncontrada, ce: ceEncontrado });
                setDialogoAsignacionVisible(true);
              }
            }
          });
        }
      });

      swapyInstanceRef.current = swapy;
    } catch (err) {
      console.warn('Nota: Inicialización Swapy adaptada para este contenedor:', err);
    }

    return () => {
      if (swapyInstanceRef.current) {
        swapyInstanceRef.current.destroy();
        swapyInstanceRef.current = null;
      }
    };
  }, [practicas, estructuraRA, moduloSeleccionadoId]);

  // Manejo de la acción al soltar una práctica sobre un CE (capturado por HTML5 drop o Swapy)
  const manejarSoltarPracticaEnCE = ({ practica, ce }) => {
    // Si la práctica es un objeto con id_practica
    const practicaObj =
      practicas.find((p) => p.id_practica === practica.id_practica) || practica;

    setDatosAsignacion({ practica: practicaObj, ce });
    setDialogoAsignacionVisible(true);
  };

  // Manejo de la asignación manual desde el botón "+" en la lista de prácticas
  const manejarSeleccionarPracticaManual = (practica) => {
    // Si hay criterios disponibles en el módulo, se toma el primero como sugerencia o se abre para selección
    let primerCE = null;
    if (estructuraRA.length > 0 && estructuraRA[0].criterios && estructuraRA[0].criterios.length > 0) {
      primerCE = estructuraRA[0].criterios[0];
    }
    if (primerCE) {
      setDatosAsignacion({ practica, ce: primerCE });
      setDialogoAsignacionVisible(true);
    }
  };

  // Manejo de la asignación manual desde el botón "+ Asignar" en un CE
  const manejarAsignarManualDesdeCE = (ce) => {
    let primeraPractica = practicas.length > 0 ? practicas[0] : null;
    if (primeraPractica) {
      setDatosAsignacion({ practica: primeraPractica, ce });
      setDialogoAsignacionVisible(true);
    }
  };

  return (
    <div className="page-container">
      {/* Cabecera principal de la página */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Evaluaciones</h1>
          <p className="text-muted m-0 mt-1 text-sm">
            Mapeo interactivo de Prácticas a Resultados de Aprendizaje (RA) y Criterios de Evaluación (CE) con gestión de convocatorias evaluativas.
          </p>
        </div>
      </div>

      <Divider />

      {/* Barra superior de selección y filtros */}
      <EvaluacionFiltros
        alAbrirGestionEvaluacion={() => setDialogoGestionEvaluacionVisible(true)}
      />

      {/* Contenedor principal de Drag & Drop con Swapy */}
      {cargando ? (
        <div className="flex flex-column align-items-center justify-content-center p-6 surface-card border-round shadow-1">
          <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
          <span className="text-muted text-sm mt-3">Cargando datos de evaluación y criterios...</span>
        </div>
      ) : !moduloSeleccionadoId ? (
        <div className="surface-card p-6 border-round shadow-1 text-center flex flex-column align-items-center justify-content-center">
          <i className="pi pi-compass text-6xl text-primary mb-3" />
          <h3 className="text-xl font-bold m-0 mb-2">Seleccione un Módulo o Evaluación</h3>
          <p className="text-muted text-sm m-0 max-w-28rem mb-4">
            Utilice los desplegables de la parte superior para cargar el catálogo de prácticas y la estructura de Resultados de Aprendizaje correspondiente.
          </p>
        </div>
      ) : (
        <div ref={swapyContainerRef} className="grid" style={{ minHeight: '500px' }}>
          {/* Columna Izquierda: Catálogo de Prácticas del Módulo */}
          <div className="col-12 lg:col-5 xl:col-4">
            <PracticasColumna
              alSeleccionarPractica={manejarSeleccionarPracticaManual}
              alVerDetallePractica={(practica) => {
                setPracticaDetalle(practica);
                setDialogoDetalleVisible(true);
              }}
            />
          </div>

          {/* Área Derecha: Acordeón de RA y Zonas de Soltado en cada CE */}
          <div className="col-12 lg:col-7 xl:col-8">
            <RACEAcordeon
              alSoltarPracticaEnCE={manejarSoltarPracticaEnCE}
              alEditarAsignacion={(asig) => {
                setAsignacionAEditar(asig);
                setDialogoEdicionVisible(true);
              }}
              alAsignarManual={manejarAsignarManualDesdeCE}
            />
          </div>
        </div>
      )}

      {/* Diálogo para definir el porcentaje de cobertura al asignar una práctica a un CE */}
      <DialogoPorcentajeCobertura
        visible={dialogoAsignacionVisible}
        alOcultar={() => {
          setDialogoAsignacionVisible(false);
          setDatosAsignacion(null);
        }}
        datosSeleccion={datosAsignacion}
      />

      {/* Diálogo para editar el porcentaje de una asignación existente */}
      <DialogoEditarPorcentaje
        visible={dialogoEdicionVisible}
        alOcultar={() => {
          setDialogoEdicionVisible(false);
          setAsignacionAEditar(null);
        }}
        asignacion={asignacionAEditar}
      />

      {/* Diálogo para ver el detalle de una práctica */}
      <DialogoDetallePractica
        visible={dialogoDetalleVisible}
        alOcultar={() => {
          setDialogoDetalleVisible(false);
          setPracticaDetalle(null);
        }}
        practica={practicaDetalle}
      />

      {/* Diálogo para gestionar las prácticas de la evaluación seleccionada */}
      <DialogoGestionEvaluacion
        visible={dialogoGestionEvaluacionVisible}
        alOcultar={() => setDialogoGestionEvaluacionVisible(false)}
      />
    </div>
  );
};

// Componente principal exportado envuelto en su proveedor de contexto
const EvaluacionesPagina = () => {
  return (
    <EvaluacionGestionContexto>
      <EvaluacionesContenido />
    </EvaluacionGestionContexto>
  );
};

export default EvaluacionesPagina;

import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Message } from 'primereact/message';
import { confirmarBorrado } from '../../components/common/ModalConfirmacion.jsx';
import useTablaMantenimiento from '../../hooks/useTablaMantenimiento.js';
import useGlobalToast from '../../hooks/useGlobalToast.js';
import CabeceraMantenimiento from '../../components/mantenimiento/CabeceraMantenimiento.jsx';
import SelectorTabla from '../../components/mantenimiento/SelectorTabla.jsx';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';
import DialogoFormulario from '../../components/mantenimiento/DialogoFormulario.jsx';
import { TABLAS_MAESTRAS } from '../../components/mantenimiento/configuracionTablas.js';

// Página orquestadora para el mantenimiento directo (CRUD) de las tablas maestras del sistema.
const MantenimientoPagina = () => {
  const { tabla = 'ciclos', '*': restoRuta } = useParams();
  const slugActivo = (tabla || restoRuta || 'ciclos').toLowerCase();

  // Si la tabla no pertenece al grupo de tablas maestras, redirige a la tabla predeterminada
  if (!TABLAS_MAESTRAS[slugActivo]) {
    return <Navigate to="/herramientas/mantenimiento/ciclos" replace />;
  }

  const {
    config,
    datos,
    cargando,
    error,
    recargar,
    opcionesReferencia,
    crearRegistro,
    actualizarRegistro,
    eliminarRegistro
  } = useTablaMantenimiento(slugActivo);

  const { mostrarExito, mostrarError } = useGlobalToast();

  const [dialogoVisible, setDialogoVisible] = useState(false);
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Apertura del modal en modo creación
  const manejarNuevo = () => {
    setRegistroSeleccionado(null);
    setDialogoVisible(true);
  };

  // Apertura del modal en modo edición
  const manejarEditar = (registro) => {
    setRegistroSeleccionado(registro);
    setDialogoVisible(true);
  };

  // Confirmación crítica y eliminación del registro seleccionado
  const manejarEliminar = (registro) => {
    confirmarBorrado({
      message: `¿Deseas eliminar este registro de ${config.singular}? Esta acción no se puede deshacer y puede afectar en cascada a datos asociados.`,
      header: 'Confirmar Eliminación',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      onAceptar: async () => {
        const id = registro[config.clavePrimaria];
        const resultado = await eliminarRegistro(id);
        if (resultado) {
          mostrarExito(`El registro de ${config.singular} ha sido eliminado correctamente.`);
        } else {
          mostrarError(`No se ha podido eliminar el registro. Comprueba si existen claves foráneas dependientes.`);
        }
      }
    });
  };

  // Guardado de datos tanto para nuevos registros como para actualizaciones
  const manejarGuardar = async (valoresFormulario) => {
    setGuardando(true);
    try {
      if (registroSeleccionado) {
        const id = registroSeleccionado[config.clavePrimaria];
        const res = await actualizarRegistro(id, valoresFormulario);
        if (res) {
          mostrarExito(`${config.singular} actualizado con éxito.`);
          setDialogoVisible(false);
        } else {
          mostrarError(`Error al actualizar el registro de ${config.singular}.`);
        }
      } else {
        const res = await crearRegistro(valoresFormulario);
        if (res) {
          mostrarExito(`${config.singular} creado con éxito.`);
          setDialogoVisible(false);
        } else {
          mostrarError(`Error al crear el nuevo registro de ${config.singular}.`);
        }
      }
    } catch (err) {
      console.error('Error durante el guardado:', err);
      mostrarError('Se produjo un error imprevisto al guardar los datos.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-column w-full">
      {/* 1. Cabecera informativa */}
      <CabeceraMantenimiento
        titulo={config.titulo}
        descripcion={config.descripcion}
        icono={config.icono}
        esRelacion={false}
        nombreTabla={config.nombreTabla}
      />

      {/* 2. Selector ágil entre tablas maestras */}
      <SelectorTabla tablaActivaSlug={slugActivo} esRelacion={false} />

      {/* 3. Notificación de error si falla la consulta */}
      {error && (
        <div className="mb-3">
          <Message severity="error" text={error} className="w-full justify-content-start" />
        </div>
      )}

      {/* 4. Tabla de datos presentacional */}
      <TablaMantenimiento
        datos={datos}
        columnas={config.columnas}
        cargando={cargando}
        opcionesReferencia={opcionesReferencia}
        onNuevo={manejarNuevo}
        onEditar={manejarEditar}
        onEliminar={manejarEliminar}
        onActualizar={recargar}
        etiquetaSingular={config.singular}
      />

      {/* 5. Modal de formulario para inserción y edición */}
      <DialogoFormulario
        visible={dialogoVisible}
        registro={registroSeleccionado}
        campos={config.camposFormulario}
        opcionesReferencia={opcionesReferencia}
        cargando={guardando}
        onGuardar={manejarGuardar}
        onOcultar={() => setDialogoVisible(false)}
        etiquetaSingular={config.singular}
      />
    </div>
  );
};

export default MantenimientoPagina;

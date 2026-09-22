import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Message } from 'primereact/message';
import { confirmarBorrado } from '../../components/common/ModalConfirmacion.jsx';
import useTablaMantenimiento from '../../hooks/useTablaMantenimiento.js';
import useGlobalToast from '../../hooks/useGlobalToast.js';
import CabeceraMantenimiento from '../../components/mantenimiento/CabeceraMantenimiento.jsx';
import SelectorTabla from '../../components/mantenimiento/SelectorTabla.jsx';
import AlertaTablaSensible from '../../components/mantenimiento/AlertaTablaSensible.jsx';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';
import DialogoFormulario from '../../components/mantenimiento/DialogoFormulario.jsx';
import { TABLAS_RELACIONES } from '../../components/mantenimiento/configuracionTablas.js';

// Página orquestadora para la administración técnica de tablas de relación sensibles.
const RelacionesPagina = () => {
  const { tabla = 'desarrollan', '*': restoRuta } = useParams();
  const slugActivo = (tabla || restoRuta || 'desarrollan').toLowerCase();

  // Si la tabla no pertenece al grupo de relaciones, redirige a la relación predeterminada
  if (!TABLAS_RELACIONES[slugActivo]) {
    return <Navigate to="/herramientas/relaciones/desarrollan" replace />;
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

  // Confirmación crítica con advertencia reforzada para tablas de relación
  const manejarEliminar = (registro) => {
    confirmarBorrado({
      message: `ATENCIÓN: Estás a punto de eliminar un vínculo en la tabla de relación "${config.nombreTabla}". Esta operación puede romper la correlación entre módulos, evaluaciones o discentes. ¿Confirmas la eliminación?`,
      header: 'Advertencia de Integridad Referencial',
      acceptLabel: 'Confirmar Eliminación',
      rejectLabel: 'Cancelar',
      onAceptar: async () => {
        const id = registro[config.clavePrimaria];
        const resultado = await eliminarRegistro(id);
        if (resultado) {
          mostrarExito(`Vínculo de ${config.singular} eliminado.`);
        } else {
          mostrarError(`No se pudo eliminar el vínculo. Puede estar restringido por restricciones de clave foránea.`);
        }
      }
    });
  };

  // Guardado de registros en la tabla de relación
  const manejarGuardar = async (valoresFormulario) => {
    setGuardando(true);
    try {
      if (registroSeleccionado) {
        const id = registroSeleccionado[config.clavePrimaria];
        const res = await actualizarRegistro(id, valoresFormulario);
        if (res) {
          mostrarExito(`Vínculo de ${config.singular} actualizado con éxito.`);
          setDialogoVisible(false);
        } else {
          mostrarError(`Error al actualizar el vínculo en ${config.nombreTabla}.`);
        }
      } else {
        const res = await crearRegistro(valoresFormulario);
        if (res) {
          mostrarExito(`Nuevo vínculo de ${config.singular} registrado con éxito.`);
          setDialogoVisible(false);
        } else {
          mostrarError(`Error al crear el vínculo en ${config.nombreTabla}.`);
        }
      }
    } catch (err) {
      console.error('Error al guardar en tabla de relación:', err);
      mostrarError('Se produjo un error al guardar el registro relacional.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="flex flex-column w-full">
      {/* 1. Cabecera con distintivo de tabla sensible */}
      <CabeceraMantenimiento
        titulo={config.titulo}
        descripcion={config.descripcion}
        icono={config.icono}
        esRelacion={true}
        nombreTabla={config.nombreTabla}
      />

      {/* 2. Advertencia visual de impacto referencial */}
      <AlertaTablaSensible nombreTabla={config.nombreTabla} />

      {/* 3. Selector ágil entre tablas de relación */}
      <SelectorTabla tablaActivaSlug={slugActivo} esRelacion={true} />

      {/* 4. Notificación de error si falla la consulta */}
      {error && (
        <div className="mb-3">
          <Message severity="error" text={error} className="w-full justify-content-start" />
        </div>
      )}

      {/* 5. Tabla de datos relacional */}
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

      {/* 6. Modal de formulario para edición y alta */}
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

export default RelacionesPagina;

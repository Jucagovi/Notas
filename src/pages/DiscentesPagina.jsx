import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import CargadorSeccion from '../components/common/CargadorSeccion.jsx';
import DirectorioDiscentes from '../components/discentes/DirectorioDiscentes.jsx';
import CabeceraFichaDiscente from '../components/discentes/CabeceraFichaDiscente.jsx';
import DesgloseModulosDiscente from '../components/discentes/DesgloseModulosDiscente.jsx';
import useDiscentes from '../hooks/useDiscentes.js';
import useClases from '../hooks/useClases.js';
import useDatos from '../hooks/useDatos.js';
import useFichaDiscente from '../hooks/useFichaDiscente.js';
import useGlobalToast from '../hooks/useGlobalToast.js';

/**
 * DiscentesPagina - Componente orquestador de la vista de Discentes e Informe 360º.
 *
 * Responsabilidad Única: Coordinar la navegación entre el directorio de discentes con filtros
 * avanzados e InputSwitch y el informe 360º del discente estructurado por años académicos y clases.
 */
const DiscentesPagina = () => {
  const { idDiscente } = useParams();
  const navigate = useNavigate();
  const { mostrarExito, mostrarError } = useGlobalToast();

  // Custom Hook para el listado general del directorio de discentes
  const discentesState = useDiscentes();

  // Custom Hook para el catálogo de clases con ordenación cronológica
  const { clases, cargando: cargandoClases } = useClases();

  // Servicio para consultar las matrículas de la tabla imparte (utilizado en el filtrado por clase)
  const {
    datos: imparteData,
    obtenerDatos: obtenerImparte
  } = useDatos('imparte');

  // Servicio para actualizar el estado del discente mediante el InputSwitch
  const { actualizar: actualizarDiscente } = useDatos('Discentes');

  // Se consultan las matrículas de discentes al cargar el orquestador
  useEffect(() => {
    obtenerImparte('id_curso, id_modulo, id_discente');
  }, [obtenerImparte]);

  // Custom Hook para el informe 360º, evaluaciones en celda y gráficos
  const {
    discente,
    aniosAcademicos,
    anioSeleccionado,
    clasesMatriculadas,
    cargando: cargandoFicha,
    guardando: guardandoNota,
    obtenerHistorialDiscente,
    actualizarNotaFicha
  } = useFichaDiscente();

  // Carga reactiva del expediente cuando se selecciona un discente en la ruta
  useEffect(() => {
    if (idDiscente) {
      obtenerHistorialDiscente(idDiscente);
    }
  }, [idDiscente, obtenerHistorialDiscente]);

  // Manejador para alternar el año académico desde los botones de la cabecera de la ficha
  const alCambiarAnio = (nuevoAnio) => {
    if (idDiscente && nuevoAnio) {
      obtenerHistorialDiscente(idDiscente, nuevoAnio);
    }
  };

  // Manejador para activar o desactivar al discente desde el InputSwitch del directorio
  const alAlternarActivo = async (discenteAfectado, nuevoEstado) => {
    try {
      const res = await actualizarDiscente('id_discente', discenteAfectado.id_discente, {
        activo: nuevoEstado
      });

      if (res) {
        discentesState.setDatos((prev) =>
          prev.map((d) =>
            d.id_discente === discenteAfectado.id_discente
              ? { ...d, activo: nuevoEstado }
              : d
          )
        );
        mostrarExito(
          `Discente ${discenteAfectado.nombre} ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`
        );
      }
    } catch (err) {
      console.error('Error al actualizar el estado del discente:', err);
      mostrarError('No se ha podido actualizar el estado del discente.');
    }
  };

  // Manejador para guardar o modificar una nota desde la edición en celda
  const alGuardarNota = async (idVersion, idEvaluacion, nota) => {
    if (!idDiscente) return;
    await actualizarNotaFicha(idVersion, idEvaluacion, idDiscente, nota);
  };

  // Si hay un alumno seleccionado en la URL, se muestra su ficha completa 360º
  if (idDiscente) {
    const tituloFicha = discente
      ? `${discente.apellidos}, ${discente.nombre} — Informe 360º`
      : 'Informe 360º del Discente';

    const accionesCabecera = (
      <Button
        label="Directorio"
        icon="pi pi-users"
        size="small"
        outlined
        onClick={() => navigate('/discentes')}
        tooltip="Volver al catálogo general de discentes"
        tooltipOptions={{ position: 'bottom' }}
      />
    );

    const anioActualObj = aniosAcademicos.find((a) => a.value === anioSeleccionado);
    const etiquetaAnioActual = anioActualObj ? anioActualObj.label : `${anioSeleccionado}/${Number(anioSeleccionado) + 1}`;

    return (
      <div className="flex flex-column w-full pb-4">
        <HeaderPagina
          titulo={tituloFicha}
          descripcion="Expediente integral de rendimiento académico desglosado por año académico, clases y actividades prácticas."
          acciones={accionesCabecera}
        />

        {cargandoFicha && !discente ? (
          <CargadorSeccion tipo="tabla" filas={5} columnas={3} />
        ) : (
          <>
            {/* Panel de cabecera con avatar, datos personales y botones de Año Académico */}
            <CabeceraFichaDiscente
              discente={discente}
              aniosAcademicos={aniosAcademicos}
              anioSeleccionado={anioSeleccionado}
              onSeleccionarAnio={alCambiarAnio}
              onVolver={() => navigate('/discentes')}
            />

            {/* Pestañas por clases matriculadas en el año seleccionado con tabla y gráficos */}
            <DesgloseModulosDiscente
              clases={clasesMatriculadas}
              anioEtiqueta={etiquetaAnioActual}
              cargando={cargandoFicha}
              guardando={guardandoNota}
              onGuardarNota={alGuardarNota}
              onError={(msg) => mostrarError(msg)}
            />
          </>
        )}
      </div>
    );
  }

  // Vista predeterminada: Directorio general de discentes
  return (
    <div className="flex flex-column w-full pb-4">
      <HeaderPagina
        titulo="Discentes"
        descripcion="Directorio de estudiantes matriculados y acceso al informe integral de rendimiento 360º."
      />

      <DirectorioDiscentes
        discentes={discentesState.datos}
        clases={clases}
        imparte={imparteData}
        cargando={discentesState.cargando || cargandoClases}
        onSeleccionarDiscente={(alumno) => navigate(`/discentes/${alumno.id_discente}`)}
        onAlternarActivo={alAlternarActivo}
      />
    </div>
  );
};

export default DiscentesPagina;

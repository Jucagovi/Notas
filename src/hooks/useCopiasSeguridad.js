import { useState, useCallback } from 'react';
import useToast from './useToast.js';
import {
  TABLAS_SISTEMA,
  obtenerTabla,
  getCopiaCompleta,
  descargarJSON,
  generarMarcaTiempo
} from '../services/backupService.js';

// Hook personalizado para gestionar el proceso de exportación y descarga de copias de seguridad
const useCopiasSeguridad = () => {
  const [cargandoCompleto, setCargandoCompleto] = useState(false);
  const [cargandoTabla, setCargandoTabla] = useState({});
  const { mostrarExito, mostrarError, mostrarInfo } = useToast();

  // Se ejecuta la exportación completa de todas las tablas en un único archivo JSON consolidado
  const exportarCopiaCompleta = useCallback(async () => {
    setCargandoCompleto(true);
    mostrarInfo('Generando copia completa', 'Consultando todas las tablas del sistema...');

    try {
      const copia = await getCopiaCompleta();
      const marcaTiempo = generarMarcaTiempo();
      const nombreArchivo = `backup_completo_${marcaTiempo}.json`;

      descargarJSON(copia, nombreArchivo);

      mostrarExito(
        'Copia de seguridad completada',
        `Se han exportado ${copia.metadatos.total_registros} registros de ${copia.metadatos.total_tablas} tablas.`
      );
      return true;
    } catch (err) {
      console.error('Error al generar la copia de seguridad completa:', err);
      mostrarError(
        'Error al exportar',
        'No se pudo generar la copia completa de la base de datos.'
      );
      return false;
    } finally {
      setCargandoCompleto(false);
    }
  }, [mostrarExito, mostrarError, mostrarInfo]);

  // Se ejecuta la exportación granular de una tabla individual
  const exportarTablaIndividual = useCallback(async (tablaId, nombreLegible = tablaId) => {
    setCargandoTabla((prev) => ({ ...prev, [tablaId]: true }));

    try {
      const registros = await obtenerTabla(tablaId);
      const marcaTiempo = generarMarcaTiempo();
      const nombreArchivo = `backup_${tablaId}_${marcaTiempo}.json`;

      // Se estructura el archivo individual con sus metadatos y registros
      const contenidoArchivo = {
        metadatos: {
          aplicacion: 'Control de Notas',
          tipo: 'backup_tabla_individual',
          tabla: tablaId,
          nombre_legible: nombreLegible,
          fecha_exportacion: new Date().toISOString(),
          total_registros: registros.length
        },
        registros
      };

      descargarJSON(contenidoArchivo, nombreArchivo);

      mostrarExito(
        'Tabla exportada',
        `Se han descargado ${registros.length} registros de ${nombreLegible}.`
      );
      return true;
    } catch (err) {
      console.error(`Error al exportar la tabla ${tablaId}:`, err);
      mostrarError(
        'Error al exportar tabla',
        `No se pudieron obtener los datos de la tabla ${nombreLegible}.`
      );
      return false;
    } finally {
      setCargandoTabla((prev) => ({ ...prev, [tablaId]: false }));
    }
  }, [mostrarExito, mostrarError]);

  return {
    tablas: TABLAS_SISTEMA,
    cargandoCompleto,
    cargandoTabla,
    exportarCopiaCompleta,
    exportarTablaIndividual
  };
};

export default useCopiasSeguridad;

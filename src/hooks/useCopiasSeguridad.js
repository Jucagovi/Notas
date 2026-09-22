import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { supabase } from '../services/supabaseClient.js';
import useGlobalToast from './useGlobalToast.js';

// Catálogo de tablas configuradas para la exportación de copias de seguridad
export const TABLAS_BACKUP = [
  { id: 'Ciclos', nombre: 'Ciclos Formativos', icono: 'pi pi-graduation-cap', descripcion: 'Titulaciones y ramas formativas.' },
  { id: 'Cursos', nombre: 'Cursos Académicos', icono: 'pi pi-calendar', descripcion: 'Años lectivos y centros educativos.' },
  { id: 'Discentes', nombre: 'Discentes', icono: 'pi pi-users', descripcion: 'Expediente y datos del alumnado.' },
  { id: 'Modulos', nombre: 'Módulos Profesionales', icono: 'pi pi-book', descripcion: 'Asignaturas y módulos formativos.' },
  { id: 'Unidades_Trabajo', nombre: 'Unidades de Trabajo', icono: 'pi pi-folder', descripcion: 'Unidades y bloques didácticos.' },
  { id: 'RA', nombre: 'Resultados de Aprendizaje', icono: 'pi pi-check-circle', descripcion: 'Resultados curriculares base.' },
  { id: 'CE', nombre: 'Criterios de Evaluación', icono: 'pi pi-list-check', descripcion: 'Criterios asociados a cada RA.' },
  { id: 'Practicas', nombre: 'Prácticas Maestras', icono: 'pi pi-file-edit', descripcion: 'Catálogo de actividades y prácticas.' },
  { id: 'Evaluaciones', nombre: 'Evaluaciones', icono: 'pi pi-calendar-plus', descripcion: 'Convocatorias trimestrales y finales.' },
  { id: 'Versiones', nombre: 'Versiones de Prácticas', icono: 'pi pi-code', descripcion: 'Instancias de prácticas en cursos.' },
  { id: 'Temporizacion', nombre: 'Temporización', icono: 'pi pi-calendar-times', descripcion: 'Calendario y estado de las UTs.' },
  { id: 'imparte', nombre: 'Matrículas (Imparte)', icono: 'pi pi-id-card', descripcion: 'Asignación de alumnos a módulos y cursos.' },
  { id: 'evaluan', nombre: 'Calificaciones (Evalúan)', icono: 'pi pi-calculator', descripcion: 'Calificaciones individuales de actividades.' },
  { id: 'ra_curso', nombre: 'Ponderación RA', icono: 'pi pi-chart-pie', descripcion: 'Pesos de los RA por curso.' },
  { id: 'ce_curso', nombre: 'Ponderación CE', icono: 'pi pi-percentage', descripcion: 'Pesos de los CE por curso.' },
  { id: 'Festivos', nombre: 'Festivos y No Lectivos', icono: 'pi pi-sun', descripcion: 'Días no lectivos del calendario escolar.' },
  { id: 'Sesiones', nombre: 'Sesiones Horarias', icono: 'pi pi-clock', descripcion: 'Tramos y horas lectivas del centro.' },
  { id: 'Horarios', nombre: 'Horarios Semanales', icono: 'pi pi-th-large', descripcion: 'Distribución horaria de asignaturas.' }
];

// Genera una marca temporal legible para el nombre de los archivos descargados (YYYYMMDD_HHMMSS)
const obtenerMarcaTemporal = () => {
  const ahora = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const anyo = ahora.getFullYear();
  const mes = pad(ahora.getMonth() + 1);
  const dia = pad(ahora.getDate());
  const hora = pad(ahora.getHours());
  const min = pad(ahora.getMinutes());
  const seg = pad(ahora.getSeconds());
  return `${anyo}${mes}${dia}_${hora}${min}${seg}`;
};

// Descarga en el navegador un archivo de cualquier tipo mime mediante URL temporal
const descargarArchivoBlob = (blob, nombreArchivo) => {
  const enlace = document.createElement('a');
  const url = URL.createObjectURL(blob);
  enlace.setAttribute('href', url);
  enlace.setAttribute('download', nombreArchivo);
  enlace.style.visibility = 'hidden';
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
};

// Convierte un array de registros a formato CSV estricto RFC 4180 con comillas y delimitador coma
const convertirACSV = (registros) => {
  // Se aplican comillas estrictas (quotes: true) y separación por comas para proteger campos de texto con comas
  return Papa.unparse(registros, {
    quotes: true,
    delimiter: ',',
    header: true,
    skipEmptyLines: false
  });
};

// Hook personalizado para gestionar la exportación completa o granular de copias de seguridad en JSON y CSV
const useCopiasSeguridad = () => {
  const [cargandoCompleto, setCargandoCompleto] = useState(false);
  const [cargandoCompletoCSV, setCargandoCompletoCSV] = useState(false);
  const [cargandoTabla, setCargandoTabla] = useState({});
  const [cargandoTablaCSV, setCargandoTablaCSV] = useState({});
  const { mostrarExito, mostrarError, mostrarInfo } = useGlobalToast();

  // Exportación de la copia completa en JSON consolidado
  const exportarCopiaCompleta = useCallback(async () => {
    setCargandoCompleto(true);
    mostrarInfo('Iniciando la exportación completa en JSON...', 'Copia completa');

    try {
      const promesas = TABLAS_BACKUP.map(async (t) => {
        const { data, error } = await supabase.from(t.id).select('*');
        if (error) throw error;
        return { tabla: t.id, datos: data || [] };
      });

      const resultados = await Promise.all(promesas);

      const copia = {
        metadatos: {
          aplicacion: 'Control de Notas',
          tipo: 'backup_completo_json',
          fecha_exportacion: new Date().toISOString(),
          total_tablas: TABLAS_BACKUP.length,
          total_registros: resultados.reduce((acc, r) => acc + r.datos.length, 0)
        },
        tablas: resultados.reduce((acc, r) => {
          acc[r.tabla] = r.datos;
          return acc;
        }, {})
      };

      const contenido = JSON.stringify(copia, null, 2);
      const blob = new Blob([contenido], { type: 'application/json;charset=utf-8;' });
      const nombreArchivo = `backup_completo_${obtenerMarcaTemporal()}.json`;
      descargarArchivoBlob(blob, nombreArchivo);

      mostrarExito(
        `Se han exportado ${copia.metadatos.total_registros} registros de ${copia.metadatos.total_tablas} tablas en JSON.`,
        'Copia completada'
      );
    } catch (err) {
      console.error('Error al generar la copia completa JSON:', err);
      mostrarError('Ocurrió un error al obtener los datos de la base de datos.', 'Error de exportación');
    } finally {
      setCargandoCompleto(false);
    }
  }, [mostrarExito, mostrarError, mostrarInfo]);

  // Exportación de la copia completa en formato CSV empaquetado en un archivo comprimido ZIP
  const exportarCopiaCompletaCSV = useCallback(async () => {
    setCargandoCompletoCSV(true);
    mostrarInfo('Generando copia completa en archivos CSV (ZIP)...', 'Copia completa CSV');

    try {
      const zip = new JSZip();
      let totalRegistros = 0;

      const promesas = TABLAS_BACKUP.map(async (t) => {
        const { data, error } = await supabase.from(t.id).select('*');
        if (error) throw error;
        const registros = data || [];
        totalRegistros += registros.length;
        const textoCSV = convertirACSV(registros);
        // Se añade marca BOM para asegurar compatibilidad de caracteres especiales en hojas de cálculo
        zip.file(`${t.id}.csv`, '\uFEFF' + textoCSV);
      });

      await Promise.all(promesas);

      const contenidoZip = await zip.generateAsync({ type: 'blob' });
      const nombreArchivo = `backup_completo_csv_${obtenerMarcaTemporal()}.zip`;
      descargarArchivoBlob(contenidoZip, nombreArchivo);

      mostrarExito(
        `Se han empaquetado ${totalRegistros} registros de ${TABLAS_BACKUP.length} tablas en un archivo ZIP con CSVs.`,
        'Copia CSV completada'
      );
    } catch (err) {
      console.error('Error al generar la copia completa CSV:', err);
      mostrarError('Ocurrió un error al generar el archivo ZIP con los CSVs.', 'Error de exportación');
    } finally {
      setCargandoCompletoCSV(false);
    }
  }, [mostrarExito, mostrarError, mostrarInfo]);

  // Exportación individual de una tabla en formato JSON
  const exportarTablaIndividual = useCallback(
    async (tablaId, nombreLegible = tablaId) => {
      setCargandoTabla((prev) => ({ ...prev, [tablaId]: true }));

      try {
        const { data, error } = await supabase.from(tablaId).select('*');
        if (error) throw error;

        const registros = data || [];
        const contenido = {
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

        const blob = new Blob([JSON.stringify(contenido, null, 2)], {
          type: 'application/json;charset=utf-8;'
        });
        const nombreArchivo = `backup_${tablaId.toLowerCase()}_${obtenerMarcaTemporal()}.json`;
        descargarArchivoBlob(blob, nombreArchivo);

        mostrarExito(
          `Se han descargado ${registros.length} registros de "${nombreLegible}" en JSON.`,
          'Exportación completada'
        );
      } catch (err) {
        console.error(`Error al exportar la tabla ${tablaId} a JSON:`, err);
        mostrarError(`No se pudieron obtener los datos de la tabla "${nombreLegible}".`, 'Error al exportar');
      } finally {
        setCargandoTabla((prev) => ({ ...prev, [tablaId]: false }));
      }
    },
    [mostrarExito, mostrarError]
  );

  // Exportación individual de una tabla en formato CSV con delimitador de coma y entrecomillado estricto
  const exportarTablaIndividualCSV = useCallback(
    async (tablaId, nombreLegible = tablaId) => {
      setCargandoTablaCSV((prev) => ({ ...prev, [tablaId]: true }));

      try {
        const { data, error } = await supabase.from(tablaId).select('*');
        if (error) throw error;

        const registros = data || [];
        const textoCSV = convertirACSV(registros);
        const blob = new Blob(['\uFEFF' + textoCSV], {
          type: 'text/csv;charset=utf-8;'
        });
        const nombreArchivo = `backup_${tablaId.toLowerCase()}_${obtenerMarcaTemporal()}.csv`;
        descargarArchivoBlob(blob, nombreArchivo);

        mostrarExito(
          `Se han descargado ${registros.length} registros de "${nombreLegible}" en formato CSV.`,
          'Exportación CSV completada'
        );
      } catch (err) {
        console.error(`Error al exportar la tabla ${tablaId} a CSV:`, err);
        mostrarError(`No se pudieron exportar los datos CSV de la tabla "${nombreLegible}".`, 'Error al exportar');
      } finally {
        setCargandoTablaCSV((prev) => ({ ...prev, [tablaId]: false }));
      }
    },
    [mostrarExito, mostrarError]
  );

  return {
    tablas: TABLAS_BACKUP,
    cargandoCompleto: cargandoCompleto || cargandoCompletoCSV,
    cargandoCompletoJSON: cargandoCompleto,
    cargandoCompletoCSV,
    cargandoTabla,
    cargandoTablaCSV,
    exportarCopiaCompleta,
    exportarCopiaCompletaCSV,
    exportarTablaIndividual,
    exportarTablaIndividualCSV
  };
};

export default useCopiasSeguridad;

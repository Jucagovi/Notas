import { useState, useCallback, useMemo } from 'react';
import useToast from './useToast.js';
import {
  TABLAS_IMPORTACION,
  obtenerConfiguracionTabla,
  obtenerEsquemaCabeceras,
  descargarPlantillaCSV,
  descargarPlantillaVaciaCSV,
  parsearCSV,
  validarRegistrosCSV,
  insertarRegistrosMasivos
} from '../services/importacionService.js';

// Hook personalizado para la gestión integral del flujo de importación masiva de datos CSV
const useImportacion = (tablaInicial = 'Discentes') => {
  const [tablaSeleccionada, setTablaSeleccionada] = useState(tablaInicial);
  const [filasProcesadas, setFilasProcesadas] = useState([]);
  const [resumen, setResumen] = useState({ total: 0, validos: 0, invalidos: 0 });
  const [procesando, setProcesando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState('todos'); // 'todos' | 'validos' | 'errores'
  const [textoCSV, setTextoCSV] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [delimitador, setDelimitador] = useState('');

  const { mostrarExito, mostrarError, mostrarInfo, mostrarAdvertencia } = useToast();

  // Configuración de metadatos de la tabla actualmente seleccionada
  const configuracionActual = useMemo(() => {
    return obtenerConfiguracionTabla(tablaSeleccionada);
  }, [tablaSeleccionada]);

  // Se genera la línea de cabeceras formateada según el delimitador actual
  const esquemaCabeceras = useMemo(() => {
    const delim = delimitador || ',';
    return obtenerEsquemaCabeceras(tablaSeleccionada, delim);
  }, [tablaSeleccionada, delimitador]);

  // Se restablece el estado de previsualización y datos cargados
  const limpiar = useCallback(() => {
    setFilasProcesadas([]);
    setResumen({ total: 0, validos: 0, invalidos: 0 });
    setTextoCSV('');
    setNombreArchivo('');
    setProgreso(0);
    setFiltroEstado('todos');
  }, []);

  // Se cambia la tabla de destino y se limpian los datos en curso
  const cambiarTabla = useCallback((nuevaTablaId) => {
    setTablaSeleccionada(nuevaTablaId);
    limpiar();
  }, [limpiar]);

  // Se descarga la plantilla CSV para la tabla activa con datos de muestra
  const descargarPlantilla = useCallback(() => {
    const delim = delimitador || ',';
    const exito = descargarPlantillaCSV(tablaSeleccionada, delim);
    if (exito) {
      mostrarInfo(
        'Plantilla descargada',
        `Se ha generado la plantilla CSV con ejemplos para ${configuracionActual?.nombre || tablaSeleccionada}.`
      );
    } else {
      mostrarError('Error al descargar', 'No se pudo generar la plantilla CSV solicitada.');
    }
  }, [tablaSeleccionada, delimitador, configuracionActual, mostrarInfo, mostrarError]);

  // Se genera y descarga un fichero CSV con la estructura exacta pero vacío (solo cabeceras)
  const descargarPlantillaVacia = useCallback(() => {
    const delim = delimitador || ',';
    const exito = descargarPlantillaVaciaCSV(tablaSeleccionada, delim);
    if (exito) {
      mostrarInfo(
        'CSV generado',
        `Se ha descargado el archivo CSV vacío con la estructura de cabeceras para ${configuracionActual?.nombre || tablaSeleccionada}.`
      );
    } else {
      mostrarError('Error al descargar', 'No se pudo generar el archivo CSV vacío.');
    }
  }, [tablaSeleccionada, delimitador, configuracionActual, mostrarInfo, mostrarError]);

  // Se procesa y valida una cadena de texto en formato CSV
  const procesarTexto = useCallback(async (contenidoTexto, delim = delimitador) => {
    if (!contenidoTexto || !contenidoTexto.trim()) {
      mostrarAdvertencia('Contenido vacío', 'Debe proporcionar o pegar contenido CSV para procesar.');
      return;
    }

    setProcesando(true);
    try {
      const { filas, errores: erroresParseo } = await parsearCSV(contenidoTexto, delim);

      if (erroresParseo && erroresParseo.length > 0 && (!filas || filas.length === 0)) {
        mostrarError('Error al leer CSV', erroresParseo.join('. '));
        setFilasProcesadas([]);
        setResumen({ total: 0, validos: 0, invalidos: 0 });
        return;
      }

      const resultadoValidacion = validarRegistrosCSV(filas, tablaSeleccionada);
      setFilasProcesadas(resultadoValidacion.filas);
      setResumen({
        total: resultadoValidacion.total,
        validos: resultadoValidacion.validos,
        invalidos: resultadoValidacion.invalidos
      });

      if (resultadoValidacion.total === 0) {
        mostrarAdvertencia('Sin registros', 'No se encontraron filas con datos en el contenido procesado.');
      } else if (resultadoValidacion.invalidos > 0) {
        mostrarAdvertencia(
          'Validación completada con avisos',
          `Se detectaron ${resultadoValidacion.validos} registros válidos y ${resultadoValidacion.invalidos} con errores.`
        );
      } else {
        mostrarExito(
          'Validación exitosa',
          `Se han validado correctamente ${resultadoValidacion.validos} registros listos para importar.`
        );
      }
    } catch (err) {
      console.error('Error al procesar texto CSV:', err);
      mostrarError('Error de procesamiento', 'Ocurrió un fallo al interpretar el formato CSV.');
    } finally {
      setProcesando(false);
    }
  }, [tablaSeleccionada, delimitador, mostrarAdvertencia, mostrarError, mostrarExito]);

  // Se procesa un archivo CSV cargado desde el componente FileUpload
  const procesarArchivo = useCallback((archivo, delim = delimitador) => {
    if (!archivo) return;

    setProcesando(true);
    setNombreArchivo(archivo.name || 'archivo.csv');

    const lector = new FileReader();
    lector.onload = async (evento) => {
      const contenidoTexto = evento.target?.result;
      if (typeof contenidoTexto === 'string') {
        setTextoCSV(contenidoTexto);
        await procesarTexto(contenidoTexto, delim);
      }
      setProcesando(false);
    };

    lector.onerror = (err) => {
      console.error('Error al leer el archivo CSV:', err);
      mostrarError('Error de lectura', 'No se pudo leer el archivo seleccionado.');
      setProcesando(false);
    };

    lector.readAsText(archivo, 'UTF-8');
  }, [delimitador, procesarTexto, mostrarError]);

  // Se filtran las filas procesadas según el criterio seleccionado (todos, válidos, errores)
  const filasFiltradas = useMemo(() => {
    if (filtroEstado === 'validos') {
      return filasProcesadas.filter((f) => f.esValido);
    }
    if (filtroEstado === 'errores') {
      return filasProcesadas.filter((f) => !f.esValido);
    }
    return filasProcesadas;
  }, [filasProcesadas, filtroEstado]);

  // Se ejecuta la inserción masiva en Supabase de los registros válidos
  const ejecutarImportacion = useCallback(async (soloValidos = true) => {
    const filasParaInsertar = filasProcesadas.filter((f) => (soloValidos ? f.esValido : true));

    if (filasParaInsertar.length === 0) {
      mostrarAdvertencia('Sin registros a importar', 'No hay registros válidos disponibles para insertar.');
      return { exito: false, insertados: 0 };
    }

    setImportando(true);
    setProgreso(30);

    try {
      const datosNormalizados = filasParaInsertar.map((f) => f.datosNormalizados);

      setProgreso(60);
      const resultado = await insertarRegistrosMasivos(tablaSeleccionada, datosNormalizados);
      setProgreso(100);

      if (resultado.exito) {
        mostrarExito(
          'Importación completada',
          `Se han insertado exitosamente ${resultado.insertados} registros en la tabla ${configuracionActual?.nombre || tablaSeleccionada}.`
        );
        limpiar();
        return resultado;
      } else {
        mostrarError(
          'Error en la importación masiva',
          resultado.error || 'No se pudieron guardar los registros en la base de datos.'
        );
        return resultado;
      }
    } catch (err) {
      console.error('Error durante la inserción masiva:', err);
      mostrarError('Fallo en la importación', 'Se produjo un error al comunicar con el servidor.');
      return { exito: false, insertados: 0, error: err.message };
    } finally {
      setImportando(false);
      setTimeout(() => setProgreso(0), 1000);
    }
  }, [filasProcesadas, tablaSeleccionada, configuracionActual, limpiar, mostrarAdvertencia, mostrarExito, mostrarError]);

  return {
    tablas: TABLAS_IMPORTACION,
    tablaSeleccionada,
    configuracionActual,
    filasProcesadas,
    filasFiltradas,
    resumen,
    procesando,
    importando,
    progreso,
    filtroEstado,
    textoCSV,
    nombreArchivo,
    delimitador,
    esquemaCabeceras,
    setFiltroEstado,
    setTextoCSV,
    setDelimitador,
    cambiarTabla,
    descargarPlantilla,
    descargarPlantillaVacia,
    procesarArchivo,
    procesarTexto,
    ejecutarImportacion,
    limpiar
  };
};

export default useImportacion;

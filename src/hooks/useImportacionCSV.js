import { useState, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import useDatos from './useDatos.js';
import useGlobalToast from './useGlobalToast.js';
import {
  TABLAS_IMPORTACION,
  OPCIONES_TABLAS_IMPORTACION
} from '../components/importacion/configuracionImportacion.js';
import {
  sanitizarYValidarCampo,
  descargarArchivoCSV
} from '../utils/sanitizadorImportacion.js';

// Hook personalizado para gestionar la lógica completa de lectura, validación e importación masiva por CSV
const useImportacionCSV = () => {
  const [tablaSeleccionada, setTablaSeleccionada] = useState('Discentes');
  const [filasProcesadas, setFilasProcesadas] = useState([]);
  const [procesandoLectura, setProcesandoLectura] = useState(false);

  // Hook genérico de Supabase para la tabla actualmente elegida
  const { insertar, cargando: cargandoInsercion, error: errorInsercion } = useDatos(tablaSeleccionada);
  const { mostrarExito, mostrarError, mostrarAdvertencia } = useGlobalToast();

  // Configuración de la tabla seleccionada en el catálogo
  const configTablaActual = useMemo(() => {
    return TABLAS_IMPORTACION[tablaSeleccionada] || TABLAS_IMPORTACION.Discentes;
  }, [tablaSeleccionada]);

  // Cálculo memoizado de estadísticas de validación
  const resumen = useMemo(() => {
    const total = filasProcesadas.length;
    const validos = filasProcesadas.filter((f) => f.esValida).length;
    const invalidos = total - validos;
    return { total, validos, invalidos };
  }, [filasProcesadas]);

  // Cambia la tabla destino y reinicia los registros pendientes
  const cambiarTabla = useCallback((nuevaTabla) => {
    setTablaSeleccionada(nuevaTabla);
    setFilasProcesadas([]);
  }, []);

  // Genera y descarga una plantilla vacía con los encabezados correspondientes
  const descargarPlantilla = useCallback(() => {
    const cabeceras = configTablaActual.campos.map((c) => c.campo);
    const filaEjemplo = configTablaActual.ejemploPlantilla || {};

    // Se construye el contenido en formato CSV con cabeceras y una fila de ejemplo demostrativa
    const contenidoCSV = Papa.unparse({
      fields: cabeceras,
      data: [filaEjemplo]
    });

    const nombreArchivo = `plantilla_${configTablaActual.nombreTabla.toLowerCase()}.csv`;
    descargarArchivoCSV(nombreArchivo, contenidoCSV);
  }, [configTablaActual]);

  // Analiza y valida un arreglo de objetos crudos provenientes del parseo de PapaParse
  const validarFilasParseadas = useCallback(
    (filasCrudas) => {
      const camposConfig = configTablaActual.campos;

      const resultado = filasCrudas.map((filaCruda, indice) => {
        const datosLimpios = {};
        const erroresPorCampo = {};
        let esValida = true;

        // Se mapea cada campo buscando coincidencias exactas o por minúsculas en las cabeceras
        camposConfig.forEach((config) => {
          const claveEncontrada = Object.keys(filaCruda).find(
            (k) =>
              k.trim().toLowerCase() === config.campo.toLowerCase() ||
              k.trim().toLowerCase() === config.etiqueta.toLowerCase()
          );

          const valorOriginal = claveEncontrada !== undefined ? filaCruda[claveEncontrada] : '';
          const { valor, error } = sanitizarYValidarCampo(valorOriginal, config);

          datosLimpios[config.campo] = valor;
          if (error) {
            erroresPorCampo[config.campo] = error;
            esValida = false;
          }
        });

        return {
          idFilaTemporal: `fila-${indice + 1}`,
          numeroFila: indice + 1,
          filaCruda,
          datosLimpios,
          erroresPorCampo,
          esValida
        };
      });

      setFilasProcesadas(resultado);
    },
    [configTablaActual]
  );

  // Procesa una cadena de texto en formato CSV o separado por tabuladores (copiado de hojas de cálculo)
  const procesarTextoCrudo = useCallback(
    (contenidoTexto) => {
      if (!contenidoTexto || !contenidoTexto.trim()) {
        mostrarAdvertencia('No se ha proporcionado contenido para procesar.', 'Aviso');
        return;
      }

      setProcesandoLectura(true);
      try {
        const resultadoParseo = Papa.parse(contenidoTexto, {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: (cabecera) => cabecera.trim()
        });

        if (resultadoParseo.errors && resultadoParseo.errors.length > 0) {
          const mensajeError = resultadoParseo.errors.map((e) => e.message).join('. ');
          mostrarAdvertencia(`Se detectaron advertencias durante la lectura: ${mensajeError}.`, 'Lectura CSV');
        }

        if (!resultadoParseo.data || resultadoParseo.data.length === 0) {
          mostrarAdvertencia('No se encontraron filas con datos válidos en el texto analizado.', 'Sin datos');
          setFilasProcesadas([]);
          return;
        }

        validarFilasParseadas(resultadoParseo.data);
      } catch (err) {
        console.error('Error al procesar el texto CSV:', err);
        mostrarError('Ocurrió un error inesperado al parsear el contenido CSV.', 'Error de formato');
      } finally {
        setProcesandoLectura(false);
      }
    },
    [validarFilasParseadas, mostrarAdvertencia, mostrarError]
  );

  // Procesa un archivo seleccionado desde el explorador del usuario
  const procesarArchivoCSV = useCallback(
    (archivo) => {
      if (!archivo) return;

      setProcesandoLectura(true);
      const lector = new FileReader();

      lector.onload = (evento) => {
        const texto = evento.target?.result;
        if (typeof texto === 'string') {
          procesarTextoCrudo(texto);
        }
        setProcesandoLectura(false);
      };

      lector.onerror = (err) => {
        console.error('Error al leer el archivo en el navegador:', err);
        mostrarError('No se pudo leer el archivo seleccionado.', 'Error de lectura');
        setProcesandoLectura(false);
      };

      lector.readAsText(archivo, 'UTF-8');
    },
    [procesarTextoCrudo, mostrarError]
  );

  // Procesa el texto pegado manualmente desde el área de texto
  const procesarTextoPegado = useCallback(
    (texto) => {
      procesarTextoCrudo(texto);
    },
    [procesarTextoCrudo]
  );

  // Restablece los datos y vacía la vista previa
  const limpiarDatos = useCallback(() => {
    setFilasProcesadas([]);
  }, []);

  // Ejecuta la inserción masiva en Supabase a través de useDatos
  const ejecutarImportacion = useCallback(async () => {
    if (filasProcesadas.length === 0) {
      mostrarAdvertencia('No existen registros preparados para importar.', 'Atención');
      return;
    }

    if (resumen.invalidos > 0) {
      mostrarAdvertencia(
        `Existen ${resumen.invalidos} fila(s) con errores de validación. Corrija los datos antes de importar.`,
        'Validación incompleta'
      );
      return;
    }

    // Se extraen exclusivamente los datos sanitizados sin campos autogenerados
    const registrosParaInsertar = filasProcesadas.map((f) => f.datosLimpios);

    const resultado = await insertar(registrosParaInsertar);

    if (resultado) {
      mostrarExito(
        `Se han importado ${resultado.length} registros en la tabla "${configTablaActual.etiqueta}" correctamente.`,
        'Importación completada'
      );
      limpiarDatos();
    } else {
      mostrarError(
        errorInsercion || 'Ocurrió un error al persistir los registros en la base de datos.',
        'Error de inserción'
      );
    }
  }, [
    filasProcesadas,
    resumen.invalidos,
    insertar,
    configTablaActual.etiqueta,
    limpiarDatos,
    errorInsercion,
    mostrarExito,
    mostrarError,
    mostrarAdvertencia
  ]);

  return {
    tablaSeleccionada,
    configTablaActual,
    tablasDisponibles: OPCIONES_TABLAS_IMPORTACION,
    filasProcesadas,
    resumen,
    cargando: procesandoLectura || cargandoInsercion,
    cambiarTabla,
    descargarPlantilla,
    procesarArchivoCSV,
    procesarTextoPegado,
    limpiarDatos,
    ejecutarImportacion
  };
};

export default useImportacionCSV;

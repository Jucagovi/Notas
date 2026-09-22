import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient.js';
import useDatos from './useDatos.js';
import { obtenerConfiguracionTabla } from '../components/mantenimiento/configuracionTablas.js';

// Hook orquestador para páginas de mantenimiento que gestiona datos, CRUD y referencias foráneas.
const useTablaMantenimiento = (slugONombre) => {
  const config = obtenerConfiguracionTabla(slugONombre);
  const nombreTabla = config ? config.nombreTabla : null;
  const clavePrimaria = config ? config.clavePrimaria : 'id';

  const {
    datos,
    cargando: cargandoDatos,
    error: errorDatos,
    obtenerDatos,
    insertar,
    actualizar,
    eliminar,
    setDatos
  } = useDatos(nombreTabla);

  const [opcionesReferencia, setOpcionesReferencia] = useState({});
  const [cargandoReferencias, setCargandoReferencias] = useState(false);

  // Carga los registros de la tabla activa.
  const recargar = useCallback(async () => {
    if (!nombreTabla) return [];
    return await obtenerDatos();
  }, [nombreTabla, obtenerDatos]);

  // Carga opciones para campos de claves foráneas requeridos en formularios y visualización.
  const cargarReferencias = useCallback(async () => {
    if (!config || !config.tablasReferenciadas || config.tablasReferenciadas.length === 0) {
      setOpcionesReferencia({});
      return;
    }

    setCargandoReferencias(true);
    const mapaOpciones = {};

    try {
      await Promise.all(
        config.tablasReferenciadas.map(async (ref) => {
          try {
            const { data, error } = await supabase
              .from(ref.tabla)
              .select('*');

            if (error) {
              console.error(`Error al cargar referencias de ${ref.tabla}:`, error);
              mapaOpciones[ref.tabla] = [];
              return;
            }

            const items = data || [];
            mapaOpciones[ref.tabla] = items.map((item) => {
              const valorClave = item[ref.clave];
              let texto = item[ref.campoTexto] || valorClave;
              if (ref.campoAlternativo && item[ref.campoAlternativo]) {
                texto = `${item[ref.campoAlternativo]} - ${texto}`;
              }
              if (ref.prefijo) {
                texto = `${ref.prefijo} ${texto}`;
              }
              return {
                label: texto,
                value: valorClave,
                datosOriginales: item
              };
            });
          } catch (errRef) {
            console.error(`Excepción cargando referencia ${ref.tabla}:`, errRef);
            mapaOpciones[ref.tabla] = [];
          }
        })
      );

      setOpcionesReferencia(mapaOpciones);
    } finally {
      setCargandoReferencias(false);
    }
  }, [config]);

  // Carga automática inicial al cambiar de tabla.
  useEffect(() => {
    if (nombreTabla) {
      recargar();
      cargarReferencias();
    }
  }, [nombreTabla, recargar, cargarReferencias]);

  // Operación para crear un registro adaptando fechas o tipos.
  const crearRegistro = useCallback(
    async (valores) => {
      if (!nombreTabla) return null;
      return await insertar(valores);
    },
    [nombreTabla, insertar]
  );

  // Operación para actualizar un registro por clave primaria.
  const actualizarRegistro = useCallback(
    async (id, valores) => {
      if (!nombreTabla) return null;
      return await actualizar(clavePrimaria, id, valores);
    },
    [nombreTabla, clavePrimaria, actualizar]
  );

  // Operación para eliminar un registro por clave primaria.
  const eliminarRegistro = useCallback(
    async (id) => {
      if (!nombreTabla) return false;
      return await eliminar(clavePrimaria, id);
    },
    [nombreTabla, clavePrimaria, eliminar]
  );

  return {
    config,
    datos,
    cargando: cargandoDatos || cargandoReferencias,
    error: errorDatos,
    recargar,
    opcionesReferencia,
    crearRegistro,
    actualizarRegistro,
    eliminarRegistro,
    setDatos
  };
};

export default useTablaMantenimiento;

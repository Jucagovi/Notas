import { useState, useEffect, useCallback } from 'react';
import useDatos from './useDatos.js';

/**
 * useVisorCurricular - Custom Hook para la consulta jerárquica del currículo oficial (RA y CE).
 *
 * Responsabilidad Única: Orquestar la obtención encadenada de los Resultados de Aprendizaje (RA)
 * de un módulo profesional y sus Criterios de Evaluación (CE) asociados mediante useDatos,
 * transformando la estructura plana en el árbol de nodos jerárquico requerido por PrimeReact TreeTable.
 *
 * @param {string|null} idModulo - Identificador del módulo profesional seleccionado.
 * @returns {Object} Árbol de nodos, listas planas de RA y CE, métricas totales, estados de carga y función de recarga.
 */
const useVisorCurricular = (idModulo = null) => {
  // Instancias aisladas del hook useDatos para acceder a las tablas curriculares
  const { obtenerDatos: obtenerRA } = useDatos('RA');
  const { obtenerDatos: obtenerCE } = useDatos('CE');

  // Estados locales para la estructura en árbol, datos base, carga y errores
  const [arbolNodos, setArbolNodos] = useState([]);
  const [ras, setRas] = useState([]);
  const [ces, setCes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga de forma encadenada los RAs del módulo y sus CEs asociados,
   * estructurándolos en nodos padre e hijos compatibles con PrimeReact TreeTable.
   */
  const cargarCurriculo = useCallback(async () => {
    // Si no hay módulo seleccionado, se limpia el estado y se cancela la ejecución
    if (!idModulo) {
      setArbolNodos([]);
      setRas([]);
      setCes([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      // 1. Se obtienen los Resultados de Aprendizaje vinculados al módulo seleccionado
      const listaRA = await obtenerRA('*', (consulta) =>
        consulta.eq('id_modulo', idModulo).order('numero', { ascending: true })
      );

      if (!listaRA || listaRA.length === 0) {
        setArbolNodos([]);
        setRas([]);
        setCes([]);
        setCargando(false);
        return;
      }

      setRas(listaRA);

      // 2. Se obtienen los Criterios de Evaluación vinculados a los RAs recuperados
      const idsRA = listaRA.map((r) => r.id_ra);
      const listaCE = await obtenerCE('*', (consulta) =>
        consulta.in('id_ra', idsRA).order('numero', { ascending: true })
      );

      const criteriosRecuperados = listaCE || [];
      setCes(criteriosRecuperados);

      // 3. Transformación de datos planos a estructura jerárquica para PrimeReact TreeTable
      const arbol = listaRA.map((ra) => {
        // Se filtran y ordenan numéricamente los criterios pertenecientes a este RA
        const criteriosDeEsteRa = criteriosRecuperados
          .filter((ce) => ce.id_ra === ra.id_ra)
          .sort((a, b) => Number(a.numero) - Number(b.numero));

        // Nodos hijos correspondientes a los Criterios de Evaluación
        const hijos = criteriosDeEsteRa.map((ce) => ({
          key: `ce-${ce.id_ce}`,
          data: {
            id: ce.id_ce,
            id_ce: ce.id_ce,
            id_ra: ra.id_ra,
            tipo: 'CE',
            codigo: `CE ${ce.numero}`,
            numero: ce.numero,
            nombre: ce.nombre || `Criterio ${ce.numero}`,
            descripcion: ce.descripcion || ''
          }
        }));

        // Nodo padre correspondiente al Resultado de Aprendizaje
        return {
          key: `ra-${ra.id_ra}`,
          data: {
            id: ra.id_ra,
            id_ra: ra.id_ra,
            id_modulo: idModulo,
            tipo: 'RA',
            codigo: `RA ${ra.numero}`,
            numero: ra.numero,
            nombre: ra.nombre || `Resultado de Aprendizaje ${ra.numero}`,
            descripcion: ra.descripcion || '',
            numCriterios: hijos.length
          },
          children: hijos.length > 0 ? hijos : undefined
        };
      });

      setArbolNodos(arbol);
    } catch (err) {
      console.error('Error al cargar la jerarquía curricular:', err);
      setError(err.message || 'Error al obtener los datos curriculares.');
      setArbolNodos([]);
      setRas([]);
      setCes([]);
    } finally {
      setCargando(false);
    }
  }, [idModulo, obtenerRA, obtenerCE]);

  // Se recargan los datos automáticamente al variar el módulo seleccionado
  useEffect(() => {
    cargarCurriculo();
  }, [cargarCurriculo]);

  return {
    arbolNodos,
    ras,
    ces,
    totalRA: ras.length,
    totalCE: ces.length,
    cargando,
    error,
    recargar: cargarCurriculo
  };
};

export default useVisorCurricular;

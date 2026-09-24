import { useState, useEffect, useCallback, useMemo } from 'react';
import useDatos from './useDatos.js';

/**
 * Función auxiliar para distribuir un total de 100 unidades enteras entre un número de elementos.
 * Se garantiza matemáticamente que la suma exacta de todos los elementos sea igual a 100.
 *
 * @param {number} cantidad - Número de elementos a los que repartir el peso.
 * @returns {Array<number>} - Lista de enteros cuya suma es 100.
 */
const repartirCienEquitativo = (cantidad) => {
  if (!cantidad || cantidad <= 0) return [];
  const base = Math.floor(100 / cantidad);
  const resto = 100 % cantidad;
  return Array.from({ length: cantidad }, (_, i) => base + (i < resto ? 1 : 0));
};

/**
 * Custom Hook para la gestión de las ponderaciones de Resultados de Aprendizaje (RA)
 * y Criterios de Evaluación (CE) de un módulo en un curso académico específico.
 *
 * Responsabilidad Única: Centralizar la obtención jerárquica de RA y CE, el cruce con
 * sus tablas de ponderación asociadas (ra_curso y ce_curso), el cálculo de balances en tiempo real
 * y la persistencia transaccional (upsert) permitiendo respaldos parciales.
 *
 * @param {string|null} idCurso - Identificador único del curso académico.
 * @param {string|null} idModulo - Identificador único del módulo profesional.
 */
const usePesosCurriculares = (idCurso = null, idModulo = null) => {
  // Instancias del hook genérico useDatos para cada tabla necesaria.
  const {
    obtenerDatos: obtenerRA,
    cargando: cargandoRA,
    error: errorRA
  } = useDatos('RA');

  const {
    obtenerDatos: obtenerCE,
    cargando: cargandoCE,
    error: errorCE
  } = useDatos('CE');

  const {
    obtenerDatos: obtenerRaCurso,
    insertar: insertarRaCurso,
    actualizar: actualizarRaCurso,
    cargando: cargandoRaCurso,
    error: errorRaCurso
  } = useDatos('ra_curso');

  const {
    obtenerDatos: obtenerCeCurso,
    insertar: insertarCeCurso,
    actualizar: actualizarCeCurso,
    cargando: cargandoCeCurso,
    error: errorCeCurso
  } = useDatos('ce_curso');

  // Estado del árbol jerárquico compatible con TreeTable de PrimeReact.
  const [arbolNodos, setArbolNodos] = useState([]);
  // Copia de los datos originales guardados en servidor para control de cambios y reinicio.
  const [datosOriginales, setDatosOriginales] = useState([]);
  const [hayCambios, setHayCambios] = useState(false);
  const [cargandoConsulta, setCargandoConsulta] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);

  // Consulta de los datos curriculares del módulo y sus ponderaciones asociadas al curso.
  const cargarDatos = useCallback(async () => {
    if (!idCurso || !idModulo) {
      setArbolNodos([]);
      setDatosOriginales([]);
      setHayCambios(false);
      setErrorOperacion(null);
      return [];
    }

    setCargandoConsulta(true);
    setErrorOperacion(null);

    try {
      // 1. Se obtienen los Resultados de Aprendizaje del módulo ordenados por su número.
      const listaRA = await obtenerRA('*', (consulta) =>
        consulta.eq('id_modulo', idModulo).order('numero', { ascending: true })
      );

      if (!listaRA || listaRA.length === 0) {
        setArbolNodos([]);
        setDatosOriginales([]);
        setHayCambios(false);
        return [];
      }

      const idsRA = listaRA.map((item) => item.id_ra);

      // 2. Se obtienen los Criterios de Evaluación asociados a los RA recuperados.
      const listaCE = await obtenerCE('*', (consulta) =>
        consulta.in('id_ra', idsRA).order('numero', { ascending: true })
      );

      // 3. Se obtienen los registros existentes de ponderación de RA para el curso actual.
      const listaRaCurso = await obtenerRaCurso('*', (consulta) =>
        consulta.eq('id_curso', idCurso).in('id_ra', idsRA)
      );

      const mapaRaCurso = new Map();
      (listaRaCurso || []).forEach((reg) => {
        mapaRaCurso.set(reg.id_ra, reg);
      });

      // 4. Se obtienen los registros existentes de ponderación de CE para el curso actual.
      const idsCE = (listaCE || []).map((item) => item.id_ce);
      let listaCeCurso = [];
      if (idsCE.length > 0) {
        listaCeCurso = await obtenerCeCurso('*', (consulta) =>
          consulta.eq('id_curso', idCurso).in('id_ce', idsCE)
        );
      }

      const mapaCeCurso = new Map();
      (listaCeCurso || []).forEach((reg) => {
        mapaCeCurso.set(reg.id_ce, reg);
      });

      // 5. Se estructura la jerarquía de nodos para el componente TreeTable.
      const estructuraConsolidada = listaRA.map((ra) => {
        const regRaCurso = mapaRaCurso.get(ra.id_ra);
        const criteriosDeEsteRa = (listaCE || []).filter((ce) => ce.id_ra === ra.id_ra);

        const hijos = criteriosDeEsteRa.map((ce) => {
          const regCeCurso = mapaCeCurso.get(ce.id_ce);
          return {
            key: `ce-${ce.id_ce}`,
            data: {
              id: ce.id_ce,
              id_ce: ce.id_ce,
              id_ra: ra.id_ra,
              id_ce_curso: regCeCurso?.id_ce_curso || null,
              tipo: 'CE',
              codigo: `CE ${ce.numero}`,
              numero: ce.numero,
              nombre: ce.nombre,
              descripcion: ce.descripcion || '',
              peso:
                regCeCurso?.peso !== undefined && regCeCurso?.peso !== null
                  ? Number(regCeCurso.peso)
                  : 0
            }
          };
        });

        // Se calcula la suma local de pesos de los criterios hijos.
        const sumaCE = hijos.reduce((acc, h) => acc + (Number(h.data.peso) || 0), 0);

        return {
          key: `ra-${ra.id_ra}`,
          data: {
            id: ra.id_ra,
            id_ra: ra.id_ra,
            id_modulo: idModulo,
            id_ra_curso: regRaCurso?.id_ra_curso || null,
            tipo: 'RA',
            codigo: `RA ${ra.numero}`,
            numero: ra.numero,
            nombre: ra.nombre,
            descripcion: ra.descripcion || '',
            peso:
              regRaCurso?.peso !== undefined && regRaCurso?.peso !== null
                ? Number(regRaCurso.peso)
                : 0,
            sumaCE,
            numHijos: hijos.length
          },
          children: hijos.length > 0 ? hijos : undefined
        };
      });

      setArbolNodos(estructuraConsolidada);
      setDatosOriginales(JSON.parse(JSON.stringify(estructuraConsolidada)));
      setHayCambios(false);
      return estructuraConsolidada;
    } catch (err) {
      console.error('Error al cargar pesos curriculares:', err);
      const mensaje = err?.message || 'Error al obtener los pesos curriculares.';
      setErrorOperacion(mensaje);
      return [];
    } finally {
      setCargandoConsulta(false);
    }
  }, [idCurso, idModulo, obtenerRA, obtenerCE, obtenerRaCurso, obtenerCeCurso]);

  // Recarga reactiva de los datos cuando cambia el curso o módulo activo.
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Actualización en tiempo real del peso asignado a un Resultado de Aprendizaje.
  const actualizarPesoRA = useCallback((idRa, nuevoPeso) => {
    const valorNumerico = Math.max(0, Math.min(100, Math.round(Number(nuevoPeso) || 0)));

    setArbolNodos((prev) =>
      prev.map((nodoRa) => {
        if (nodoRa.data.id === idRa) {
          return {
            ...nodoRa,
            data: {
              ...nodoRa.data,
              peso: valorNumerico
            }
          };
        }
        return nodoRa;
      })
    );
    setHayCambios(true);
  }, []);

  // Actualización en tiempo real del peso asignado a un Criterio de Evaluación.
  const actualizarPesoCE = useCallback((idRa, idCe, nuevoPeso) => {
    const valorNumerico = Math.max(0, Math.min(100, Math.round(Number(nuevoPeso) || 0)));

    setArbolNodos((prev) =>
      prev.map((nodoRa) => {
        if (nodoRa.data.id === idRa) {
          const nuevosHijos = (nodoRa.children || []).map((hijo) => {
            if (hijo.data.id === idCe) {
              return {
                ...hijo,
                data: {
                  ...hijo.data,
                  peso: valorNumerico
                }
              };
            }
            return hijo;
          });

          const nuevaSumaCE = nuevosHijos.reduce(
            (acc, h) => acc + (Number(h.data.peso) || 0),
            0
          );

          return {
            ...nodoRa,
            data: {
              ...nodoRa.data,
              sumaCE: nuevaSumaCE
            },
            children: nuevosHijos
          };
        }
        return nodoRa;
      })
    );
    setHayCambios(true);
  }, []);

  // Distribución automática equitativa global: reparte el 100% entre RA y el 100% entre los CE de cada RA.
  const distribuirPesosEquitativamente = useCallback(() => {
    setArbolNodos((prev) => {
      if (!prev || prev.length === 0) return prev;
      const pesosRA = repartirCienEquitativo(prev.length);

      return prev.map((nodoRa, indexRa) => {
        const hijos = nodoRa.children || [];
        let nuevosHijos = hijos;
        let nuevaSumaCE = 0;

        if (hijos.length > 0) {
          const pesosCE = repartirCienEquitativo(hijos.length);
          nuevosHijos = hijos.map((hijo, indexCe) => ({
            ...hijo,
            data: {
              ...hijo.data,
              peso: pesosCE[indexCe]
            }
          }));
          nuevaSumaCE = 100;
        }

        return {
          ...nodoRa,
          data: {
            ...nodoRa.data,
            peso: pesosRA[indexRa],
            sumaCE: nuevaSumaCE
          },
          children: nuevosHijos
        };
      });
    });
    setHayCambios(true);
  }, []);

  // Distribución automática equitativa local: reparte el 100% exclusivamente entre los CE de un RA específico.
  const distribuirPesosCEEquitativamente = useCallback((idRa) => {
    setArbolNodos((prev) =>
      prev.map((nodoRa) => {
        if (nodoRa.data.id === idRa) {
          const hijos = nodoRa.children || [];
          if (hijos.length === 0) return nodoRa;

          const pesosCE = repartirCienEquitativo(hijos.length);
          const nuevosHijos = hijos.map((hijo, indexCe) => ({
            ...hijo,
            data: {
              ...hijo.data,
              peso: pesosCE[indexCe]
            }
          }));

          return {
            ...nodoRa,
            data: {
              ...nodoRa.data,
              sumaCE: 100
            },
            children: nuevosHijos
          };
        }
        return nodoRa;
      })
    );
    setHayCambios(true);
  }, []);

  // Restablecimiento de los valores en edición a la última copia guardada en la base de datos.
  const restablecerPesos = useCallback(() => {
    setArbolNodos(JSON.parse(JSON.stringify(datosOriginales)));
    setHayCambios(false);
    setErrorOperacion(null);
  }, [datosOriginales]);

  // Persistencia transaccional de los pesos curriculares mediante inserción o actualización (Upsert).
  const guardarPesos = useCallback(async () => {
    if (!idCurso || !idModulo) {
      return { ok: false, error: 'Clase o módulo no seleccionado.', status: 400 };
    }

    setGuardando(true);
    setErrorOperacion(null);

    try {
      const arbolClonado = JSON.parse(JSON.stringify(arbolNodos));

      // Se recorre cada Resultado de Aprendizaje para persistir su registro en ra_curso.
      for (const nodoRa of arbolClonado) {
        const { id_ra, peso, id_ra_curso } = nodoRa.data;

        if (id_ra_curso) {
          // Si ya existe registro previo para este curso, se actualiza el peso.
          const resActualizar = await actualizarRaCurso('id_ra_curso', id_ra_curso, {
            peso: Number(peso) || 0
          });
          if (!resActualizar) {
            throw new Error(`No se pudo actualizar el peso del ${nodoRa.data.codigo}.`);
          }
        } else {
          // Si no existía registro, se inserta una nueva fila en ra_curso.
          const resInsertar = await insertarRaCurso({
            id_curso: idCurso,
            id_ra,
            peso: Number(peso) || 0
          });
          if (resInsertar && resInsertar[0]) {
            nodoRa.data.id_ra_curso = resInsertar[0].id_ra_curso;
          } else {
            throw new Error(`No se pudo crear la ponderación para el ${nodoRa.data.codigo}.`);
          }
        }

        // Se recorren los Criterios de Evaluación hijos de este RA para persistir en ce_curso.
        for (const nodoCe of nodoRa.children || []) {
          const { id_ce, peso: pesoCe, id_ce_curso } = nodoCe.data;

          if (id_ce_curso) {
            const resCeActualizar = await actualizarCeCurso('id_ce_curso', id_ce_curso, {
              peso: Number(pesoCe) || 0
            });
            if (!resCeActualizar) {
              throw new Error(`No se pudo actualizar el peso del ${nodoCe.data.codigo}.`);
            }
          } else {
            const resCeInsertar = await insertarCeCurso({
              id_curso: idCurso,
              id_ce,
              peso: Number(pesoCe) || 0
            });
            if (resCeInsertar && resCeInsertar[0]) {
              nodoCe.data.id_ce_curso = resCeInsertar[0].id_ce_curso;
            } else {
              throw new Error(`No se pudo crear la ponderación para el ${nodoCe.data.codigo}.`);
            }
          }
        }
      }

      // Se actualiza el estado local con los nuevos identificadores generados.
      setArbolNodos(arbolClonado);
      setDatosOriginales(JSON.parse(JSON.stringify(arbolClonado)));
      setHayCambios(false);

      return { ok: true, error: null, status: 200 };
    } catch (err) {
      console.error('Error al guardar ponderaciones curriculares:', err);
      const mensaje = err?.message || 'Error al persistir los pesos en la base de datos.';
      setErrorOperacion(mensaje);
      return { ok: false, error: mensaje, status: 500 };
    } finally {
      setGuardando(false);
    }
  }, [
    idCurso,
    idModulo,
    arbolNodos,
    actualizarRaCurso,
    insertarRaCurso,
    actualizarCeCurso,
    insertarCeCurso
  ]);

  // Cálculo reactivo de la suma total de los pesos asignados a los Resultados de Aprendizaje.
  const sumaPesosRA = useMemo(() => {
    return arbolNodos.reduce((acc, nodo) => acc + (Number(nodo.data?.peso) || 0), 0);
  }, [arbolNodos]);

  // Resumen estadístico reactivo de la coherencia del balance curricular.
  const estadisticas = useMemo(() => {
    const totalRA = arbolNodos.length;
    let totalCE = 0;
    let rasEquilibrados = 0;
    let rasIncompletos = 0;

    arbolNodos.forEach((nodo) => {
      const numHijos = nodo.children?.length || 0;
      totalCE += numHijos;
      if (numHijos === 0 || nodo.data?.sumaCE === 100) {
        rasEquilibrados += 1;
      } else {
        rasIncompletos += 1;
      }
    });

    const esModuloEquilibrado = sumaPesosRA === 100;
    const todoEquilibrado = esModuloEquilibrado && rasIncompletos === 0 && totalRA > 0;

    return {
      totalRA,
      totalCE,
      sumaPesosRA,
      esModuloEquilibrado,
      rasEquilibrados,
      rasIncompletos,
      todoEquilibrado
    };
  }, [arbolNodos, sumaPesosRA]);

  return {
    arbolNodos,
    estadisticas,
    cargando: cargandoConsulta || cargandoRA || cargandoCE || cargandoRaCurso || cargandoCeCurso,
    guardando,
    error: errorOperacion || errorRA || errorCE || errorRaCurso || errorCeCurso,
    hayCambios,
    actualizarPesoRA,
    actualizarPesoCE,
    distribuirPesosEquitativamente,
    distribuirPesosCEEquitativamente,
    guardarPesos,
    restablecerPesos,
    recargar: cargarDatos
  };
};

export default usePesosCurriculares;

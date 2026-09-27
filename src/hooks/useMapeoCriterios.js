import { useState, useCallback, useEffect, useMemo } from 'react';
import useDatos from './useDatos.js';

/**
 * useMapeoCriterios - Custom Hook para la gestión jerárquica de vinculación de Criterios de Evaluación a Versiones de Prácticas.
 *
 * Responsabilidad Única: Orquestar la obtención jerárquica de Resultados de Aprendizaje (RA)
 * y Criterios de Evaluación (CE) a través de useDatos, estructurar los nodos para TreeTable de PrimeReact,
 * gestionar la selección en cascada y persistir las asignaciones en la tabla trabajan utilizando id_version.
 *
 * @param {string|null} [idCursoInicial=null] - Identificador de la clase (Cursos) activa.
 * @param {string|null} [idModuloInicial=null] - Identificador del módulo curricular activo.
 * @param {string|null} [idVersionInicial=null] - Identificador de la versión de práctica seleccionada.
 */
const useMapeoCriterios = (idCursoInicial = null, idModuloInicial = null, idVersionInicial = null) => {
  // Instancias del hook genérico useDatos para cada tabla de datos requerida
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
    obtenerDatos: obtenerPracticas,
    cargando: cargandoPracticas,
    error: errorPracticas
  } = useDatos('Practicas');

  const {
    obtenerDatos: obtenerVersiones,
    cargando: cargandoVersiones,
    error: errorVersiones
  } = useDatos('Versiones');

  const {
    obtenerDatos: obtenerTrabajan,
    insertar: insertarTrabajan,
    eliminar: eliminarTrabajan,
    cargando: cargandoTrabajan,
    error: errorTrabajan
  } = useDatos('trabajan');

  // Estado explícito de carga para la transición entre clases
  const [cargandoEstructura, setCargandoEstructura] = useState(false);

  // Estados de datos crudos consultados
  const [listaRA, setListaRA] = useState([]);
  const [listaCE, setListaCE] = useState([]);
  const [listaPracticas, setListaPracticas] = useState([]);
  const [listaVersiones, setListaVersiones] = useState([]);
  const [listaTrabajan, setListaTrabajan] = useState([]);

  // Estado del árbol jerárquico adaptado para PrimeReact TreeTable
  const [arbolNodos, setArbolNodos] = useState([]);
  const [arbolOriginal, setArbolOriginal] = useState([]);
  const [hayCambios, setHayCambios] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState(null);

  // Identificador de la versión actualmente activa para mapeo
  const [idVersionActiva, setIdVersionActiva] = useState(idVersionInicial);

  // Sincronización con el parámetro de versión inicial
  useEffect(() => {
    setIdVersionActiva(idVersionInicial);
  }, [idVersionInicial]);

  /**
   * Extrae los RA y CE de la base de datos y los formatea en el árbol jerárquico.
   * Se obtienen además las versiones asociadas a la clase (curso) y las asignaciones de trabajan.
   *
   * @param {string} idCurso - Identificador de la clase (tabla Cursos).
   * @param {string} idModulo - Identificador del módulo curricular.
   */
  const obtenerArbolCriterios = useCallback(
    async (idCurso, idModulo) => {
      // Se activa inmediatamente el estado de carga y se limpian los datos residuales de la clase anterior
      setCargandoEstructura(true);
      setArbolNodos([]);
      setArbolOriginal([]);
      setListaVersiones([]);
      setListaRA([]);
      setListaCE([]);
      setListaTrabajan([]);
      setHayCambios(false);
      setErrorOperacion(null);

      if (!idModulo || !idCurso) {
        setCargandoEstructura(false);
        return { ra: [], ce: [], versiones: [], trabajan: [] };
      }

      try {
        // 1. Se consultan los Resultados de Aprendizaje ordenados por número
        const datosRA = await obtenerRA('*', (consulta) =>
          consulta.eq('id_modulo', idModulo).order('numero', { ascending: true })
        );

        if (!datosRA || datosRA.length === 0) {
          setCargandoEstructura(false);
          return { ra: [], ce: [], versiones: [], trabajan: [] };
        }

        const idsRA = datosRA.map((r) => r.id_ra);

        // 2. Se consultan los Criterios de Evaluación vinculados a los RA recuperados
        const datosCE = await obtenerCE('*', (consulta) =>
          consulta.in('id_ra', idsRA).order('numero', { ascending: true })
        );

        // 3. Se consultan las prácticas registradas para este módulo
        const datosPracticas = await obtenerPracticas('*', (consulta) =>
          consulta.eq('id_modulo', idModulo).order('nombre', { ascending: true })
        );
        const mapaPracticas = new Map((datosPracticas || []).map((p) => [p.id_practica, p]));

        // 4. Se consultan las versiones instanciadas para esta clase específica (id_curso)
        const datosVersionesBrutas = await obtenerVersiones(
          'id_version, enunciado, numero, id_practica, id_curso, id_ut, id_evaluacion, peso_evaluacion, Practicas(*)',
          (consulta) => consulta.eq('id_curso', idCurso)
        );

        // Se combinan los datos de las versiones con la información de su práctica padre
        const versionesConsolidadas = (datosVersionesBrutas || [])
          .map((v) => {
            const practicaPadre = v.Practicas || mapaPracticas.get(v.id_practica) || null;
            const nombrePractica = practicaPadre?.nombre || 'Práctica sin título';
            const etiquetaVersion = v.numero ? `${nombrePractica} (v${v.numero})` : nombrePractica;

            return {
              id_version: v.id_version,
              id_practica: v.id_practica,
              id_curso: v.id_curso,
              id_ut: v.id_ut,
              id_evaluacion: v.id_evaluacion,
              numero: v.numero,
              enunciado: v.enunciado || '',
              peso_evaluacion: v.peso_evaluacion || 0,
              nombre: etiquetaVersion,
              nombrePractica,
              descripcion: v.enunciado || practicaPadre?.descripcion || '',
              id_modulo: practicaPadre?.id_modulo || idModulo,
              practicaObj: practicaPadre
            };
          })
          .filter((v) => !v.id_modulo || v.id_modulo === idModulo);

        // Ordenación de versiones por número o por nombre de práctica
        versionesConsolidadas.sort((a, b) => {
          if (a.nombrePractica !== b.nombrePractica) {
            return a.nombrePractica.localeCompare(b.nombrePractica);
          }
          return String(a.numero || '').localeCompare(String(b.numero || ''), undefined, { numeric: true });
        });

        // 5. Se consultan las asignaciones en la tabla trabajan para los CE del módulo
        const idsCE = (datosCE || []).map((c) => c.id_ce);
        let datosTrabajan = [];
        if (idsCE.length > 0) {
          datosTrabajan = await obtenerTrabajan('*', (consulta) =>
            consulta.in('id_ce', idsCE)
          );
        }

        setListaRA(datosRA);
        setListaCE(datosCE || []);
        setListaPracticas(datosPracticas || []);
        setListaVersiones(versionesConsolidadas);
        setListaTrabajan(datosTrabajan || []);

        return {
          ra: datosRA,
          ce: datosCE || [],
          versiones: versionesConsolidadas,
          trabajan: datosTrabajan || []
        };
      } catch (err) {
        console.error('Error al obtener la estructura de criterios y versiones de la clase:', err);
        setErrorOperacion(err.message || 'Error al obtener la estructura curricular.');
        return { ra: [], ce: [], versiones: [], trabajan: [] };
      } finally {
        setCargandoEstructura(false);
      }
    },
    [obtenerRA, obtenerCE, obtenerPracticas, obtenerVersiones, obtenerTrabajan]
  );

  // Carga automática inicial de datos cuando se proporcionan los identificadores
  useEffect(() => {
    if (idCursoInicial && idModuloInicial) {
      obtenerArbolCriterios(idCursoInicial, idModuloInicial);
    }
  }, [idCursoInicial, idModuloInicial, obtenerArbolCriterios]);

  /**
   * Construcción del árbol jerárquico para la versión activa.
   * Se calculan los porcentajes asignados en esta versión y los acumulados en otras versiones de la clase.
   * Si un criterio ya alcanza el 100% en otras versiones, se marca como bloqueado para evitar sobrecobertura.
   */
  const reconstruirArbol = useCallback(
    (idVersion, datosRA = listaRA, datosCE = listaCE, datosTrabajan = listaTrabajan, datosVersiones = listaVersiones) => {
      if (!datosRA || datosRA.length === 0) {
        setArbolNodos([]);
        setArbolOriginal([]);
        setHayCambios(false);
        return [];
      }

      // Conjunto de identificadores de versiones pertenecientes a esta clase
      const idsVersionesClase = new Set((datosVersiones || []).map((v) => v.id_version));

      // Se genera un mapa de asignaciones para la versión activa y otro para las demás versiones de la clase
      const asignacionesEstaVersion = new Map();
      const acumuladoOtrasVersiones = new Map();

      (datosTrabajan || []).forEach((t) => {
        const idCe = t.id_ce;
        const porcentaje = Number(t.porcentaje) || 0;

        if (idVersion && t.id_version === idVersion) {
          asignacionesEstaVersion.set(idCe, porcentaje);
        } else if (idsVersionesClase.has(t.id_version)) {
          const acumulado = acumuladoOtrasVersiones.get(idCe) || 0;
          acumuladoOtrasVersiones.set(idCe, acumulado + porcentaje);
        }
      });

      // Construcción estructurada de nodos para PrimeReact TreeTable
      const nodos = datosRA.map((ra) => {
        const hijosCE = (datosCE || []).filter((ce) => ce.id_ra === ra.id_ra);

        let hijosSeleccionados = 0;

        const hijosFormateados = hijosCE.map((ce) => {
          const asignado = asignacionesEstaVersion.has(ce.id_ce);
          const porcentajeActual = asignado ? asignacionesEstaVersion.get(ce.id_ce) : 0;
          const porcentajeOtras = acumuladoOtrasVersiones.get(ce.id_ce) || 0;
          const estaMarcado = asignado && porcentajeActual > 0;

          // Si el criterio ya tiene el 100% en otras versiones y no está asignado en esta, se bloquea
          const bloqueadoPorOtras = porcentajeOtras >= 100 && !estaMarcado;

          if (estaMarcado) {
            hijosSeleccionados++;
          }

          // Se compone el texto con formato Nombre + Descripción limpio sin guiones
          const prefijoCE = !ce.nombre?.toLowerCase().startsWith('ce') ? `CE${ce.numero}` : '';
          const partesCE = [prefijoCE, ce.nombre, ce.descripcion].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
          const textoCompletoCE = partesCE;

          return {
            key: ce.id_ce,
            data: {
              id: ce.id_ce,
              id_ra: ra.id_ra,
              numero: ce.numero,
              codigo: `CE${ce.numero}`,
              nombre: ce.nombre || '',
              descripcion: ce.descripcion || '',
              textoCompleto: textoCompletoCE,
              etiqueta: textoCompletoCE,
              esPadre: false,
              bloqueadoPorOtras,
              seleccionado: estaMarcado,
              porcentaje: estaMarcado ? porcentajeActual : 0,
              porcentajeOtrasVersiones: porcentajeOtras,
              porcentajeGlobal: (estaMarcado ? porcentajeActual : 0) + porcentajeOtras
            }
          };
        });

        const totalHijos = hijosFormateados.length;
        const todosSeleccionados = totalHijos > 0 && hijosSeleccionados === totalHijos;
        // Se comprueba si todos los criterios hijos están completamente asignados
        const todosAsignados = totalHijos > 0 && hijosFormateados.every(
          (h) => (h.data.seleccionado && h.data.porcentaje > 0) || h.data.bloqueadoPorOtras || h.data.porcentajeGlobal >= 100
        );
        const parcial = totalHijos > 0 && hijosSeleccionados > 0 && !todosSeleccionados;

        // Se compone el texto del RA con formato Nombre + Descripción limpio sin guiones
        const prefijoRA = !ra.nombre?.toLowerCase().startsWith('ra') ? `RA${ra.numero}` : '';
        const partesRA = [prefijoRA, ra.nombre, ra.descripcion].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
        const textoCompletoRA = partesRA;

        return {
          key: ra.id_ra,
          data: {
            id: ra.id_ra,
            numero: ra.numero,
            codigo: `RA${ra.numero}`,
            nombre: ra.nombre || '',
            descripcion: ra.descripcion || '',
            textoCompleto: textoCompletoRA,
            etiqueta: textoCompletoRA,
            esPadre: true,
            seleccionado: todosSeleccionados || todosAsignados,
            todosAsignados,
            parcial,
            totalHijos,
            hijosSeleccionados
          },
          children: hijosFormateados
        };
      });

      setArbolNodos(nodos);
      setArbolOriginal(JSON.parse(JSON.stringify(nodos)));
      setHayCambios(false);
      return nodos;
    },
    [listaRA, listaCE, listaTrabajan, listaVersiones]
  );

  // Se regenera el árbol cada vez que cambia la versión seleccionada o las listas maestras
  useEffect(() => {
    reconstruirArbol(idVersionActiva);
  }, [idVersionActiva, reconstruirArbol]);

  /**
   * Manejador de selección de nodo en cascada.
   * Si es un nodo padre (RA), se marcan/desmarcan todos los hijos elegibles (omitiendo los bloqueados al 100%).
   * Si es un nodo hijo (CE), se actualiza el estado individual y se recalcula el estado del padre.
   *
   * @param {string} claveNodo - Identificador único de la fila (key).
   * @param {boolean} nuevoEstado - Estado del checkbox tras la interacción.
   */
  const seleccionarNodo = useCallback((claveNodo, nuevoEstado) => {
    setArbolNodos((nodosPrevios) => {
      let huboModificacion = false;

      const nuevosNodos = nodosPrevios.map((nodoPadre) => {
        // Caso 1: Se ha pulsado sobre el nodo padre (RA)
        if (nodoPadre.key === claveNodo) {
          // Si todos los criterios de este RA ya están asignados, no se permite volver a accionar el check
          if (nodoPadre.data.todosAsignados) {
            return nodoPadre;
          }

          huboModificacion = true;
          let contadorSeleccionados = 0;

          const nuevosHijos = (nodoPadre.children || []).map((hijo) => {
            // Si el criterio está bloqueado por tener ya el 100% en otras versiones, no se activa
            if (hijo.data.bloqueadoPorOtras) {
              return hijo;
            }

            const nuevoPorcentaje = nuevoEstado ? 100 : 0;
            const nuevoGlobal = nuevoPorcentaje + (hijo.data.porcentajeOtrasVersiones || 0);

            if (nuevoEstado) {
              contadorSeleccionados++;
            }

            return {
              ...hijo,
              data: {
                ...hijo.data,
                seleccionado: nuevoEstado,
                porcentaje: nuevoPorcentaje,
                porcentajeGlobal: nuevoGlobal
              }
            };
          });

          const totalHijos = nuevosHijos.length;
          const todosSeleccionados = totalHijos > 0 && contadorSeleccionados === totalHijos;
          const todosAsignados = totalHijos > 0 && nuevosHijos.every(
            (h) => (h.data.seleccionado && h.data.porcentaje > 0) || h.data.bloqueadoPorOtras || h.data.porcentajeGlobal >= 100
          );

          return {
            ...nodoPadre,
            data: {
              ...nodoPadre.data,
              seleccionado: nuevoEstado || todosAsignados,
              todosAsignados,
              parcial: false,
              hijosSeleccionados: nuevoEstado ? contadorSeleccionados : 0
            },
            children: nuevosHijos
          };
        }

        // Caso 2: Se busca si el nodo pulsado corresponde a uno de sus hijos (CE)
        const tieneHijo = (nodoPadre.children || []).some((h) => h.key === claveNodo);
        if (tieneHijo) {
          huboModificacion = true;
          let contadorSeleccionados = 0;

          const nuevosHijos = (nodoPadre.children || []).map((hijo) => {
            if (hijo.key === claveNodo) {
              // Si está bloqueado por otras versiones no se permite modificar
              if (hijo.data.bloqueadoPorOtras) {
                return hijo;
              }

              const estaMarcado = nuevoEstado;
              let nuevoPorcentaje = hijo.data.porcentaje;
              if (estaMarcado) {
                nuevoPorcentaje = nuevoPorcentaje > 0 ? nuevoPorcentaje : 100;
                contadorSeleccionados++;
              } else {
                nuevoPorcentaje = 0;
              }
              const nuevoGlobal = nuevoPorcentaje + (hijo.data.porcentajeOtrasVersiones || 0);

              return {
                ...hijo,
                data: {
                  ...hijo.data,
                  seleccionado: estaMarcado,
                  porcentaje: nuevoPorcentaje,
                  porcentajeGlobal: nuevoGlobal
                }
              };
            }

            if (hijo.data.seleccionado) {
              contadorSeleccionados++;
            }
            return hijo;
          });

          const totalHijos = nuevosHijos.length;
          const todosSeleccionados = totalHijos > 0 && contadorSeleccionados === totalHijos;
          const todosAsignados = totalHijos > 0 && nuevosHijos.every(
            (h) => (h.data.seleccionado && h.data.porcentaje > 0) || h.data.bloqueadoPorOtras || h.data.porcentajeGlobal >= 100
          );
          const parcial = totalHijos > 0 && contadorSeleccionados > 0 && !todosSeleccionados;

          return {
            ...nodoPadre,
            data: {
              ...nodoPadre.data,
              seleccionado: todosSeleccionados || todosAsignados,
              todosAsignados,
              parcial,
              hijosSeleccionados: contadorSeleccionados
            },
            children: nuevosHijos
          };
        }

        return nodoPadre;
      });

      if (huboModificacion) {
        setHayCambios(true);
      }
      return nuevosNodos;
    });
  }, []);

  /**
   * Actualización del porcentaje de cobertura de un Criterio de Evaluación específico.
   * Se normaliza el valor entre 0 y 100 y se recalcula el total acumulado con otras versiones.
   *
   * @param {string} claveCe - Identificador del criterio hijo (id_ce).
   * @param {number|null} nuevoValor - Valor numérico introducido (0-100).
   */
  const actualizarPorcentaje = useCallback((claveCe, nuevoValor) => {
    const valorNumerico =
      nuevoValor === null || nuevoValor === undefined || isNaN(nuevoValor)
        ? 0
        : Math.max(0, Math.min(100, Math.round(Number(nuevoValor))));

    setArbolNodos((nodosPrevios) => {
      let huboModificacion = false;

      const nuevosNodos = nodosPrevios.map((nodoPadre) => {
        const tieneHijo = (nodoPadre.children || []).some((h) => h.key === claveCe);
        if (!tieneHijo) return nodoPadre;

        huboModificacion = true;
        let contadorSeleccionados = 0;

        const nuevosHijos = (nodoPadre.children || []).map((hijo) => {
          if (hijo.key === claveCe) {
            // Si está bloqueado por otras versiones no se permite actualizar
            if (hijo.data.bloqueadoPorOtras) {
              return hijo;
            }

            const estaMarcado = valorNumerico > 0 ? true : hijo.data.seleccionado;
            if (estaMarcado && valorNumerico > 0) {
              contadorSeleccionados++;
            }
            const nuevoGlobal = valorNumerico + (hijo.data.porcentajeOtrasVersiones || 0);

            return {
              ...hijo,
              data: {
                ...hijo.data,
                seleccionado: estaMarcado,
                porcentaje: valorNumerico,
                porcentajeGlobal: nuevoGlobal
              }
            };
          }

          if (hijo.data.seleccionado && hijo.data.porcentaje > 0) {
            contadorSeleccionados++;
          }
          return hijo;
        });

        const totalHijos = nuevosHijos.length;
        const todosSeleccionados = totalHijos > 0 && contadorSeleccionados === totalHijos;
        const todosAsignados = totalHijos > 0 && nuevosHijos.every(
          (h) => (h.data.seleccionado && h.data.porcentaje > 0) || h.data.bloqueadoPorOtras || h.data.porcentajeGlobal >= 100
        );
        const parcial = totalHijos > 0 && contadorSeleccionados > 0 && !todosSeleccionados;

        return {
          ...nodoPadre,
          data: {
            ...nodoPadre.data,
            seleccionado: todosSeleccionados || todosAsignados,
            todosAsignados,
            parcial,
            hijosSeleccionados: contadorSeleccionados
          },
          children: nuevosHijos
        };
      });

      if (huboModificacion) {
        setHayCambios(true);
      }
      return nuevosNodos;
    });
  }, []);

  /**
   * Restablece el árbol de criterios al estado inicial guardado en la base de datos.
   */
  const restablecerArbol = useCallback(() => {
    setArbolNodos(JSON.parse(JSON.stringify(arbolOriginal)));
    setHayCambios(false);
  }, [arbolOriginal]);

  /**
   * Persiste transaccionalmente el mapeo de criterios para una versión específica.
   * Se eliminan primero las asignaciones previas en la tabla trabajan para esa id_version,
   * y a continuación se insertan los nuevos registros marcados con porcentaje válido.
   *
   * @param {string} idVersion - Identificador de la versión de práctica a guardar.
   * @param {Array<Object>} [seleccionesManuales=null] - Opcional, lista directa de criterios seleccionados.
   * @returns {Promise<{ ok: boolean, total: number, error: string|null }>}
   */
  const guardarMapeo = useCallback(
    async (idVersion = idVersionActiva, seleccionesManuales = null) => {
      if (!idVersion) {
        return {
          ok: false,
          total: 0,
          error: 'No se ha especificado ninguna versión de práctica para guardar el mapeo.'
        };
      }

      setGuardando(true);
      setErrorOperacion(null);

      try {
        // Se extraen los criterios marcados con porcentaje positivo
        let registrosAInsertar = [];

        if (Array.isArray(seleccionesManuales)) {
          registrosAInsertar = seleccionesManuales
            .filter((item) => item.seleccionado && Number(item.porcentaje) > 0)
            .map((item) => ({
              id_ce: item.id_ce || item.id,
              id_version: idVersion,
              porcentaje: Math.round(Number(item.porcentaje))
            }));
        } else {
          arbolNodos.forEach((nodoPadre) => {
            (nodoPadre.children || []).forEach((hijo) => {
              if (hijo.data.seleccionado && Number(hijo.data.porcentaje) > 0) {
                registrosAInsertar.push({
                  id_ce: hijo.data.id,
                  id_version: idVersion,
                  porcentaje: Math.round(Number(hijo.data.porcentaje))
                });
              }
            });
          });
        }

        // 1. Operación DELETE: se eliminan las asignaciones previas de esta versión en la tabla trabajan
        await eliminarTrabajan('id_version', idVersion);

        // 2. Operación INSERT: se insertan masivamente las nuevas asignaciones activas
        if (registrosAInsertar.length > 0) {
          const resultadoInsercion = await insertarTrabajan(registrosAInsertar);
          if (!resultadoInsercion) {
            throw new Error('No se han podido insertar los registros en la tabla trabajan.');
          }
        }

        // 3. Se recargan las asignaciones globales de trabajan para mantener la consistencia
        const idsCE = listaCE.map((c) => c.id_ce);
        let nuevosTrabajan = [];
        if (idsCE.length > 0) {
          nuevosTrabajan = await obtenerTrabajan('*', (consulta) =>
            consulta.in('id_ce', idsCE)
          );
        }
        setListaTrabajan(nuevosTrabajan || []);

        // Se actualiza el estado de referencia original con los cambios guardados
        setArbolOriginal(JSON.parse(JSON.stringify(arbolNodos)));
        setHayCambios(false);

        return {
          ok: true,
          total: registrosAInsertar.length,
          error: null
        };
      } catch (err) {
        console.error('Error al guardar el mapeo de criterios:', err);
        const mensaje = err?.message || 'Error al persistir la asignación de criterios en la base de datos.';
        setErrorOperacion(mensaje);
        return {
          ok: false,
          total: 0,
          error: mensaje
        };
      } finally {
        setGuardando(false);
      }
    },
    [
      idVersionActiva,
      arbolNodos,
      eliminarTrabajan,
      insertarTrabajan,
      listaCE,
      obtenerTrabajan
    ]
  );

  /**
   * Cálculo cuantitativo global del grado de asignación curricular de los Criterios de Evaluación.
   * Se obtiene el progreso ponderado sobre todos los criterios del módulo curricular.
   */
  const metricasGlobales = useMemo(() => {
    const totalCE = listaCE.length;
    if (totalCE === 0) {
      return {
        totalCE: 0,
        ceCompletos: 0,
        ceIncompletos: 0,
        ceSinAsignar: 0,
        ceExcedidos: 0,
        porcentajeGlobalMedio: 0,
        porcentajeCriteriosCompletos: 0,
        hayCriteriosDesbalanceados: false,
        criteriosConAlerta: []
      };
    }

    // Se calcula la suma acumulada de cobertura por criterio combinando el estado local de la versión activa
    const mapaGlobal = new Map();
    const idsVersionesClase = new Set((listaVersiones || []).map((v) => v.id_version));

    // 1. Asignaciones de otras versiones de la clase procedentes de la base de datos
    (listaTrabajan || []).forEach((t) => {
      if (t.id_version !== idVersionActiva && idsVersionesClase.has(t.id_version)) {
        const actual = mapaGlobal.get(t.id_ce) || 0;
        mapaGlobal.set(t.id_ce, actual + (Number(t.porcentaje) || 0));
      }
    });

    // 2. Se suman los porcentajes activos de la versión actual desde el árbol local
    arbolNodos.forEach((padre) => {
      (padre.children || []).forEach((hijo) => {
        const idCe = hijo.data.id;
        const actual = mapaGlobal.get(idCe) || 0;
        const aporteActual = hijo.data.seleccionado ? Number(hijo.data.porcentaje || 0) : 0;
        mapaGlobal.set(idCe, actual + aporteActual);
      });
    });

    let ceCompletos = 0;
    let ceIncompletos = 0;
    let ceSinAsignar = 0;
    let ceExcedidos = 0;
    let sumaPorcentajesEfectivos = 0;
    const criteriosConAlerta = [];

    listaCE.forEach((ce) => {
      const porcentaje = mapaGlobal.get(ce.id_ce) || 0;
      sumaPorcentajesEfectivos += Math.min(100, Math.max(0, porcentaje));

      if (porcentaje > 100) {
        ceExcedidos++;
        criteriosConAlerta.push({
          id_ce: ce.id_ce,
          codigo: `CE${ce.numero}`,
          nombre: ce.nombre,
          porcentaje,
          tipo: 'excedido'
        });
      } else if (porcentaje === 100) {
        ceCompletos++;
      } else if (porcentaje > 0) {
        ceIncompletos++;
        criteriosConAlerta.push({
          id_ce: ce.id_ce,
          codigo: `CE${ce.numero}`,
          nombre: ce.nombre,
          porcentaje,
          tipo: 'incompleto'
        });
      } else {
        ceSinAsignar++;
      }
    });

    const porcentajeGlobalMedio = Math.round((sumaPorcentajesEfectivos / (totalCE * 100)) * 100);
    const porcentajeCriteriosCompletos = Math.round((ceCompletos / totalCE) * 100);
    const hayCriteriosDesbalanceados = ceIncompletos > 0 || ceExcedidos > 0;

    return {
      totalCE,
      ceCompletos,
      ceIncompletos,
      ceSinAsignar,
      ceExcedidos,
      porcentajeGlobalMedio,
      porcentajeCriteriosCompletos,
      hayCriteriosDesbalanceados,
      criteriosConAlerta
    };
  }, [listaCE, listaTrabajan, idVersionActiva, arbolNodos, listaVersiones]);

  /**
   * Resumen de las versiones de la clase con el cómputo de criterios asignados a cada una.
   */
  const versionesConMetricas = useMemo(() => {
    return (listaVersiones || []).map((version) => {
      let criteriosAsignados = 0;
      let porcentajeSuma = 0;

      // Si es la versión activa, se extraen las métricas del árbol local en tiempo real
      if (version.id_version === idVersionActiva) {
        arbolNodos.forEach((p) => {
          (p.children || []).forEach((h) => {
            if (h.data.seleccionado && h.data.porcentaje > 0) {
              criteriosAsignados++;
              porcentajeSuma += h.data.porcentaje;
            }
          });
        });
      } else {
        (listaTrabajan || []).forEach((t) => {
          if (t.id_version === version.id_version && Number(t.porcentaje) > 0) {
            criteriosAsignados++;
            porcentajeSuma += Number(t.porcentaje);
          }
        });
      }

      return {
        ...version,
        criteriosAsignados,
        porcentajeSuma
      };
    });
  }, [listaVersiones, listaTrabajan, idVersionActiva, arbolNodos]);

  const cargando =
    cargandoEstructura ||
    cargandoRA ||
    cargandoCE ||
    cargandoPracticas ||
    cargandoVersiones ||
    cargandoTrabajan;

  const error =
    errorOperacion ||
    errorRA ||
    errorCE ||
    errorPracticas ||
    errorVersiones ||
    errorTrabajan;

  return {
    listaRA,
    listaCE,
    versiones: versionesConMetricas,
    practicas: versionesConMetricas, // Alias de compatibilidad
    arbolNodos,
    idVersionActiva,
    setIdVersionActiva,
    hayCambios,
    cargando,
    guardando,
    error,
    metricasGlobales,
    obtenerArbolCriterios,
    seleccionarNodo,
    actualizarPorcentaje,
    restablecerArbol,
    guardarMapeo
  };
};

export default useMapeoCriterios;

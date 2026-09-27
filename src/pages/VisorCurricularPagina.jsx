import React, { useState, useMemo, useEffect } from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import EstadoVacio from '../components/common/EstadoVacio.jsx';
import CargadorSeccion from '../components/common/CargadorSeccion.jsx';
import {
  FiltrosVisorCurricular,
  ResumenCurriculo,
  AcordeonCurriculo
} from '../components/visorcurricular/index.js';
import useCiclos from '../hooks/useCiclos.js';
import useModulos from '../hooks/useModulos.js';
import useVisorCurricular from '../hooks/useVisorCurricular.js';
import useGlobalToast from '../hooks/useGlobalToast.js';
import exportarCurriculoPDF from '../utils/exportadorCurriculoPdf.js';

/**
 * VisorCurricularPagina - Página orquestadora del Caso de Uso 12.6 / 12.7 (Visor del Currículo Oficial).
 *
 * Responsabilidad Única: Actuar como contenedor orquestador integrando la consulta de Ciclos Formativos,
 * Módulos Profesionales y la jerarquía curricular oficial de Resultados de Aprendizaje (RA)
 * y Criterios de Evaluación (CE) mediante vista en acordeón, coordinando además la exportación oficial a PDF.
 */
const VisorCurricularPagina = () => {
  const { mostrarExito, mostrarError } = useGlobalToast();

  // 1. Consulta de entidades base maestras (Ciclos y Módulos)
  const {
    datos: ciclos,
    cargando: cargandoCiclos,
    error: errorCiclos
  } = useCiclos();

  const {
    datos: modulos,
    cargando: cargandoModulos,
    error: errorModulos
  } = useModulos();

  // Estados locales para la selección jerárquica de ciclo y módulo (inician vacíos por requerimiento)
  const [cicloSeleccionadoId, setCicloSeleccionadoId] = useState(null);
  const [moduloSeleccionadoId, setModuloSeleccionadoId] = useState(null);

  // Estado indicador del proceso de exportación a PDF
  const [exportandoPDF, setExportandoPDF] = useState(false);

  // Filtrado de módulos asociados al ciclo actualmente seleccionado
  const modulosDelCiclo = useMemo(() => {
    if (!cicloSeleccionadoId || !modulos) return [];
    return modulos.filter((m) => m.id_ciclo === cicloSeleccionadoId);
  }, [modulos, cicloSeleccionadoId]);

  // Si cambia el ciclo, se resetea el módulo seleccionado si ya no pertenece al nuevo ciclo
  useEffect(() => {
    if (moduloSeleccionadoId && modulosDelCiclo.length > 0) {
      const existeModulo = modulosDelCiclo.some((m) => m.id_modulo === moduloSeleccionadoId);
      if (!existeModulo) {
        setModuloSeleccionadoId(null);
      }
    }
  }, [modulosDelCiclo, moduloSeleccionadoId]);

  // Se extraen los objetos descriptivos del ciclo y módulo activos
  const cicloActivo = useMemo(() => {
    if (!cicloSeleccionadoId || !ciclos) return null;
    return ciclos.find((c) => c.id_ciclo === cicloSeleccionadoId) || null;
  }, [ciclos, cicloSeleccionadoId]);

  const moduloActivo = useMemo(() => {
    if (!moduloSeleccionadoId || !modulosDelCiclo) return null;
    return modulosDelCiclo.find((m) => m.id_modulo === moduloSeleccionadoId) || null;
  }, [modulosDelCiclo, moduloSeleccionadoId]);

  // 2. Consulta encadenada de RAs y CEs del módulo seleccionado mediante Custom Hook
  const {
    arbolNodos,
    ras,
    ces,
    totalRA,
    totalCE,
    cargando: cargandoCurriculo,
    error: errorCurriculo
  } = useVisorCurricular(moduloSeleccionadoId);

  // Notificación reactiva de posibles errores de carga
  useEffect(() => {
    const errorCapturado = errorCiclos || errorModulos || errorCurriculo;
    if (errorCapturado) {
      mostrarError(errorCapturado);
    }
  }, [errorCiclos, errorModulos, errorCurriculo, mostrarError]);

  // Manejador para la exportación del currículo oficial a PDF
  const manejarExportarPDF = async () => {
    if (!moduloActivo || ras.length === 0) {
      mostrarError('No hay Resultados de Aprendizaje para generar el documento PDF.');
      return;
    }

    setExportandoPDF(true);
    try {
      await exportarCurriculoPDF({
        ciclo: cicloActivo,
        modulo: moduloActivo,
        ras,
        ces
      });
      mostrarExito('Documento curricular oficial en PDF generado correctamente.');
    } catch (err) {
      console.error('Error al exportar currículo a PDF:', err);
      mostrarError(err.message || 'Error al exportar el currículo a PDF.');
    } finally {
      setExportandoPDF(false);
    }
  };

  const cargandoFiltros = cargandoCiclos || cargandoModulos;
  const tieneContenidoCurricular = moduloSeleccionadoId && ras.length > 0;

  return (
    <div className="flex flex-column w-full pb-6">
      {/* Cabecera principal estandarizada de la página */}
      <HeaderPagina
        titulo="Visor del Currículo Oficial (RA y CE)"
        descripcion="Catálogo de consulta rápida de solo lectura para visualizar la jerarquía curricular oficial (Resultados de Aprendizaje y Criterios de Evaluación) filtrando por Ciclo Formativo y Módulo."
      />

      {/* Barra de filtros con selector de Ciclo y tarjetas de Módulos */}
      <FiltrosVisorCurricular
        ciclos={ciclos}
        cicloSeleccionadoId={cicloSeleccionadoId}
        onSeleccionarCicloId={(nuevoCicloId) => {
          setCicloSeleccionadoId(nuevoCicloId);
          setModuloSeleccionadoId(null);
        }}
        modulos={modulos}
        moduloSeleccionadoId={moduloSeleccionadoId}
        onSeleccionarModuloId={setModuloSeleccionadoId}
        cargando={cargandoFiltros}
        onExportarPDF={manejarExportarPDF}
        puedeExportar={tieneContenidoCurricular}
        exportandoPDF={exportandoPDF}
      />

      {/* Estado: No hay ciclo formativo seleccionado (estado inicial al entrar a la página) */}
      {!cicloSeleccionadoId && !cargandoFiltros && (
        <EstadoVacio
          mensaje="Selecciona un Ciclo Formativo"
          descripcion="Elige un ciclo formativo en el desplegable superior para desplegar sus módulos profesionales."
          icono="pi pi-briefcase"
          className="w-full my-3"
        />
      )}

      {/* Estado: Ciclo seleccionado pero no tiene módulos asociados */}
      {cicloSeleccionadoId && !cargandoFiltros && modulosDelCiclo.length === 0 && (
        <EstadoVacio
          mensaje="Sin módulos profesionales"
          descripcion="El ciclo formativo seleccionado no tiene ningún módulo profesional asociado en el sistema."
          icono="pi pi-book"
          className="w-full my-3"
        />
      )}

      {/* Estado: Ciclo seleccionado con módulos pero el usuario aún no ha pulsado ninguno */}
      {cicloSeleccionadoId && modulosDelCiclo.length > 0 && !moduloSeleccionadoId && (
        <EstadoVacio
          mensaje="Selecciona un Módulo Profesional"
          descripcion="Haz clic en una de las tarjetas de módulo que aparecen arriba para consultar sus Resultados de Aprendizaje y Criterios de Evaluación."
          icono="pi pi-book"
          className="w-full my-3"
        />
      )}

      {/* Estado: Carga asíncrona de los elementos curriculares del módulo */}
      {moduloSeleccionadoId && cargandoCurriculo && (
        <CargadorSeccion
          cargando={true}
          tipo="tabla"
          filas={6}
          columnas={4}
          className="my-3"
        />
      )}

      {/* Estado: Módulo seleccionado sin RAs registrados */}
      {moduloSeleccionadoId && !cargandoCurriculo && ras.length === 0 && (
        <EstadoVacio
          mensaje="Currículo no disponible"
          descripcion="El módulo profesional seleccionado no tiene Resultados de Aprendizaje ni Criterios de Evaluación registrados en el catálogo oficial."
          icono="pi pi-list"
          className="w-full my-3"
        />
      )}

      {/* Contenido principal: Resumen analítico y Acordeón con estilo unificado */}
      {tieneContenidoCurricular && !cargandoCurriculo && (
        <div className="flex flex-column w-full">
          {/* Tarjetas resumen con métricas curriculares */}
          <ResumenCurriculo
            ciclo={cicloActivo}
            modulo={moduloActivo}
            totalRA={totalRA}
            totalCE={totalCE}
          />

          {/* Visualización permanente mediante Acordeón adaptado */}
          <AcordeonCurriculo
            arbolNodos={arbolNodos}
          />
        </div>
      )}
    </div>
  );
};

export default VisorCurricularPagina;

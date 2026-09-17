import React, { useMemo } from 'react';
import useEvaluanContexto from '../../hooks/useEvaluanContexto.js';
import useEvaluacionesContexto from '../../hooks/useEvaluacionesContexto.js';
import usePracticasContexto from '../../hooks/usePracticasContexto.js';
import useDiscentesContexto from '../../hooks/useDiscentesContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';

// Componente de página para el mantenimiento de la tabla evaluan (calificaciones de prácticas)
const EvaluanPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useEvaluanContexto();
  const { datos: evaluaciones } = useEvaluacionesContexto();
  const { datos: practicas } = usePracticasContexto();
  const { datos: discentes } = useDiscentesContexto();

  // Opciones de evaluaciones para el selector
  const opcionesEvaluaciones = useMemo(() => {
    return (evaluaciones || []).map((e) => ({
      label: e.nombre,
      value: e.id_evaluacion
    }));
  }, [evaluaciones]);

  // Opciones de prácticas ordenadas por número o nombre para el selector
  const opcionesPracticas = useMemo(() => {
    return (practicas || []).map((p) => ({
      label: `${p.numero ? `P${p.numero} - ` : ''}${p.nombre}`,
      value: p.id_practica
    }));
  }, [practicas]);

  // Opciones de discentes ordenados por apellidos mostrando únicamente nombre y apellidos (sin NIA)
  const opcionesDiscentes = useMemo(() => {
    return [...(discentes || [])]
      .sort((a, b) => (a.apellidos || '').localeCompare(b.apellidos || ''))
      .map((d) => ({
        label: `${d.nombre || ''} ${d.apellidos || ''}`.trim() || 'Discente sin nombre',
        value: d.id_discente
      }));
  }, [discentes]);

  // Definición de las columnas y campos de la tabla evaluan
  const columnas = useMemo(() => [
    {
      campo: 'id_evaluacion',
      encabezado: 'Evaluación',
      tipo: 'seleccion',
      opciones: opcionesEvaluaciones,
      requerido: true,
      ancho: '200px',
      placeholder: 'Seleccione una evaluación'
    },
    {
      campo: 'id_practica',
      encabezado: 'Práctica',
      tipo: 'seleccion',
      opciones: opcionesPracticas,
      requerido: true,
      ancho: '260px',
      placeholder: 'Seleccione una práctica'
    },
    {
      campo: 'id_discente',
      encabezado: 'Discente',
      tipo: 'seleccion',
      opciones: opcionesDiscentes,
      requerido: true,
      ancho: '260px',
      placeholder: 'Seleccione un discente'
    },
    {
      campo: 'nota',
      encabezado: 'Calificación (0-100)',
      tipo: 'numero',
      requerido: false,
      min: 0,
      max: 100,
      ancho: '160px',
      placeholder: '0 - 100'
    },
    {
      campo: 'peso',
      encabezado: 'Peso (%)',
      tipo: 'numero',
      requerido: false,
      valorPorDefecto: 100,
      min: 1,
      max: 100,
      ancho: '120px',
      placeholder: '100'
    },
    {
      campo: 'created_at',
      encabezado: 'Fecha Creación',
      tipo: 'fecha',
      soloLectura: true,
      mostrarEnFormulario: false,
      ancho: '140px'
    }
  ], [opcionesEvaluaciones, opcionesPracticas, opcionesDiscentes]);

  return (
    <TablaMantenimiento
      titulo="Mantenimiento de Evalúan (Calificaciones)"
      descripcion="Control directo de registros de calificaciones y ponderaciones por discente, práctica y evaluación."
      nombreEntidad="Calificación (Evalúan)"
      campoId="id_evaluan"
      columnas={columnas}
      datos={datos}
      cargando={cargando}
      alCrear={crear}
      alModificar={modificar}
      alEliminar={eliminar}
      alRecargar={recargar}
    />
  );
};

export default EvaluanPagina;

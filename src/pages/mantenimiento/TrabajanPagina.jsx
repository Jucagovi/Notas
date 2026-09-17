import React, { useMemo } from 'react';
import useTrabajanContexto from '../../hooks/useTrabajanContexto.js';
import usePracticasContexto from '../../hooks/usePracticasContexto.js';
import useCEContexto from '../../hooks/useCEContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';
import { formatearTextoCE } from '../../utils/formatters.js';

// Componente de página para el mantenimiento de la tabla trabajan (cobertura de CE en prácticas)
const TrabajanPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useTrabajanContexto();
  const { datos: practicas } = usePracticasContexto();
  const { datos: listaCE } = useCEContexto();

  // Opciones de prácticas ordenadas para el selector
  const opcionesPracticas = useMemo(() => {
    return (practicas || []).map((p) => ({
      label: `${p.numero ? `P${p.numero} - ` : ''}${p.nombre}`,
      value: p.id_practica
    }));
  }, [practicas]);

  // Opciones de criterios de evaluación ordenados mostrando identificador y descripción pedagógica
  const opcionesCE = useMemo(() => {
    return (listaCE || []).map((c) => ({
      label: formatearTextoCE(c),
      value: c.id_ce
    }));
  }, [listaCE]);

  // Definición de las columnas y campos de la tabla trabajan
  const columnas = useMemo(() => [
    {
      campo: 'id_practica',
      encabezado: 'Práctica',
      tipo: 'seleccion',
      opciones: opcionesPracticas,
      requerido: true,
      ancho: '250px',
      placeholder: 'Seleccione una práctica'
    },
    {
      campo: 'id_ce',
      encabezado: 'Criterio de Evaluación (CE)',
      tipo: 'seleccion',
      opciones: opcionesCE,
      requerido: true,
      ancho: '380px',
      placeholder: 'Seleccione un criterio'
    },
    {
      campo: 'porcentaje',
      encabezado: 'Porcentaje (%)',
      tipo: 'numero',
      requerido: true,
      min: 1,
      max: 100,
      ancho: '130px',
      placeholder: '1 - 100'
    },
    {
      campo: 'descripcion',
      encabezado: 'Descripción / Detalle',
      tipo: 'textarea',
      requerido: false,
      ancho: '280px',
      placeholder: 'Detalle o justificación de la cobertura del criterio'
    },
    {
      campo: 'created_at',
      encabezado: 'Fecha Creación',
      tipo: 'fecha',
      soloLectura: true,
      mostrarEnFormulario: false,
      ancho: '140px'
    }
  ], [opcionesPracticas, opcionesCE]);

  return (
    <TablaMantenimiento
      titulo="Mantenimiento de Trabajan (Criterios en Prácticas)"
      descripcion="Asignación y porcentaje de cobertura de criterios de evaluación trabajados en cada práctica."
      nombreEntidad="Vinculación Práctica-CE (Trabajan)"
      campoId="id_trabajan"
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

export default TrabajanPagina;

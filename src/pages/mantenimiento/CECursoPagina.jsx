import React, { useMemo } from 'react';
import useCECursoContexto from '../../hooks/useCECursoContexto.js';
import useCursosContexto from '../../hooks/useCursosContexto.js';
import useCEContexto from '../../hooks/useCEContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';
import { formatearTextoCE } from '../../utils/formatters.js';

// Componente de página para el mantenimiento de la tabla ce_curso (ponderaciones de CE por curso)
const CECursoPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useCECursoContexto();
  const { datos: cursos } = useCursosContexto();
  const { datos: listaCE } = useCEContexto();

  // Opciones de cursos académicos para el selector
  const opcionesCursos = useMemo(() => {
    return (cursos || []).map((c) => ({
      label: `${c.nombre} (${c.anyo || c.centro || ''})`,
      value: c.id_curso
    }));
  }, [cursos]);

  // Opciones de criterios de evaluación ordenados mostrando identificador y descripción pedagógica
  const opcionesCE = useMemo(() => {
    return (listaCE || []).map((c) => ({
      label: formatearTextoCE(c),
      value: c.id_ce
    }));
  }, [listaCE]);

  // Definición de las columnas y campos de la tabla ce_curso
  const columnas = useMemo(() => [
    {
      campo: 'id_curso',
      encabezado: 'Curso Académico',
      tipo: 'seleccion',
      opciones: opcionesCursos,
      requerido: true,
      ancho: '220px',
      placeholder: 'Seleccione un curso'
    },
    {
      campo: 'id_ce',
      encabezado: 'Criterio de Evaluación (CE)',
      tipo: 'seleccion',
      opciones: opcionesCE,
      requerido: true,
      ancho: '420px',
      placeholder: 'Seleccione un criterio'
    },
    {
      campo: 'peso',
      encabezado: 'Peso Ponderado',
      tipo: 'numero',
      requerido: true,
      min: 1,
      ancho: '150px',
      placeholder: 'Peso del criterio en el curso'
    },
    {
      campo: 'created_at',
      encabezado: 'Fecha Creación',
      tipo: 'fecha',
      soloLectura: true,
      mostrarEnFormulario: false,
      ancho: '140px'
    }
  ], [opcionesCursos, opcionesCE]);

  return (
    <TablaMantenimiento
      titulo="Mantenimiento de CE por Curso (Ponderaciones)"
      descripcion="Ponderación y configuración de criterios de evaluación específicos por curso académico."
      nombreEntidad="Ponderación CE (ce_curso)"
      campoId="id_ce_curso"
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

export default CECursoPagina;

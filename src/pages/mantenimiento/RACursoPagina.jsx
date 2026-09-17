import React, { useMemo } from 'react';
import useRACursoContexto from '../../hooks/useRACursoContexto.js';
import useCursosContexto from '../../hooks/useCursosContexto.js';
import useRAContexto from '../../hooks/useRAContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';
import { formatearTextoRA } from '../../utils/formatters.js';

// Componente de página para el mantenimiento de la tabla ra_curso (ponderaciones de RA por curso)
const RACursoPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useRACursoContexto();
  const { datos: cursos } = useCursosContexto();
  const { datos: listaRA } = useRAContexto();

  // Opciones de cursos académicos para el selector
  const opcionesCursos = useMemo(() => {
    return (cursos || []).map((c) => ({
      label: `${c.nombre} (${c.anyo || c.centro || ''})`,
      value: c.id_curso
    }));
  }, [cursos]);

  // Opciones de resultados de aprendizaje ordenados mostrando identificador y descripción pedagógica
  const opcionesRA = useMemo(() => {
    return (listaRA || []).map((r) => ({
      label: formatearTextoRA(r),
      value: r.id_ra
    }));
  }, [listaRA]);

  // Definición de las columnas y campos de la tabla ra_curso
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
      campo: 'id_ra',
      encabezado: 'Resultado de Aprendizaje (RA)',
      tipo: 'seleccion',
      opciones: opcionesRA,
      requerido: true,
      ancho: '420px',
      placeholder: 'Seleccione un RA'
    },
    {
      campo: 'peso',
      encabezado: 'Peso Ponderado',
      tipo: 'numero',
      requerido: true,
      min: 1,
      ancho: '150px',
      placeholder: 'Peso del RA en el curso'
    },
    {
      campo: 'created_at',
      encabezado: 'Fecha Creación',
      tipo: 'fecha',
      soloLectura: true,
      mostrarEnFormulario: false,
      ancho: '140px'
    }
  ], [opcionesCursos, opcionesRA]);

  return (
    <TablaMantenimiento
      titulo="Mantenimiento de RA por Curso (Ponderaciones)"
      descripcion="Ponderación y configuración de resultados de aprendizaje específicos por curso académico."
      nombreEntidad="Ponderación RA (ra_curso)"
      campoId="id_ra_curso"
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

export default RACursoPagina;

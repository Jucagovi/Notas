import React, { useMemo } from 'react';
import useEvaluacionesContexto from '../../hooks/useEvaluacionesContexto.js';
import useCursosContexto from '../../hooks/useCursosContexto.js';
import useModulosContexto from '../../hooks/useModulosContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';

// Componente de página para el mantenimiento de la tabla Evaluaciones
const EvaluacionesPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useEvaluacionesContexto();
  const { datos: cursos } = useCursosContexto();
  const { datos: modulos } = useModulosContexto();

  // Opciones de cursos para desplegable
  const opcionesCursos = useMemo(() => {
    return (cursos || []).map((c) => ({
      label: `${c.nombre} (${c.anyo})`,
      value: c.id_curso
    }));
  }, [cursos]);

  // Opciones de módulos para desplegable
  const opcionesModulos = useMemo(() => {
    return (modulos || []).map((m) => ({
      label: `${m.siglas ? `[${m.siglas}] ` : ''}${m.nombre}`,
      value: m.id_modulo
    }));
  }, [modulos]);

  // Definición de las columnas y campos de la entidad Evaluaciones
  const columnas = useMemo(() => [
    {
      campo: 'nombre',
      encabezado: 'Nombre Evaluación',
      tipo: 'texto',
      requerido: true,
      ancho: '180px',
      placeholder: 'Ej. 1ª Evaluación, Final Ordinaria'
    },
    {
      campo: 'id_curso',
      encabezado: 'Curso Académico',
      tipo: 'seleccion',
      opciones: opcionesCursos,
      requerido: false,
      placeholder: 'Seleccionar curso',
      ancho: '180px'
    },
    {
      campo: 'id_modulo',
      encabezado: 'Módulo Profesional',
      tipo: 'seleccion',
      opciones: opcionesModulos,
      requerido: false,
      placeholder: 'Seleccionar módulo',
      ancho: '200px'
    },
    {
      campo: 'fecha_ini',
      encabezado: 'Fecha Inicio',
      tipo: 'fecha',
      requerido: false,
      ancho: '130px'
    },
    {
      campo: 'fecha_fin',
      encabezado: 'Fecha Fin',
      tipo: 'fecha',
      requerido: false,
      ancho: '130px'
    },
    {
      campo: 'id_tipoevaluacion',
      encabezado: 'Tipo Eval.',
      tipo: 'numero',
      requerido: false,
      ancho: '100px',
      placeholder: '1, 2...'
    },
    {
      campo: 'descripcion',
      encabezado: 'Descripción',
      tipo: 'textarea',
      requerido: false,
      placeholder: 'Criterios y notas de la convocatoria'
    },
    {
      campo: 'created_at',
      encabezado: 'Fecha Creación',
      tipo: 'fecha',
      soloLectura: true,
      mostrarEnFormulario: false,
      ancho: '140px'
    }
  ], [opcionesCursos, opcionesModulos]);

  return (
    <TablaMantenimiento
      titulo="Mantenimiento de Evaluaciones"
      descripcion="Gestión de periodos y convocatorias de evaluación por curso y módulo."
      nombreEntidad="Evaluación"
      campoId="id_evaluacion"
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

export default EvaluacionesPagina;

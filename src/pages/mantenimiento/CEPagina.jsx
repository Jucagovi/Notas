import React, { useMemo } from 'react';
import useCEContexto from '../../hooks/useCEContexto.js';
import useRAContexto from '../../hooks/useRAContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';

// Componente de página para el mantenimiento de la tabla CE (Criterios de Evaluación)
const CEPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useCEContexto();
  const { datos: listaRA } = useRAContexto();

  // Opciones de RA para desplegable
  const opcionesRA = useMemo(() => {
    return (listaRA || []).map((ra) => ({
      label: `RA${ra.numero || ''}: ${ra.nombre}`,
      value: ra.id_ra
    }));
  }, [listaRA]);

  // Definición de las columnas y campos de la entidad CE
  const columnas = useMemo(() => [
    {
      campo: 'numero',
      encabezado: 'Nº Criterio',
      tipo: 'numero',
      decimales: true,
      requerido: true,
      ancho: '110px',
      placeholder: 'Ej. 1.1, 1.2'
    },
    {
      campo: 'nombre',
      encabezado: 'Criterio de Evaluación',
      tipo: 'texto',
      requerido: true,
      placeholder: 'Ej. Se han identificado las etiquetas y estructuras'
    },
    {
      campo: 'id_ra',
      encabezado: 'Resultado de Aprendizaje (RA)',
      tipo: 'seleccion',
      opciones: opcionesRA,
      requerido: false,
      placeholder: 'Seleccionar RA asociado',
      ancho: '250px'
    },
    {
      campo: 'descripcion',
      encabezado: 'Descripción',
      tipo: 'textarea',
      requerido: false,
      placeholder: 'Ponderación o especificación del criterio'
    },
    {
      campo: 'created_at',
      encabezado: 'Fecha Creación',
      tipo: 'fecha',
      soloLectura: true,
      mostrarEnFormulario: false,
      ancho: '140px'
    }
  ], [opcionesRA]);

  return (
    <TablaMantenimiento
      titulo="Mantenimiento de CE (Criterios de Evaluación)"
      descripcion="Gestión de criterios evaluables y su vinculación con los resultados de aprendizaje."
      nombreEntidad="Criterio de Evaluación (CE)"
      campoId="id_ce"
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

export default CEPagina;

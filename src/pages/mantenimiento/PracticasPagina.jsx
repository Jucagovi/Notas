import React, { useMemo } from 'react';
import usePracticasContexto from '../../hooks/usePracticasContexto.js';
import useModulosContexto from '../../hooks/useModulosContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';

// Componente de página para el mantenimiento de la tabla Prácticas
const PracticasPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = usePracticasContexto();
  const { datos: modulos } = useModulosContexto();

  // Opciones de módulos para desplegable
  const opcionesModulos = useMemo(() => {
    return (modulos || []).map((m) => ({
      label: `${m.siglas ? `[${m.siglas}] ` : ''}${m.nombre}`,
      value: m.id_modulo
    }));
  }, [modulos]);

  // Definición de las columnas y campos de la entidad Prácticas
  const columnas = useMemo(() => [
    {
      campo: 'numero',
      encabezado: 'Número',
      tipo: 'texto',
      requerido: false,
      ancho: '100px',
      placeholder: 'Ej. P01, T01'
    },
    {
      campo: 'nombre',
      encabezado: 'Título de la Práctica',
      tipo: 'texto',
      requerido: true,
      placeholder: 'Ej. Componentes en React y JSX'
    },
    {
      campo: 'unidad',
      encabezado: 'Unidad',
      tipo: 'texto',
      requerido: false,
      ancho: '100px',
      placeholder: 'Ej. UT1, UT2'
    },
    {
      campo: 'id_tipopractica',
      encabezado: 'Tipo Práctica',
      tipo: 'texto',
      requerido: true,
      ancho: '130px',
      placeholder: 'Individual, Grupal, Examen'
    },
    {
      campo: 'id_modulo',
      encabezado: 'Módulo',
      tipo: 'seleccion',
      opciones: opcionesModulos,
      requerido: false,
      placeholder: 'Seleccionar módulo',
      ancho: '200px'
    },
    {
      campo: 'enunciado',
      encabezado: 'Enunciado',
      tipo: 'textarea',
      requerido: false,
      mostrarEnTabla: false,
      placeholder: 'Enunciado detallado de la práctica'
    },
    {
      campo: 'descripcion',
      encabezado: 'Descripción',
      tipo: 'textarea',
      requerido: false,
      placeholder: 'Criterios u observaciones de la práctica'
    },
    {
      campo: 'created_at',
      encabezado: 'Fecha Creación',
      tipo: 'fecha',
      soloLectura: true,
      mostrarEnFormulario: false,
      ancho: '140px'
    }
  ], [opcionesModulos]);

  return (
    <TablaMantenimiento
      titulo="Mantenimiento de Prácticas y Tareas"
      descripcion="Gestión del catálogo de actividades evaluables asignadas a módulos."
      nombreEntidad="Práctica"
      campoId="id_practica"
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

export default PracticasPagina;

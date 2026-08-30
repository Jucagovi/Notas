import React, { useMemo } from 'react';
import useCursosContexto from '../../hooks/useCursosContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';

// Componente de página para el mantenimiento de la tabla Cursos
const CursosPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useCursosContexto();

  // Definición de las columnas y campos de la entidad Cursos
  const columnas = useMemo(() => [
    {
      campo: 'nombre',
      encabezado: 'Nombre del Curso',
      tipo: 'texto',
      requerido: true,
      ancho: '180px',
      placeholder: 'Ej. 1º DAW, 2º DAM'
    },
    {
      campo: 'anyo',
      encabezado: 'Año Académico',
      tipo: 'texto',
      requerido: true,
      ancho: '150px',
      placeholder: 'Ej. 2026/2027'
    },
    {
      campo: 'centro',
      encabezado: 'Centro Educativo',
      tipo: 'texto',
      requerido: false,
      placeholder: 'Ej. IES Tecnológico'
    },
    {
      campo: 'descripcion',
      encabezado: 'Descripción',
      tipo: 'textarea',
      requerido: false,
      placeholder: 'Detalles adicionales del curso'
    },
    {
      campo: 'created_at',
      encabezado: 'Fecha Creación',
      tipo: 'fecha',
      soloLectura: true,
      mostrarEnFormulario: false,
      ancho: '140px'
    }
  ], []);

  return (
    <TablaMantenimiento
      titulo="Mantenimiento de Cursos Académicos"
      descripcion="Gestión de cursos lectivos y grupos académicos del centro."
      nombreEntidad="Curso Académico"
      campoId="id_curso"
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

export default CursosPagina;

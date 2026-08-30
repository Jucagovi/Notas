import React, { useMemo } from 'react';
import useDiscentesContexto from '../../hooks/useDiscentesContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';

// Componente de página para el mantenimiento de la tabla Discentes
const DiscentesPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useDiscentesContexto();

  // Definición de las columnas y campos de la entidad Discentes
  const columnas = useMemo(() => [
    {
      campo: 'NIA',
      encabezado: 'NIA',
      tipo: 'texto',
      requerido: false,
      ancho: '120px',
      placeholder: 'Número de Identificación del Alumno'
    },
    {
      campo: 'nombre',
      encabezado: 'Nombre',
      tipo: 'texto',
      requerido: true,
      ancho: '150px',
      placeholder: 'Nombre del estudiante'
    },
    {
      campo: 'apellidos',
      encabezado: 'Apellidos',
      tipo: 'texto',
      requerido: true,
      ancho: '200px',
      placeholder: 'Apellidos del estudiante'
    },
    {
      campo: 'correo',
      encabezado: 'Correo Electrónico',
      tipo: 'texto',
      requerido: false,
      placeholder: 'alumno@ejemplo.com'
    },
    {
      campo: 'localidad',
      encabezado: 'Localidad',
      tipo: 'texto',
      requerido: false,
      ancho: '140px',
      placeholder: 'Localidad de residencia'
    },
    {
      campo: 'fecha_nac',
      encabezado: 'Fecha Nacimiento',
      tipo: 'fecha',
      requerido: false,
      ancho: '140px'
    },
    {
      campo: 'activo',
      encabezado: 'Estado',
      tipo: 'booleano',
      etiquetaVerdadero: 'Activo',
      etiquetaFalso: 'Inactivo',
      etiquetaCheckbox: 'Estudiante en estado activo',
      valorPorDefecto: true,
      ancho: '100px'
    },
    {
      campo: 'imagen',
      encabezado: 'URL Imagen/Avatar',
      tipo: 'texto',
      requerido: false,
      mostrarEnTabla: false,
      placeholder: 'URL de fotografía o avatar'
    },
    {
      campo: 'created_at',
      encabezado: 'Fecha Registro',
      tipo: 'fecha',
      soloLectura: true,
      mostrarEnFormulario: false,
      ancho: '140px'
    }
  ], []);

  return (
    <TablaMantenimiento
      titulo="Mantenimiento de Discentes (Alumnado)"
      descripcion="Gestión de expedientes, datos personales y estado de los alumnos matriculados."
      nombreEntidad="Discente"
      campoId="id_discente"
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

export default DiscentesPagina;

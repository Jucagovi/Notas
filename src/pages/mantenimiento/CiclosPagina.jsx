import React, { useMemo } from 'react';
import useCiclosContexto from '../../hooks/useCiclosContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';

// Componente de página para el mantenimiento de la tabla Ciclos
const CiclosPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useCiclosContexto();

  // Definición de las columnas y campos de la entidad Ciclos
  const columnas = useMemo(() => [
    {
      campo: 'siglas',
      encabezado: 'Siglas',
      tipo: 'texto',
      requerido: true,
      ancho: '120px',
      placeholder: 'Ej. DAW, DAM, ASIR'
    },
    {
      campo: 'nombre',
      encabezado: 'Nombre del Ciclo',
      tipo: 'texto',
      requerido: true,
      placeholder: 'Ej. Desarrollo de Aplicaciones Web'
    },
    {
      campo: 'descripcion',
      encabezado: 'Descripción',
      tipo: 'textarea',
      requerido: false,
      placeholder: 'Descripción o detalles del ciclo formativo'
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
      titulo="Mantenimiento de Ciclos Formativos"
      descripcion="Gestión integral de ciclos formativos de grado superior y medio."
      nombreEntidad="Ciclo Formativo"
      campoId="id_ciclo"
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

export default CiclosPagina;

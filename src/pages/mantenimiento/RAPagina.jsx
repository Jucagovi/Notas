import React, { useMemo } from 'react';
import useRAContexto from '../../hooks/useRAContexto.js';
import useModulosContexto from '../../hooks/useModulosContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';

// Componente de página para el mantenimiento de la tabla RA (Resultados de Aprendizaje)
const RAPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useRAContexto();
  const { datos: modulos } = useModulosContexto();

  // Opciones de módulos para desplegable
  const opcionesModulos = useMemo(() => {
    return (modulos || []).map((m) => ({
      label: `${m.siglas ? `[${m.siglas}] ` : ''}${m.nombre}`,
      value: m.id_modulo
    }));
  }, [modulos]);

  // Definición de las columnas y campos de la entidad RA
  const columnas = useMemo(() => [
    {
      campo: 'numero',
      encabezado: 'Nº RA',
      tipo: 'numero',
      requerido: true,
      ancho: '90px',
      min: 1,
      placeholder: '1, 2...'
    },
    {
      campo: 'nombre',
      encabezado: 'Resultado de Aprendizaje',
      tipo: 'texto',
      requerido: true,
      placeholder: 'Ej. Desarrolla aplicaciones web cliente interactivas'
    },
    {
      campo: 'id_modulo',
      encabezado: 'Módulo Asociado',
      tipo: 'seleccion',
      opciones: opcionesModulos,
      requerido: false,
      placeholder: 'Seleccionar módulo',
      ancho: '220px'
    },
    {
      campo: 'descripcion',
      encabezado: 'Descripción',
      tipo: 'textarea',
      requerido: false,
      placeholder: 'Detalle o desglose del resultado de aprendizaje'
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
      titulo="Mantenimiento de RA (Resultados de Aprendizaje)"
      descripcion="Definición y mantenimiento de los resultados de aprendizaje por módulo formativo."
      nombreEntidad="Resultado de Aprendizaje (RA)"
      campoId="id_ra"
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

export default RAPagina;

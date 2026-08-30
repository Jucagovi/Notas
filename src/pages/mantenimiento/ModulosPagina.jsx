import React, { useMemo } from 'react';
import useModulosContexto from '../../hooks/useModulosContexto.js';
import useCiclosContexto from '../../hooks/useCiclosContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';

// Componente de página para el mantenimiento de la tabla Módulos profesionales
const ModulosPagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useModulosContexto();
  const { datos: ciclos } = useCiclosContexto();

  // Se transforman los ciclos en opciones para el desplegable de clave foránea en el formulario
  const opcionesCiclos = useMemo(() => {
    return (ciclos || []).map((c) => ({
      label: `${c.siglas ? `[${c.siglas}] ` : ''}${c.nombre}`,
      value: c.id_ciclo
    }));
  }, [ciclos]);

  // Definición de las columnas y campos de la entidad Módulos
  const columnas = useMemo(() => [
    {
      campo: 'siglas',
      encabezado: 'Siglas',
      tipo: 'texto',
      requerido: true,
      ancho: '120px',
      placeholder: 'Ej. DWEC, DWES, DIW'
    },
    {
      campo: 'nombre',
      encabezado: 'Nombre del Módulo',
      tipo: 'texto',
      requerido: true,
      placeholder: 'Ej. Desarrollo Web en Entorno Cliente'
    },
    {
      campo: 'id_ciclo',
      encabezado: 'Ciclo Formativo',
      tipo: 'seleccion',
      opciones: opcionesCiclos,
      renderizar: (rowData) => {
        const ciclo = (ciclos || []).find((c) => c.id_ciclo === rowData.id_ciclo);
        return ciclo?.siglas || '-';
      },
      requerido: false,
      placeholder: 'Seleccionar ciclo formativo',
      ancho: '140px'
    },
    {
      campo: 'descripcion',
      encabezado: 'Descripción',
      tipo: 'textarea',
      requerido: false,
      placeholder: 'Contenidos y objetivos del módulo'
    }
  ], [opcionesCiclos, ciclos]);

  return (
    <TablaMantenimiento
      titulo="Mantenimiento de Módulos Profesionales"
      descripcion="Gestión de asignaturas y materias impartidas asociadas a ciclos formativos."
      nombreEntidad="Módulo Profesional"
      campoId="id_modulo"
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

export default ModulosPagina;


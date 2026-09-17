import React, { useMemo } from 'react';
import useImparteContexto from '../../hooks/useImparteContexto.js';
import useCursosContexto from '../../hooks/useCursosContexto.js';
import useModulosContexto from '../../hooks/useModulosContexto.js';
import useDiscentesContexto from '../../hooks/useDiscentesContexto.js';
import TablaMantenimiento from '../../components/mantenimiento/TablaMantenimiento.jsx';

// Componente de página para el mantenimiento de la tabla imparte (matrículas y docencia)
const ImpartePagina = () => {
  const { datos, cargando, crear, modificar, eliminar, recargar } = useImparteContexto();
  const { datos: cursos } = useCursosContexto();
  const { datos: modulos } = useModulosContexto();
  const { datos: discentes } = useDiscentesContexto();

  // Opciones de cursos académicos para el selector
  const opcionesCursos = useMemo(() => {
    return (cursos || []).map((c) => ({
      label: `${c.nombre} (${c.anyo || c.centro || ''})`,
      value: c.id_curso
    }));
  }, [cursos]);

  // Opciones de módulos profesionales para el selector (únicamente nombre, sin siglas)
  const opcionesModulos = useMemo(() => {
    return (modulos || []).map((m) => ({
      label: m.nombre || 'Módulo sin nombre',
      value: m.id_modulo
    }));
  }, [modulos]);

  // Opciones de discentes ordenados por apellidos mostrando únicamente nombre y apellidos (sin NIA)
  const opcionesDiscentes = useMemo(() => {
    return [...(discentes || [])]
      .sort((a, b) => (a.apellidos || '').localeCompare(b.apellidos || ''))
      .map((d) => ({
        label: `${d.nombre || ''} ${d.apellidos || ''}`.trim() || 'Discente sin nombre',
        value: d.id_discente
      }));
  }, [discentes]);

  // Definición de las columnas y campos de la tabla imparte
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
      campo: 'id_modulo',
      encabezado: 'Módulo Profesional',
      tipo: 'seleccion',
      opciones: opcionesModulos,
      requerido: true,
      ancho: '260px',
      placeholder: 'Seleccione un módulo'
    },
    {
      campo: 'id_discente',
      encabezado: 'Discente Matriculado',
      tipo: 'seleccion',
      opciones: opcionesDiscentes,
      requerido: true,
      ancho: '260px',
      placeholder: 'Seleccione un discente'
    },
    {
      campo: 'notas',
      encabezado: 'Observaciones / Notas',
      tipo: 'texto',
      requerido: false,
      ancho: '260px',
      placeholder: 'Observaciones de matrícula o docencia'
    },
    {
      campo: 'created_at',
      encabezado: 'Fecha Creación',
      tipo: 'fecha',
      soloLectura: true,
      mostrarEnFormulario: false,
      ancho: '140px'
    }
  ], [opcionesCursos, opcionesModulos, opcionesDiscentes]);

  return (
    <TablaMantenimiento
      titulo="Mantenimiento de Imparte (Matrículas y Docencia)"
      descripcion="Gestión de vinculaciones de discentes con los cursos y módulos en los que se encuentran matriculados."
      nombreEntidad="Asignación (Imparte)"
      campoId="id_imparte"
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

export default ImpartePagina;

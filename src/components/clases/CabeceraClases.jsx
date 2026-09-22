import React from 'react';
import HeaderPagina from '../common/HeaderPagina.jsx';

// Títulos y subtítulos específicos según la sección activa seleccionada en el menú lateral.
const DESCRIPCIONES_SECCIONES = {
  crear: {
    titulo: 'Crear Clase',
    descripcion: 'Asistente interactivo por pasos para configurar cursos, módulos, evaluaciones y matrículas.'
  },
  modificar: {
    titulo: 'Modificar Clase',
    descripcion: 'Gestión de matriculaciones para incorporar o dar de baja discentes de una clase.'
  },
  eliminar: {
    titulo: 'Eliminar Clase',
    descripcion: 'Eliminación en cascada y purga segura de cursos y sus dependencias curriculares.'
  }
};

// Componente presentacional para la cabecera informativa de la página de Clases.
const CabeceraClases = ({ pestanyaActiva = 'crear' }) => {
  const seccion = DESCRIPCIONES_SECCIONES[pestanyaActiva] || DESCRIPCIONES_SECCIONES.crear;

  return (
    <HeaderPagina
      titulo={
        <span className="flex align-items-center gap-2">
          <i className="pi pi-building text-primary text-3xl" />
          {seccion.titulo}
        </span>
      }
      descripcion={seccion.descripcion}
      className="mb-4"
    />
  );
};

export default CabeceraClases;

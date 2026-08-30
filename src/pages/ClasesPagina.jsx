import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Divider } from 'primereact/divider';
import CrearClaseAsistente from '../components/clases/CrearClaseAsistente.jsx';
import ModificarClase from '../components/clases/ModificarClase.jsx';
import EliminarClase from '../components/clases/EliminarClase.jsx';

// Página principal para la gestión de Clases con renderizado directo según el submenú seleccionado
const ClasesPagina = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pestanyaParam = searchParams.get('pestanya') || searchParams.get('tab') || 'crear';

  const [claveRecarga, setClaveRecarga] = useState(0);

  // Se fuerza la recarga de datos al realizar cambios
  const manejarActualizacionGlobal = () => {
    setClaveRecarga((prev) => prev + 1);
  };

  // Se determina el componente a renderizar según la opción del submenú
  const renderizarContenido = () => {
    switch (pestanyaParam) {
      case 'modificar':
        return <ModificarClase key={`modificar-${claveRecarga}`} />;
      case 'eliminar':
        return (
          <EliminarClase
            key={`eliminar-${claveRecarga}`}
            alEliminarExito={manejarActualizacionGlobal}
          />
        );
      case 'crear':
      default:
        return (
          <CrearClaseAsistente
            key={`crear-${claveRecarga}`}
            alFinalizarExito={() => {
              manejarActualizacionGlobal();
              setSearchParams({ pestanya: 'modificar' });
            }}
          />
        );
    }
  };

  return (
    <div className="page-container">
      {/* Cabecera de la página */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="page-title m-0">Gestión de Clases y Cursos</h1>
          <p className="text-muted m-0 mt-1">
            Asistente de configuración de cursos, asignación de módulos, matriculación de discentes y auto-generación de evaluaciones.
          </p>
        </div>
      </div>

      <Divider />

      {/* Contenido dinámico según el submenú activo */}
      <div className="page-content">
        {renderizarContenido()}
      </div>
    </div>
  );
};

export default ClasesPagina;

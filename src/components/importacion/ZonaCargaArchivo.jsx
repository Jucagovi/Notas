import React, { useRef } from 'react';
import { FileUpload } from 'primereact/fileupload';

// Componente presentacional con el componente FileUpload avanzado de PrimeReact para arrastrar y cargar archivos CSV.
const ZonaCargaArchivo = ({ onArchivoSeleccionado, deshabilitado = false }) => {
  const uploadRef = useRef(null);

  // Maneja la selección del archivo CSV e invoca el procesador correspondiente
  const manejarSeleccion = (evento) => {
    const archivos = evento.files;
    if (archivos && archivos.length > 0) {
      onArchivoSeleccionado(archivos[0]);
    }
  };

  // Plantilla visual vacía mostrada dentro del área de carga
  const plantillaVacia = () => {
    return (
      <div className="flex flex-column align-items-center justify-content-center p-4 text-center">
        <i className="pi pi-file-excel text-4xl text-primary mb-3" />
        <p className="m-0 text-700 font-medium">
          Arrastra y suelta tu archivo CSV aquí o pulsa en <strong>Elegir archivo</strong>.
        </p>
        <span className="text-xs text-500 mt-2">
          Solo se admiten archivos delimitados por comas o punto y coma (.csv) codificados en UTF-8.
        </span>
      </div>
    );
  };

  return (
    <div className="w-full">
      <FileUpload
        ref={uploadRef}
        name="archivoCsv"
        mode="advanced"
        accept=".csv,text/csv"
        maxFileSize={10000000}
        customUpload
        auto={false}
        chooseLabel="Elegir archivo CSV"
        uploadLabel="Procesar"
        cancelLabel="Cancelar"
        onSelect={manejarSeleccion}
        uploadHandler={manejarSeleccion}
        emptyTemplate={plantillaVacia}
        disabled={deshabilitado}
        className="w-full"
      />
    </div>
  );
};

export default ZonaCargaArchivo;

import React, { useState } from 'react';
import HeaderPagina from '../components/common/HeaderPagina.jsx';
import SelectorTablaImportacion from '../components/importacion/SelectorTablaImportacion.jsx';
import ZonaCargaArchivo from '../components/importacion/ZonaCargaArchivo.jsx';
import ZonaPegadoTexto from '../components/importacion/ZonaPegadoTexto.jsx';
import TablaVistaPrevia from '../components/importacion/TablaVistaPrevia.jsx';
import ResumenValidacion from '../components/importacion/ResumenValidacion.jsx';
import useImportacionCSV from '../hooks/useImportacionCSV.js';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';

// Página orquestadora para la importación masiva de datos mediante archivos CSV o texto tabulado.
const ImportacionPagina = () => {
  const [indicePestanya, setIndicePestanya] = useState(0);

  // Se extraen el estado y las operaciones del hook especializado de importación.
  const {
    tablaSeleccionada,
    configTablaActual,
    tablasDisponibles,
    cambiarTabla,
    filasProcesadas,
    resumen,
    cargando,
    procesarArchivoCSV,
    procesarTextoPegado,
    descargarPlantilla,
    limpiarDatos,
    ejecutarImportacion
  } = useImportacionCSV();

  return (
    <div className="flex flex-column w-full gap-4">
      {/* Cabecera descriptiva de la página de importación masiva */}
      <HeaderPagina
        titulo="Importación Masiva de Datos"
        descripcion="Carga registros en las tablas maestras del sistema mediante archivos CSV o pegado directo desde hojas de cálculo."
      />

      {/* Selector de tabla destino y descarga de plantilla */}
      <Card className="shadow-1">
        <SelectorTablaImportacion
          tablaSeleccionada={tablaSeleccionada}
          tablasDisponibles={tablasDisponibles}
          onCambiarTabla={cambiarTabla}
          onDescargarPlantilla={descargarPlantilla}
          deshabilitado={cargando}
        />
      </Card>

      {/* Zona de carga: archivo CSV o pegado manual de texto */}
      <Card className="shadow-1">
        <TabView activeIndex={indicePestanya} onTabChange={(e) => setIndicePestanya(e.index)}>
          <TabPanel header="Subir Archivo CSV" leftIcon="pi pi-upload mr-2">
            <ZonaCargaArchivo
              onArchivoSeleccionado={procesarArchivoCSV}
              deshabilitado={cargando}
            />
          </TabPanel>
          <TabPanel header="Copiar y Pegar Texto" leftIcon="pi pi-file-edit mr-2">
            <ZonaPegadoTexto
              onProcesarTexto={procesarTextoPegado}
              deshabilitado={cargando}
            />
          </TabPanel>
        </TabView>
      </Card>

      {/* Resumen de validación y botón de inserción masiva */}
      {filasProcesadas.length > 0 && (
        <ResumenValidacion
          resumen={resumen}
          cargando={cargando}
          onImportar={ejecutarImportacion}
          onLimpiar={limpiarDatos}
        />
      )}

      {/* Vista previa tabular con resaltado de celdas con errores */}
      {filasProcesadas.length > 0 && (
        <Card className="shadow-1">
          <TablaVistaPrevia
            filas={filasProcesadas}
            configTabla={configTablaActual}
            cargando={cargando}
          />
        </Card>
      )}
    </div>
  );
};

export default ImportacionPagina;

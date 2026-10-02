import React from 'react';
import { Message } from 'primereact/message';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

// Listado normativo de las cinco evaluaciones reglamentarias requeridas por el caso de uso.
const EVALUACIONES_ESTANDAR = [
  { orden: 1, nombre: 'Primera', descripcion: 'Primera Evaluación ordinaria / Primer Trimestre' },
  { orden: 2, nombre: 'Segunda', descripcion: 'Segunda Evaluación ordinaria / Segundo Trimestre' },
  { orden: 3, nombre: 'Tercera', descripcion: 'Tercera Evaluación ordinaria / Tercer Trimestre' },
  { orden: 4, nombre: 'Final', descripcion: 'Evaluación Final de la convocatoria ordinaria' },
  { orden: 5, nombre: 'Extraordinaria', descripcion: 'Convocatoria de evaluación extraordinaria' }
];

// Paso 4: Presentación y preparación de las evaluaciones automáticas para la clase y módulos.
const PasoEvaluaciones = ({
  claseNombre,
  cursoNombre,
  moduloNombre,
  esFlexibilizado = false,
  moduloFlexibleNombre = null
}) => {
  const nombreClaseActiva = claseNombre || cursoNombre || 'seleccionada';

  const textoInformativo = esFlexibilizado && moduloFlexibleNombre
    ? `Al confirmar el asistente, se generarán 10 registros independientes en la tabla Evaluaciones (5 registros para el módulo principal "${moduloNombre || 'seleccionado'}" y otros 5 registros independientes para el módulo flexibilizado "${moduloFlexibleNombre}").`
    : `Al confirmar el asistente, se generarán silenciosamente 5 registros en la tabla Evaluaciones vinculados a la clase "${nombreClaseActiva}" y módulo "${moduloNombre || 'seleccionado'}".`;

  return (
    <div className="flex flex-column gap-3 py-2">
      <div>
        <h3 className="m-0 text-xl font-bold text-800">Auto-Generación de Evaluaciones</h3>
        <p className="text-secondary text-sm m-0 mt-1">
          {esFlexibilizado
            ? 'El sistema prepara evaluaciones reglamentarias independientes para ambos módulos flexibilizados.'
            : 'El sistema prepara automáticamente los registros normativos de evaluación para el módulo seleccionado.'}
        </p>
      </div>

      <Message
        severity="info"
        text={textoInformativo}
        className="w-full justify-content-start"
      />

      <div className="surface-border border-1 border-round overflow-hidden mt-1">
        <DataTable
          value={EVALUACIONES_ESTANDAR}
          responsiveLayout="scroll"
          className="p-datatable-sm"
        >
          <Column
            field="orden"
            header="#"
            style={{ width: '4rem', textAlign: 'center' }}
            body={(fila) => <span className="font-bold text-secondary">{fila.orden}</span>}
          />
          <Column
            field="nombre"
            header="Nombre de Evaluación"
            style={{ width: '14rem' }}
            body={(fila) => (
              <span className="font-semibold text-900 flex align-items-center gap-2">
                <i className="pi pi-calendar-plus text-primary" />
                {fila.nombre}
              </span>
            )}
          />
          <Column
            field="descripcion"
            header="Descripción Normativa"
            body={(fila) => <span className="text-700 text-sm">{fila.descripcion}</span>}
          />
          <Column
            header="Estado"
            style={{ width: '10rem', textAlign: 'center' }}
            body={() => <Tag value="Preparada" severity="success" icon="pi pi-check" />}
          />
        </DataTable>
      </div>
    </div>
  );
};

export default PasoEvaluaciones;

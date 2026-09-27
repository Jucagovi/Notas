import React, { useState, useMemo } from 'react';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import TablaBase from '../common/TablaBase.jsx';
import { getColorNota } from '../../utils/coloresNota.js';

/**
 * TablaCalificaciones - Componente presentacional para la entrada de notas en formato tabular.
 *
 * Responsabilidad Única: Renderizar el listado de alumnos de la clase con soporte de edición
 * de celda (Cell Editing) para la columna Nota, validación de rango (0-100), formato cromático
 * mediante getColorNota y guardado automático sin botón general.
 *
 * @param {Object} props
 * @param {Array<Object>} props.discentes - Lista de discentes con calificaciones asociadas.
 * @param {boolean} props.cargando - Indicador de estado de carga.
 * @param {boolean} props.guardando - Indicador de estado de persistencia.
 * @param {Function} props.onGuardarNota - Función para persistir la calificación del discente.
 * @param {Function} props.onError - Callback para reportar errores de validación a nivel superior.
 */
const TablaCalificaciones = ({
  discentes = [],
  cargando = false,
  guardando = false,
  onGuardarNota,
  onError
}) => {
  // Estado local para búsqueda textual en la tabla de discentes
  const [filtroTexto, setFiltroTexto] = useState('');

  // Filtrado de alumnos por nombre, apellidos o NIA
  const discentesFiltrados = useMemo(() => {
    if (!filtroTexto.trim()) return discentes;
    const termino = filtroTexto.toLowerCase().trim();
    return discentes.filter((d) => {
      const nombreCompleto = `${d.nombre || ''} ${d.apellidos || ''}`.toLowerCase();
      const nia = (d.NIA || '').toLowerCase();
      return nombreCompleto.includes(termino) || nia.includes(termino);
    });
  }, [discentes, filtroTexto]);

  // Plantilla visual para la columna de apellidos con truncado y tooltip si desborda
  const plantillaApellidos = (fila) => {
    return (
      <span
        className="white-space-nowrap overflow-hidden text-overflow-ellipsis block font-semibold text-900"
        data-pr-tooltip={fila.apellidos}
      >
        {fila.apellidos}
      </span>
    );
  };

  // Plantilla visual para la columna de nombre con truncado y tooltip si desborda
  const plantillaNombre = (fila) => {
    return (
      <span
        className="white-space-nowrap overflow-hidden text-overflow-ellipsis block text-800"
        data-pr-tooltip={fila.nombre}
      >
        {fila.nombre}
      </span>
    );
  };

  // Plantilla visual para la columna de calificación (modo lectura)
  const plantillaNota = (fila) => {
    const tieneNota =
      fila.nota !== null &&
      fila.nota !== undefined &&
      fila.nota !== '' &&
      !isNaN(Number(fila.nota));

    if (!tieneNota) {
      return (
        <div className="flex align-items-center justify-content-center">
          <span
            className="font-bold text-base text-color-secondary border-round px-3 py-1 surface-100 hover:surface-200 transition-colors cursor-pointer select-none"
            data-pr-tooltip="Pendiente de calificar. Haz clic para asignar una nota."
          >
            ?
          </span>
        </div>
      );
    }

    const { clase, etiqueta } = getColorNota(fila.nota);

    return (
      <div className="flex align-items-center justify-content-center">
        <span
          className={`font-bold text-base border-round px-3 py-1 surface-100 hover:surface-200 transition-colors cursor-pointer select-none ${clase}`}
          data-pr-tooltip={`Calificación: ${fila.nota} (${etiqueta}). Haz clic para editar.`}
        >
          {fila.nota}
        </span>
      </div>
    );
  };

  // Editor numérico para la columna Nota (Cell Editing)
  const editorNota = (opciones) => {
    const valor = opciones.value;
    const esInvalido =
      valor !== null &&
      valor !== undefined &&
      valor !== '' &&
      (isNaN(Number(valor)) || Number(valor) < 0 || Number(valor) > 100);

    return (
      <div className="flex justify-content-center w-full">
        <InputNumber
          value={valor}
          onValueChange={(e) => opciones.editorCallback(e.value)}
          min={0}
          max={100}
          step={1}
          showButtons={false}
          className={`w-full max-w-7rem ${esInvalido ? 'p-invalid' : ''}`}
          inputClassName="text-center font-bold text-base"
          autoFocus
          placeholder="?"
        />
      </div>
    );
  };

  // Manejador del cierre de edición o evento onBlur de la celda
  const alCompletarEdicionCelda = async (e) => {
    const { rowData, newValue, field, originalEvent } = e;

    // Si el valor numérico no ha cambiado, no se dispara acción alguna
    if (rowData[field] === newValue) {
      return;
    }

    // Validación: la nota debe ser un número entero estricto entre 0 y 100
    if (newValue !== null && newValue !== undefined && String(newValue).trim() !== '') {
      const valorNumerico = Number(newValue);
      if (isNaN(valorNumerico) || valorNumerico < 0 || valorNumerico > 100) {
        if (originalEvent) {
          originalEvent.preventDefault();
        }
        if (onError) {
          onError('La calificación debe estar comprendida estrictamente entre 0 y 100.');
        }
        return;
      }
    }

    // Se delega el guardado automático en el orquestador
    await onGuardarNota(rowData.id_discente, newValue);
  };

  // Cabecera superior con barra de búsqueda y nota de ayuda
  const cabeceraTabla = (
    <div className="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3 py-1">
      <div className="flex align-items-center gap-2">
        <span className="p-input-icon-left w-full sm:w-20rem">
          <i className="pi pi-search" />
          <InputText
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            placeholder="Buscar por discente..."
            className="w-full p-inputtext-sm"
          />
        </span>
        {filtroTexto && (
          <Button
            icon="pi pi-times"
            rounded
            text
            severity="secondary"
            onClick={() => setFiltroTexto('')}
            tooltip="Limpiar filtro"
            tooltipOptions={{ position: 'top' }}
          />
        )}
      </div>

      <div className="flex align-items-center gap-2 text-xs text-color-secondary">
        <i className="pi pi-info-circle text-primary" />
        <span>
          Haz clic en cualquier celda de <strong>Nota</strong> para calificar. El guardado es automático al cambiar el foco.
        </span>
        {guardando && (
          <span className="text-primary font-bold flex align-items-center gap-1 ml-2">
            <i className="pi pi-spin pi-spinner text-xs" />
            Guardando...
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="surface-card p-3 border-round shadow-1">
      <Tooltip target="[data-pr-tooltip]" />

      <TablaBase
        value={discentesFiltrados}
        loading={cargando}
        header={cabeceraTabla}
        editMode="cell"
        paginator={discentesFiltrados.length > 5}
        paginatorPosition="top"
        rows={10}
        rowsPerPageOptions={[5, 10, 15, 20, 25]}
        emptyMessage={
          filtroTexto
            ? 'No se encontraron discentes con el criterio de búsqueda.'
            : 'No hay discentes matriculados en esta clase.'
        }
        className="p-datatable-sm w-full"
      >
        <Column
          field="apellidos"
          header="Apellidos"
          body={plantillaApellidos}
          sortable
          style={{ minWidth: '220px' }}
        />
        <Column
          field="nombre"
          header="Nombre"
          body={plantillaNombre}
          sortable
          style={{ minWidth: '180px' }}
        />
        <Column
          field="nota"
          header="Nota"
          body={plantillaNota}
          editor={editorNota}
          onCellEditComplete={alCompletarEdicionCelda}
          sortable
          style={{ width: '130px', textAlign: 'center' }}
          bodyClassName="text-center"
        />
      </TablaBase>
    </div>
  );
};

export default TablaCalificaciones;

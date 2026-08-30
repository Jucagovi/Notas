import React, { useState, useEffect, useMemo } from "react";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Badge } from "primereact/badge";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Skeleton } from "primereact/skeleton";
import { Message } from "primereact/message";
import { ProgressBar } from "primereact/progressbar";
import { Divider } from "primereact/divider";
import useDashboard from "../hooks/useDashboard.js";
import { getColorNota } from "../utils/coloresNota.js";
import { formatNota } from "../utils/formatters.js";
import InformePendientesTarjetaDashboard from "./informes/InformePendientesTarjetaDashboard.jsx";

// Componente principal de la pantalla de Dashboard
const Dashboard = () => {
  const { estadisticas, cargando, error, origenDatos, recargarEstadisticas } =
    useDashboard();

  // Estado reactivo para adaptar la paleta de colores de los gráficos al tema Nano claro/oscuro
  const [temaGraficos, setTemaGraficos] = useState(() => ({
    textColor: "#343a3f",
    textColorSecondary: "#697077",
    surfaceBorder: "#dee2e6",
    surfaceGrid: "rgba(0, 0, 0, 0.06)",
  }));

  // Sincronización de colores cuando el usuario alterna el modo oscuro en la aplicación
  useEffect(() => {
    const actualizarColoresTema = () => {
      const estiloComputado = getComputedStyle(document.documentElement);
      const esOscuro =
        document.documentElement.classList.contains("dark-theme") ||
        document.documentElement.getAttribute("data-theme") === "dark";

      setTemaGraficos({
        textColor: esOscuro
          ? "#f1f5f9"
          : estiloComputado.getPropertyValue("--text-color").trim() ||
            "#343a3f",
        textColorSecondary: esOscuro
          ? "#94a3b8"
          : estiloComputado.getPropertyValue("--text-muted").trim() ||
            "#697077",
        surfaceBorder: esOscuro
          ? "#334155"
          : estiloComputado.getPropertyValue("--border-color").trim() ||
            "#dee2e6",
        surfaceGrid: esOscuro
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(0, 0, 0, 0.06)",
      });
    };

    actualizarColoresTema();

    const observador = new MutationObserver(() => {
      actualizarColoresTema();
    });

    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observador.disconnect();
  }, []);

  // Configuración de datos para el Gráfico de Barras: Nota media por asignatura
  const datosGraficoBarras = useMemo(() => {
    const modulos = estadisticas.mediasPorModulo || [];
    return {
      labels: modulos.map((m) => m.siglas || m.nombre),
      datasets: [
        {
          label: "Nota Media",
          backgroundColor: modulos.map((m) => getColorNota(m.media).hex),
          borderColor: modulos.map((m) => getColorNota(m.media).hex),
          borderWidth: 1,
          borderRadius: 6,
          data: modulos.map((m) => m.media),
        },
      ],
    };
  }, [estadisticas.mediasPorModulo]);

  // Opciones de renderizado y escalas del Gráfico de Barras
  const opcionesGraficoBarras = useMemo(() => {
    return {
      maintainAspectRatio: false,
      aspectRatio: 1.4,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleFont: { weight: "bold" },
          callbacks: {
            label: (context) => {
              const indice = context.dataIndex;
              const modulo = (estadisticas.mediasPorModulo || [])[indice];
              const nombreModulo = modulo?.nombre ? ` (${modulo.nombre})` : "";
              return ` Media: ${formatNota(context.raw)} / 100${nombreModulo}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: temaGraficos.textColorSecondary,
            font: { weight: "600", size: 12 },
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        y: {
          min: 0,
          max: 100,
          ticks: {
            color: temaGraficos.textColorSecondary,
            stepSize: 20,
          },
          grid: {
            color: temaGraficos.surfaceGrid,
            drawBorder: false,
          },
        },
      },
    };
  }, [temaGraficos, estadisticas.mediasPorModulo]);

  // Configuración de datos para el Gráfico Doughnut: Distribución de calificaciones
  const datosGraficoDoughnut = useMemo(() => {
    const dist = estadisticas.distribucion || {
      suspensos: 0,
      aprobados: 0,
      notables: 0,
      sobresalientes: 0,
    };
    return {
      labels: [
        "Suspensos (0-49)",
        "Aprobados (50-69)",
        "Notables (70-89)",
        "Sobresalientes (90-100)",
      ],
      datasets: [
        {
          data: [
            dist.suspensos,
            dist.aprobados,
            dist.notables,
            dist.sobresalientes,
          ],
          backgroundColor: [
            getColorNota(0).hex,
            getColorNota(55).hex,
            getColorNota(75).hex,
            getColorNota(95).hex,
          ],
          hoverBackgroundColor: [
            getColorNota(0).hex,
            getColorNota(55).hex,
            getColorNota(75).hex,
            getColorNota(95).hex,
          ],
          borderWidth: 2,
          borderColor: temaGraficos.surfaceBorder,
        },
      ],
    };
  }, [estadisticas.distribucion, temaGraficos.surfaceBorder]);

  // Opciones de renderizado y leyenda del Gráfico Doughnut
  const opcionesGraficoDoughnut = useMemo(() => {
    return {
      maintainAspectRatio: false,
      aspectRatio: 1.4,
      cutout: "62%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: temaGraficos.textColor,
            usePointStyle: true,
            padding: 16,
            font: { size: 12, weight: "500" },
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const valor = context.raw;
              const porcentaje =
                total > 0 ? ((valor / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${valor} (${porcentaje}%)`;
            },
          },
        },
      },
    };
  }, [temaGraficos]);

  // Plantillas de visualización personalizadas para el DataTable de Alumnos en Riesgo
  const plantillaAlumno = (fila) => (
    <div className='flex align-items-center gap-3'>
      <Avatar
        image={fila.imagen || undefined}
        icon={!fila.imagen ? "pi pi-user" : undefined}
        shape='circle'
        size='large'
        className='flex-shrink-0'
        style={{
          backgroundColor: "var(--primary-light)",
          color: "var(--primary-color)",
          fontWeight: "bold",
        }}
      />
      <div className='flex flex-column'>
        <span className='font-bold text-color'>{fila.nombreCompleto}</span>
        <span className='text-xs text-muted'>{fila.correo}</span>
      </div>
    </div>
  );

  const plantillaNia = (fila) => (
    <span className='font-mono text-sm font-semibold text-color-secondary'>
      {fila.nia}
    </span>
  );

  const plantillaSuspensos = (fila) => {
    const severidad = fila.suspensos >= 2 ? "danger" : "warning";
    const texto = `${fila.suspensos} ${fila.suspensos === 1 ? "módulo" : "módulos"}`;
    return <Tag value={texto} severity={severidad} icon='pi pi-book' />;
  };

  const plantillaMedia = (fila) => {
    const color = getColorNota(fila.media);
    return (
      <div className='flex align-items-center gap-2'>
        <span
          className={`font-bold ${color.text}`}
          style={{ color: color.hex }}
        >
          {formatNota(fila.media)}
        </span>
        <span className='text-xs text-muted'>/ 100</span>
      </div>
    );
  };

  const plantillaNivelRiesgo = (fila) => (
    <Tag
      value={fila.nivelRiesgo}
      severity={fila.severidadBadge}
      icon={
        fila.nivelRiesgo === "Crítico"
          ? "pi pi-exclamation-triangle"
          : "pi pi-exclamation-circle"
      }
    />
  );

  // Renderizado del estado de carga con Skeleton de PrimeReact
  if (cargando) {
    return (
      <div className='page-container p-3'>
        <div className='flex justify-content-between align-items-center mb-3'>
          <div>
            <Skeleton width='220px' height='2.2rem' className='mb-2' />
            <Skeleton width='340px' height='1.2rem' />
          </div>
          <Skeleton width='120px' height='2.5rem' />
        </div>
        <Divider />

        {/* Skeleton de tarjetas KPI */}
        <div className='grid'>
          <div className='col-12 md:col-4'>
            <Skeleton width='100%' height='130px' borderRadius='8px' />
          </div>
          <div className='col-12 md:col-4'>
            <Skeleton width='100%' height='130px' borderRadius='8px' />
          </div>
          <div className='col-12 md:col-4'>
            <Skeleton width='100%' height='130px' borderRadius='8px' />
          </div>
        </div>

        {/* Skeleton de gráficos */}
        <div className='grid mt-3'>
          <div className='col-12 md:col-6'>
            <Skeleton width='100%' height='340px' borderRadius='8px' />
          </div>
          <div className='col-12 md:col-6'>
            <Skeleton width='100%' height='340px' borderRadius='8px' />
          </div>
        </div>

        {/* Skeleton de tabla */}
        <div className='mt-4'>
          <Skeleton width='100%' height='220px' borderRadius='8px' />
        </div>
      </div>
    );
  }

  // Renderizado en caso de ausencia total de datos
  if (!estadisticas.tieneDatos) {
    return (
      <div className='page-container p-3'>
        <div className='flex justify-content-between align-items-center mb-3'>
          <h1 className='page-title m-0'>Panel de Control</h1>
          <Button
            label='Recargar'
            icon='pi pi-refresh'
            size='small'
            outlined
            onClick={recargarEstadisticas}
          />
        </div>
        <Divider />
        <Message
          severity='info'
          text='Aún no hay datos suficientes para mostrar estadísticas. Comienza añadiendo alumnos y calificaciones.'
          className='w-full mt-4'
        />
      </div>
    );
  }

  return (
    <div className='page-container p-2'>
      {/* 1. Cabecera principal con título y acciones */}
      <div className='flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-2'>
        <div>
          <h1 className='page-title m-0'>Panel de control</h1>
          <p className='text-muted m-0 mt-1'>
            Resumen estadístico del rendimiento académico, métricas globales y
            alertas de seguimiento.
          </p>
        </div>
        <div className='flex align-items-center gap-2'>
          {estadisticas.esMock && (
            <Tag
              value='Datos de Demostración'
              severity='info'
              icon='pi pi-info-circle'
            />
          )}
          {origenDatos === "supabase" && (
            <Tag
              value='Supabase Conectado'
              severity='success'
              icon='pi pi-check'
            />
          )}
          <Button
            type='button'
            icon='pi pi-refresh'
            label='Actualizar'
            size='small'
            outlined
            onClick={recargarEstadisticas}
            tooltip='Volver a consultar estadísticas'
            tooltipOptions={{ position: "bottom" }}
          />
        </div>
      </div>

      {error && (
        <Message
          severity='warn'
          text={`Aviso: ${error}. Se muestran datos simulados para no interrumpir la navegación.`}
          className='w-full mb-3'
        />
      )}

      <Divider />

      {/* 2. Grid superior con 3 Tarjetas (Cards): Total Alumnos, Nota Media Global y Tasa de Aprobados */}
      <div className='grid'>
        {/* Tarjeta 1: Total Alumnos */}
        <div className='col-12 md:col-4'>
          <Card className='h-full shadow-1 border-round surface-card'>
            <div className='flex justify-content-between align-items-start'>
              <div>
                <span className='block font-semibold mb-2 text-sm text-muted'>
                  TOTAL DISCENTES
                </span>
                <div className='font-bold text-3xl text-color'>
                  {estadisticas.totalAlumnos}
                </div>
                <div className='text-xs text-muted mt-2'>
                  <span className='text-green-500 font-bold'>100% </span>
                  matriculados y activos
                </div>
              </div>
              <div
                className='flex align-items-center justify-content-center border-round'
                style={{
                  width: "2.8rem",
                  height: "2.8rem",
                  backgroundColor: "var(--primary-light)",
                }}
              >
                <i className='pi pi-users text-xl text-primary font-bold'></i>
              </div>
            </div>
          </Card>
        </div>

        {/* Tarjeta 2: Nota Media Global */}
        <div className='col-12 md:col-4'>
          <Card className='h-full shadow-1 border-round surface-card'>
            <div className='flex justify-content-between align-items-start'>
              <div>
                <span className='block font-semibold mb-2 text-sm text-muted'>
                  NOTA MEDIA GLOBAL
                </span>
                <div className='font-bold text-3xl text-color flex align-items-baseline gap-2'>
                  {formatNota(estadisticas.notaMediaGlobal)}
                  <span className='text-sm font-normal text-muted'>
                    ({formatNota(estadisticas.notaMediaGlobal / 10)} / 10)
                  </span>
                </div>
                <div className='mt-2'>
                  <Tag
                    value={getColorNota(estadisticas.notaMediaGlobal).label}
                    className={`${getColorNota(estadisticas.notaMediaGlobal).bg} ${getColorNota(estadisticas.notaMediaGlobal).text}`}
                  />
                </div>
              </div>
              <div
                className='flex align-items-center justify-content-center border-round'
                style={{
                  width: "2.8rem",
                  height: "2.8rem",
                  backgroundColor: "rgba(59, 130, 246, 0.15)",
                }}
              >
                <i className='pi pi-chart-line text-xl text-blue-500 font-bold'></i>
              </div>
            </div>
          </Card>
        </div>

        {/* Tarjeta 3: Tasa de Aprobados */}
        <div className='col-12 md:col-4'>
          <Card className='h-full shadow-1 border-round surface-card'>
            <div className='flex justify-content-between align-items-start'>
              <div className='w-full mr-2'>
                <span className='block font-semibold mb-2 text-sm text-muted'>
                  TASA DE APROBADOS
                </span>
                <div className='font-bold text-3xl text-green-600 mb-2'>
                  {estadisticas.tasaAprobados.toLocaleString("es-ES", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 2,
                  })}
                  %
                </div>
                <ProgressBar
                  value={estadisticas.tasaAprobados}
                  showValue={false}
                  style={{ height: "7px" }}
                  color={
                    estadisticas.tasaAprobados >= 70 ? "#10b981" : "#f59e0b"
                  }
                />
                <div className='text-xs text-muted mt-2'>
                  {estadisticas.distribucion.aprobados +
                    estadisticas.distribucion.notables +
                    estadisticas.distribucion.sobresalientes}{" "}
                  de {estadisticas.totalCalificaciones} calificaciones superadas
                </div>
              </div>
              <div
                className='flex align-items-center justify-content-center border-round flex-shrink-0'
                style={{
                  width: "2.8rem",
                  height: "2.8rem",
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                }}
              >
                <i className='pi pi-check-circle text-xl text-green-500 font-bold'></i>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Grid central con dos gráficos (Chart): Barras y Doughnut */}
      <div className='grid mt-2'>
        {/* Gráfico de Barras: Nota media por asignatura */}
        <div className='col-12 lg:col-7'>
          <Card
            title='Nota media por asignatura'
            className='h-full shadow-1 border-round surface-card'
          >
            <div style={{ height: "320px" }}>
              <Chart
                type='bar'
                data={datosGraficoBarras}
                options={opcionesGraficoBarras}
                style={{ height: "100%" }}
              />
            </div>
          </Card>
        </div>

        {/* Gráfico Doughnut: Distribución de calificaciones */}
        <div className='col-12 lg:col-5'>
          <Card
            title='Distribución de calificaciones'
            className='h-full shadow-1 border-round surface-card'
          >
            <div style={{ height: "320px" }}>
              <Chart
                type='doughnut'
                data={datosGraficoDoughnut}
                options={opcionesGraficoDoughnut}
                style={{ height: "100%" }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Tarjeta de resumen de Calificaciones Pendientes */}
      <div className='mt-4'>
        <InformePendientesTarjetaDashboard />
      </div>

      {/* 5. Sección inferior con DataTable: Alumnos en Riesgo */}
      <div className='mt-2'>
        <Card
          title={
            <div className='flex align-items-center justify-content-between'>
              <div className='flex align-items-center gap-2'>
                <i className='pi pi-exclamation-triangle text-red-500 text-xl'></i>
                <span className='font-bold'>Discentes en riesgo</span>
              </div>
              <Badge
                value={estadisticas.alumnosEnRiesgo.length}
                severity={
                  estadisticas.alumnosEnRiesgo.length > 0 ? "danger" : "success"
                }
              />
            </div>
          }
          subTitle='Discentes con nota media global inferior a 50 o más de una asignatura suspensa.'
          className='shadow-1 border-round surface-card'
        >
          <DataTable
            value={estadisticas.alumnosEnRiesgo}
            responsiveLayout='scroll'
            emptyMessage='No se han detectado alumnos en situación de riesgo académico.'
            className='p-datatable-sm'
            stripedRows
          >
            <Column
              field='nombreCompleto'
              header='Alumno'
              body={plantillaAlumno}
              sortable
              style={{ minWidth: "220px" }}
            />
            <Column
              field='nia'
              header='NIA'
              body={plantillaNia}
              sortable
              style={{ minWidth: "130px" }}
            />
            <Column
              field='suspensos'
              header='Suspensos'
              body={plantillaSuspensos}
              sortable
              style={{ minWidth: "130px" }}
            />
            <Column
              field='media'
              header='Nota Media'
              body={plantillaMedia}
              sortable
              style={{ minWidth: "130px" }}
            />
            <Column
              field='nivelRiesgo'
              header='Nivel de Riesgo'
              body={plantillaNivelRiesgo}
              sortable
              style={{ minWidth: "150px" }}
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

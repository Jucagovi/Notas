import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import { getRadarCompetencias } from "../../services/informesService.js";
import { getColorNota } from "../../utils/coloresNota.js";
import { formatNota } from "../../utils/formatters.js";

// Se eliminan prefijos redundantes en la numeración del Resultado de Aprendizaje
const limpiarDescripcionRA = (texto) => {
  if (!texto) return "";
  return texto
    .replace(/^(RA|Resultado\s+de\s+Aprendizaje)\s*\d*[\s:.-]*/gi, "")
    .replace(/^[\s:.-]+/, "")
    .trim();
};

// Se divide un texto extenso en líneas para los tooltips respetando palabras completas
const dividirTextoEnLineas = (texto, maxLongitud = 46) => {
  if (!texto) return [];
  const palabras = texto.trim().split(/\s+/);
  const lineas = [];
  let lineaActual = "";

  palabras.forEach((palabra) => {
    if (
      (lineaActual ? `${lineaActual} ${palabra}` : palabra).length <=
      maxLongitud
    ) {
      lineaActual = lineaActual ? `${lineaActual} ${palabra}` : palabra;
    } else {
      if (lineaActual) lineas.push(lineaActual);
      lineaActual = palabra;
    }
  });

  if (lineaActual) lineas.push(lineaActual);
  return lineas;
};

// Componente para la representación gráfica del mapa de competencias en radar del módulo con acceso al informe completo
const DiscenteModuloRadar = ({
  discente = null,
  modulo = null,
  cursoId = null,
  todasPracticas = [],
}) => {
  const navigate = useNavigate();
  const chartRef = useRef(null);

  const [datosRadar, setDatosRadar] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Paleta de colores para el gráfico adaptativa a temas claro y oscuro
  const [temaGraficos, setTemaGraficos] = useState(() => ({
    textColor: "#343a3f",
    textColorSecondary: "#697077",
    surfaceBorder: "#dee2e6",
    surfaceGrid: "rgba(0, 0, 0, 0.08)",
  }));

  // Sincronización del tema gráfico con las mutaciones de estilo de la aplicación
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
          ? "rgba(255, 255, 255, 0.12)"
          : "rgba(0, 0, 0, 0.08)",
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

  // Clave reactiva para refrescar el radar cuando cambian las calificaciones de las prácticas
  const firmaPracticas = useMemo(() => {
    return (todasPracticas || [])
      .map((p) => `${p.id_practica}:${p.nota}`)
      .join("|");
  }, [todasPracticas]);

  // Se obtienen los datos del mapa competencial del alumno en este módulo
  useEffect(() => {
    let cancelado = false;

    const cargarRadar = async () => {
      if (!modulo?.id_modulo || !discente?.id_discente) {
        setDatosRadar(null);
        return;
      }

      setCargando(true);
      try {
        const resp = await getRadarCompetencias(
          modulo.id_modulo,
          discente.id_discente,
        );
        if (!cancelado) {
          if (resp.error) {
            console.error(
              "Error al consultar radar de competencias del módulo:",
              resp.error,
            );
            setDatosRadar(null);
          } else {
            setDatosRadar(resp.data);
          }
        }
      } catch (err) {
        if (!cancelado) {
          console.error("Error inesperado en consulta de radar:", err);
          setDatosRadar(null);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargarRadar();

    return () => {
      cancelado = true;
    };
  }, [modulo?.id_modulo, discente?.id_discente, firmaPracticas]);

  const listaRA = useMemo(() => {
    return datosRadar?.listaRA || [];
  }, [datosRadar]);

  const estadisticas = useMemo(() => {
    return (
      datosRadar?.estadisticas || {
        totalRA: 0,
        raEvaluados: 0,
        mediaGlobal: null,
      }
    );
  }, [datosRadar]);

  const tieneDatosValidos = useMemo(() => {
    return (listaRA || []).some(
      (ra) => ra.nota !== null && ra.nota !== undefined,
    );
  }, [listaRA]);

  // Se configuran los datos del gráfico Radar de PrimeReact
  const datosGraficoRadar = useMemo(() => {
    if (listaRA.length === 0) {
      return { labels: [], datasets: [] };
    }

    const etiquetas = listaRA.map((ra) => ra.codigo || `RA ${ra.numero || ""}`);
    const valoresNotas = listaRA.map((ra) =>
      ra.nota !== null && ra.nota !== undefined ? ra.nota : 0,
    );
    const coloresPuntos = listaRA.map((ra) => getColorNota(ra.nota).hex);

    return {
      labels: etiquetas,
      datasets: [
        {
          label: "Calificación ponderada (0 - 100)",
          data: valoresNotas,
          backgroundColor: "rgba(59, 130, 246, 0.22)",
          borderColor: "#3b82f6",
          pointBackgroundColor: coloresPuntos,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#3b82f6",
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 2,
        },
      ],
    };
  }, [listaRA]);

  // Opciones de visualización y escalas radiales del gráfico Radar
  const opcionesGraficoRadar = useMemo(() => {
    return {
      maintainAspectRatio: false,
      aspectRatio: 1.4,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: temaGraficos.textColor,
            font: { size: 12, weight: "600" },
          },
        },
        tooltip: {
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleFont: { weight: "bold", size: 13 },
          titleColor: "#ffffff",
          bodyFont: { size: 11 },
          bodyColor: "#f1f5f9",
          footerFont: { size: 10, weight: "normal" },
          footerColor: "#94a3b8",
          padding: 12,
          boxPadding: 4,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            title: (items) => {
              if (!items.length) return "";
              const idx = items[0].dataIndex;
              const ra = listaRA[idx];
              const nombreLimpio = limpiarDescripcionRA(ra?.nombre || "");
              return ra
                ? `${ra.codigo}${nombreLimpio ? `: ${nombreLimpio}` : ""}`
                : "";
            },
            beforeBody: (items) => {
              if (!items.length) return [];
              const idx = items[0].dataIndex;
              const ra = listaRA[idx];
              const descBruta =
                ra?.descripcion || ra?.textoCompleto || ra?.nombre || "";
              const descLimpia = limpiarDescripcionRA(descBruta);

              if (!descLimpia) {
                return [];
              }

              const lineasDesc = dividirTextoEnLineas(descLimpia, 46);
              return [...lineasDesc, ""];
            },
            label: (context) => {
              const valor = context.raw;
              const idx = context.dataIndex;
              const ra = listaRA[idx];
              if (ra && (ra.nota === null || ra.nota === undefined)) {
                return " Calificación: sin calificaciones registradas";
              }
              const infoColor = getColorNota(valor);
              return ` Calificación: ${formatNota(valor)} / 100 (${infoColor.label})`;
            },
            afterBody: (items) => {
              if (!items.length) return [];
              const idx = items[0].dataIndex;
              const ra = listaRA[idx];
              if (!ra) return [];
              return [
                ` Cobertura: ${ra.ceEvaluados || 0} de ${ra.totalCE || 0} Criterios (CE) evaluados`,
              ];
            },
          },
        },
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            color: temaGraficos.textColorSecondary,
            backdropColor: "transparent",
            showLabelBackdrop: false,
            font: { size: 10 },
          },
          grid: {
            color: temaGraficos.surfaceGrid,
          },
          angleLines: {
            color: temaGraficos.surfaceBorder,
          },
          pointLabels: {
            color: temaGraficos.textColor,
            font: { size: 11, weight: "600" },
          },
        },
      },
    };
  }, [temaGraficos, listaRA]);

  // Se navega al informe competencial individual detallado
  const irAInformeCompetencias = () => {
    navigate(
      `/informes/competencia?curso=${cursoId || ""}&modulo=${modulo?.id_modulo || ""}&discente=${discente?.id_discente || ""}`,
      {
        state: {
          idCurso: cursoId,
          idModulo: modulo?.id_modulo,
          idDiscente: discente?.id_discente,
        },
      },
    );
  };

  if (cargando && !datosRadar) {
    return (
      <Card className='shadow-1 surface-card border-round'>
        <div className='flex justify-content-between align-items-center mb-3'>
          <Skeleton width='220px' height='1.5rem' />
          <Skeleton width='120px' height='1.5rem' />
        </div>
        <Skeleton width='100%' height='300px' borderRadius='8px' />
      </Card>
    );
  }

  const tituloCabecera = (
    <div className='flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-2'>
      <div className='flex align-items-center gap-2'>
        <i className='pi pi-compass text-primary text-xl' />
        <div>
          <span className='text-base sm:text-lg font-bold text-color'>
            Mapa de competencias (Radar)
          </span>
          <span className='text-xs text-muted block mt-1 font-normal'>
            Ponderación del discente en los Resultados de Aprendizaje de{" "}
            {modulo?.siglas || modulo?.nombre || "este módulo"}
          </span>
        </div>
      </div>
      <div className='flex align-items-center gap-2'>
        <Tag
          value={`${estadisticas?.raEvaluados || 0} de ${listaRA.length} RAs evaluados`}
          severity={estadisticas?.raEvaluados > 0 ? "info" : "secondary"}
          className='text-xs'
        />
      </div>
    </div>
  );

  return (
    <Card
      title={tituloCabecera}
      className='shadow-1 surface-card border-round'
    >
      {listaRA.length === 0 ? (
        <div className='surface-50 p-4 border-round text-center mb-2'>
          <i className='pi pi-compass text-3xl text-400 mb-2 block' />
          <span className='text-sm font-semibold text-color block'>
            Sin Resultados de Aprendizaje configurados
          </span>
          <span className='text-xs text-muted block mt-1'>
            El módulo no dispone de Resultados de Aprendizaje registrados en el
            sistema.
          </span>
        </div>
      ) : !tieneDatosValidos ? (
        <div className='surface-50 p-4 border-round text-center mb-2'>
          <i className='pi pi-info-circle text-3xl text-400 mb-2 block' />
          <span className='text-sm font-semibold text-color block'>
            Sin calificaciones suficientes para generar el gráfico de radar
          </span>
          <span className='text-xs text-muted block mt-1'>
            El discente no cuenta con notas registradas en las prácticas
            vinculadas a los Resultados de Aprendizaje de este módulo.
          </span>
        </div>
      ) : (
        <>
          <div className='flex align-items-center justify-content-center gap-2 mb-2 p-2 border-round surface-50 text-xs text-muted'>
            <i className='pi pi-info-circle text-primary' />
            <span>
              Pase el cursor sobre los vértices del radar para consultar la
              descripción detallada, criterios y calificación de cada Resultado
              de Aprendizaje.
            </span>
          </div>

          <div
            className='w-full flex justify-content-center'
            style={{ minHeight: "360px", maxHeight: "420px" }}
          >
            <div
              className='w-full'
              style={{ maxWidth: "620px", height: "380px" }}
            >
              <Chart
                ref={chartRef}
                type='radar'
                data={datosGraficoRadar}
                options={opcionesGraficoRadar}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </>
      )}

      {/* Botón discreto en la parte inferior derecha que conduce al informe completo */}
      <div className='flex justify-content-end align-items-center mt-2 pt-2 border-top-1 surface-border'>
        <Button
          type='button'
          label='Ver informe de competecias completo'
          icon='pi pi-arrow-right'
          iconPos='right'
          text
          size='small'
          severity='secondary'
          className='text-xs font-semibold p-1'
          onClick={irAInformeCompetencias}
          tooltip='Abrir informe competencial individual detallado con desglose de criterios y exportación en PDF'
          tooltipOptions={{ position: "left" }}
        />
      </div>
    </Card>
  );
};

export default DiscenteModuloRadar;

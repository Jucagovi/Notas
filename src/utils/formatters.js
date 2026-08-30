// General formatting utility functions

export const formatNota = (nota) => {
  if (nota === null || nota === undefined || nota === "" || isNaN(nota)) return "?";

  const num = typeof nota === "number" ? nota : parseFloat(String(nota).replace(",", "."));
  if (isNaN(num)) return "?";

  // Se formatea con dos decimales usando coma decimal europea (es-ES)
  const formateado = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  // Se asegura la coma como separador decimal ante cualquier configuración del entorno
  return formateado.includes(",") ? formateado : num.toFixed(2).replace(".", ",");
};


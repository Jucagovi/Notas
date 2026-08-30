// Funciones de utilidad para formateo de datos en la aplicación

// Se formatea una calificación numérica a la escala oficial española con dos decimales y coma
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

// Se formatea el tamaño de un archivo en bytes mostrando un único decimal y coma como separador decimal
export const formatearTamanoArchivo = (bytes) => {
  if (bytes === 0 || bytes === null || bytes === undefined) return "0 B";

  const k = 1024;
  const unidades = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const valor = bytes / Math.pow(k, i);

  // Para valores en bytes individuales no se aplican decimales
  if (i === 0) {
    return `${bytes} B`;
  }

  // Se fija exactamente un decimal y se sustituye el punto por coma
  const valorConComa = valor.toFixed(1).replace(".", ",");
  return `${valorConComa} ${unidades[i]}`;
};

export default {
  formatNota,
  formatearTamanoArchivo,
};


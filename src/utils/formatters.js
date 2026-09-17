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

// Se formatea un Criterio de Evaluación (CE) mostrando su identificador y descripción pedagógica sin duplicaciones
export const formatearTextoCE = (c) => {
  if (!c) return "-";
  const numStr = c.numero ? `CE ${c.numero}` : "";
  let nombre = (c.nombre || numStr || "").trim();
  const desc = (c.descripcion || "").trim();

  // Si no hay descripción disponible, se devuelve el nombre o código
  if (!desc) {
    return nombre || numStr || "Criterio sin nombre";
  }

  // Si no hay nombre disponible, se devuelve la descripción
  if (!nombre) {
    return desc;
  }

  // Si el nombre ya incluye la descripción, se devuelve el nombre para evitar duplicar texto
  if (
    nombre.toLowerCase() === desc.toLowerCase() ||
    nombre.toLowerCase().includes(desc.toLowerCase())
  ) {
    return nombre;
  }

  // Si la descripción ya incluye el nombre al inicio, se devuelve la descripción
  if (desc.toLowerCase().includes(nombre.toLowerCase())) {
    return desc;
  }

  // Si ambos campos son diferentes, se combinan con guion
  return `${nombre} - ${desc}`;
};

// Se formatea un Resultado de Aprendizaje (RA) mostrando su identificador y descripción pedagógica sin duplicaciones
export const formatearTextoRA = (r) => {
  if (!r) return "-";
  const numStr = r.numero ? `RA ${r.numero}` : "";
  let nombre = (r.nombre || numStr || "").trim();
  const desc = (r.descripcion || "").trim();

  // Si no hay descripción disponible, se devuelve el nombre o código
  if (!desc) {
    return nombre || numStr || "RA sin nombre";
  }

  // Si no hay nombre disponible, se devuelve la descripción
  if (!nombre) {
    return desc;
  }

  // Si el nombre ya incluye la descripción, se devuelve el nombre para evitar duplicar texto
  if (
    nombre.toLowerCase() === desc.toLowerCase() ||
    nombre.toLowerCase().includes(desc.toLowerCase())
  ) {
    return nombre;
  }

  // Si la descripción ya incluye el nombre al inicio, se devuelve la descripción
  if (desc.toLowerCase().includes(nombre.toLowerCase())) {
    return desc;
  }

  // Si ambos campos son diferentes, se combinan con guion
  return `${nombre} - ${desc}`;
};

export default {
  formatNota,
  formatearTamanoArchivo,
  formatearTextoCE,
  formatearTextoRA,
};


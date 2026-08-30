// src/utils/coloresNota.js

export const getColorNota = (nota) => {
  if (nota === null || nota === undefined || nota === "" || isNaN(nota)) {
    return {
      text: "text-500",
      bg: "bg-gray-100",
      hex: "#9ca3af",
      label: "Sin calificar",
    };
  }

  const n = parseFloat(nota);
  if (isNaN(n)) {
    return {
      text: "text-500",
      bg: "bg-gray-100",
      hex: "#9ca3af",
      label: "Sin calificar",
    };
  }

  if (n < 50)
    return {
      text: "text-red-500",
      bg: "bg-red-100",
      hex: "#ef4444",
      label: "Suspenso",
    };
  if (n < 60)
    return {
      text: "text-orange-500",
      bg: "bg-orange-100",
      hex: "#f97316",
      label: "Suficiente",
    };
  if (n < 70)
    return {
      text: "text-yellow-500",
      bg: "bg-yellow-100",
      hex: "#eab308",
      label: "Bien",
    };
  if (n < 90)
    return {
      text: "text-green-500",
      bg: "bg-green-100",
      hex: "#22c55e",
      label: "Notable",
    };

  return {
    text: "text-blue-500",
    bg: "bg-blue-100",
    hex: "#3b82f6",
    label: "Sobresaliente",
  };
};

export const getGradeColor = getColorNota;


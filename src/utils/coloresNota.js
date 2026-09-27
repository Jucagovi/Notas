// Función auxiliar para obtener la clase CSS y el color hexadecimal asociado a una calificación (0-100).
export const getColorNota = (nota, esOscuro = false) => {
  const valor = Number(nota);

  if (Number.isNaN(valor)) {
    return {
      clase: 'text-color-secondary',
      hex: esOscuro ? '#94a3b8' : '#6c757d',
      etiqueta: 'Sin calificar'
    };
  }

  if (valor < 50) {
    return {
      clase: 'text-red-500',
      hex: esOscuro ? '#f87171' : '#ef4444',
      etiqueta: 'Suspenso'
    };
  }

  if (valor < 60) {
    return {
      clase: 'text-orange-500',
      hex: esOscuro ? '#fb923c' : '#f97316',
      etiqueta: 'Suficiente'
    };
  }

  if (valor < 70) {
    return {
      clase: 'text-yellow-500',
      hex: esOscuro ? '#facc15' : '#eab308',
      etiqueta: 'Bien'
    };
  }

  if (valor < 90) {
    return {
      clase: 'text-green-500',
      hex: esOscuro ? '#4ade80' : '#22c55e',
      etiqueta: 'Notable'
    };
  }

  return {
    clase: 'text-blue-500',
    hex: esOscuro ? '#60a5fa' : '#3b82f6',
    etiqueta: 'Sobresaliente'
  };
};

// Obtiene la severidad (severity) de PrimeReact correspondiente a una calificación (0-100).
// Menor a 50: danger, 50-59: warning, 60-69: info, 70-89: success, 90-100: primary
export const getSeverityNota = (nota) => {
  const valor = Number(nota);

  if (Number.isNaN(valor) || nota === null || nota === undefined) {
    return null;
  }

  if (valor < 50) return 'danger';
  if (valor < 60) return 'warning';
  if (valor < 70) return 'info';
  if (valor < 90) return 'success';
  return 'primary';
};

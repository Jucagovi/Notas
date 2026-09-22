// Utilidades para la sanitización, formateo y validación de datos para la importación masiva por CSV

// Sanitiza una cadena de texto eliminando espacios en blanco innecesarios en los extremos.
export const sanitizarTexto = (valor) => {
  if (valor === null || valor === undefined) return '';
  return String(valor).trim();
};

// Valida y formatea una fecha al estándar ISO de PostgreSQL (YYYY-MM-DD).
export const formatearFechaPostgres = (valor) => {
  const texto = sanitizarTexto(valor);
  if (!texto) {
    return { valor: null, error: null };
  }

  // Patrón para formato YYYY-MM-DD o YYYY/MM/DD
  const patronISO = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;
  // Patrón para formato DD/MM/YYYY o DD-MM-YYYY
  const patronEspanol = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/;

  let anyo, mes, dia;

  if (patronISO.test(texto)) {
    const coincidencias = texto.match(patronISO);
    anyo = parseInt(coincidencias[1], 10);
    mes = parseInt(coincidencias[2], 10);
    dia = parseInt(coincidencias[3], 10);
  } else if (patronEspanol.test(texto)) {
    const coincidencias = texto.match(patronEspanol);
    dia = parseInt(coincidencias[1], 10);
    mes = parseInt(coincidencias[2], 10);
    anyo = parseInt(coincidencias[3], 10);
  } else {
    return {
      valor: texto,
      error: 'Formato de fecha no reconocido. Se espera DD/MM/AAAA o AAAA-MM-DD.'
    };
  }

  // Se verifica el rango de año razonable
  if (anyo < 1900 || anyo > 2100) {
    return {
      valor: texto,
      error: 'El año indicado se encuentra fuera del rango permitido (1900-2100).'
    };
  }

  // Se verifica el rango de mes
  if (mes < 1 || mes > 12) {
    return {
      valor: texto,
      error: 'El mes indicado no es válido (debe ser entre 1 y 12).'
    };
  }

  // Se verifica el número de días según el mes y año bisiesto
  const diasEnMes = new Date(anyo, mes, 0).getDate();
  if (dia < 1 || dia > diasEnMes) {
    return {
      valor: texto,
      error: `El día indicado no es válido para el mes ${mes} (máximo ${diasEnMes} días).`
    };
  }

  const mesFormateado = String(mes).padStart(2, '0');
  const diaFormateado = String(dia).padStart(2, '0');
  const fechaResultado = `${anyo}-${mesFormateado}-${diaFormateado}`;

  return { valor: fechaResultado, error: null };
};

// Convierte representaciones textuales o numéricas en un valor booleano estricto.
export const parsearBooleano = (valor, predeterminado = true) => {
  const texto = sanitizarTexto(valor).toLowerCase();
  if (!texto) {
    return { valor: predeterminado, error: null };
  }

  const valoresVerdaderos = ['true', '1', 'si', 'sí', 'verdadero', 'yes', 's', 'v'];
  const valoresFalsos = ['false', '0', 'no', 'falso', 'n', 'f'];

  if (valoresVerdaderos.includes(texto)) {
    return { valor: true, error: null };
  }
  if (valoresFalsos.includes(texto)) {
    return { valor: false, error: null };
  }

  return {
    valor: texto,
    error: 'Valor booleano no válido. Se admite Sí/No, 1/0 o True/False.'
  };
};

// Valida si una cadena cumple con el formato estándar de correo electrónico.
export const validarCorreo = (valor) => {
  const texto = sanitizarTexto(valor);
  if (!texto) {
    return { valor: null, error: null };
  }

  // Expresión regular estándar para validación de formato de correo electrónico
  const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!patronCorreo.test(texto)) {
    return {
      valor: texto,
      error: 'El formato del correo electrónico no es válido.'
    };
  }

  return { valor: texto.toLowerCase(), error: null };
};

// Sanitiza y valida un campo individual según su configuración de tipo y obligatoriedad.
export const sanitizarYValidarCampo = (valorCrudo, configCampo) => {
  const textoLimpio = sanitizarTexto(valorCrudo);

  // Comprobación de obligatoriedad
  if (configCampo.requerido && (!textoLimpio || textoLimpio === '')) {
    return {
      valor: null,
      error: `El campo "${configCampo.etiqueta || configCampo.campo}" es obligatorio.`
    };
  }

  // Validación y conversión según el tipo de dato
  switch (configCampo.tipo) {
    case 'fecha': {
      const resFecha = formatearFechaPostgres(textoLimpio);
      if (resFecha.error) return resFecha;
      if (configCampo.requerido && !resFecha.valor) {
        return { valor: null, error: `La fecha es obligatoria.` };
      }
      return resFecha;
    }
    case 'booleano': {
      return parsearBooleano(textoLimpio, configCampo.predeterminado ?? true);
    }
    case 'correo': {
      const resCorreo = validarCorreo(textoLimpio);
      if (resCorreo.error) return resCorreo;
      if (configCampo.requerido && !resCorreo.valor) {
        return { valor: null, error: `El correo electrónico es obligatorio.` };
      }
      return resCorreo;
    }
    case 'numero': {
      if (!textoLimpio) {
        return { valor: null, error: null };
      }
      const num = Number(textoLimpio);
      if (Number.isNaN(num)) {
        return { valor: textoLimpio, error: 'Debe ser un número válido.' };
      }
      return { valor: num, error: null };
    }
    case 'texto':
    default: {
      return { valor: textoLimpio || null, error: null };
    }
  }
};

// Descarga en el navegador un archivo de texto con codificación UTF-8 y marca BOM.
export const descargarArchivoCSV = (nombreArchivo, contenidoCSV) => {
  const blob = new Blob(['\uFEFF' + contenidoCSV], {
    type: 'text/csv;charset=utf-8;'
  });
  const enlace = document.createElement('a');
  const url = URL.createObjectURL(blob);
  enlace.setAttribute('href', url);
  enlace.setAttribute('download', nombreArchivo);
  enlace.style.visibility = 'hidden';
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
};

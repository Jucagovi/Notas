import React, { createContext, useState, useEffect } from 'react';
import PrimeReact from 'primereact/api';

export const TemaContexto = createContext(null);

const CLAVE_ALMACENAMIENTO = 'tema_notas_preferencia';
const TEMA_CLARO = 'lara-light-blue';
const TEMA_OSCURO = 'lara-dark-blue';

// Proveedor de estado global para la gestión del tema Lara (claro/oscuro).
export const TemaProveedor = ({ children }) => {
  const [tema, setTema] = useState(() => {
    // Se recupera la preferencia previa del usuario o se analiza el sistema operativo.
    const preferenciaGuardada = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (preferenciaGuardada === 'oscuro') {
      return TEMA_OSCURO;
    }
    if (preferenciaGuardada === 'claro') {
      return TEMA_CLARO;
    }
    return TEMA_OSCURO;
  });

  const esOscuro = tema === TEMA_OSCURO;

  // Se sincroniza la clase 'app-dark' y atributos semánticos en el elemento raíz <html>.
  useEffect(() => {
    const raiz = document.documentElement;
    if (esOscuro) {
      raiz.classList.add('app-dark', 'dark-theme');
      raiz.setAttribute('data-theme', 'dark');
    } else {
      raiz.classList.remove('app-dark', 'dark-theme');
      raiz.setAttribute('data-theme', 'light');
    }
    localStorage.setItem(CLAVE_ALMACENAMIENTO, esOscuro ? 'oscuro' : 'claro');
  }, [esOscuro]);

  // Función para alternar dinámicamente entre lara-light-blue y lara-dark-blue.
  const alternarTema = () => {
    const temaActual = tema;
    const nuevoTema = esOscuro ? TEMA_CLARO : TEMA_OSCURO;

    PrimeReact.changeTheme(temaActual, nuevoTema, 'tema-css', () => {
      setTema(nuevoTema);
    });
  };

  const valor = {
    tema,
    esOscuro,
    alternarTema,
    establecerTema: setTema
  };

  return (
    <TemaContexto.Provider value={valor}>
      {children}
    </TemaContexto.Provider>
  );
};

export default TemaProveedor;

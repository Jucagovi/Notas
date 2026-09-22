// Definición del tema Nano para la API de Theming de PrimeReact (soporta modos claro y oscuro).

export const NanoClaro = {
  name: 'nano',
  colorScheme: 'light',
  primitive: {
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px'
    }
  },
  semantic: {
    primary: {
      50: '#f4f6fb',
      100: '#e5eaf5',
      200: '#cfd9ed',
      300: '#abc0e0',
      400: '#7e9fd0',
      500: '#1174c0',
      600: '#0e63a3',
      700: '#0c5186',
      800: '#09406a',
      900: '#072e4d',
      950: '#041c30'
    },
    colorScheme: {
      light: {
        surface: {
          ground: '#f2f4f8',
          section: '#ffffff',
          card: '#ffffff',
          overlay: '#ffffff',
          border: '#dee2e6',
          hover: '#dde1e6'
        },
        text: {
          color: '#343a3f',
          secondaryColor: '#697077'
        }
      }
    }
  }
};

export const NanoOscuro = {
  name: 'nano',
  colorScheme: 'dark',
  primitive: {
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px'
    }
  },
  semantic: {
    primary: {
      50: '#041c30',
      100: '#072e4d',
      200: '#09406a',
      300: '#0c5186',
      400: '#0e63a3',
      500: '#3b9ae1',
      600: '#6ba9d8',
      700: '#99c3e4',
      800: '#c6def0',
      900: '#e5eaf5',
      950: '#f4f6fb'
    },
    colorScheme: {
      dark: {
        surface: {
          ground: '#121214',
          section: '#18181b',
          card: '#18181b',
          overlay: '#222226',
          border: '#2e2e36',
          hover: '#26262e'
        },
        text: {
          color: '#ffffff',
          secondaryColor: '#cbd5e1'
        }
      }
    }
  }
};

// Por defecto se exporta la variante clara de Nano.
export const Nano = NanoClaro;

export default Nano;

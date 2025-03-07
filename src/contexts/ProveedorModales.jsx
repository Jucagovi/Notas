import React, { createContext, useState } from "react";

const contextoModales = createContext();

const ProveedorModales = ({ children }) => {
  /** Estado para controlar la visibilidad. */
  const [visible, setVisible] = useState(false);

  /** Función para ocultar/desocultar */
  const alternarModal = () => {
    setVisible(!visible);
  };

  const datos = { visible, alternarModal };

  return (
    <contextoModales.Provider value={datos}>
      {children}
    </contextoModales.Provider>
  );
};

export default ProveedorModales;
export { contextoModales };

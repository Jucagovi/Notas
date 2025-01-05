import ProveedorDatos from "./contexts/ProveedorDatos.jsx";
import ProveedorSesion from "./contexts/ProveedorSesion.jsx";
import ProveedorTostadas from "./contexts/ProveedorTostadas.jsx";
import PrincipalLayout from "./layout/PrincipalLayout.jsx";
import Rutas from "./routes/Rutas.jsx";

function App() {
  return (
    <>
      <ProveedorSesion>
        <ProveedorTostadas>
          <ProveedorDatos>
            <PrincipalLayout>
              <Rutas />
            </PrincipalLayout>
          </ProveedorDatos>
        </ProveedorTostadas>
      </ProveedorSesion>
    </>
  );
}

export default App;

import ProveedorDatos from "./contexts/ProveedorDatos.jsx";
import ProveedorEstilos from "./contexts/ProveedorEstilos.jsx";
import ProveedorModales from "./contexts/ProveedorModales.jsx";
import ProveedorSesion from "./contexts/ProveedorSesion.jsx";
import ProveedorTostadas from "./contexts/ProveedorTostadas.jsx";
import PrincipalLayout from "./layout/PrincipalLayout.jsx";
import Rutas from "./routes/Rutas.jsx";

function App() {
  return (
    <>
      <ProveedorModales>
        <ProveedorEstilos>
          <ProveedorTostadas>
            <ProveedorSesion>
              <ProveedorDatos>
                <PrincipalLayout>
                  <Rutas />
                </PrincipalLayout>
              </ProveedorDatos>
            </ProveedorSesion>
          </ProveedorTostadas>
        </ProveedorEstilos>
      </ProveedorModales>
    </>
  );
}

export default App;

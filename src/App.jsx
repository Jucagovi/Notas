import ProveedorDatos from "./contexts/ProveedorDatos.jsx";
import ProveedorSesion from "./contexts/ProveedorSesion.jsx";
import PrincipalLayout from "./layout/PrincipalLayout.jsx";
import Rutas from "./routes/Rutas.jsx";

function App() {
  return (
    <>
      <ProveedorSesion>
        <ProveedorDatos>
          <PrincipalLayout>
            <Rutas />
          </PrincipalLayout>
        </ProveedorDatos>
      </ProveedorSesion>
    </>
  );
}

export default App;

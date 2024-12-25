import ProveedorSesion from "./contexts/ProveedorSesion.jsx";
import PrincipalLayout from "./layout/PrincipalLayout.jsx";
import Rutas from "./routes/Rutas.jsx";

function App() {
  return (
    <>
      <ProveedorSesion>
        <PrincipalLayout>
          <Rutas />
        </PrincipalLayout>
      </ProveedorSesion>
    </>
  );
}

export default App;

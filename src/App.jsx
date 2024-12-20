import Inicio from "./pages/Inicio.jsx";
import PrincipalLayout from "../layouts/PrincipalLayout.jsx";
import Mantenimiento from "./pages/Mantenimiento.jsx";

function App() {
  return (
    <>
      <PrincipalLayout>
        <Mantenimiento />
      </PrincipalLayout>
    </>
  );
}

export default App;

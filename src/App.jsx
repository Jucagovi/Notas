import Cabecera from "./components/grid/Cabecera.jsx";
import MenuPrincipal from "./components/Menu/MenuPrincial.jsx";
import PiePagina from "./components/grid/PiePagina.jsx";
import Inicio from "./pages/Inicio.jsx";

function App() {
  return (
    <>
      <div className='grid'>
        <div className='col p-5'>
          <Cabecera />
        </div>
      </div>
      <div className='grid'>
        <div className='col-2 border-solid surface-border border-1  border-round-lg p-3'>
          <MenuPrincipal />
        </div>
        <div className='col-10 p-3'>
          <Inicio />
        </div>
      </div>
      <div className='grid'>
        <PiePagina />
      </div>
    </>
  );
}

export default App;

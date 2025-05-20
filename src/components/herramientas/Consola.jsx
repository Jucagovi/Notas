import React, { useEffect } from "react";
import { Terminal } from "primereact/terminal";
import { TerminalService } from "primereact/terminalservice";
import useDatos from "../../hooks/useDatos.js";
import "./Consola.css";

const Consola = () => {
  const { discentes, modulos } = useDatos();

  const ayuda = "Comandos disponibles: fecha, aleatorio, limpiar";

  const comando_mostrar = (comando, argumentos) => {
    let resultado = "";
    if (argumentos.length > 1) {
      return "Se han encontrado demasiados argumentos. Revisa la ayuda del comando con 'mostrar ayuda'";
    }
    switch (argumentos[0]) {
      case "ayuda":
        resultado = "mostrar tabla (modulos, cursos)";
        break;
      case "modulos":
        resultado = <pre>{JSON.stringify(modulos, null, 2)}</pre>;
        break;
      case "discentes":
        resultado = <pre>{JSON.stringify(discentes, null, 2)}</pre>;
        break;
      case "--tabla":
        resultado = mostrar_formato_tabla(modulos);
        break;
      default:
        resultado = "No se ha especificado tabla o la tabla no existe";
        break;
    }
    return resultado;
  };

  const mostrar_formato_tabla = (datos) => {
    let tabla = "";
    if (Array.isArray(datos) && datos.length) {
      const claves = Object.keys(datos[0]);
      tabla = "<table><tr>";
      tabla += claves.map((clave) => {
        return `<td>${clave}</td>`;
      });
      tabla += "</tr>";
      /* tabla += datos.map((dato) => {
        return ""
      }); */
      tabla += "</table>";
    } else {
      tabla = "No se ha especifiacdo tabla";
    }
    return tabla;
  };

  const commandHandler = (texto) => {
    let respuesta;
    /**
     * Se limpia el comando recogido en el terminal:
     *    -> se eliminan los espacios a ambos lados con trim(),
     *    -> se eliminan espacios duplicados con una expresión regular.
     */
    texto = texto.trim().replace(/\s+/g, " ");
    let argsIndex = texto.indexOf(" ");
    // Devuelve el comando en solitario (tenga argumentos o no).
    let comando =
      argsIndex !== -1 ? texto.substring(0, argsIndex) : texto.trim();
    // Devuelve los argumentos en un array o uno vacío si no existen.
    let argumentos =
      argsIndex !== -1 ? texto.substring(argsIndex + 1).split(" ") : [];

    switch (comando) {
      case "fecha":
        respuesta =
          "Hoy es " +
          new Date().toLocaleString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        break;

      case "ayuda":
        respuesta = ayuda;
        break;

      case "aleatorio":
        respuesta = Math.floor(Math.random() * 100);
        break;

      case "limpiar":
        respuesta = null;
        break;

      case "mostrar":
        respuesta = comando_mostrar(comando, argumentos);
        break;

      default:
        respuesta = "Comando desconocido: " + comando;
        break;
    }

    if (respuesta) TerminalService.emit("response", respuesta);
    else TerminalService.emit("clear");
  };
  useEffect(() => {
    TerminalService.on("command", commandHandler);

    return () => {
      TerminalService.off("command", commandHandler);
    };
  }, []);

  return (
    <>
      <h3>Consola</h3>
      <div>
        <Terminal
          className='consola-principal'
          welcomeMessage='Escribe "ayuda" en el terminal para obtener el listado de comandos'
          prompt='notas $'
          pt={{
            root: "bg-gray-900 text-white border-round",
            prompt: "text-gray-400 mr-2",
            command: "text-primary-300",
            response: "text-primary-300",
          }}
        />
      </div>
    </>
  );
};

export default Consola;

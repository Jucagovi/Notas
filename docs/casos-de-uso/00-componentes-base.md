0. Rol y Contexto:

Eres un desarrollador Senior en React y PrimeReact. Tu tarea es crear la librería de componentes UI base para evitar la duplicación de código en nuestro ERP educativo.

1. Objetivo

Centralizar los elementos de interfaz de usuario más utilizados en componentes presentacionales "tontos" (Dumb Components). Esto garantiza la coherencia visual en toda la aplicación, facilita el mantenimiento global y reduce el código repetitivo en las vistas (Páginas).

2. Ubicación y Reglas

- Todos los componentes se crearán en src/components/common/.
- No deben realizar llamadas a base de datos ni importar Custom Hooks de datos. Reciben su información estrictamente a través de props (ej. opciones, value, onChange).
- Utilizarán PrimeFlex para sus márgenes y alineaciones internas.
- Asegúrate de configurar la propiedad optionLabel (para las búsquedas por texto si configuras filter) y optionValue (normalmente el ID de la entidad).
- Devuelve el código de los componentes de forma modular y limpia.
- Genera el código asegurando que aplican el patrón contenedor-presentacional y admiten children donde sea necesario.


3. Elementos a crear

- <HeaderPagina.jsx>: Un componente que reciba titulo (string), descripcion (string, opcional) y acciones (nodo React, opcional). Debe renderizar el título a la izquierda, las acciones a la derecha (usando flexbox).

- Selectores: Crea los siguientes componentes presentacionales. Todos deben recibir value, options, onChange, loading y disabled por props:

  - <SelectorCurso.jsx>: Un <Dropdown> donde cada elemento muestre un icono (pi-building), el nombre del curso, texto con el anyo y, entre paréntesis en un gris más claro, el centro.

  - <SelectorClase.jsx>: Un <Dropdown> donde cada elemento muestre un icono (pi-graduation-cap), el nombre del curso, entre paréntesis en un gris más claro, las siglas del modulo y el nombre del módulo.

  - <SelectorModulo.jsx>: Un <Dropdown> que muestre un icono (pi-book), las siglas y el nombre del módulo.

  - <SelectorDiscente.jsx>: Un <Dropdown> que muestre un icono de usuario (pi-user), seguido de nombre, apellidos y el campo NIA en un texto secundario más pequeño y de color gris (text-color-secondary de PrimeFlex).

  - <SelectorCiclo.jsx>: Un <Dropdown> similar al de módulo, con icono (pi-briefcase), siglas y el nombre del ciclo.

  - <SelectorEvaluacion.jsx>: Un <Dropdown> similar al de módulo, con icono (pi-calculator), siglas y el nombre del ciclo.

- <BadgeNota.jsx>: Recibe una prop nota (0-100). Utiliza un <Tag> de PrimeReact para mostrar el número. Aplica color según el valor: menor a 50 (danger), 50-59 (warning), 60-69 (info), 70-89 (success), 90-100 (primary/azul). Se debe utilizar el helper `utils/coloresNotas.js`.

- <BotonAccion.jsx>: Un componente <Button> estandarizado. Recibe label, icon, onClick, tipo (guardar, cancelar, exportar, eliminar) para asignar automáticamente el color de PrimeReact (severity) y la clase p-button-outlined o p-button-danger según corresponda.

- <TablaBase/>: Evita repetir la configuración de paginator, rows={10}, emptyMessage="No hay registros" y el estado loading en las 20 tablas que tendrá la aplicación. Uso: <TablaBase data="{misDatos}">{ misColumnas }</TablaBase>

- <EstadoVacio/> Cuando no hay alumnos, prácticas o unidades creadas, en lugar de mostrar una tabla vacía triste, muestra una ilustración o icono centrado con un mensaje ("Aún no hay prácticas aquí") y un botón ("Crear la primera").

- <ModalConfirmacion/>: Estandariza el ConfirmDialog para los borrados peligrosos, asegurando que el botón de aceptar sea siempre rojo (danger) y el icono sea el de advertencia, sin tener que reescribirlo en cada caso de uso.

- <CargadorSeccion/> Muestra una animación de carga (componente Skeleton de PrimeReact) unificada mientras el Custom Hook resuelve la petición HTTP, evitando saltos bruscos en la interfaz.


## TAREAS A EJECUTAR Secuencialmente:

### Tarea 1: Inicialización y Dependencias

- Asegúrate de que el proyecto está inicializado con Vite (React).
- Instala las siguientes dependencias: `primereact`, `primeicons`, `react-router-dom`, `@supabase/supabase-js`.

### Tarea 2: Configuración de PrimeReact

- En `src/main.jsx`, envuelve la aplicación con `PrimeReactProvider`.
- Importa los estilos base de PrimeReact, PrimeIcons y el tema predeterminado (ej. `primereact/resources/themes/lara-light-indigo/theme.css`).

### Tarea 3: Cliente de Supabase

- Crea el archivo `src/config/supabase.js`.
- Inicializa el cliente usando las variables de entorno `import.meta.env.VITE_SUPABASE_URL` e `import.meta.env.VITE_SUPABASE_ANON_KEY`.

### Tarea 4: El Núcleo de Datos (`src/hooks/useDatos.js`)

- Crea este Custom Hook genérico. Será el único archivo que interactúe directamente con el cliente de Supabase.
- Debe exponer funciones para: `obtenerDatos(tabla, filtros)`, `insertarDato(tabla, payload)`, `actualizarDato(tabla, id, payload)`, y `eliminarDato(tabla, id)`.
- Debe gestionar internamente un estado de `loading` y devolver las respuestas capturando errores para no romper la aplicación.

### Tarea 5: Layout Principal y Enrutamiento

- Crea `src/layout/LayoutPrincipal.jsx`. Este layout debe tener:
  - Una barra lateral izquierda (Sidebar) para el menú principal.
  - Una barra superior (Topbar) genérica.
  - Un área central (`<Outlet />` de react-router-dom) donde se renderizarán las páginas.
- Crea una página base `src/pages/PanelControl.jsx` con un mensaje de bienvenida.
- Configura el enrutador en `src/App.jsx` utilizando `BrowserRouter` y `Routes`, estableciendo `LayoutPrincipal` como ruta padre y `Panel de control` como índice (`/`).

**Resultado Esperado:**
Al finalizar estas tareas, la aplicación debe poder ejecutarse sin errores, mostrando un Layout responsivo con PrimeReact listo para que los siguientes casos de uso inyecten sus páginas en el enrutador.

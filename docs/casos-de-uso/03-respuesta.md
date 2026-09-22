  ### Resumen de los cambios implementados paso a paso                                                 
                                                                                                       
  #### 1. Contexto Global y Custom Hook de Autenticación con Supabase                                  
                                                                                                       
  • Contexto Global de Sesión (AuthContext.jsx):                                                       
  Se ha creado el contexto AuthContext.jsx:4 y su proveedor AuthContext.jsx:7.                         
      • Se comprueba la sesión inicial del cliente mediante supabase.auth.getSession().                
      • Se suscribe reactivamente a los cambios de estado con supabase.auth.onAuthStateChange.         
      • Se implementan las operaciones nativas de Supabase: AuthContext.jsx:52 (signInWithPassword) y  
      AuthContext.jsx:80 (signOut).
      • Se expone un estado unificado con alias en castellano e inglés (usuario/user, sesion/session,  
      cargando/loading, iniciarSesion/login, cerrarSesion/logout).
  • Custom Hook (useAuth.js):
  Se encapsula el consumo de AuthContext.jsx, garantizando que solo pueda ser invocado dentro del      
  proveedor correspondiente y evitando dependencias directas del SDK de Supabase en los componentes    
  visuales.
  • Inyección en el árbol raíz (main.jsx):
  Se ha integrado AuthContext.jsx dentro de ToastContext.jsx para disponer tanto del sistema de        
  notificaciones como del estado de sesión en toda la jerarquía de componentes.
  ──────
  #### 2. Componentización Modular de la Vista de Acceso (src/components/autenticacion/)
  
  Cumpliendo la directriz estricta de no construir vistas monolíticas y aplicar el principio de        
  responsabilidad única (SRP), la interfaz de inicio de sesión se ha dividido en los siguientes        
  componentes:
  
  1. CabeceraLogin.jsx:
  Componente presentacional que renderiza el isotipo institucional con icono pi-graduation-cap, el     
  título institucional ("Administración Académica") y el subtítulo ("Control de Notas y Gestión        
  Docente").
  2. FormularioLogin.jsx:
  Componente presentacional con los campos requeridos de PrimeReact:
      • InputText: Para el ingreso del correo electrónico con icono pi-envelope.
      • Password: Para la clave con feedback={false} (para agilizar el login) y toggleMask.            
      • Button: Botón de acción con severidad primaria, icono pi-sign-in y estado reactivo loading.    
  3. **`TarjetaLogin.jsx`:** Contenedor presentacional que implementa el componente `Card` de PrimeReact con un ancho optimizado (`maxWidth: 400px`), ensamblando `CabeceraLogin`, `FormularioLogin` y un pie informativo con aviso de acceso restringido.
  4. **`RutaPrivada.jsx`:** Envoltorio de rutas privadas que verifica el estado devuelto por `useAuth`. Si la comprobación está en curso, renderiza un `ProgressSpinner` de PrimeReact; si no existe usuario autenticado, redirige automáticamente a `/login` preservando la ruta solicitada en el estado de navegación.

  ---

  ### 3.1. Ajustes de Maquetación y Homologación Visual

  * **Homologación de dimensiones:** Se ha encapsulado cada campo en `.login-input-contenedor` y se han fijado dimensiones idénticas (`height: 44px`, ancho al 100%, relleno horizontal de `2.5rem` y radio de borde de `8px`), logrando que el campo de correo y el de contraseña tengan un tamaño simétrico y equilibrado.
  * **Centrado vertical del icono de máscara:** Se ha forzado el posicionamiento absoluto con `top: 50%`, `transform: translateY(-50%)` y `margin: 0` sobre los selectores de iconos de PrimeReact (`.p-password-show-icon`, `.p-password-hide-icon`, `svg`), garantizando que el icono para alternar la visibilidad de la clave quede exactamente centrado en el eje vertical.
  * **Armonización del color de fondo:** Se ha sustituido el degradado anterior por el fondo canónico del sistema (`var(--bg-color)`: `#f2f4f8` en tema claro y `#0f172a` en tema oscuro) e inyectado reglas sobre `input:-webkit-autofill` para neutralizar el fondo amarillo predeterminado de los navegadores.
  
  ──────
  #### 3. Página Orquestadora (LoginPagina.jsx)
  
  • Se sitúa en la ruta /login fuera del shell administrativo.
  • Consume useAuth.js y useGlobalToast.js.
  • Si un usuario autenticado accede a /login, se le redirige automáticamente a la página principal    
  (/dashboard).
  • Gestiona el envío de credenciales, control de errores y validación en castellano mediante          
  notificaciones Toast (mostrarError, mostrarExito, mostrarAdvertencia).
  ──────
  #### 4. Integración en la Cabecera Global (Cabecera.jsx)
  
  • Se eliminaron los valores fijos hardcodeados en Cabecera.jsx.
  • Se conectó con useAuth.js para mostrar el correo o nombre del usuario logueado en tiempo real y    
  calcular dinámicamente las iniciales del Avatar.
  • El botón de salida (Button con icono pi-sign-out) finaliza la sesión activa en Supabase mediante   
  logout(), emite un aviso con useGlobalToast.js y redirige al usuario a /login.
  ──────
  #### 5. Enrutamiento Protegido y Rutas Públicas (App.jsx)
  
  • Se configuró la ruta pública /login asociada a LoginPagina.jsx.
  • Se añadió redirección de compatibilidad desde /iniciar-sesion hacia /login.
  • Se envolvieron todas las rutas principales bajo RutaPrivada.jsx y LayoutPrincipal.jsx, garantizando
  bloqueo total contra accesos no autorizados.
  • Se habilitaron las rutas / y /dashboard para la navegación al panel de control.

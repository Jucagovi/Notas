### Resumen de acciones ejecutadas
  
  1. Inicialización y entorno Vite:
      • Se configuraron los archivos base package.json, vite.config.js e index.html directamente en la 
      raíz sin sobrescribir ni eliminar archivos previos.
      • Se actualizó el archivo .env.local para proveer explícitamente VITE_SUPABASE_URL y             
      VITE_SUPABASE_ANON_KEY.
  2. Dependencias Core instaladas:
      • react y react-dom (v18)
      • react-router-dom (v7)
      • swapy (v1.0.5)
      • primereact (v10.9.9), primeicons y primeflex
      • @supabase/supabase-js (v2.49)
      • Paquete de temas de PrimeReact: dado que @primereact/themes no está publicado como paquete     
      independiente en el registro público de npm (a diferencia del ecosistema unificado
      @primeuix/themes), se estructuró el módulo en src/themes/ y se configuró el alias en Vite y en   
      package.json para permitir la importación canónica import Nano from '@primereact/themes/nano';   
      inyectando tanto el preset como los estilos de nano/theme.css.
  3. Estructura de carpetas en src/:
      • src/components/: componentes de vista y plantilla.
      • src/pages/: vistas organizadas por módulos (dashboard, planificacion, evaluacion, informes,    
      herramientas, ayuda).
      • src/hooks/: reservado para hooks personalizados (useDatos, etc.).
      • src/services/: cliente de Supabase (supabaseClient.js).
      • src/utils/: funciones puras y utilidades, incluyendo coloresNota.js con la escala cromática    
      requerida en las convenciones.
  4. Configuración de UI y Theming en main.jsx:
      • Inyección de Nano en PrimeReactProvider con ripple: true.
      • Carga de los estilos requeridos: tema Nano, núcleo de PrimeReact, PrimeIcons y clases          
      utilitarias de PrimeFlex.
  5. App Shell en LayoutPrincipal.jsx:
      • Cabecera superior fija: implementada con Toolbar, botón de menú hamburguesa (en móviles),      
      título de aplicación, botón de configuración y Avatar del profesor.
      • Menú lateral: implementado con PanelMenu jerárquico. En pantallas de escritorio se mantiene    
      fijado lateralmente (sticky), y en dispositivos móviles se despliega a través de un Sidebar      
      responsive.
      • Área principal: contenedor con padding PrimeFlex y <Outlet />.
      • Pie de página: fijo al final con texto "Administración docente v1.0 - 2026".
  6. Enrutamiento y componentes esqueleto:
      • Configurado en App.jsx con todas las rutas oficiales del layout:
          • /: DashboardPagina.jsx
          • /planificacion/temporizacion: TemporizacionPagina.jsx
          • /planificacion/programacion: ProgramacionPagina.jsx
          • /evaluacion/cuaderno: CuadernoPagina.jsx
          • /evaluacion/diario: DiarioPagina.jsx
          • /evaluacion/practicas: PracticasPagina.jsx
          • /informes/memoria: MemoriaPagina.jsx
          • /informes/seguimiento: SeguimientoPagina.jsx
          • /informes/progreso: ProgresoPagina.jsx
          • /herramientas/exportador: ExportadorPagina.jsx
          • /herramientas/calendario: CalendarioPagina.jsx
          • /herramientas/horarios: HorariosPagina.jsx
          • /herramientas/mantenimiento: MantenimientoPagina.jsx
          • /ayuda: AyudaPagina.jsx
          • Control de rutas no encontradas con NotFoundPagina.jsx.
      • Cada página esqueleto cuenta con un título principal y el separador Divider de PrimeReact.     
  
---

 Se ha implementado el cambio dinámico entre los modos claro y oscuro para el tema Nano de PrimeReact,
  respetando la arquitectura del proyecto y las convenciones de nomenclatura.
---
  ### Componentes y cambios implementados
  
  1. Variantes del tema Nano (nano.js):
      • Se crearon y exportaron dos presets temáticos: NanoClaro y NanoOscuro.
      • La paleta oscura adapta los contrastes, escalas de grises y tonos de acento de Nano para       
      entornos con baja luminosidad.
  2. Estilos de modo oscuro (nanoDark.css):
      • Define las variables CSS (--surface-ground, --surface-card, --surface-section, --surface-border,
      --text-color, etc.) bajo las clases html.app-dark y [data-theme="dark"].
      • Ajusta los componentes clave de PrimeReact (Toolbar, PanelMenu, Sidebar, Divider, textos y     
      fondos de PrimeFlex) para integrarse visualmente en modo oscuro.
  3. Contexto de UI (TemaContexto.jsx):
      • Gestiona el estado global del tema ('claro' o 'oscuro'), cumpliendo la regla de reservar       
      Context API exclusivamente para estados globales de UI.
      • Sincroniza la clase app-dark y el atributo data-theme en el elemento raíz <html>.              
      • Persiste la elección del usuario en localStorage (tema_notas_preferencia) y, si no existe una  
      elección previa, detecta la preferencia del sistema operativo (prefers-color-scheme).            
  4. Hook personalizado (useTema.js):
      • Expone { tema, esOscuro, presetTema, alternarTema, establecerTema } para consumo directo en    
      cualquier componente.
  5. Integración en main.jsx:
      • Se envolvió la aplicación con TemaProveedor, actualizando reactivamente las propiedades theme y
      preset de PrimeReactProvider.
  6. Selector en la cabecera (LayoutPrincipal.jsx):
      • Se añadió un botón en la barra superior (Toolbar), junto a las opciones y el avatar del usuario,
      que muestra el icono pi pi-moon (en modo claro) o pi pi-sun (en modo oscuro) con tooltip         
      informativo.
  
---

Se han corregido ambos aspectos para mejorar el contraste visual y la alineación de la navegación:   
  ──────
  ### 1. Corrección del color de texto en modo oscuro (nanoDark.css y nano.js)
  
  • Contraste nítido y blanco brillante:
      • Se sustituyeron los tonos grises apagados (#9aa1a9 / #343a3f) por blanco puro (#ffffff) para   
      títulos, textos principales y etiquetas de enlaces (.text-900, h1-h4, .p-panelmenu-header-link, .
      p-menuitem-text).
      • Los textos secundarios y descripciones (.text-secondary, .text-500, .text-muted, subtítulos) se
      configuraron en un tono pizarra claro de alta legibilidad (#cbd5e1 / #e2e8f0).
      • Los iconos del menú y submenú se ajustaron a tonos azules claros y contrastados (#60a5fa y     
      #93c5fd).
  
  ──────
  ### 2. Alineación y margen derecho de los elementos de submenú (LayoutPrincipal.css)
  
  • Alineación a la misma columna:
      • El encabezado padre cuenta con un chevron desplegable de ~14px más márgenes, lo que situaba su 
      icono a 34px del borde izquierdo.
      • Se configuró padding-left: 2.125rem; (34px) en los enlaces de submenú (.p-panelmenu-content .p-
      menuitem-link) para que el icono y texto del submenú se alineen con el icono y texto del elemento
      menú que los contiene.
  • Margen derecho:
      • Se aplicó margin-right: 0.5rem; en cada ítem de submenú para evitar que queden pegados al borde
      derecho del panel y respiren de forma simétrica con el resto de la interfaz.
  
---

 Se ha implementado con éxito la segunda opción, migrando la aplicación a la familia oficial de temas 
  Lara de PrimeReact: lara-light-blue (modo claro) y lara-dark-blue (modo oscuro).                     
  ──────
  ### Cambios realizados
  
  1. Recursos de temas oficiales (themes):
      • Se copiaron los directorios oficiales lara-light-blue y lara-dark-blue con sus tipografías y
      estilos completos en public/themes/.                                                             
  2. Carga y prevención de destellos (index.html):
      • Se configuró la etiqueta <link id="tema-css" rel="stylesheet" href="/themes/lara-light-
      blue/theme.css" />.                                                                              
      • Se incorporó un script en el <head> para detectar la preferencia guardada en localStorage o en
      el sistema operativo antes de renderizar, evitando cualquier parpadeo de color al cargar la      
      página.                                                                                          
  3. Alternancia dinámica oficial con PrimeReact.changeTheme (TemaContexto.jsx):
      • El cambio entre claro y oscuro ahora utiliza la API oficial de PrimeReact (PrimeReact.
      changeTheme), que intercambia la hoja de estilo en memoria sin recargar la página.               
      • Se sincroniza la persistencia en localStorage y la clase app-dark.
  4. Mejora en tipografía y contraste nativo:
      • lara-dark-blue incluye de serie superficies oscuras calibradas (#111827, #1f2937), bordes
      suaves y textos de alto contraste blanco brillante (rgba(255, 255, 255, 0.87)), eliminando el    
      gris opaco del tema anterior.                                                                    
  5. Alineación y margen derecho del submenú (LayoutPrincipal.css):
      • Se adaptaron los elementos de submenú a las dimensiones de Lara (padding-left: 2.625rem;), de
      modo que el icono del submenú queda alineado en la misma columna vertical que el icono del       
      elemento contenedor.                                                                             
      • Se mantiene el margen derecho (margin-right: 0.5rem;) y esquinas redondeadas (border-radius:
      6px) típicas de la estética moderna de Lara.                                                     
      • Se preservó la cabecera ampliada (150px). 

---

## Respuesta creación de componentes base

  Se ha implementado la librería completa de componentes base de UI en  cumpliendo estrictamente con el Principio de     
  Responsabilidad Única (SRP), el patrón contenedor-presentacional (dumb components) y las reglas de maquetación con     
  PrimeFlex y PrimeReact.
  ──────
  ### Componentes Creados
  
  1. HeaderPagina.jsx
      • Responsabilidad: Presentar el encabezado de las páginas con título (titulo), subtítulo opcional (descripcion),   
      zona de acciones alineada a la derecha (acciones) y soporte opcional para children.
      • Estilo: Utiliza flexbox responsivo con PrimeFlex (flex flex-column md:flex-row justify-content-between).         
  2. Selectores Estandarizados (Dropdown de PrimeReact):
  Todos reciben value, options, onChange, loading y disabled por props, con optionLabel, optionValue e iconos            
  contextuales preconfigurados:
      • SelectorCurso.jsx: Renderiza cada curso con icono pi-building, nombre, año académico y centro educativo en gris  
      más claro entre paréntesis.
      • SelectorClase.jsx: Renderiza la clase con icono pi-graduation-cap, nombre del curso, siglas del módulo entre     
      paréntesis en gris claro (text-color-secondary) y denominación del módulo.
      • SelectorModulo.jsx: Muestra icono pi-book, siglas oficiales en negrita y el nombre del módulo profesional.       
      • SelectorDiscente.jsx: Muestra icono de usuario pi-user, nombre completo y el campo NIA en texto secundario más   
      pequeño con text-color-secondary.
      • SelectorCiclo.jsx: Muestra icono pi-briefcase, siglas en negrita y denominación del ciclo formativo.             
      • SelectorEvaluacion.jsx: Muestra icono pi-calculator, siglas, período evaluativo y ciclo asociado.
  3. BadgeNota.jsx
      • Responsabilidad: Mostrar una nota (0-100) en un <Tag> con la severidad cromática oficial calculada desde         
      coloresNotas.js:
          • < 50: danger (Suspenso)
          • 50-59: warning (Suficiente)
          • 60-69: info (Bien)
          • 70-89: success (Notable)
          • 90-100: primary / azul (Sobresaliente)
  
  4. BotonAccion.jsx
      • Responsabilidad: Asignar automáticamente severity, iconos por defecto y clases (p-button-outlined o p-button-    
      danger) según el tipo de acción semántica:
          • guardar: severidad primaria sólida (pi pi-check).
          • cancelar: severidad secundaria con p-button-outlined (pi pi-times).
          • exportar: severidad informativa con p-button-outlined (pi pi-download).
          • eliminar: severidad danger con p-button-danger (pi pi-trash).
  
  5. TablaBase.jsx
      • Responsabilidad: Unificar la configuración de DataTable (paginador de 10 filas por defecto, opciones [5, 10, 20, 
      50], mensaje de vacío "No hay registros", diseño responsivo y estado loading).
      • Admite children con los <Column /> de PrimeReact.
  6. EstadoVacio.jsx
      • Responsabilidad: Renderizar estados vacíos amigables cuando no existan registros (alumnos, prácticas, etc.),     
      mostrando icono o ilustración central, título explicativo y botón directo de acción (ej. "Crear la primera").      
  7. ModalConfirmacion.jsx
      • Responsabilidad: Estandarizar diálogos de confirmación para borrados críticos, garantizando el icono de          
      advertencia (pi-exclamation-triangle) y el botón de aceptar rojo (p-button-danger).
      • Proporciona tanto el componente declarativo <ModalConfirmacion /> como la función helper imperativa              
      confirmarBorrado(...).
  8. CargadorSeccion.jsx
      • Responsabilidad: Prevenir saltos de diseño (CLS) mientras se resuelven peticiones asíncronas mostrando esqueletos
      (Skeleton) configurables por tipo (tabla, formulario, tarjetas y lista).
  9. index.js
      • Archivo de barril para importar de forma limpia cualquier componente desde @/components/common.

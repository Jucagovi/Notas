### 🆘 Caso de Uso 31: Centro de Ayuda y Guía de Onboarding

**1. Objetivo**
Proporcionar al usuario un manual integrado en la aplicación que explique el flujo exacto de configuración inicial (Onboarding) y resuelva dudas sobre el funcionamiento de los módulos más complejos (como el asistente de temporización o el cálculo de notas criteriales).

**2. Interfaz de Usuario y Flujo (UI/UX)**

* **Navegación:** Nueva entrada principal en el menú lateral denominada `Ayuda`, apuntando a la ruta `/ayuda` (`src/pages/AyudaPagina.jsx`).
* **Layout Principal:** Un componente `TabView` de PrimeReact para separar la guía paso a paso del manual de referencia.
* **Pestaña 1: "Guía de Inicio (Paso a Paso)"**
* Utilizará un componente `Timeline` o `Stepper` vertical de PrimeReact para ilustrar el "Camino Feliz" de configuración a principio de curso.
* *Paso 1:* Crear el Curso y el Calendario Escolar (Días lectivos).
* *Paso 2:* Crear el Módulo y asignar los pesos de los Resultados de Aprendizaje (RA).
* *Paso 3:* Definir el Horario del grupo y del docente.
* *Paso 4:* Diseñar las Unidades de Trabajo y usar el Asistente de Temporización Mágica.
* *Paso 5:* Matricular Discentes.


* **Pestaña 2: "Manual de Módulos Complejos"**
* Un componente `Accordion` de PrimeReact donde cada panel explica un concepto técnico (ej. "¿Cómo calcula el sistema la nota final de un alumno?", "¿Cómo exportar a ITACA correctamente?").



**3. Arquitectura y Datos**

* **Carga de Datos:** A diferencia del resto de la aplicación, esta vista será **completamente estática**. No requerirá llamadas al Custom Hook `useDatos` ni conexión a Supabase, lo que garantiza que cargue de forma instantánea y no consuma recursos de red.
* **Estilos:** Se utilizará PrimeFlex para organizar los textos, iconos (`PrimeIcons`) y divisores, manteniendo una lectura limpia y amigable sin recurrir a CSS externo.

---

### 🤖 Prompt para la IA generadora de código (Fase Final)

Guarda este texto para pegarlo en tu CLI cuando el resto de la aplicación esté 100% terminada y funcionando:

> **Rol y Contexto:**
> Eres un desarrollador Senior en React y PrimeReact. El desarrollo del ERP educativo ha finalizado. Trabajas con componentes funcionales y PrimeFlex (no usamos Tailwind).
> **Tarea:**
> Implementa el "Caso de Uso 31: Centro de Ayuda". Es una página estática de documentación interna para el docente.
> **Requisitos Técnicos (`src/pages/AyudaPagina.jsx`):**
> 1. Crea un layout estructurado con un `TabView` de PrimeReact que contenga dos pestañas: "Guía de Inicio" y "Preguntas Frecuentes".
> 2. **Pestaña Guía de Inicio:** Implementa un `Timeline` vertical que explique los 5 pasos obligatorios para configurar un curso desde cero (1. Curso y Calendario, 2. Módulos y RAs, 3. Horarios, 4. Temporización Automática, 5. Discentes). Usa iconos representativos de `PrimeIcons` para cada paso. Añade botones en cada paso que usen `useNavigate` de `react-router-dom` para llevar al usuario directamente a la sección correspondiente de la app.
> 3. **Pestaña Preguntas Frecuentes:** Implementa un `Accordion` con al menos tres paneles explicativos redactados de forma clara: "Cálculo de calificaciones criteriales", "Uso del cuaderno del profesor" y "Exportación a ITACA/Aules".
> 4. Asegúrate de aplicar un diseño limpio usando exclusivamente las clases de PrimeFlex (`flex`, `flex-column`, `gap-3`, `text-color-secondary`, etc.).
> 
> 
> Entrégame el componente visual completo.

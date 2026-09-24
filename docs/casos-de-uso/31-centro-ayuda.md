### Caso de Uso 31: Centro de Ayuda y Guía de Onboarding

**1. Objetivo**
Proporcionar al usuario un manual integrado en la aplicación que explique el flujo exacto de configuración inicial (Onboarding) y resuelva dudas sobre el funcionamiento de los módulos más complejos (como el asistente de temporización o el cálculo de notas criteriales).

**2. Interfaz de Usuario y Flujo (UI/UX)**
* **Navegación:** Nueva entrada principal en el menú lateral denominada `Ayuda`, apuntando a la ruta `/ayuda` (`src/pages/AyudaPagina.jsx`).
* **Layout Principal:** Un componente `TabView` de PrimeReact para separar la guía paso a paso del manual de referencia.
* **Pestaña 1: "Guía de Inicio (Paso a Paso)"**
* Utilizará un componente `Timeline` o `Stepper` vertical de PrimeReact para ilustrar el "Camino Feliz" de configuración a principio de curso.
* *Paso 1:* Crear la Clase (que estará ligada a un módulo y un curso académico).
* *Paso 2:* Crear el Calendario Escolar (Días lectivos).
* *Paso 3:* Asignar los pesos de los Resultados de Aprendizaje (RA).
* *Paso 4:* Definir el Horario del grupo y del docente.
* *Paso 5:* Diseñar las Unidades de Trabajo.
* *Paso 6:* Crear la temporización con el Asistente de Temporización.
* *Paso 7:* Matricular Discentes.

* **Pestaña 2: "Manual de Módulos Complejos"**
* Un componente `Accordion` de PrimeReact donde cada panel explica un concepto técnico (ej. "¿Cómo calcula el sistema la nota final de un alumno?", "¿Cómo exportar a ITACA correctamente?") y otras cuestiones que creas que son complicadas y debn estar aquí.

**3. Arquitectura y Datos**
* **Carga de Datos:** A diferencia del resto de la aplicación, esta vista será **completamente estática**. No requerirá llamadas al Custom Hook `useDatos` ni conexión a Supabase, lo que garantiza que cargue de forma instantánea y no consuma recursos de red.
* **Estilos:** Se utilizará PrimeFlex para organizar los textos, iconos (`PrimeIcons`) y divisores, manteniendo una lectura limpia y amigable sin recurrir a CSS externo.

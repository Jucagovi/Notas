# 📅 Caso de uso 29: Calendario Escolar (Fechas y Festivos)

## 1. Objetivo

Establecer el marco temporal anual del curso académico. Consiste en definir la fecha oficial de inicio y fin de las clases, e identificar todos los días no lectivos (fines de semana, festivos nacionales, autonómicos, locales y días de libre disposición del centro) que el motor de temporización debe ignorar al calcular el reparto de sesiones.

## 2. Cambios en la Base de Datos (Esquema Supabase ya implementados)

Para soportar esta funcionalidad manteniendo la normalización y facilitando las consultas de fechas, es necesario realizar dos ajustes en la base de datos:

* **Modificación en la tabla `Cursos`:**
* Añadir el campo `fecha_inicio` (tipo `DATE`).
* Añadir el campo `fecha_fin` (tipo `DATE`).


* **Nueva tabla `Dias_No_Lectivos`:**
* `id_dia` (UUID, Primary Key, gen_random_uuid()).
* `id_curso` (UUID, Foreign Key referenciando a `Cursos`, ON DELETE CASCADE).
* `fecha` (DATE, not null).
* `descripcion` (VARCHAR, opcional, ej. "Fallas", "Puente Constitución").
* *Restricción (Unique):* Un mismo curso no puede tener la misma fecha repetida.



## 3. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** Nueva entrada en el menú `Herramientas` denominada `Calendario Escolar`, que conducirá a la página `src/pages/CalendarioEscolarPagina.jsx`.
* **Configuración General (Cabecera):**
* Selector de Curso (`Dropdown` autoseleccionado al curso actual).
* Dos selectores de fecha (`Calendar` de PrimeReact) para establecer la `fecha_inicio` y `fecha_fin` del curso lectivo.


* **Selector de Festivos (Principal):**
* Un componente `Calendar` de PrimeReact configurado en modo en línea (`inline`), con selección múltiple (`selectionMode="multiple"`) y que muestre varios meses a la vez (ej. `numberOfMonths={3}`).
* El componente debe renderizar los fines de semana (sábados y domingos) en un color gris/inactivo por defecto.
* Al hacer clic en un día laborable, se marcará en rojo (festivo). Al volver a hacer clic, se desmarcará.


* **Panel de Detalles (Opcional):** Una pequeña lista o `DataTable` lateral mostrando las fechas marcadas con un `InputText` al lado por si el docente quiere añadir la descripción del festivo.
* **Acción:** Botón "Guardar Calendario" para consolidar los cambios en la base de datos.

## 4. Obtención de Datos y Arquitectura

* **Custom Hook:** Se creará `src/hooks/useCalendarioEscolar.js` consumiendo el hook base `useDatos`.
* **Lógica de Sincronización:**
* Al cargar la vista, el hook extraerá las fechas de inicio/fin del curso y el array de fechas de la tabla `Dias_No_Lectivos`, pasándoselas al componente `Calendar` como su estado inicial.
* Al guardar, realizará un `UPDATE` en la tabla `Cursos` y una transacción de borrado e inserción múltiple (`DELETE` de los días anteriores de ese curso + masivo `INSERT` de los nuevos días seleccionados) en `Dias_No_Lectivos`.



---

### 🤖 Prompt para la IA generadora de código

Copia y pega este texto cuando quieras implementar esta funcionalidad:

> **Rol y Contexto:**
> Eres un desarrollador Senior en React, PrimeReact y Supabase. Trabajamos con el patrón Maestro-Detalle, Custom Hooks (`useDatos`) y TailwindCSS.
> **Tarea:**
> Implementa el "Caso de Uso 29: Calendario Escolar". Es un gestor para definir las fechas de inicio/fin de un curso y marcar los días festivos en un calendario interactivo.
> **Requisitos Técnicos:**
> 1. **Base de Datos (Scripts SQL):** Proporciona primero el código SQL para añadir los campos `fecha_inicio` y `fecha_fin` a la tabla `Cursos`, y para crear la tabla `Dias_No_Lectivos` (`id_dia`, `id_curso`, `fecha`, `descripcion`) con las políticas RLS correspondientes.
> 2. **Custom Hook (`src/hooks/useCalendarioEscolar.js`):** Crea un hook que consulte y actualice estos datos. Debe tener una función para guardar que haga un UPDATE en `Cursos` y reemplace (borrar e insertar) los registros correspondientes en `Dias_No_Lectivos`.
> 3. **Componente UI (`src/pages/CalendarioEscolarPagina.jsx`):**
> * Crea una cabecera con el selector de Curso actual y dos `Calendar` (PrimeReact) para el inicio y fin del curso.
> * Implementa un `Calendar` de PrimeReact en modo `inline` y `selectionMode="multiple"` para seleccionar los festivos.
> * Utiliza la propiedad `dateTemplate` del Calendar para pintar de color rojo los días seleccionados como festivos y de gris los fines de semana.
> 
> 
> 4. Entrégame el script SQL, el Custom Hook y el componente visual con un diseño limpio basado en Tailwind.
> 
> 

Tener la base de datos alineada con estas necesidades de fechas hará que las consultas posteriores sean mucho más ligeras. ¿Revisamos ahora el Caso 30 sobre los horarios y la disponibilidad del aula, o hay algo del calendario escolar que prefieras ajustar?
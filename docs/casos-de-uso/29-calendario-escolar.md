# Caso de uso 29: Calendario Escolar (Fechas y Festivos)

## 1. Objetivo

Establecer el marco temporal anual del curso académico. Consiste en definir la fecha oficial de inicio y fin de las clases, e identificar todos los días no lectivos (fines de semana, festivos nacionales, autonómicos, locales y días de libre disposición del centro) que el motor de temporización debe ignorar al calcular el reparto de sesiones.

## 2. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** Nueva entrada en el menú `Herramientas` denominada `Calendario Escolar`, que conducirá a la página `src/pages/CalendarioEscolarPagina.jsx`.
* **Configuración General (Cabecera):**
* Selector de Curso (`Dropdown` autoseleccionado al curso actual).
* Dos selectores de fecha para establecer la `fecha_inicio` y `fecha_fin` del curso lectivo.

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

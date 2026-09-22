# Caso de Uso 18: Temporización de Unidades de Trabajo

## 1. Objetivo

Implementar un sistema interactivo para planificar y hacer el seguimiento temporal de las Unidades de Trabajo (UT) de un módulo durante un curso académico. El sistema permitirá comparar la planificación prevista con la ejecución real e introducir variaciones específicas del curso (orden y nombre alternativo).

## 2. Modelo de Datos

La funcionalidad se apoya en las siguientes estructuras de la base de datos:

* La tabla `Unidades_Trabajo` almacena el currículo base con su `id_ut`, `numero` y `nombre`.
* La tabla `Temporizacion` registra la planificación específica vinculando `id_ut` e `id_curso`.
* Los hitos temporales se gestionan mediante los campos `fecha_ini_prevista`, `fecha_fin_prevista`, `fecha_ini_real` y `fecha_fin_real` de la tabla `Temporizacion`.
* Las modificaciones específicas del curso académico se almacenan en los campos opcionales `orden` y `nombre_alternativo`.
* El campo `estado` (con valor por defecto 'Pendiente') permite filtrar el progreso actual.

## 3. Interfaz de Usuario (UI)

Toda la interfaz debe construirse utilizando componentes de PrimeReact con el tema Nano.

* Crea una nueva entrada en el menú lateral de la izquierda con el nombre `Planificación` que tendrá un submenú (no lleva a ninguna página).
* Mueve la entrada `Unidades de trabajo` como submenú de esa nueva entrada `Planificación`.
* crea una nueva entrada como submenú en `Planificación` con el nombre `Temporización` que conducirá a una nueva página en src/pages/TemporizacionPagina.jsx.
* **Tabla de Planificación:** Se utilizará un componente `DataTable` de PrimeReact para listar las unidades.
* **Gestor de Fechas:** Para la edición de `fecha_ini_prevista`, `fecha_fin_prevista`, `fecha_ini_real` y `fecha_fin_real`, se implementará el componente `Calendar` de PrimeReact en su modo de selección de rango o fecha única.
* **Reordenación de Unidades:** Para modificar el campo `orden`, se implementará la librería `swapy` para permitir interacciones fluidas de arrastrar y soltar (Drag & Drop) sobre las filas de la tabla.
* **Selector de Estado:** Se utilizará un `Dropdown` de PrimeReact para actualizar el campo `estado` entre sus posibles valores.

## 4. Arquitectura y Lógica de Negocio

* **Gestión de Estado:** Se creará un *Custom Hook* llamado `useTemporizacion.js`.
* **Acceso a Datos:** Este hook no accederá directamente a los servicios, sino que consumirá el hook genérico `useDatos` para aislar la lógica de Supabase.
* **Componentes:** El componente visual principal se nombrará en PascalCase, por ejemplo, `GestorTemporizacion.jsx`, y se exportará en la última línea del archivo.
* **Manejo de Errores:** Las respuestas fallidas al actualizar fechas o estados no utilizarán bloques `try/catch` vacíos, devolviendo siempre una estructura HTTP estándar al frontend.
* **Comentarios:** El código incluirá comentarios redactados en forma impersonal (ej. "se actualizan las fechas previstas.") terminados siempre en un punto.

## Propuesta

# 📅 Caso de uso 19: Temporización y Seguimiento de Unidades de Trabajo

## 1. Objetivo

Implementar un sistema interactivo para planificar y hacer el seguimiento temporal de las Unidades de Trabajo (UT) de un módulo durante un curso académico. El sistema permitirá al docente comparar la planificación prevista con la ejecución real, alterar el orden de impartición e introducir variaciones específicas para ese año (como nombres alternativos).

## 2. Interfaz de Usuario y Navegación (UI/UX)

* **Reestructuración del Menú Principal:**
  * Crear una nueva categoría/menú desplegable en la barra lateral izquierda llamada `Planificación` (sin enlace directo).
  * Mover la entrada actual `Unidades de trabajo` (Caso de Uso 18) para que sea el primer submenú de `Planificación`.
  * Crear un segundo submenú denominado `Temporización`, que conducirá a la nueva página `src/pages/TemporizacionPagina.jsx`.
* **Tabla de Planificación (Main):**
  * Se utilizará un componente `DataTable` de PrimeReact para listar las unidades del módulo seleccionado en el curso actual.
  * **Reordenación Nativa:** Para modificar el campo `orden`, se utilizará la funcionalidad nativa `RowReorder` del `DataTable` de PrimeReact (evitando `swapy` en este contexto para no romper el DOM tabular). Al soltar la fila, se actualizará el orden numérico en la base de datos.
* **Gestor de Fechas e Hitos:**
  * Para la edición en línea de `fecha_ini_prevista`, `fecha_fin_prevista`, `fecha_ini_real` y `fecha_fin_real`, se implementará el componente `Calendar` (o `DatePicker`) de PrimeReact.
* **Selector de Estado:** Se utilizará un `Dropdown` de PrimeReact dentro de la celda para actualizar el campo `estado` (ej. 'Pendiente', 'En Curso', 'Completada').

## 3. Modelo de Datos y Reglas de Negocio

* La tabla `Unidades_Trabajo` almacena el currículo base (`id_ut`, `numero`, `nombre`).
* La tabla `Temporizacion` registra la instancia temporal vinculando el `id_ut` con el `id_curso`.
* **Sincronización:** Cuando el usuario reordene las filas mediante el *Drag & Drop* nativo de la tabla, el frontend debe recalcular el campo `orden` de todas las filas afectadas y enviar un `UPSERT` masivo o múltiples actualizaciones a la tabla `Temporizacion`.

## 4. Obtención de Datos y Arquitectura

* **Custom Hook:** La lógica de estado y llamadas a la API se aislará en el Custom Hook `src/hooks/useTemporizacion.js`.
* **Acceso a Datos:** Este hook consumirá el hook genérico `useDatos` para asegurar que las peticiones a Supabase pasen por la capa segura de la arquitectura.
* **Manejo de Errores Estricto:** Si falla la actualización de fechas, orden o estado, la función no debe usar un bloque `try/catch` vacío o silencioso. Debe devolver o propagar un objeto estructurado (`{ error: "Mensaje", status: 400 }`) para que la interfaz lance el `Toast` correspondiente.
* **Componentización y Estilo:**
  * El componente visual principal se nombrará `GestorTemporizacion.jsx` (formato *PascalCase*) y su `export default` se colocará en la última línea del archivo.
  * El código incluirá comentarios redactados en forma impersonal (ej. "Se actualizan las fechas previstas del curso.") terminados siempre en un punto.

# Caso de uso 19: Temporización y Seguimiento de Unidades de Trabajo

## 1. Objetivo

Implementar un sistema interactivo para planificar y hacer el seguimiento temporal de las Unidades de Trabajo (UT) de un módulo durante un curso académico. El sistema permitirá al docente comparar la planificación prevista con la ejecución real, alterar el orden de impartición e introducir variaciones específicas para ese año (como nombres alternativos).

## 2. Interfaz de Usuario y Navegación (UI/UX)

* **Posición en Menú Principal:** crear un submenú denominado `Temporización`, que conducirá a la nueva página `src/pages/TemporizacionPagina.jsx`.
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

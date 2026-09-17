# Caso de Uso 18: Temporización de Unidades de Trabajo

## 1. Objetivo

Implementar un sistema interactivo para planificar y hacer el seguimiento temporal de las Unidades de Trabajo (UT) de un módulo durante un curso académico. El sistema permitirá comparar la planificación prevista con la ejecución real e introducir variaciones específicas del curso (orden y nombre alternativo).

## 2. Modelo de Datos

La funcionalidad se apoya en las siguientes estructuras de la base de datos:

* La tabla `Unidades_Trabajo` almacena el currículo base con su `id_ut`, `numero` y `nombre`[cite: 2].
* La tabla `Temporizacion` registra la planificación específica vinculando `id_ut` e `id_curso`[cite: 2].
* Los hitos temporales se gestionan mediante los campos `fecha_ini_prevista`, `fecha_fin_prevista`, `fecha_ini_real` y `fecha_fin_real` de la tabla `Temporizacion`[cite: 2].
* Las modificaciones específicas del curso académico se almacenan en los campos opcionales `orden` y `nombre_alternativo`[cite: 2].
* El campo `estado` (con valor por defecto 'Pendiente') permite filtrar el progreso actual[cite: 2].

## 3. Interfaz de Usuario (UI)

Toda la interfaz debe construirse utilizando componentes de PrimeReact con el tema Nano[cite: 3].

* **Tabla de Planificación:** Se utilizará un componente `DataTable` de PrimeReact para listar las unidades[cite: 3].
* **Gestor de Fechas:** Para la edición de `fecha_ini_prevista`, `fecha_fin_prevista`, `fecha_ini_real` y `fecha_fin_real`[cite: 2], se implementará el componente `Calendar` de PrimeReact en su modo de selección de rango o fecha única.
* **Reordenación de Unidades:** Para modificar el campo `orden`[cite: 2], se implementará la librería `swapy` para permitir interacciones fluidas de arrastrar y soltar (Drag & Drop) sobre las filas de la tabla[cite: 3].
* **Selector de Estado:** Se utilizará un `Dropdown` de PrimeReact para actualizar el campo `estado` entre sus posibles valores[cite: 2].

## 4. Arquitectura y Lógica de Negocio

* **Gestión de Estado:** Se creará un *Custom Hook* llamado `useTemporizacion.js`[cite: 3].
* **Acceso a Datos:** Este hook no accederá directamente a los servicios, sino que consumirá el hook genérico `useDatos` para aislar la lógica de Supabase[cite: 3].
* **Componentes:** El componente visual principal se nombrará en PascalCase, por ejemplo, `GestorTemporizacion.jsx`, y se exportará en la última línea del archivo[cite: 3].
* **Manejo de Errores:** Las respuestas fallidas al actualizar fechas o estados no utilizarán bloques `try/catch` vacíos, devolviendo siempre una estructura HTTP estándar al frontend[cite: 3].
* **Comentarios:** El código incluirá comentarios redactados en forma impersonal (ej. "se actualizan las fechas previstas.") terminados siempre en un punto[cite: 3].


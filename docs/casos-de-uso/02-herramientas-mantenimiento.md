# Caso de uso 02: Herramientas de Mantenimiento (CRUD de Tablas)

## 1. Objetivo
Proporcionar al docente/administrador un panel de control técnico para el mantenimiento directo (CRUD) de las tablas maestras de la base de datos (`Ciclos`, `Cursos`, `Modulos`, `Unidades_Trabajo`, `RA`, `CE`, `Practicas`, `Discentes`, `Evaluaciones`, `Sesiones`). Se incluirá una sección protegida para auditar y gestionar excepcionalmente las tablas de relación o "sensibles" (`desarrollan`, `Versiones`, `Temporizacion`, `ra_curso`, `ce_curso`, `trabajan`, `imparte`, `evaluan`, `Festivos`, `Horarios`).

## 2. Lógica de Interfaz y Flujo (UI/UX)
En el menú de navegación principal se habilitará:

* **"Herramientas > Mantenimiento Maestros":** Submenú con una entrada por cada tabla principal [Ej. "Gestión de Ciclos", "Gestión de Módulos"](cite: 4).
* **"Herramientas > Tablas de Relación":** Submenú con advertencias visuales (iconos de alerta) para auditar las tablas sensibles.

## 3. Reglas de Negocio y Visualización

* **Componente Base:** Cada página renderizará un `DataTable` de PrimeReact con paginación, ordenación y filtrado básico.
* **Operaciones CRUD:**
  * Se habilitará un botón para "Nuevo Registro" que abrirá un `Dialog` (modal) con el formulario correspondiente.
  * Cada fila tendrá acciones de "Editar" (abre el modal) y "Eliminar".
  * **Obligatorio:** Toda eliminación o edición crítica debe requerir confirmación mediante el componente `ConfirmDialog` de PrimeReact.
* **Control de Desbordamiento:** Las celdas de las tablas deben mostrar la información en una sola línea. Si el texto (como descripciones largas) provoca desbordamiento, se truncará con puntos suspensivos (`text-overflow: ellipsis`) y se utilizará el componente `Tooltip` de PrimeReact para mostrar el texto completo al pasar el ratón por encima.
* **Sistema Global de Notificaciones:** El resultado de cualquier operación (éxito o error HTTP) debe informarse visualmente mediante el componente `Toast` de PrimeReact.

## 4. Obtención de Datos y Arquitectura de Estados

* **Estado Global (Toasts):** Se creará un contexto global (`ToastContext`) y un hook genérico (`useGlobalToast`) que envuelva el componente `Toast` de PrimeReact en la raíz de la aplicación, permitiendo invocar notificaciones desde cualquier rincón del sistema sin *prop drilling*.
* **Estado de Datos (Evitar Context Hell):** NO se crearán contextos para los datos de las tablas. La lógica se aislará en Custom Hooks individuales (ej. `useCiclos`, `useCursos`) que consumirán al hook genérico `useDatos`.
* Cada página de mantenimiento invocará exclusivamente a su hook correspondiente, manteniendo el estado de los datos acotado a la vista activa para maximizar el rendimiento.

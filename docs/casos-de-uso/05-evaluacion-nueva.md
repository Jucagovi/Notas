# Caso de uso 05: Creación y Configuración de Evaluaciones

## 1. Objetivo

Crear una sección para asignar Versiones a una evaluación concreta. El docente asignará manualmente las prácticas y exámenes a cada evaluación seleccionándolas desde una "Bandeja de Pendientes" (prácticas que aún no pertenecen a ninguna evaluación), permitiendo al sistema calcular qué Resultados de Aprendizaje (RA) se cubren en dicho periodo.

## 2. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** Entrada en el menú `Evaluación` denominada `Gestión de Evaluaciones`.
* **Layout Principal:**
  * Uso del `<SelectorCurso>` para elegir la clase.
  * Un `DataTable` que lista las evaluaciones creadas para ese curso.
* **Flujo de Creación/Edición (Dialog):**
  * Campo de texto para el nombre: "1ª Evaluación".
  * **Asignación Manual (Bandeja de Pendientes):** Un componente `PickList` o una lista con *checkboxes*. En un lado/lista aparecen todas las `Versiones` (prácticas/exámenes) de ese curso que **no han sido asignadas a ninguna evaluación todavía**. El docente simplemente marca las que quiere incluir.
  * **Panel de Resumen Curricular:** Un componente visual que lee los CEs mapeados de las prácticas seleccionadas e informa en tiempo real: *"Esta evaluación cubrirá el RA1 (100%), RA2 (45%) y RA3 (20%)"*.

## 3. Obtención de Datos y Arquitectura

* **Custom Hook:** `useEvaluaciones` gestionará el CRUD en la tabla `Evaluaciones`.
* **Lógica de la Bandeja de Pendientes:** Para poblar la lista de selección, el hook consultará la tabla de `Versiones` filtrando por el curso actual y excluyendo aquellas cuyo ID ya exista en la tabla intermedia `evalua`.
* **Guardado (Cascade):** Al guardar, el hook actualizará la tabla `evalua` vinculando el ID de la Evaluación con los IDs de las `Versiones` que el docente ha metido en la caja.
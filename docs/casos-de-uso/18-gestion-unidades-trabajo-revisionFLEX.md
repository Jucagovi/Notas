# 18-gestion-unidades-trabajo-revisionFLEX.md

## 1. Objetivo de la Revisión (Entrelazado de UTs)
Adaptar el gestor de Unidades de Trabajo para que, cuando un docente seleccione un "Módulo Principal" (aquel que tiene módulos delegados), la interfaz permita visualizar y reordenar las UTs de todos los módulos implicados en una única secuencia cronológica global.

## 2. Cambios en Interfaz de Usuario (UI/UX)
* **Vista Combinada:** 
  * Al usar el `<SelectorModulo>` para elegir el módulo principal, el `DataTable` (o lista drag & drop) mostrará tanto las UTs del módulo principal como las de sus módulos delegados.
  * Para evitar confusión visual, cada fila incluirá un `<Badge>` o etiqueta de color indicando a qué módulo real pertenece esa UT (ej. [DGPP] UT01, [D2D3D] UT01, [D2D3D] UT02, [DGPP] UT02).
* **Reordenación Global:** El usuario podrá arrastrar y soltar libremente las UTs mezclando los módulos para establecer el orden real de impartición en el aula.

## 3. Cambios en Base de Datos y Arquitectura
* **Tabla `Unidades_Trabajo`:** Se añade la columna `orden_imparticion` (Entero).
* **Lógica del Hook (`useUnidadesTrabajo`):**
  * **Fetch:** Si el módulo seleccionado tiene módulos hijos asociados en la tabla `Modulos`, la consulta a Supabase traerá las UTs de todos ellos.
  * **Save:** Al hacer drag & drop, el hook actualizará la columna `orden_imparticion` de todas las UTs afectadas simultáneamente, creando una única secuencia numérica que el motor de temporización podrá seguir.
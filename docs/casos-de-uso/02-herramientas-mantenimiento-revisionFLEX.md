# 02-herramientas-mantenimiento-revisionFLEX.md

## 1. Objetivo de la Revisión (Módulos Flexibilizados)
Ampliar el CRUD de mantenimiento de la entidad `Modulos` para soportar el patrón de "Delegación Temporal". Esto permite que dos o más módulos mantengan su independencia en contenidos y evaluación (RAs, CEs), pero compartan una única línea de tiempo y bolsa de horas para su impartición (ej. DGPP y D2D3D).

## 2. Cambios en Interfaz de Usuario (UI/UX)
* **Formulario de Módulo (Dialog):**
  * Se añade un `InputSwitch` con la etiqueta: *"Flexibilizar temporización (Delegar en otro módulo)"*.
  * Si el usuario activa el interruptor, se despliega condicionalmente un `<SelectorModulo>` que permite elegir el "Módulo Principal" (ej. DGPP). 
  * Se mostrará un pequeño texto de ayuda: *"Este módulo usará las horas semanales y el calendario del módulo seleccionado. Sus Unidades de Trabajo se intercalarán en la misma programación."*

## 3. Cambios en Base de Datos y Arquitectura
* **Tabla `Modulos`:** Se añade la columna `id_modulo_temporizacion` (UUID, Clave foránea que apunta a la propia tabla `Modulos`, `NULL` por defecto).
* **Lógica del Hook:** Al guardar un módulo como principal, este campo será `null`. Al guardar el módulo secundario (D2D3D), este campo almacenará el ID del módulo principal (DGPP).
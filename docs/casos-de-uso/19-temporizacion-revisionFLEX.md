# 19-temporizacion-revisionFLEX.md

## 1. Objetivo de la Revisión (Bolsa de Horas Combinada)
Modificar el motor matemático del asistente de temporización para que sea capaz de procesar módulos flexibilizados, sumando sus horas de clase semanales y consumiendo la lista entrelazada de Unidades de Trabajo sin interrupciones.

## 2. Cambios en la Lógica y Motor Matemático (Sin cambios UI)
* **Paso 1: Agrupación de Horas (Pool Semanal):**
  * El hook `useTemporizacion` cruzará el horario (Caso 30). Si detecta que está calculando la temporización de un módulo principal, buscará también las horas asignadas en el horario a sus módulos delegados.
  * *Ejemplo:* Si DGPP tiene 4 horas/semana y D2D3D tiene 3 horas/semana, el motor fusionará ambas en una única bolsa de **7 horas semanales** disponibles para ese "bloque flexibilizado".
* **Paso 2: Consumo de Secuencia:**
  * El algoritmo ordenará todas las UTs del bloque basándose estrictamente en el campo `orden_imparticion` (creado en la revisión del Caso 18).
  * Repartirá las 7 horas semanales descontando los festivos globales del Calendario Escolar (Caso 29), fluyendo de una UT a la siguiente independientemente de a qué módulo pertenezca la UT en curso, generando las fechas de inicio y fin exactas para el sándwich de contenidos.
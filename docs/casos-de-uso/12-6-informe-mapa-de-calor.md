# Caso de uso 12.6: Mapa de Calor Curricular (Heatmap de Puntos Ciegos)

## 1. Objetivo

Proporcionar al docente una matriz visual de alto contraste que cruce a todos los discentes matriculados con los Resultados de Aprendizaje (RA) o Criterios de Evaluación (CE) del módulo. El propósito es detectar instantáneamente anomalías individuales (alumnos que fracasan en todas las áreas) y anomalías pedagógicas (columnas enteras suspendidas, lo que indica que un concepto no se ha asimilado correctamente en clase).

## 2. Interfaz de Usuario y Flujo (UI/UX)

* **Nueva entrada en el menú:** Habilitar un submenú final en la sección `Informes` con el nombre `Mapa de Calor`, que conducirá a la nueva página `src/pages/informes/InformeMapaCalor.jsx`.
* **Filtros Contextuales (Header):**
* **Cambio de enfoque:** los cursos ahora son tratados como clases conceptualmente. Esto no representa ningún cambio arquitectónico, solo de concepto. Cambia todas las referencias a `Curso` por las de `Clase` en los textos de este caso de uso.
* **Filtros Contextuales:** componentes `Dropdown` (PrimeReact) para elegir `Año académico` (obtenida de la tabla cursos y mostrada coo 2026/2027 para el año 2026) que filtrará los Cursos/Clases de ese año académico (la clase ya lleva asociado un módulo). El Dropdown de `Año académico` seleccionará el año más reciente por defecto; el de Curso/Clase.
  * *Nota de ordenación:* El Dropdown de Cursos debe listar los registros ordenados del más reciente al más antiguo.
  * Solo se habilitará el siguiente Dropdown cuando el usuario seleccione un valor en el anterior.
* Un componente `SelectButton` o `ToggleButton` de PrimeReact para alternar el nivel de detalle de las columnas: "Vista por RA" (resumen) o "Vista por CE" (análisis microscópico).

* **Visualización de la Matriz (Main):**
* Un `DataTable` de PrimeReact configurado con alta densidad de datos (propiedad `size="small"`).
* **Eje Y (Filas):** Nombre y apellidos de los discentes (columna fijada a la izquierda mediante `frozen`).
* **Eje X (Columnas dinámicas):** Los códigos cortos de los RA (ej. RA1, RA2) o de los CE (ej. 1.a, 1.b) generados dinámicamente según el Toggle superior.


* **Renderizado de Celdas (Regla Estricta):**
* La celda completa debe adoptar como color de fondo el resultado del helper `getColorNota(nota)` (`src/utils/coloresNota.js`).
* El valor numérico de la nota (0-100) se mostrará centrado con una tipografía pequeña y de alto contraste (blanco/negro dependiendo de la oscuridad del fondo). Si no hay datos, mostrar celda en blanco o gris claro.

## 3. Lógica de Análisis Visual

* **Alerta Individual (Lectura Horizontal):** Si una fila completa tiende al rojo o naranja, el discente está en riesgo crítico generalizado.
* **Alerta Pedagógica (Lectura Vertical):** Si una columna completa tiende al rojo, el sistema evidencia un "Punto Ciego Pedagógico". El docente sabrá inmediatamente que la actividad que evaluaba ese CE/RA fue demasiado difícil, o que la explicación en clase no fue suficiente y requiere un repaso.

## 4. Obtención de Datos y Arquitectura

* **Custom Hook:** La lógica se aislará en el hook `src/hooks/useMapaCalor.js`, consumiendo `useDatos` para interactuar de forma segura con la API.
* **Procesamiento de la Matriz:**
* Al igual que en el radar de competencias, transformar el cruce de calificaciones (`evaluan`), actividades (`Versiones`), ponderaciones (`trabajan`) y criterios (`CE`/`RA`) en una matriz plana es muy costoso para el navegador.
* Se requiere la implementación de una función RPC en Supabase (ej. `obtener_matriz_calor(id_curso, id_modulo, nivel_detalle)`) que devuelva el array estructurado directamente.
* El frontend solo iterará sobre el JSON devuelto para construir las columnas dinámicas del `DataTable`.

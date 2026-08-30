# Caso de uso: análisis de dificultad (Histograma)

## 1. Objetivo

Analizar la distribución de las calificaciones de una práctica específica para evaluar su nivel de dificultad y detectar posibles anomalías pedagógicas mediante un histograma de frecuencias.

## 2. Interfaz de Usuario (UI)

- **Nueva entrada en el menú:** habilita una nueva entrada en el menú `Informes` en forma de submenú con el nombre `Análisis dificultad` que conducirá a la página `src/pages/informes/InformeDificultad.jsx`. Debes crear esa paǵina.
- **Selector Principal:** `Dropdown` (PrimeReact) para elegir la Práctica (idealmente filtrada previamente por Curso/Módulo para no tener una lista infinita). Sólo el <DropDown> de Cursos tendrá selección al inicio y será el curso más reciente. El resto de <DropDown> esperarán la intervención del usuario.
- Panel de Resumen (Grid superior):** Tres componentes `Card` de PrimeReact:
  1. **Nota Media:** Mostrando la media aritmética de todas las notas entregadas.
  2. **Tasa de Aprobados:** Porcentaje de discentes con nota >= 5.00.
  3. **Diagnóstico Automático:** Mostrará un texto basado en la media (Ej. "Muy Fácil" si media > 8, "Adecuada" si 5-7.99, "Difícil" si < 5).
- **Visualización Central (Gráfico):**
  - Componente `Chart` de PrimeReact (tipo 'bar').
  - **Eje X (Rango de Notas):** '0-10', '11-20', '21-30', '31-40', '41-50' y así sucesivamente hasta '91-100'.
  - **Eje Y:** Número absoluto de alumnos que ha realizado la práctica.
  - El color de cada barra debe coincidir con la escala de colores centralizada en `src/utils/gradeColors.js`.

## 3. Lógica de Datos y Agrupación (Frontend)

- Se obtendrán todas las notas de la tabla `evaluan` para la práctica seleccionada (excluyendo notas nulas).
- La lógica de React debe iterar sobre las notas y contarlas (agruparlas) dentro de los rangos (bins) mencionados para alimentar el gráfico.

## 4. Obtención de Datos y Servicios

- Añadir la función `getDistribucionNotas(practicaId)` en `src/services/informesService.js`.
- Esta consulta solo necesita extraer un array con los valores numéricos del campo `nota` de la tabla `evaluan` donde el `id_practica` coincida.

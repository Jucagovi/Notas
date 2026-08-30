# 🧑‍🎓 Caso de uso: ficha Completa e informe del discente

## 1. Objetivo

Mostrar un informe integral 360º del rendimiento de un estudiante. Permite visualizar su progreso histórico, desglosado por cursos, módulos y evaluaciones, con capacidad para modificar notas al vuelo.

## 2. Flujo de Navegación y UI Base

- **Vista Principal:** Un `DataTable` de PrimeReact con el listado de `Discentes` (con buscador integrado). Al hacer clic en una fila, se navega al detalle del alumno.
- **Cabecera de Detalle:** Mostrar la `imagen`, nombre, apellidos y otros datos personales extraídos de la tabla `Discentes`.
- **Selector de Contexto:** Un `Dropdown` para elegir el Curso escolar (imprescindible para alumnos repetidores).

## 3. Desglose de Datos y Edición (Tabs)

- **Navegación por Módulos:** Usar el componente `TabView` de PrimeReact. Cada pestaña representará un registro de la tabla `Modulos` asociado al alumno en el curso seleccionado.
- **Tabla de Evaluaciones:** Dentro de cada pestaña, un `DataTable` agrupado por `Evaluaciones`. Mostrará las prácticas y la `nota` de la tabla `evaluan`.
- **Visualización de Notas (Regla estricta):** Si la nota es nula, renderizar el carácter `?` (alineado al centro).
- **Edición en línea (In-cell Editing):** El `DataTable` debe permitir edición en la propia celda (usando la propiedad `cellEdit` de PrimeReact). Al pulsar "Enter", se actualiza la nota en la base de datos automáticamente.

## 4. Visualización Gráfica (Charts)

Incluir dos gráficos (`Chart` de PrimeReact) en la parte inferior o lateral:

- **Gráfico de Líneas:** Evolución temporal de las notas de las prácticas.
- **Gráfico de Barras o Circular:** Agrupación de notas por categorías (Suspensos < 5, Aprobados 5-6, Notables 7-8, Sobresalientes 9-10).

## 5. Servicios (Supabase)

- Crear `src/services/discenteService.js`.
- Función `getHistorialDiscente(discenteId, cursoId)` que haga los cruces (JOINs) necesarios entre `imparte`, `evaluan` y `Practicas` para alimentar las pestañas y los gráficos.

# Caso de Uso 05: Creación y Configuración de Evaluaciones (Bandeja de Pendientes) - Implementación

Se ha implementado el **Caso de Uso 05** adaptándolo al nuevo paradigma de asignación manual mediante **Bandeja de Pendientes (Inbox)** en formato de tarjetas interactivas, cumpliendo con las directrices de `docs/CONVENCIONES.md`, la separación estricta de responsabilidades y las modificaciones solicitadas.

---

## 1. Principales Modificaciones Aplicadas

1. **Eliminación de Creación y Borrado de Evaluaciones**:
   - Se ha retirado el botón «Nueva Evaluación», el diálogo modal de edición y el modal de confirmación de borrado. Las evaluaciones son las 5 reglamentarias establecidas durante la creación del curso.
2. **Orden Reglamentario Estricto**:
   - El orden de las evaluaciones en la tabla siempre es:
     1. **Primera**
     2. **Segunda**
     3. **Tercera**
     4. **Final / Ordinaria**
     5. **Extraordinaria**
3. **Botón de Actualización Optimizado**:
   - Se ha ubicado en la barra superior junto al selector de cursos, con tamaño ampliado y el icono de la flecha (`pi pi-refresh`) centrado horizontal y verticalmente.
4. **Eliminación de la Columna Acciones**:
   - Se ha eliminado la columna «Acciones» completa y todo el código modal asociado.
5. **Nuevo Sistema de Asignación por Tarjetas (Bandeja de Pendientes)**:
   - Situada justo encima del `DataTable` de evaluaciones.
   - Muestra las prácticas huérfanas (sin evaluación) en tarjetas con su nombre, versión y descripción.
   - Cada tarjeta contiene botones sin borde y en color gris (`severity="secondary"`, `text`) con las 5 evaluaciones a las que puede asignarse: **Primera**, **Segunda**, **Tercera**, **Final** y **Extra**.
   - Al pulsar sobre uno de los botones, la práctica se asigna inmediatamente a esa evaluación en la base de datos (desapareciendo de la bandeja superior).
6. **Columna «Prácticas asignadas» mostrada en Filas**:
   - En el `DataTable`, dentro de la columna «Prácticas asignadas», cada práctica se visualiza en su propia fila individual (apiladas verticalmente), mostrando su nombre, tag de versión y el botón de desasignación individual (`pi pi-times`), que la devuelve de inmediato a la bandeja de pendientes.
7. **Eliminación de la Paginación**:
   - El `DataTable` se renderiza sin paginación (`paginator={false}`), mostrando directamente las 5 evaluaciones fijas del curso.

---

## 2. Componentes del Módulo (`src/components/evaluaciones/`)

- [FiltroCursoEvaluaciones.jsx](file:///media/jucagovi/ALMAC%C3%89N/000Código/Git/Notas/src/components/evaluaciones/FiltroCursoEvaluaciones.jsx): Selector de curso mediante `<SelectorCurso>`, badge con contador de prácticas pendientes y botón de actualización centrado y dimensionado.
- [BandejaPendientesTarjetas.jsx](file:///media/jucagovi/ALMAC%C3%89N/000Código/Git/Notas/src/components/evaluaciones/BandejaPendientesTarjetas.jsx): Cuadrícula responsiva de tarjetas interactivas para prácticas pendientes con botones directos para asignarlas a cualquiera de las 5 evaluaciones.
- [TablaEvaluaciones.jsx](file:///media/jucagovi/ALMAC%C3%89N/000Código/Git/Notas/src/components/evaluaciones/TablaEvaluaciones.jsx): Tabla sin paginación con orden reglamentario fijo, columna de «Prácticas asignadas» con botones de desasignación y columna de «Cobertura Curricular (RA)».
- [PanelResumenCurricular.jsx](file:///media/jucagovi/ALMAC%C3%89N/000Código/Git/Notas/src/components/evaluaciones/PanelResumenCurricular.jsx): Módulo visual para la estimación de cobertura formativa.
- [index.js](file:///media/jucagovi/ALMAC%C3%89N/000Código/Git/Notas/src/components/evaluaciones/index.js): Exportación centralizada de subcomponentes.

---

## 3. Lógica y Persistencia

- **Helper** [resumenCurricular.js](file:///media/jucagovi/ALMAC%C3%89N/000Código/Git/Notas/src/utils/resumenCurricular.js): Analiza los CEs mapeados en `trabajan` y calcula el porcentaje de cobertura de cada RA para cada evaluación en tiempo real.
- **Hook** [useEvaluaciones.js](file:///media/jucagovi/ALMAC%C3%89N/000Código/Git/Notas/src/hooks/useEvaluaciones.js):
  - Ordena de forma estricta las 5 evaluaciones (`obtenerOrdenEvaluacion`).
  - Proporciona `asignarPracticaAEvaluacion(idVersion, idEvaluacion)` y `desasignarPracticaDeEvaluacion(idVersion)`.
  - Persiste los cambios tanto en el campo `Versiones.id_evaluacion` como en la tabla intermedia `evalua`.
- **Página Orquestadora** [GestionEvaluacionesPagina.jsx](file:///media/jucagovi/ALMAC%C3%89N/000Código/Git/Notas/src/pages/evaluacion/GestionEvaluacionesPagina.jsx): Orquesta los estados y emite las notificaciones mediante `<Toast>`.

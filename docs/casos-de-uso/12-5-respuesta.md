Se ha completado la implementación del Caso de Uso 12.5: Mapa de Competencias Individual (Gráfico de Radar), respetando rigurosamente las reglas definidas en `CONVENCIONES.md`, el modelo relacional de `ESQUEMA.sql`, el principio de responsabilidad única (SRP) y el cambio de enfoque conceptual a Clases.

A continuación se detalla la arquitectura y los cambios realizados paso a paso:

---

### 1. Cambio de Enfoque Conceptual (Clase en lugar de Curso)

Siguiendo la directriz del proyecto:
• Los cursos son tratados ahora como **Clases** a nivel conceptual y de interfaz visual.
• Se han actualizado todos los textos, etiquetas descriptivas, mensajes de estado vacío y cabeceras de tabla sustituyendo las referencias de "Curso" por "Clase".
• Cada clase lleva asociado intrínsecamente un módulo profesional, permitiendo filtrar directamente los discentes matriculados en dicha impartición.

---

### 2. Filtros Contextuales Jerárquicos en Cascada

Se ha implementado el flujo de selección en tres niveles:
1. **Año Académico**:
   • Obtenido a partir de la tabla `Cursos` mediante el hook `useAniosAcademicos`.
   • Formateado en formato escolar canónico (ej. `2026/2027` para el año 2026).
   • Autoselecciona el año más reciente por defecto al iniciar la vista.
2. **Clase (Curso / Módulo)**:
   • Renderizado con `SelectorClase` de la carpeta `common`.
   • Filtrado por el año académico activo y listando los registros estrictamente ordenados del más reciente al más antiguo.
   • Espera la acción explícita del usuario (sin selección por defecto).
3. **Discente (Alumno)**:
   • Renderizado con `SelectorDiscente` de la carpeta `common`.
   • Deshabilitado hasta que el usuario selecciona una clase.
   • Al elegir una clase, filtra y lista únicamente los discentes matriculados en la misma a través de la tabla `imparte`, ordenados alfabéticamente por apellidos y nombre.

---

### 3. Custom Hooks de Datos

1. **`useFiltrosRadar.js` (`src/hooks/useFiltrosRadar.js`)**:
   • Conecta `useAniosAcademicos` y `useClases(anioSeleccionado)`.
   • Ordena las clases de la más reciente a la más antigua.
   • Consulta en la tabla `imparte` y `Discentes` para cargar el alumnado matriculado en la clase activa.
   • Controla el reseteo en cascada: al cambiar de año académico se anulan la clase y el discente; al cambiar de clase se anula el discente.

2. **`useRadarCompetencias.js` (`src/hooks/useRadarCompetencias.js`)**:
   • Conecta con Supabase mediante `useDatos` eliminando referencias a servicios directos.
   • Estrategia de resiliencia computacional: intenta en primer lugar invocar la función RPC `calcular_notas_ra_discente`; si la función no se encuentra desplegada en la base de datos, ejecuta el cálculo cliente utilizando `useDatos` cruzando `RA`, `CE`, `ce_curso`, `ra_curso`, `Versiones`, `trabajan` y `evaluan`.
   • Calcula métricas agregadas (media competencial ponderada de la clase, RAs superados $\ge 50$, RAs a reforzar $< 50$, porcentaje de cobertura completada).
   • Prepara la estructura de datos consumible por el componente `Chart` tipo radar de PrimeReact.

---

### 4. Componentización Modular

Siguiendo la regla estricta de componentización y el patrón Contenedor-Presentacional:

1. **`FiltrosRadarCompetencias.jsx` (`src/components/radar/FiltrosRadarCompetencias.jsx`)**:
   • Subcomponente presentacional que renderiza los desplegables de Año Académico, Clase y Discente.
   • Aplica la regla de habilitación secuencial (cada selector se activa tras completar el anterior).
   • Botón de refresco integrado para recargar los datos.

2. **`GraficoRadarCompetencias.jsx` (`src/components/GraficoRadarCompetencias.jsx`)**:
   • Componente visual aislado y reutilizable para incrustación directa tanto en el informe de competencias como en la Ficha Completa del Discente (Caso de Uso 07).
   • Renderiza el componente `Chart` de PrimeReact con `type="radar"`.
   • Eje perimetral: códigos de los RAs (`RA 1`, `RA 2`...).
   • Área poligonal: calificación obtenida (0 a 100).
   • Escala cromática centralizada: los puntos del polígono y el área adquieren el color dinámico devuelto por `getColorNota(nota)` (`src/utils/coloresNota.js`).
   • Tooltip interactivo con denominación del RA, calificación numérica, categoría oficial y estado de cobertura.
   • Leyenda inferior con códigos, nombres completos y notas.

3. **`TablaDesgloseRA.jsx` (`src/components/radar/TablaDesgloseRA.jsx`)**:
   • Subcomponente desacoplado que renderiza la tabla de respaldo cuantitativa utilizando el componente genérico `<TablaBase>` de `src/components/common/`.
   • Incluye paginador superior estándar (`5, 10, 15, 20, 25` elementos) y renderizado de texto truncado con tooltip para evitar desbordamientos.
   • Aplica estrictamente la escala cromática oficial con `getColorNota(nota, esOscuro)` (`src/utils/coloresNota.js`) en las celdas de calificación, adaptada tanto a tema claro como oscuro.

4. **`PanelMetricasRadar.jsx` (`src/components/radar/PanelMetricasRadar.jsx`)**:
   • Tarjetas resumen con indicadores rápidos: media competencial ponderada de la clase, RAs superados, RAs a reforzar y porcentaje de cobertura evaluada.

5. **`index.js` (`src/components/radar/index.js`)**:
   • Barril de exportación para la importación limpia y centralizada de subcomponentes.

---

### 5. Página Orquestadora (`InformeCompetencia.jsx`)

• Ubicada en `src/pages/informes/InformeCompetencia.jsx`.
• Actúa como orquestador consumiendo `useFiltrosRadar` y `useRadarCompetencias`.
• Utiliza los componentes base obligatorios de `src/components/common/`: `HeaderPagina`, `EstadoVacio`, `CargadorSeccion` y delega en `TablaBase` a través de `TablaDesgloseRA`.
• Guía paso a paso al usuario informando de la selección requerida en cada estado vacío.
• Muestra secuencialmente las tarjetas de métricas, el gráfico de radar competencial y la tabla de respaldo numérica.

---

### 6. Ajustes de Formato de Resultados de Aprendizaje y Modo Oscuro

1. **Formato Canónico de RA (`formatearNombreRA`)**:
   • Se detectó que el nombre en base de datos almacenaba únicamente el código identificador (ej. `RA1`), lo que provocaba la repetición `RA1: RA1` al mostrar títulos o leyendas.
   • Se ha implementado un normalizador con expresiones regulares en `src/components/GraficoRadarCompetencias.jsx` que extrae la descripción curricular asociada y genera el formato estandarizado `RA1: <Descripción>` (o el nombre descriptivo cuando no existe descripción), evitando prefijos duplicados y títulos redundantes tanto en los tooltips como en la leyenda perimetral inferior.

2. **Adaptabilidad y Legibilidad en Modo Oscuro (`useTema`)**:
   • Integración completa con el hook `useTema` para adaptar dinámicamente la paleta de colores del gráfico de radar y sus elementos textuales.
   • Tipografías de ejes y vértices (`pointLabels`) en blanco de alto contraste (`#ffffff`, 13px, negrita) en modo oscuro.
   • Escala graduada (`ticks`) configurada con `backdropColor: 'transparent'` para evitar recuadros blancos residuales, con tipografía nítida (`#cbd5e1`).
   • Rejilla poligonal concéntrica (`grid`) y radios angulares (`angleLines`) con opacidades calibradas (`rgba(255, 255, 255, 0.16)` y `0.20`).
   • Clave reactiva `key={esOscuro ? 'radar-dark' : 'radar-light'}` en el componente `Chart` para forzar la re-instanciación inmediata del lienzo al conmutar entre modos claro y oscuro.
   • Leyenda perimetral con textos de alto contraste (`#e2e8f0` y `#ffffff`) y fondos de insignia con contraste garantizado en todas las calificaciones.

---

### 7. Menú de Navegación y Enrutamiento

1. **`src/components/layout/menuConfiguracion.js`**:
   • Se ha registrado la entrada `Competencia individual` con icono `pi pi-compass` dentro de `ELEMENTOS_INFORMES` apuntando a `/informes/competencia`.
2. **`src/App.jsx`**:
   • Se ha importado `InformeCompetencia` y registrado la ruta protegida `/informes/competencia`.
   • Se han añadido los alias de conveniencia `/competencia-individual`, `/radar-competencias` e `/informes/competencia-individual`.

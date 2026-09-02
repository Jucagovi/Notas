### Resumen de Cambios Realizados Paso a Paso                                                                          
                                                                                                                         
  #### 1. Servicios de Base de Datos para ra_evaluacion                                                                  
                                                                                                                         
  • En evaluacionService.js (y su puente evaluacionesService.js) se han implementado las funciones CRUD sobre la tabla   
  intermedia ra_evaluacion:                                                                                              
      • evaluacionService.js:713-748: Consulta los RA asignados a un periodo evaluativo específico.                      
      • evaluacionService.js:750-788: Consulta todas las vinculaciones de RA para las evaluaciones de un módulo.         
      • evaluacionService.js:790-831 y evaluacionService.js:833-856: Inserción y borrado atómico evitando duplicidades.  
      • evaluacionService.js:858-904 y evaluacionService.js:906-928: Operaciones por lotes.                              

Resume with -c (or command below):
agy --conversation=835d708f-511e-4f27-9a96-1e9ef30b85e5

      • evaluacionService.js:930-984: Sincronización completa del conjunto de RAs asociados a una evaluación.            
  
  
  #### 2. Configuración de Evaluaciones Reglamentarias
  
  • En cursoSetupService.js:4-10 y CrearClaseAsistente.jsx:640-670:
      • Se han ampliado las evaluaciones generadas automáticamente a 5 periodos: Primera, Segunda, Tercera, Final        
      Ordinaria y Extraordinaria.
  
  
  #### 3. Nueva Interfaz de Asignación y Custom Hook
  
  • Se ha creado el Custom Hook useAsignacionRA.js, que gestiona de manera reactiva la carga de cursos, módulos, periodos
  evaluativos, pesos de ra_curso y asignaciones en ra_evaluacion con actualización optimista inmediata.
  • Se ha renombrado y adaptado la vista a AsignacionPagina.jsx (manteniendo compatibilidad en PracticasPagina.jsx):     
      • Selector de evaluaciones (Dropdown y botonera de acceso rápido) para Primera, Segunda, Tercera y Extraordinaria. 
      • Tabla interactiva de PrimeReact con InputSwitch para incluir/excluir RAs, indicadores de peso curricular         
      (ProgressBar), recuento de criterios (CE) y modal de inspección detallada.
      • Resumen del peso conjunto asignado al trimestre con advertencia de normalización al 100%.
  
  
  #### 4. Algoritmo de Normalización Matemática de Notas Trimestrales
  
  • En informesService.js:
      • Se ha implementado la función informesService.js:1602-1658.
      • En informesService.js:1459-1600, para cada periodo de evaluación trimestral:
  
  
                           ∑       ⎛Nota   × Peso  ⎞
                      RA∈Trimestre ⎝    RA       RA⎠
    Nota Trimestral = ──────────────────────────────
                                ∑        Peso
                           RA∈Trimestre      RA
  
  • La Evaluación Final mantiene el cálculo global ponderado al 100% de todos los RA del módulo.
  
  #### 5. Paginación y Actualización de Nomenclatura en la UI
  
  • En InformeEvaluacionTabla.jsx:257-270 se ha añadido la paginación al <DataTable> de discentes (paginator, rows={10}, 
  rowsPerPageOptions={[5, 10, 20, 50]} y plantillas en castellano).
  • Se ha actualizado la denominación de "Evaluación módulo" por "Acta por trimestres" en:
      • Layout.jsx:30-48 (submenús de Evaluación e Informes).
      • InformesPagina.jsx:26-38.
      • InformeEvaluacion.jsx:41-49.
      • Enrutador central en App.jsx:10-75.

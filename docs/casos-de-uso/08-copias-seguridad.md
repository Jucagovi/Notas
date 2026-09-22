# Casos de uso 08: panel de copias de seguridad (Exportación JSON)

## 1. Objetivo

Permitir al administrador descargar la información de la base de datos en formato JSON directamente desde el navegador, garantizando la portabilidad de los datos y sirviendo como resguardo histórico de la configuración y las calificaciones.

## 2. Interfaz de Usuario (UI)

- **Navegación:** En el menú principal izquierdo, dentro de la sección `Herramientas`, se habilitará la entrada `Copia de seguridad` que conducirá al componente `src/pages/CopiasSeguridad.jsx`.
- **Vista Principal:** Un diseño en cuadrícula (Grid) utilizando PrimeReact. Toda la vista debe envolverse en un componente `BlockUI` que bloquee la pantalla mientras se realizan las descargas para evitar peticiones duplicadas.
- **Sección 1: Copia de Seguridad Completa:**
  - Un componente `Card` destacado (con un color de fondo corporativo o icono de advertencia/importancia).
  - Un `Button` principal: "Descargar Copia Completa (JSON)".
- **Sección 2: Exportación Granular:**
  - Una cuadrícula con componentes `Card` más pequeños, uno por cada tabla principal (Ej. `Ciclos`, `Modulos`, `Unidades_Trabajo`, `RA`, `CE`, `Practicas`, `Cursos`, `Discentes`, `Evaluaciones`, `Versiones`).
  - Cada tarjeta tendrá un `Button` secundario: "Exportar [Nombre Tabla]".

## 3. Lógica de Descarga y Navegador

- Al iniciar cualquier descarga, el sistema activará el `BlockUI` y mostrará un `ProgressSpinner`.
- Los datos se formatearán para ser legibles: `JSON.stringify(datos, null, 2)`.
- Se generará un archivo `.json` utilizando la API nativa de JavaScript (`Blob` y `URL.createObjectURL`).
- El archivo se descargará automáticamente usando un elemento `<a>` temporal, con el nombre estructurado: `backup_[nombre_tabla]_[YYYYMMDD].json` o `backup_completo_[YYYYMMDD].json`.
- Tras la descarga, se informará del éxito mediante el sistema global de `Toast`.

## 4. Obtención de Datos y Arquitectura

- **Evitar Servicios Directos:** No se creará `backupService.js`. Toda la lógica residirá en el Custom Hook `src/hooks/useBackup.js`.
- Este hook consumirá el hook genérico `useDatos` para asegurar que las peticiones pasen por el cliente de Supabase autenticado.
- **Funciones del Hook:**
  - `exportarTabla(nombreTabla)`: Hará un `select('*')` de la tabla indicada y devolverá los datos.
  - `exportarCopiaCompleta(listaTablas)`: Ejecutará las promesas en paralelo mediante `Promise.all()` para empaquetar todo el esquema en un único objeto JSON (donde cada clave raíz es el nombre de la tabla).
  
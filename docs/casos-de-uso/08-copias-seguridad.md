# Casos de uso: panel de copias de seguridad (Exportación JSON)

## 1. Objetivo

Permitir al administrador descargar la información de la base de datos en formato JSON directamente desde el navegador, garantizando la portabilidad de los datos.

## 2. Interfaz de Usuario (UI)

- En **menú principal de la izquierda** en la sección de `Herramientas` habilita una nueva entrada denominada `Copia de seguridad` que conduzca al fichero src/pages/CopiasSeguridad.jsx.
- **Vista Principal:** Un diseño en cuadrícula (Grid) utilizando el componente `Card` de PrimeReact.
- **Sección 1: Copia de Seguridad Completa:**
  - Una tarjeta destacada (más grande o con diferente color de fondo).
  - Un botón principal "Descargar Copia Completa (JSON)".
- **Sección 2: Exportación Granular:**
  - Una cuadrícula con tarjetas más pequeñas, una por cada tabla principal (`Ciclos`, `Cursos`, `Discentes`, `Modulos`, `Practicas`, `Evaluaciones`, etc.).
  - Cada tarjeta tendrá un botón "Exportar [Nombre Tabla]".

## 3. Lógica de Descarga (Navegador)

- Al hacer clic en cualquier botón, el sistema mostrará un indicador de carga (`ProgressSpinner` o estado de *loading* en el botón).
- Se generará un archivo `.json` utilizando la API nativa de JavaScript (`Blob` y `URL.createObjectURL`).
- El archivo se descargará automáticamente con el nombre `backup_[tabla]_[fecha].json` o `backup_completo_[fecha].json`.

## 4. Servicios (Supabase)

- Crear el archivo `src/services/backupService.js`.
- Tendrá funciones individuales para hacer un `select('*')` de cada tabla.
- Tendrá una función `getCopiaCompleta()` que ejecute todas las consultas mediante `Promise.all()` para empaquetar todo el esquema en un único objeto JSON.

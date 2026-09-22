# 🔗 Caso de uso 20: Visor del Discente (Enlaces Mágicos)

## 1. Objetivo
Proporcionar una vista pública, de solo lectura y adaptada a dispositivos móviles, para que el discente (o sus tutores legales) pueda consultar su progreso académico en tiempo real. Se accederá mediante un "Enlace Mágico" o código QR único, eliminando la necesidad de gestionar contraseñas y cuentas de usuario para los alumnos.

## 2. Interfaz de Usuario y Flujo (UI/UX)
* **Lado del Docente (Generación):** 
  * En la Ficha del Discente (Caso 07), se añadirá un botón "Compartir Progreso" en la cabecera.
  * Al pulsarlo, se abrirá un `Dialog` que mostrará un Código QR generado dinámicamente y un campo de texto de solo lectura con una URL pública (ej. `misitio.com/visor/abc-123`). Incluirá un botón para "Copiar Enlace" al portapapeles.
* **Lado del Alumno (Visor Público - `src/pages/VisorPublico.jsx`):**
  * **Layout Especial:** Esta página no tendrá la barra de navegación lateral ni el menú del docente. Será un diseño de columna única, 100% responsivo (Mobile-First).
  * **Cabecera:** Nombre del alumno, módulo y curso académico.
  * **Sección 1 (Alertas):** Un componente `Message` si hay calificaciones pendientes de entrega (basado en el Caso 12.3).
  * **Sección 2 (Competencias):** Reutilizará el componente `GraficoRadarCompetencias.jsx` (Caso 12.5) para que el alumno vea su mapa de fortalezas.
  * **Sección 3 (Calificaciones):** Un `DataTable` simplificado con las notas de las actividades ya evaluadas y la nota temporal de la evaluación actual.

## 3. Seguridad y Reglas de Negocio
* **Token de Acceso:** En la base de datos, la tabla `imparte` (que une al discente con el curso/módulo) deberá incluir una nueva columna `token_acceso` (tipo UUID, generado automáticamente). El enlace mágico usará este token, no el ID secuencial del alumno, para evitar que alguien adivine URLs.
* **Revocación:** El docente debe tener la opción en el `Dialog` de "Regenerar Enlace", lo que cambiará el UUID en la base de datos y anulará el enlace anterior.

## 4. Obtención de Datos y Arquitectura
* **Permisos RLS en Supabase:** Dado que el alumno no inicia sesión, se creará una función RPC específica en Supabase (ej. `obtener_datos_visor(token_uuid)`) que devolverá el JSON ensamblado. Las políticas RLS de las tablas maestras seguirán cerradas; solo la función RPC (ejecutada con privilegios de definidor o mediante rol anónimo configurado) expondrá estrictamente la vista del alumno que coincida con el token.
* **Custom Hook:** Crear `src/hooks/useVisorDiscente.js`. Consumirá `useDatos` sin requerir el token de autenticación del profesor (modo público), enviando únicamente el UUID de la URL.
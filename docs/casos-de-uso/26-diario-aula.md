### 📓 Caso de Uso 26: Diario de Aula (Cuaderno de Bitácora)

**1. Objetivo**
Proporcionar un espacio ágil y cronológico donde el docente pueda registrar incidencias diarias, observaciones cualitativas del grupo, nivel de comprensión de las explicaciones o anotaciones sobre alumnos específicos. Este contexto es vital para enriquecer las tutorías y redactar la Memoria Anual.

**2. Interfaz de Usuario y Flujo (UI/UX)**

* **Navegación:** Nueva entrada principal en el menú lateral denominada `Diario de Aula`, que conducirá a `src/pages/DiarioPagina.jsx`.
* **Filtros (Header):** Componentes `Dropdown` (PrimeReact) para seleccionar Curso y Módulo.
* **Layout Principal (Grid de dos columnas):**
* **Columna Izquierda (Historial):** Un componente `Timeline` o `DataScroller` de PrimeReact que muestre las entradas anteriores ordenadas de la más reciente a la más antigua. Cada tarjeta mostrará la fecha, un extracto del texto y etiquetas (`Chips`) con los alumnos implicados.
* **Columna Derecha (Editor Diario):**
* Un `Calendar` para seleccionar la fecha de la nota (por defecto, el día actual).
* Un `MultiSelect` de PrimeReact etiquetado como "Discentes implicados (Opcional)", para vincular la incidencia a uno o varios alumnos (ej. faltas de material, llamadas de atención, participaciones destacadas).
* Un componente `Editor` (Quill) para redactar la nota con texto enriquecido.
* Botón "Guardar Anotación".

**3. Lógica de Base de Datos y Arquitectura**

* **Modelo de Datos:** Se requiere una nueva tabla `Diario_Aula` con los campos `id_diario`, `id_curso`, `id_modulo`, `fecha`, `contenido` (texto enriquecido) y `discentes_vinculados` (puede ser un array de IDs en formato JSONB o una tabla relacional, dejaremos que la base de datos lo maneje de forma óptima).
* **Visibilidad en la Ficha del Alumno:** Las notas guardadas aquí que tengan alumnos etiquetados, deberán aparecer automáticamente listadas en la Ficha Completa del Discente (Caso de uso 07) para tener todo su historial centralizado.
* **Custom Hook:** Se creará `useDiarioAula.js` consumiendo `useDatos` para realizar el CRUD de las entradas, asegurando que siempre se filtren por el módulo y curso activos.

---

### 🤖 Prompt para la IA generadora de código

Copia y pega este texto cuando quieras implementar esta funcionalidad:

> **Rol y Contexto:**
> Eres un desarrollador Senior en React, PrimeReact y Supabase. Trabajamos con el patrón Maestro-Detalle, Custom Hooks (`useDatos`) y TailwindCSS.
> **Tarea:**
> Implementa el "Caso de Uso 26: Diario de Aula". Es un cuaderno de bitácora cronológico para anotar observaciones de clase, con la posibilidad de etiquetar a alumnos concretos.
> **Requisitos Técnicos:**
> 1. **Componente de Interfaz (`src/pages/DiarioPagina.jsx`):** Crea un layout de dos columnas. En la izquierda, un `Timeline` de PrimeReact que itere sobre el estado de las notas guardadas (mostrando fecha, extracto del HTML renderizado de forma segura y `Chips` de alumnos). En la derecha, un formulario con `Calendar`, un `MultiSelect` para elegir a los alumnos implicados (recibidos de la tabla `Discentes`) y un `Editor` de PrimeReact para el texto.
> 2. **Custom Hook (`src/hooks/useDiarioAula.js`):** Crea las funciones para el CRUD de las anotaciones. Debe consumir `useDatos` apuntando a la tabla `Diario_Aula`. Incluye una función `obtenerDiarioPorModulo(idCurso, idModulo)` y otra `guardarNota(datosNota)`.
> 3. Asegúrate de que el componente de UI maneja los estados de carga (`loading`) en el botón de guardar y muestra un `Toast` de confirmación al insertar la nota correctamente. Limpia el editor tras guardar, pero mantén la fecha actual.
> 
> 
> Entrégame el código completo del Custom Hook y de la vista principal.

## Consulta SQL

-- 1. Creación de la tabla Diario de Aula
CREATE TABLE diario_aula (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_curso UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    id_modulo UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    contenido TEXT NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Evitamos que un profesor cree dos diarios distintos para el mismo módulo y grupo el mismo día
    CONSTRAINT diario_unico_por_dia UNIQUE (id_curso, id_modulo, fecha)
);

-- 2. Habilitar la Seguridad a Nivel de Fila (RLS)
ALTER TABLE diario_aula ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Seguridad (El docente solo ve y edita sus propios registros)
CREATE POLICY "Los usuarios pueden ver sus propios registros del diario"
ON diario_aula FOR SELECT
USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden insertar en su diario"
ON diario_aula FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios registros"
ON diario_aula FOR UPDATE
USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propios registros"
ON diario_aula FOR DELETE
USING (auth.uid() = usuario_id);

-- 4. Trigger opcional para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_diario_aula_updated_at
    BEFORE UPDATE ON diario_aula
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

# ⏰ Caso de uso 30: Gestor de Horarios y Disponibilidad de Aula

## 1. Objetivo

Registrar la plantilla horaria semanal (lunes a viernes) del docente y de sus grupos. Esta herramienta alimenta el widget de la Agenda Semanal con horas exactas, permite calcular las "sesiones reales" para la temporización automática, y visualiza el horario completo del grupo para facilitar la coordinación de exámenes o actividades con otros profesores.

## 2. Cambios en la Base de Datos (Esquema Supabase ya implementados)

Dado que en tu esquema actual los discentes se matriculan directamente en módulos a través de la tabla `imparte` y no existe una entidad "Grupo" aislada, crearemos el horario basándonos en una etiqueta de texto para el grupo (ej. "2º DAW") y lo vincularemos al año académico (`Cursos`).

Ejecuta estas sentencias en el editor SQL de Supabase para crear la estructura:

```sql
-- ==========================================
-- ESTRUCTURA PARA EL CASO DE USO 30 (HORARIOS)
-- ==========================================

-- 1. Definición de los tramos horarios del centro (ej. 1ª hora, Recreo, etc.)
CREATE TABLE public."Tramos_Horarios" (
  id_tramo uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_curso uuid NOT NULL REFERENCES public."Cursos"(id_curso) ON DELETE CASCADE,
  numero smallint NOT NULL, -- Para ordenar (1, 2, 3...)
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  descripcion text -- Ej: "1ª Hora", "Recreo"
);

-- 2. Cuadrícula semanal del horario
CREATE TABLE public."Horario" (
  id_horario uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_curso uuid NOT NULL REFERENCES public."Cursos"(id_curso) ON DELETE CASCADE,
  id_tramo uuid NOT NULL REFERENCES public."Tramos_Horarios"(id_tramo) ON DELETE CASCADE,
  dia_semana smallint NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7), -- 1=Lunes, 5=Viernes
  grupo text NOT NULL, -- Identificador manual, ej: "2º DAW"
  id_modulo uuid REFERENCES public."Modulos"(id_modulo) ON DELETE SET NULL, -- Vinculado si es tu módulo
  modulo_alt text, -- Texto libre si es un módulo impartido por otro profesor
  profesor text, -- Nombre del compañero (o el tuyo)
  aula text,
  UNIQUE(id_curso, id_tramo, dia_semana, grupo) -- Un grupo no puede estar en dos sitios a la vez
);

-- 3. Habilitar RLS
ALTER TABLE public."Tramos_Horarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Horario" ENABLE ROW LEVEL SECURITY;

```

## 3. Interfaz de Usuario y Flujo (UI/UX)

* **Navegación:** Entrada en el menú `Herramientas` denominada `Gestor de Horarios` (`src/pages/HorarioPagina.jsx`).
* **Layout Principal (`TabView`):**
* **Pestaña 1: Configuración de Tramos:** Un `DataTable` editable para definir las horas de tu instituto (Inicio, Fin, Descripción).
* **Pestaña 2: Horario por Grupos:**
* Un `Dropdown` para seleccionar o escribir el Grupo.
* Un grid visual (o `DataTable` pivoteado) donde las columnas son los días (Lunes - Viernes) y las filas son los Tramos.
* Al hacer clic en una celda vacía, se abre un `Dialog`. Si marcas el *checkbox* "Es mi clase", seleccionas el módulo desde un `Dropdown` (alimentado por la tabla `Modulos`). Si no lo marcas, escribes manualmente el nombre de la asignatura y del compañero.




* **Pestaña 3: Mi Horario Docente:** Una vista de solo lectura que filtra automáticamente todas las celdas de todos los grupos donde tú figuras como profesor, construyendo tu horario semanal personal.



## 4. Obtención de Datos y Arquitectura

* **Custom Hook:** Se creará `src/hooks/useHorarios.js`, consumiendo `useDatos` para gestionar tanto `Tramos_Horarios` como `Horario`.
* **Sinergia con el Dashboard (Agenda Semanal):** El hook del widget del Dashboard cruzará el día actual con tu horario personal, mostrando con precisión qué clase tienes, a qué hora y en qué aula.
* **Sinergia con la Temporización Inteligente:** El motor matemático consultará esta tabla para contar exactamente cuántas horas de clase a la semana tienes con ese grupo/módulo, permitiendo calcular la fecha de fin de las Unidades de Trabajo con precisión quirúrgica.

---

### 🤖 Prompt para la IA generadora de código

Copia y pega este texto cuando quieras implementar esta funcionalidad:

> **Rol y Contexto:**
> Eres un desarrollador Senior en React, PrimeReact y Supabase. Trabajamos con el patrón Maestro-Detalle, Custom Hooks (`useDatos`) y TailwindCSS.
> **Tarea:**
> Implementa el "Caso de Uso 30: Gestor de Horarios y Disponibilidad". Permite configurar las horas del centro y crear la cuadrícula del horario semanal de los grupos y del profesor.
> **Requisitos Técnicos:**
> 1. **Custom Hook (`src/hooks/useHorarios.js`):** Crea el hook con funciones para realizar el CRUD en la tabla `Tramos_Horarios` y en la tabla `Horario` (filtrando siempre por `id_curso`).
> 2. **Componente Visual (`src/pages/HorarioPagina.jsx`):**
> * Implementa un `TabView`.
> * En la pestaña de Tramos, un `DataTable` con edición en celda (`cellEdit`) para definir los números, horas de inicio/fin y descripciones de cada hora lectiva o recreo.
> * En la pestaña de Horarios, crea una cuadrícula (usando tablas HTML nativas o Grid de Tailwind). Las filas serán los Tramos devueltos por el hook, y las columnas los días de la semana (L a V).
> * Al pulsar en una celda, abre un modal (`Dialog`) para insertar o editar la clase (permitiendo elegir si es un módulo propio a través de un `Dropdown` de la tabla `Modulos`, o texto libre si es otro profesor).
> 
> 
> 3. Entrégame el Custom Hook y el componente visual completo, aplicando diseño responsivo básico con Tailwind.
> 
> 

¿Estamos listos para el Prompt de Andamiaje Inicial que te genere el esqueleto del proyecto en Vite?
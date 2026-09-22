-- ==========================================
-- 1. ESTRUCTURA CURRICULAR BASE (Inmutable)
-- ==========================================

CREATE TABLE public."Ciclos" (
  id_ciclo uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
nombre text NOT NULL, siglas text NOT NULL, descripcion text
);
CREATE TABLE public."Modulos" (
  id_modulo uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
nombre text NOT NULL,
  siglas text NOT NULL,
  descripcion text,
  id_ciclo uuid REFERENCES public."Ciclos"(id_ciclo) ON DELETE CASCADE
);
CREATE TABLE public."Unidades_Trabajo" (
  id_ut uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  numero smallint NOT NULL,
  nombre text NOT NULL,
descripcion text,
  id_modulo uuid NOT NULL REFERENCES public."Modulos"(id_modulo) ON DELETE CASCADE
);
CREATE TABLE public."RA" (
  id_ra uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
numero smallint NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  id_modulo uuid NOT NULL REFERENCES public."Modulos"(id_modulo) ON DELETE CASCADE
);
CREATE TABLE public."CE" (
  id_ce uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
numero text NOT NULL, -- Texto por si existen nomenclaturas como "1.a"
  nombre text NOT NULL,
  descripcion text,
  id_ra uuid NOT NULL REFERENCES public."RA"(id_ra) ON DELETE CASCADE
);
CREATE TABLE public."desarrollan" (
  id_desarrollan uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_ut uuid NOT NULL REFERENCES public."Unidades_Trabajo"(id_ut) ON DELETE CASCADE,
  id_ra uuid NOT NULL REFERENCES public."RA"(id_ra) ON DELETE CASCADE,
  UNIQUE(id_ut, id_ra)
);

-- Banco de Prácticas (Repositorio Maestro)
CREATE TABLE public."Practicas" (
  id_practica uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
nombre text NOT NULL, descripcion text,
  id_tipopractica text NOT NULL,
id_modulo uuid NOT NULL REFERENCES public."Modulos"(id_modulo) ON DELETE CASCADE
);
-- ==========================================
-- 2. PLANIFICACIÓN ACADÉMICA (Por Curso)
-- ==========================================

CREATE TABLE public."Cursos" (
  id_curso uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
anyo text NOT NULL, -- Ej: "2024/2025"
  centro text NOT NULL,
  nombre text NOT NULL,
  descripcion text
);

CREATE TABLE public."Temporizacion" (
  id_temporizacion uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fecha_ini_prevista date,
  fecha_fin_prevista date,
  fecha_ini_real date,
  fecha_fin_real date,
  estado text DEFAULT 'Pendiente',
  observaciones text,
  orden smallint,
  nombre_alternativo text,
  id_ut uuid NOT NULL REFERENCES public."Unidades_Trabajo"(id_ut) ON DELETE CASCADE,
  id_curso uuid NOT NULL REFERENCES public."Cursos"(id_curso) ON DELETE CASCADE,
  UNIQUE(id_ut, id_curso)
);

CREATE TABLE public."ra_curso" (
  id_ra_curso uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  peso smallint NOT NULL CHECK (peso >= 0 AND peso <= 100),
  id_ra uuid NOT NULL REFERENCES public."RA"(id_ra) ON DELETE CASCADE,
  id_curso uuid NOT NULL REFERENCES public."Cursos"(id_curso) ON DELETE CASCADE,
  UNIQUE(id_ra, id_curso)
);
CREATE TABLE public."ce_curso" (
  id_ce_curso uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  peso smallint NOT NULL CHECK (peso >= 0 AND peso <= 100),
  id_ce uuid NOT NULL REFERENCES public."CE"(id_ce) ON DELETE CASCADE,
  id_curso uuid NOT NULL REFERENCES public."Cursos"(id_curso) ON DELETE CASCADE,
  UNIQUE(id_ce, id_curso)
);
-- Instancia de la Práctica (Edición)
CREATE TABLE public."Versiones" (
  id_version uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enunciado text,
  numero text,
  id_practica uuid NOT NULL REFERENCES public."Practicas"(id_practica) ON DELETE CASCADE,
  id_curso uuid NOT NULL REFERENCES public."Cursos"(id_curso) ON DELETE CASCADE,
  id_ut uuid REFERENCES public."Unidades_Trabajo"(id_ut) ON DELETE SET NULL
);
-- Cobertura de Criterios (Mapeo)
CREATE TABLE public."trabajan" (
  id_trabajan uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  porcentaje smallint NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
  id_ce uuid NOT NULL REFERENCES public."CE"(id_ce) ON DELETE CASCADE,
  id_version uuid NOT NULL REFERENCES public."Versiones"(id_version) ON DELETE CASCADE
);
-- ==========================================
-- 3. MATRICULACIÓN Y EVALUACIÓN
-- ==========================================

CREATE TABLE public."Discentes" (
  id_discente uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  nombre text NOT NULL,
  apellidos text NOT NULL,
  correo text,
  fecha_nac date,
  localidad text,
  NIA text UNIQUE,
  activo boolean DEFAULT true,
  imagen text
);
CREATE TABLE public."imparte" (
  id_imparte uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notas text,
  id_curso uuid NOT NULL REFERENCES public."Cursos"(id_curso) ON DELETE CASCADE,
  id_modulo uuid NOT NULL REFERENCES public."Modulos"(id_modulo) ON DELETE CASCADE,
  id_discente uuid NOT NULL REFERENCES public."Discentes"(id_discente) ON DELETE CASCADE,
  UNIQUE(id_curso, id_modulo, id_discente)
);
CREATE TABLE public."Evaluaciones" (
  id_evaluacion uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL, -- 'Primera', 'Segunda', 'Final', 'Extraordinaria'
  fecha_ini date,
  fecha_fin date,
  descripcion text,
  id_curso uuid NOT NULL REFERENCES public."Cursos"(id_curso) ON DELETE CASCADE,
  id_modulo uuid NOT NULL REFERENCES public."Modulos"(id_modulo) ON DELETE CASCADE
);
CREATE TABLE public."evaluan" (
  id_evaluan uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nota integer CHECK (nota >= 0 AND nota <= 100),
  id_version uuid NOT NULL REFERENCES public."Versiones"(id_version) ON DELETE CASCADE,
  id_evaluacion uuid NOT NULL REFERENCES public."Evaluaciones"(id_evaluacion) ON DELETE CASCADE,
  id_discente uuid NOT NULL REFERENCES public."Discentes"(id_discente) ON DELETE CASCADE,
  UNIQUE(id_version, id_evaluacion, id_discente)
);

-- Cambio para la Asirnación de Versiones (caso de uso 5, punto 2).
ALTER TABLE public."Versiones" ADD COLUMN id_evaluacion uuid REFERENCES public."Evaluaciones"(id_evaluacion) ON DELETE SET NULL;

-- Cambio para la evaluación de pesos (ya no se hace en evalua sino en Versiones).
ALTER TABLE public."Versiones" ADD COLUMN peso_evaluacion smallint DEFAULT 0;

-- ==========================================
-- MODIFICACIONES PARA EL CASO DE USO 29 (CALENDARIO ESCOLAR)
-- ==========================================

-- 1. Añadir fechas límite a la tabla Cursos existente
ALTER TABLE public."Cursos" 
ADD COLUMN fecha_inicio date,
ADD COLUMN fecha_fin date;

-- 2. Crear la nueva tabla de días no lectivos (festivos/fines de semana marcados)
CREATE TABLE public."Festivos" (
  id_festivo uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_curso uuid NOT NULL REFERENCES public."Cursos"(id_curso) ON DELETE CASCADE,
  fecha date NOT NULL,
  descripcion text,
UNIQUE (id_curso, fecha)
);

-- 3. Habilitar la seguridad a nivel de fila (RLS) para la nueva tabla
ALTER TABLE public."Festivos" ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ESTRUCTURA PARA EL CASO DE USO 30 (HORARIOSS)
-- ==========================================

-- 1. Definición de los tramos horarioss del centro (ej. 1ª hora, Recreo, etc.)
CREATE TABLE public."Sesiones" (
  id_sesion uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_curso uuid NOT NULL REFERENCES public."Cursos"(id_curso) ON DELETE CASCADE,
  numero smallint NOT NULL, -- Para ordenar (1, 2, 3...)
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  descripcion text -- Ej: "1ª Hora", "Recreo"
);

-- 2. Cuadrícula semanal del horarios
CREATE TABLE public."Horarios" (
  id_horario uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
id_curso uuid REFERENCES public."Cursos"(id_curso) ON DELETE CASCADE,
  id_sesion uuid NOT NULL REFERENCES public."Sesiones"(id_sesion) ON DELETE CASCADE,
  dia_semana smallint NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7), -- 1=Lunes, 5=Viernes
  grupo text NOT NULL, -- Identificador manual, ej: "2º DAW"
  id_modulo uuid REFERENCES public."Modulos"(id_modulo) ON DELETE SET NULL, -- Vinculado si es tu módulo
  modulo_alt text, -- Texto libre si es un módulo impartido por otro profesor
  profesor text, -- Nombre del compañero (o el tuyo)
  aula text,
  UNIQUE(id_curso, id_sesion, dia_semana, grupo) -- Un grupo no puede estar en dos sitios a la vez
);
-- 3. Habilitar RLS
ALTER TABLE public."Sesiones" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Horarios" ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- HABILITAR RLS
-- ==========================================
-- Habilitar RLS para la Estructura Curricular Base
ALTER TABLE public."Ciclos" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Modulos" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Unidades_Trabajo" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."RA" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."CE" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."desarrollan" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Practicas" ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS para la Planificación Académica
ALTER TABLE public."Cursos" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Temporizacion" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."ra_curso" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."ce_curso" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Versiones" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."trabajan" ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS para la Matriculación y Evaluación
ALTER TABLE public."Discentes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."imparte" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."Evaluaciones" ENABLE ROW LEVEL SECURITY;

ALTER TABLE public."evaluan" ENABLE ROW LEVEL SECURITY;
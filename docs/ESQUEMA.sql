-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Ciclos (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
nombre character varying NOT NULL DEFAULT ''::character varying,
  siglas character varying NOT NULL DEFAULT ''::character varying,
  descripcion text DEFAULT ''::text,
  id_ciclo uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT Ciclos_pkey PRIMARY KEY (id_ciclo)
);
CREATE TABLE public.Discentes (
  nombre text NOT NULL,
  apellidos text NOT NULL,
  correo text,
  fecha_nac date,
  localidad text,
id_discente uuid NOT NULL DEFAULT gen_random_uuid (), imagen text,
created_at timestamp
with
    time zone DEFAULT now(),
    NIA text,
    activo boolean DEFAULT true,
    CONSTRAINT Discentes_pkey PRIMARY KEY (id_discente)
);
CREATE TABLE public.Modulos (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
nombre character varying NOT NULL DEFAULT ''::character varying,
  siglas character varying NOT NULL DEFAULT ''::character varying,
  descripcion text DEFAULT ''::text,
  id_modulo uuid NOT NULL DEFAULT gen_random_uuid(),
  id_ciclo uuid,
  CONSTRAINT Modulos_pkey PRIMARY KEY (id_modulo),
  CONSTRAINT Modulos_id_ciclo_fkey FOREIGN KEY (id_ciclo) REFERENCES public.Ciclos(id_ciclo)
);
CREATE TABLE public.cesta_compra (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  cantidad smallint,
  listado boolean,
  supermercado text,
  CONSTRAINT cesta_compra_pkey PRIMARY KEY (id)
);
CREATE TABLE public.RA (
  id_ra uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
nombre character varying NOT NULL,
numero integer NOT NULL,
descripcion character varying,
id_modulo uuid,
CONSTRAINT RA_pkey PRIMARY KEY (id_ra),
CONSTRAINT RA_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.Modulos (id_modulo)
);
CREATE TABLE public.CE (
  id_ce uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
nombre character varying NOT NULL,
  numero real NOT NULL,
  descripcion character varying,
  id_ra uuid,
  CONSTRAINT CE_pkey PRIMARY KEY (id_ce),
  CONSTRAINT CE_id_ra_fkey FOREIGN KEY (id_ra) REFERENCES public.RA(id_ra)
);
CREATE TABLE public.Unidades_Trabajo (
  id_ut uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  numero smallint NOT NULL,
  nombre text NOT NULL,
  descripcion text,
id_modulo uuid NOT NULL,
CONSTRAINT Unidades_Trabajo_pkey PRIMARY KEY (id_ut),
CONSTRAINT Unidades_Trabajo_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.Modulos (id_modulo)
);
CREATE TABLE public.desarrollan (
  id_desarrollan uuid NOT NULL DEFAULT gen_random_uuid(),
  id_ut uuid NOT NULL,
  id_ra uuid NOT NULL,
  porcentaje smallint NOT NULL DEFAULT 100 CHECK (porcentaje >= 0 AND porcentaje <= 100),
  CONSTRAINT desarrollan_pkey PRIMARY KEY (id_desarrollan),
  CONSTRAINT desarrollan_id_ut_fkey FOREIGN KEY (id_ut) REFERENCES public.Unidades_Trabajo(id_ut),
  CONSTRAINT desarrollan_id_ra_fkey FOREIGN KEY (id_ra) REFERENCES public.RA(id_ra)
);
CREATE TABLE public.Practicas (
  id_practica uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
nombre text NOT NULL, descripcion text,
  id_tipopractica text NOT NULL,
id_modulo uuid NOT NULL,
es_activa boolean DEFAULT true,
CONSTRAINT Practicas_pkey PRIMARY KEY (id_practica),
CONSTRAINT Practicas_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.Modulos (id_modulo)
);
CREATE TABLE public.Cursos (
  id_curso uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
anyo text NOT NULL,
  centro text NOT NULL,
  nombre text NOT NULL,
descripcion text,
fecha_inicio date,
fecha_fin date,
CONSTRAINT Cursos_pkey PRIMARY KEY (id_curso)
);
CREATE TABLE public.Temporizacion (
  id_temporizacion uuid NOT NULL DEFAULT gen_random_uuid(),
  fecha_ini_prevista date,
  fecha_fin_prevista date,
  fecha_ini_real date,
  fecha_fin_real date,
estado text DEFAULT 'Pendiente'::text,
  observaciones text,
  orden smallint,
  nombre_alternativo text,
id_ut uuid NOT NULL,
id_curso uuid NOT NULL,
CONSTRAINT Temporizacion_pkey PRIMARY KEY (id_temporizacion),
CONSTRAINT Temporizacion_id_ut_fkey FOREIGN KEY (id_ut) REFERENCES public.Unidades_Trabajo (id_ut),
CONSTRAINT Temporizacion_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos (id_curso)
);
CREATE TABLE public.ra_curso (
  id_ra_curso uuid NOT NULL DEFAULT gen_random_uuid(),
  peso smallint NOT NULL CHECK (peso >= 0 AND peso <= 100),
id_ra uuid NOT NULL,
id_curso uuid NOT NULL,
CONSTRAINT ra_curso_pkey PRIMARY KEY (id_ra_curso),
CONSTRAINT ra_curso_id_ra_fkey FOREIGN KEY (id_ra) REFERENCES public.RA (id_ra),
CONSTRAINT ra_curso_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos (id_curso)
);
CREATE TABLE public.ce_curso (
  id_ce_curso uuid NOT NULL DEFAULT gen_random_uuid(),
  peso smallint NOT NULL CHECK (peso >= 0 AND peso <= 100),
id_ce uuid NOT NULL,
id_curso uuid NOT NULL,
CONSTRAINT ce_curso_pkey PRIMARY KEY (id_ce_curso),
CONSTRAINT ce_curso_id_ce_fkey FOREIGN KEY (id_ce) REFERENCES public.CE (id_ce),
CONSTRAINT ce_curso_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos (id_curso)
);
CREATE TABLE public.Versiones (
  id_version uuid NOT NULL DEFAULT gen_random_uuid(),
  enunciado text,
  numero text,
id_practica uuid NOT NULL,
id_curso uuid NOT NULL,
id_ut uuid,
id_evaluacion uuid,
peso_evaluacion smallint DEFAULT 0,
CONSTRAINT Versiones_pkey PRIMARY KEY (id_version),
CONSTRAINT Versiones_id_practica_fkey FOREIGN KEY (id_practica) REFERENCES public.Practicas (id_practica),
CONSTRAINT Versiones_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos (id_curso),
CONSTRAINT Versiones_id_ut_fkey FOREIGN KEY (id_ut) REFERENCES public.Unidades_Trabajo (id_ut),
CONSTRAINT Versiones_id_evaluacion_fkey FOREIGN KEY (id_evaluacion) REFERENCES public.Evaluaciones (id_evaluacion)
);
CREATE TABLE public.trabajan (
  id_trabajan uuid NOT NULL DEFAULT gen_random_uuid(),
  porcentaje smallint NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
id_ce uuid NOT NULL,
id_version uuid NOT NULL,
CONSTRAINT trabajan_pkey PRIMARY KEY (id_trabajan),
CONSTRAINT trabajan_id_ce_fkey FOREIGN KEY (id_ce) REFERENCES public.CE (id_ce),
CONSTRAINT trabajan_id_version_fkey FOREIGN KEY (id_version) REFERENCES public.Versiones (id_version)
);
CREATE TABLE public.imparte (
  id_imparte uuid NOT NULL DEFAULT gen_random_uuid(),
  notas text,
id_curso uuid NOT NULL,
id_modulo uuid NOT NULL,
id_discente uuid NOT NULL,
CONSTRAINT imparte_pkey PRIMARY KEY (id_imparte),
CONSTRAINT imparte_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos (id_curso),
CONSTRAINT imparte_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.Modulos (id_modulo),
CONSTRAINT imparte_id_discente_fkey FOREIGN KEY (id_discente) REFERENCES public.Discentes (id_discente)
);
CREATE TABLE public.Evaluaciones (
  id_evaluacion uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  fecha_ini date,
  fecha_fin date,
  descripcion text,
id_curso uuid NOT NULL,
id_modulo uuid NOT NULL,
CONSTRAINT Evaluaciones_pkey PRIMARY KEY (id_evaluacion),
CONSTRAINT Evaluaciones_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos (id_curso),
CONSTRAINT Evaluaciones_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.Modulos (id_modulo)
);
CREATE TABLE public.evaluan (
  id_evaluan uuid NOT NULL DEFAULT gen_random_uuid(),
  nota integer CHECK (nota >= 0 AND nota <= 100),
id_version uuid NOT NULL,
id_evaluacion uuid,
id_discente uuid NOT NULL,
CONSTRAINT evaluan_pkey PRIMARY KEY (id_evaluan),
CONSTRAINT evaluan_id_version_fkey FOREIGN KEY (id_version) REFERENCES public.Versiones (id_version),
CONSTRAINT evaluan_id_evaluacion_fkey FOREIGN KEY (id_evaluacion) REFERENCES public.Evaluaciones (id_evaluacion),
CONSTRAINT evaluan_id_discente_fkey FOREIGN KEY (id_discente) REFERENCES public.Discentes (id_discente)
);
CREATE TABLE public.Calendario_Eventos (
  id_evento uuid NOT NULL DEFAULT gen_random_uuid(),
  id_curso uuid,
  fecha_inicio date NOT NULL,
  descripcion text,
fecha_fin date NOT NULL,
tipo_evento text NOT NULL,
es_lectivo boolean NOT NULL,
CONSTRAINT Calendario_Eventos_pkey PRIMARY KEY (id_evento),
CONSTRAINT Calendario_Eventos_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos (id_curso)
);
CREATE TABLE public.Sesiones (
  id_sesion uuid NOT NULL DEFAULT gen_random_uuid(),
  id_curso uuid NOT NULL,
  numero smallint NOT NULL,
  hora_inicio time without time zone NOT NULL,
  hora_fin time without time zone NOT NULL,
  descripcion text,
  CONSTRAINT Sesiones_pkey PRIMARY KEY (id_sesion),
  CONSTRAINT Sesiones_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos(id_curso)
);
CREATE TABLE public.Horarios (
  id_horario uuid NOT NULL DEFAULT gen_random_uuid(),
  id_curso uuid,
  id_sesion uuid NOT NULL,
  dia_semana smallint NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
  grupo text NOT NULL,
  id_modulo uuid,
  modulo_alt text,
  profesor text,
  aula text,
CONSTRAINT Horarios_pkey PRIMARY KEY (id_horario),
CONSTRAINT Horarios_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos(id_curso),
  CONSTRAINT Horarios_id_sesion_fkey FOREIGN KEY (id_sesion) REFERENCES public.Sesiones(id_sesion),
  CONSTRAINT Horarios_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.Modulos(id_modulo)
);

CREATE TABLE public.ra_evaluacion (
  id_ra_evaluacion uuid NOT NULL DEFAULT gen_random_uuid(),
  id_ra uuid NOT NULL,
  id_evaluacion uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ra_evaluacion_pkey PRIMARY KEY (id_ra_evaluacion),
  CONSTRAINT ra_evaluacion_id_ra_fkey FOREIGN KEY (id_ra) REFERENCES public.RA(id_ra),
  CONSTRAINT ra_evaluacion_id_evaluacion_fkey FOREIGN KEY (id_evaluacion) REFERENCES public.Evaluaciones(id_evaluacion)
);
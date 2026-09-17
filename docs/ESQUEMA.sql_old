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
CREATE TABLE public.Cursos (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  centro character varying NOT NULL DEFAULT ''::character varying,
  nombre character varying NOT NULL DEFAULT ''::character varying,
  descripcion text DEFAULT ''::text,
  anyo character varying NOT NULL DEFAULT ''::character varying,
  id_curso uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT Cursos_pkey PRIMARY KEY (id_curso)
);
CREATE TABLE public.Discentes (
  nombre text NOT NULL,
  apellidos text NOT NULL,
  correo text,
  fecha_nac date,
  localidad text,
  id_discente uuid NOT NULL DEFAULT gen_random_uuid(),
  imagen text,
  created_at timestamp with time zone DEFAULT now(),
  NIA text,
  activo boolean DEFAULT true,
  CONSTRAINT Discentes_pkey PRIMARY KEY (id_discente)
);
CREATE TABLE public.Evaluaciones (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre character varying NOT NULL DEFAULT ''::character varying,
  fecha_ini date,
  fecha_fin date,
  descripcion text DEFAULT ''::text,
  id_tipoevaluacion bigint,
  id_evaluacion uuid NOT NULL DEFAULT gen_random_uuid(),
  id_curso uuid,
  id_modulo uuid,
  CONSTRAINT Evaluaciones_pkey PRIMARY KEY (id_evaluacion),
  CONSTRAINT Evaluaciones_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.Modulos(id_modulo),
  CONSTRAINT Evaluaciones_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos(id_curso)
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
CREATE TABLE public.Practicas (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre text NOT NULL DEFAULT ''::text,
  numero character varying NOT NULL DEFAULT ''::character varying,
  enunciado text NOT NULL DEFAULT ''::text,
  descripcion text DEFAULT ''::text,
  id_tipopractica text NOT NULL,
  unidad character varying NOT NULL DEFAULT ''::character varying,
  id_practica uuid NOT NULL DEFAULT gen_random_uuid(),
id_modulo uuid NOT NULL,
  CONSTRAINT Practicas_pkey PRIMARY KEY (id_practica),
  CONSTRAINT Practicas_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.Modulos(id_modulo)
);
CREATE TABLE public.evaluan (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  peso smallint,
  id_evaluan uuid NOT NULL DEFAULT gen_random_uuid(),
  id_practica uuid NOT NULL,
  id_evaluacion uuid NOT NULL,
  id_discente uuid NOT NULL,
  nota integer,
CONSTRAINT evaluan_pkey PRIMARY KEY (id_evaluan),
  CONSTRAINT evaluan_id_practica_fkey FOREIGN KEY (id_practica) REFERENCES public.Practicas(id_practica),
CONSTRAINT evaluan_id_evaluacion_fkey FOREIGN KEY (id_evaluacion) REFERENCES public.Evaluaciones (id_evaluacion),
CONSTRAINT evaluan_id_discente_fkey FOREIGN KEY (id_discente) REFERENCES public.Discentes (id_discente)
);
CREATE TABLE public.imparte (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  notas character varying,
  id_imparte uuid NOT NULL DEFAULT gen_random_uuid(),
  id_curso uuid,
  id_modulo uuid,
  id_discente uuid,
  CONSTRAINT imparte_pkey PRIMARY KEY (id_imparte),
CONSTRAINT imparte_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos (id_curso),
  CONSTRAINT imparte_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.Modulos(id_modulo),
CONSTRAINT imparte_id_discente_fkey FOREIGN KEY (id_discente) REFERENCES public.Discentes (id_discente)
);
CREATE TABLE public.shopping_list (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  item_name text NOT NULL,
  added_by text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT shopping_list_pkey PRIMARY KEY (id)
);
CREATE TABLE public.RA (
  id_ra uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre character varying NOT NULL,
  numero integer NOT NULL,
  descripcion character varying,
  id_modulo uuid,
  CONSTRAINT RA_pkey PRIMARY KEY (id_ra),
  CONSTRAINT RA_id_modulo_fkey FOREIGN KEY (id_modulo) REFERENCES public.Modulos(id_modulo)
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
CREATE TABLE public.trabajan (
  id_trabajan uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  porcentaje smallint NOT NULL,
  descripcion character varying,
  id_ce uuid NOT NULL,
  id_practica uuid NOT NULL,
  CONSTRAINT trabajan_pkey PRIMARY KEY (id_trabajan),
CONSTRAINT trabajan_id_ce_fkey FOREIGN KEY (id_ce) REFERENCES public.CE (id_ce),
  CONSTRAINT trabajan_id_practica_fkey FOREIGN KEY (id_practica) REFERENCES public.Practicas(id_practica)
);
CREATE TABLE public.ra_curso (
id_ra_curso uuid NOT NULL DEFAULT gen_random_uuid (),
created_at timestamp
with
    time zone NOT NULL DEFAULT now(),
    peso smallint NOT NULL,
    id_ra uuid NOT NULL,
    id_curso uuid NOT NULL,
    CONSTRAINT ra_curso_pkey PRIMARY KEY (id_ra_curso),
CONSTRAINT ra_curso_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos (id_curso),
CONSTRAINT ra_curso_id_ra_fkey FOREIGN KEY (id_ra) REFERENCES public.RA (id_ra)
);
CREATE TABLE public.ce_curso (
  id_ce_curso uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  peso smallint NOT NULL,
  id_ce uuid NOT NULL,
  id_curso uuid NOT NULL,
  CONSTRAINT ce_curso_id_ce_fkey FOREIGN KEY (id_ce) REFERENCES public.CE(id_ce),
  CONSTRAINT ce_curso_id_curso_fkey FOREIGN KEY (id_curso) REFERENCES public.Cursos(id_curso)
);
CREATE TABLE public.ra_evaluacion (
    id_ra_evaluacion uuid NOT NULL DEFAULT gen_random_uuid (),
    id_ra uuid NOT NULL,
    id_evaluacion uuid NOT NULL,
    CONSTRAINT ra_evaluacion_id_evaluacion_fkey FOREIGN KEY (id_evaluacion) REFERENCES public.Evaluaciones (id_evaluacion),
    CONSTRAINT ra_evaluacion_id_ra_fkey FOREIGN KEY (id_ra) REFERENCES public.RA (id_ra)
);
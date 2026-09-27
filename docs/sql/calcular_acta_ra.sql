-- ==============================================================================
-- Función RPC: calcular_acta_ra
-- Caso de uso 17: Acta de Evaluación por Resultados de Aprendizaje (RA)
--
-- Se encarga del cruce computacional de datos curriculares y de calificaciones
-- para una clase y módulo específicos:
-- imparte -> Discentes -> RA -> CE -> ce_curso -> ra_curso -> Versiones -> trabajan -> evaluan
--
-- Devuelve un objeto JSON estructurado con la información de los discentes matriculados,
-- la lista de Resultados de Aprendizaje con sus pesos, y las calificaciones obtenidas en cada RA.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.calcular_acta_ra(
  p_id_curso uuid,
  p_id_modulo uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado jsonb;
BEGIN
  -- Se realiza la consulta agregada construyendo el documento JSON con discentes y calificaciones por RA
  WITH
  -- 1. Discentes matriculados en el binomio curso escolar y módulo
  discentes_curso AS (
    SELECT DISTINCT
      d.id_discente,
      d.nombre,
      d.apellidos,
      d.nia,
      d.correo,
      d.imagen,
      d.activo
    FROM public.imparte i
    JOIN public."Discentes" d ON d.id_discente = i.id_discente
    WHERE i.id_curso = p_id_curso
      AND i.id_modulo = p_id_modulo
    ORDER BY d.apellidos, d.nombre
  ),

  -- 2. Resultados de Aprendizaje del módulo con sus pesos específicos para este curso
  ras_modulo AS (
    SELECT
      r.id_ra,
      r.numero,
      r.nombre,
      r.descripcion,
      COALESCE(rc.peso, 0)::numeric AS peso
    FROM public."RA" r
    LEFT JOIN public.ra_curso rc
      ON rc.id_ra = r.id_ra
      AND rc.id_curso = p_id_curso
    WHERE r.id_modulo = p_id_modulo
    ORDER BY r.numero
  ),

  -- 3. Criterios de Evaluación vinculados a los RA del módulo y sus ponderaciones en el curso
  ces_modulo AS (
    SELECT
      c.id_ce,
      c.numero,
      c.nombre,
      c.descripcion,
      c.id_ra,
      COALESCE(cc.peso, 0)::numeric AS peso
    FROM public."CE" c
    JOIN ras_modulo rm ON rm.id_ra = c.id_ra
    LEFT JOIN public.ce_curso cc
      ON cc.id_ce = c.id_ce
      AND cc.id_curso = p_id_curso
    ORDER BY c.numero
  ),

  -- 4. Actividades y versiones asignadas a la clase con su cobertura porcentual en Criterios
  versiones_clase AS (
    SELECT
      v.id_version,
      t.id_ce,
      t.porcentaje::numeric AS porcentaje_cobertura
    FROM public."Versiones" v
    JOIN public.trabajan t ON t.id_version = v.id_version
    WHERE v.id_curso = p_id_curso
  ),

  -- 5. Calificaciones de los discentes en las versiones de actividades
  notas_discentes AS (
    SELECT
      e.id_discente,
      e.id_version,
      e.nota::numeric AS nota
    FROM public.evaluan e
    JOIN public."Versiones" v ON v.id_version = e.id_version
    WHERE v.id_curso = p_id_curso
      AND e.nota IS NOT NULL
  ),

  -- 6. Cálculo de calificación y cobertura evaluada por discente y Criterio de Evaluación
  notas_ce AS (
    SELECT
      dc.id_discente,
      cm.id_ra,
      cm.id_ce,
      cm.peso AS peso_ce,
      COALESCE(SUM(nd.nota * (vc.porcentaje_cobertura / 100.0)), 0) AS nota_ponderada_ce,
      COALESCE(SUM(vc.porcentaje_cobertura), 0) AS cobertura_evaluada
    FROM discentes_curso dc
    CROSS JOIN ces_modulo cm
    LEFT JOIN versiones_clase vc ON vc.id_ce = cm.id_ce
    LEFT JOIN notas_discentes nd
      ON nd.id_discente = dc.id_discente
      AND nd.id_version = vc.id_version
    GROUP BY dc.id_discente, cm.id_ra, cm.id_ce, cm.peso
  ),

  -- 7. Agregación de la calificación de cada Resultado de Aprendizaje por discente
  notas_ra AS (
    SELECT
      nce.id_discente,
      nce.id_ra,
      -- La nota del RA resulta de la suma ponderada de las notas de sus criterios según ce_curso
      CASE
        WHEN SUM(nce.peso_ce) > 0 THEN
          ROUND(LEAST(100.0, GREATEST(0.0,
            SUM(LEAST(100.0, nce.nota_ponderada_ce) * nce.peso_ce) / SUM(nce.peso_ce)
          )))
        ELSE
          ROUND(LEAST(100.0, GREATEST(0.0, AVG(LEAST(100.0, nce.nota_ponderada_ce)))))
      END AS nota_ra,
      -- Un RA se considera completo si todos sus CE alcanzan al menos el 100% de cobertura evaluada
      BOOL_AND(nce.cobertura_evaluada >= 100.0) AS es_completo
    FROM notas_ce nce
    GROUP BY nce.id_discente, nce.id_ra
  ),

  -- 8. Construcción de mapa JSON de calificaciones de RA por discente
  mapa_discentes AS (
    SELECT
      dc.id_discente,
      dc.nombre,
      dc.apellidos,
      dc.nia,
      dc.correo,
      dc.imagen,
      dc.activo,
      COALESCE(
        jsonb_object_agg(
          nr.id_ra::text,
          jsonb_build_object(
            'id_ra', nr.id_ra,
            'nota', nr.nota_ra,
            'completo', nr.es_completo
          )
        ) FILTER (WHERE nr.id_ra IS NOT NULL),
        '{}'::jsonb
      ) AS calificaciones_ra
    FROM discentes_curso dc
    LEFT JOIN notas_ra nr ON nr.id_discente = dc.id_discente
    GROUP BY
      dc.id_discente,
      dc.nombre,
      dc.apellidos,
      dc.nia,
      dc.correo,
      dc.imagen,
      dc.activo
  )

  -- 9. Agrupación final en el objeto raíz devuelto
  SELECT jsonb_build_object(
    'discentes', COALESCE((SELECT jsonb_agg(to_jsonb(md)) FROM mapa_discentes md), '[]'::jsonb),
    'ras', COALESCE((SELECT jsonb_agg(to_jsonb(rm)) FROM ras_modulo rm), '[]'::jsonb)
  ) INTO v_resultado;

  RETURN v_resultado;
END;
$$;

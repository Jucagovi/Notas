-- ==============================================================================
-- Función RPC: calcular_notas_ra_discente
-- Caso de uso 12.5: Mapa de Competencias Individual (Gráfico de Radar)
--
-- Se encarga del cruce computacional de datos curriculares y de calificaciones
-- para un discente y módulo específicos:
-- RA -> CE -> ce_curso -> ra_curso -> Versiones -> trabajan -> evaluan
--
-- Devuelve un objeto JSON con el rendimiento competencial por Resultado de Aprendizaje.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.calcular_notas_ra_discente(
  p_id_discente uuid,
  p_id_modulo uuid,
  p_id_curso uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id_curso uuid := p_id_curso;
  v_resultado jsonb;
BEGIN
  -- Se infiere el curso a partir de la matrícula en imparte si no se proporciona expresamente
  IF v_id_curso IS NULL THEN
    SELECT i.id_curso INTO v_id_curso
    FROM public.imparte i
    WHERE i.id_discente = p_id_discente
      AND i.id_modulo = p_id_modulo
    LIMIT 1;
  END IF;

  WITH
  -- 1. Resultados de Aprendizaje del módulo con sus pesos en el curso
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
      AND (v_id_curso IS NULL OR rc.id_curso = v_id_curso)
    WHERE r.id_modulo = p_id_modulo
    ORDER BY r.numero
  ),

  -- 2. Criterios de Evaluación vinculados a los RA y sus ponderaciones en el curso
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
      AND (v_id_curso IS NULL OR cc.id_curso = v_id_curso)
    ORDER BY c.numero
  ),

  -- 3. Actividades (Versiones) vinculadas al curso
  versiones_curso AS (
    SELECT
      v.id_version,
      t.id_ce,
      t.porcentaje::numeric AS porcentaje_cobertura
    FROM public."Versiones" v
    JOIN public.trabajan t ON t.id_version = v.id_version
    WHERE (v_id_curso IS NULL OR v.id_curso = v_id_curso)
  ),

  -- 4. Calificaciones del discente en las versiones
  notas_discente AS (
    SELECT
      e.id_version,
      e.nota::numeric AS nota
    FROM public.evaluan e
    JOIN public."Versiones" v ON v.id_version = e.id_version
    WHERE e.id_discente = p_id_discente
      AND (v_id_curso IS NULL OR v.id_curso = v_id_curso)
      AND e.nota IS NOT NULL
  ),

  -- 5. Calificación ponderada y cobertura evaluada por Criterio de Evaluación
  notas_ce AS (
    SELECT
      cm.id_ra,
      cm.id_ce,
      cm.peso AS peso_ce,
      COALESCE(SUM(nd.nota * (vc.porcentaje_cobertura / 100.0)), 0) AS nota_ponderada_ce,
      COALESCE(SUM(vc.porcentaje_cobertura), 0) AS cobertura_evaluada
    FROM ces_modulo cm
    LEFT JOIN versiones_curso vc ON vc.id_ce = cm.id_ce
    LEFT JOIN notas_discente nd ON nd.id_version = vc.id_version
    GROUP BY cm.id_ra, cm.id_ce, cm.peso
  ),

  -- 6. Agregación de la nota por Resultado de Aprendizaje
  notas_ra AS (
    SELECT
      rm.id_ra,
      rm.numero,
      rm.nombre,
      rm.descripcion,
      rm.peso,
      CASE
        WHEN COUNT(nce.id_ce) = 0 THEN NULL
        WHEN SUM(nce.cobertura_evaluada) = 0 THEN NULL
        WHEN SUM(nce.peso_ce) > 0 THEN
          ROUND(LEAST(100.0, GREATEST(0.0,
            SUM(LEAST(100.0, nce.nota_ponderada_ce) * nce.peso_ce) / SUM(nce.peso_ce)
          )))
        ELSE
          ROUND(LEAST(100.0, GREATEST(0.0, AVG(LEAST(100.0, nce.nota_ponderada_ce)))))
      END AS nota,
      COALESCE(BOOL_AND(nce.cobertura_evaluada >= 100.0), false) AS completo
    FROM ras_modulo rm
    LEFT JOIN notas_ce nce ON nce.id_ra = rm.id_ra
    GROUP BY rm.id_ra, rm.numero, rm.nombre, rm.descripcion, rm.peso
    ORDER BY rm.numero
  )

  -- 7. Documento JSON consolidado
  SELECT jsonb_build_object(
    'id_discente', p_id_discente,
    'id_modulo', p_id_modulo,
    'id_curso', v_id_curso,
    'ras', COALESCE((SELECT jsonb_agg(to_jsonb(nr)) FROM notas_ra nr), '[]'::jsonb)
  ) INTO v_resultado;

  RETURN v_resultado;
END;
$$;

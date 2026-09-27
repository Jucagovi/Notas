-- ==============================================================================
-- Función RPC: obtener_matriz_calor
-- Caso de uso 12.6: Mapa de Calor Curricular (Heatmap de Puntos Ciegos)
--
-- Se encarga del cruce computacional de datos curriculares y de calificaciones
-- para una clase y módulo específicos centrado en los Resultados de Aprendizaje (RA):
-- imparte -> Discentes -> RA -> CE -> ce_curso -> ra_curso -> Versiones -> trabajan -> evaluan
--
-- Devuelve un objeto JSON estructurado con:
--   - 'nivel_detalle': 'RA'
--   - 'columnas': lista ordenada de Resultados de Aprendizaje (código corto, nombre, descripción, peso)
--   - 'filas': lista de discentes con su mapa unívoco de calificaciones por RA
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.obtener_matriz_calor(
  p_id_curso uuid,
  p_id_modulo uuid,
  p_nivel_detalle text DEFAULT 'RA'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_resultado jsonb;
BEGIN
  -- Consulta focalizada en Resultados de Aprendizaje (RA).
  WITH
  -- 1. Discentes matriculados en la clase y módulo.
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

  -- 2. Resultados de Aprendizaje del módulo con sus pesos en el curso.
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

  -- 3. Criterios de Evaluación vinculados a los RA del módulo y sus ponderaciones en el curso.
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

  -- 4. Actividades y versiones asignadas a la clase con su cobertura porcentual en Criterios.
  versiones_clase AS (
    SELECT
      v.id_version,
      t.id_ce,
      t.porcentaje::numeric AS porcentaje_cobertura
    FROM public."Versiones" v
    JOIN public.trabajan t ON t.id_version = v.id_version
    WHERE v.id_curso = p_id_curso
  ),

  -- 5. Calificaciones registradas de los discentes en las versiones de actividades.
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

  -- 6. Calificación ponderada y cobertura evaluada por discente y Criterio de Evaluación.
  notas_ce AS (
    SELECT
      dc.id_discente,
      cm.id_ra,
      cm.id_ce,
      cm.peso AS peso_ce,
      COALESCE(SUM(nd.nota * (vc.porcentaje_cobertura / 100.0)), 0) AS nota_ponderada_ce,
      COALESCE(SUM(vc.porcentaje_cobertura), 0) AS cobertura_evaluada,
      COUNT(nd.nota) AS cant_notas
    FROM discentes_curso dc
    CROSS JOIN ces_modulo cm
    LEFT JOIN versiones_clase vc ON vc.id_ce = cm.id_ce
    LEFT JOIN notas_discentes nd
      ON nd.id_discente = dc.id_discente
      AND nd.id_version = vc.id_version
    GROUP BY dc.id_discente, cm.id_ra, cm.id_ce, cm.peso
  ),

  -- 7. Agregación de la calificación de cada Resultado de Aprendizaje por discente.
  notas_ra AS (
    SELECT
      nce.id_discente,
      nce.id_ra,
      CASE
        WHEN COUNT(CASE WHEN nce.cobertura_evaluada > 0 AND nce.cant_notas > 0 THEN 1 END) = 0 THEN NULL
        WHEN SUM(CASE WHEN nce.cobertura_evaluada > 0 AND nce.cant_notas > 0 THEN nce.peso_ce ELSE 0 END) > 0 THEN
          ROUND(LEAST(100.0, GREATEST(0.0,
            SUM(CASE WHEN nce.cobertura_evaluada > 0 AND nce.cant_notas > 0 THEN LEAST(100.0, nce.nota_ponderada_ce) * nce.peso_ce ELSE 0 END)
            / SUM(CASE WHEN nce.cobertura_evaluada > 0 AND nce.cant_notas > 0 THEN nce.peso_ce ELSE 0 END)
          )))
        ELSE
          ROUND(LEAST(100.0, GREATEST(0.0,
            AVG(CASE WHEN nce.cobertura_evaluada > 0 AND nce.cant_notas > 0 THEN LEAST(100.0, nce.nota_ponderada_ce) END)
          )))
      END AS nota_ra,
      COALESCE(BOOL_AND(nce.cobertura_evaluada >= 100.0), false) AS es_completo
    FROM notas_ce nce
    GROUP BY nce.id_discente, nce.id_ra
  ),

  -- 8. Construcción del mapa de calificaciones por discente para cada RA.
  mapa_discentes AS (
    SELECT
      dc.id_discente,
      dc.nombre,
      dc.apellidos,
      (dc.apellidos || ', ' || dc.nombre) AS nombre_completo,
      dc.nia,
      dc.correo,
      dc.imagen,
      dc.activo,
      COALESCE(
        jsonb_object_agg(
          nr.id_ra::text,
          jsonb_build_object(
            'id', nr.id_ra,
            'nota', nr.nota_ra,
            'completo', nr.es_completo
          )
        ) FILTER (WHERE nr.id_ra IS NOT NULL),
        '{}'::jsonb
      ) AS calificaciones
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
    ORDER BY dc.apellidos, dc.nombre
  ),

  -- 9. Estructuración de columnas dinámicas para los RA con código corto normalizado (ej. RA1, RA2).
  columnas_ra AS (
    SELECT
      rm.id_ra::text AS id,
      ('RA' || rm.numero) AS codigo,
      rm.nombre,
      rm.descripcion,
      rm.numero,
      rm.peso
    FROM ras_modulo rm
    ORDER BY rm.numero
  )

  -- 10. Generación del objeto JSON raíz para vista por RA.
  SELECT jsonb_build_object(
    'nivel_detalle', 'RA',
    'columnas', COALESCE((SELECT jsonb_agg(to_jsonb(r)) FROM columnas_ra r), '[]'::jsonb),
    'filas', COALESCE((SELECT jsonb_agg(to_jsonb(md)) FROM mapa_discentes md), '[]'::jsonb)
  ) INTO v_resultado;

  RETURN v_resultado;
END;
$$;

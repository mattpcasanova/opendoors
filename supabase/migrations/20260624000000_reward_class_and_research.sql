-- ============================================================================
-- Reward class (food vs school) + research instrumentation
--
-- Education pivot, phase 2. Two product features that double as a data model
-- for a student research / DECA project:
--
--   1) Every teacher reward is now classed as a FOOD reward (fries, cookie) or
--      a SCHOOL reward (bonus point, homework pass). A door a teacher sends can
--      be locked to food, locked to school, or left as the student's choice
--      ('either'). When a student spends an 'either' door, the class they pick
--      IS a revealed-preference data point (food vs school).
--
--   2) A place to record assessment scores (e.g. EOC) per student so a teacher
--      can correlate doors earned with academic performance.
--
-- Backward compatible: existing rewards default to 'food', existing doors
-- default to 'either' (they could already be spent on anything).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) reward_class on templates and granted perks; door_eligibility snapshot
-- ----------------------------------------------------------------------------
ALTER TABLE public.reward_templates
  ADD COLUMN IF NOT EXISTS reward_class text NOT NULL DEFAULT 'food'
    CHECK (reward_class IN ('food', 'school'));

ALTER TABLE public.granted_rewards
  ADD COLUMN IF NOT EXISTS reward_class text NOT NULL DEFAULT 'food'
    CHECK (reward_class IN ('food', 'school')),
  -- The eligibility of the door the student spent to get this reward.
  -- NULL when the teacher granted it directly (no door was spent).
  -- 'either' here = the student made a free food-vs-school choice.
  ADD COLUMN IF NOT EXISTS door_eligibility text
    CHECK (door_eligibility IN ('food_only', 'school_only', 'either'));

-- ----------------------------------------------------------------------------
-- 2) eligibility on the door itself (earned_rewards)
-- ----------------------------------------------------------------------------
ALTER TABLE public.earned_rewards
  ADD COLUMN IF NOT EXISTS eligibility text NOT NULL DEFAULT 'either'
    CHECK (eligibility IN ('food_only', 'school_only', 'either'));

COMMENT ON COLUMN public.earned_rewards.eligibility IS
  'What a teacher door may be spent on: food_only, school_only, or either (student chooses).';

-- ----------------------------------------------------------------------------
-- 3) add_earned_reward gains an eligibility argument (drop 6-arg, create 7-arg)
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.add_earned_reward(uuid, text, text, text, int, uuid);
CREATE OR REPLACE FUNCTION public.add_earned_reward(
  p_user_id uuid,
  p_source_type text,
  p_source_name text,
  p_description text DEFAULT NULL,
  p_doors_earned int DEFAULT 1,
  p_source_teacher_id uuid DEFAULT NULL,
  p_eligibility text DEFAULT 'either'
) RETURNS public.earned_rewards
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.earned_rewards(
    user_id, source_type, source_name, description, doors_earned,
    source_teacher_id, eligibility)
  VALUES (
    p_user_id, p_source_type::text, p_source_name, p_description, p_doors_earned,
    p_source_teacher_id, COALESCE(p_eligibility, 'either'))
  RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.add_earned_reward(uuid, text, text, text, int, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_earned_reward(uuid, text, text, text, int, uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.add_earned_reward(uuid, text, text, text, int, uuid, text) TO authenticated;

-- ----------------------------------------------------------------------------
-- 4) grant_classroom_reward snapshots reward_class (drop 7-arg, create 8-arg)
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.grant_classroom_reward(uuid, uuid, uuid, text, text, text, text);
CREATE OR REPLACE FUNCTION public.grant_classroom_reward(
  p_class_id uuid,
  p_student_id uuid,
  p_template_id uuid DEFAULT NULL,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_icon text DEFAULT NULL,
  p_note text DEFAULT NULL,
  p_reward_class text DEFAULT NULL
) RETURNS public.granted_rewards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row public.granted_rewards;
  v_title text;
  v_desc text;
  v_icon text;
  v_type text := 'direct';
  v_doors smallint := 3;
  v_class text := NULL;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = p_class_id AND c.teacher_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized for this class';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.class_enrollments e
    WHERE e.class_id = p_class_id AND e.student_id = p_student_id
  ) THEN
    RAISE EXCEPTION 'Student not enrolled in this class';
  END IF;

  IF p_template_id IS NOT NULL THEN
    SELECT title, description, icon, reward_type, doors, reward_class
      INTO v_title, v_desc, v_icon, v_type, v_doors, v_class
    FROM public.reward_templates
    WHERE id = p_template_id AND teacher_id = auth.uid();
  END IF;

  v_title := COALESCE(v_title, p_title);
  v_desc := COALESCE(v_desc, p_description);
  v_icon := COALESCE(v_icon, p_icon);
  v_class := COALESCE(v_class, p_reward_class, 'food');

  IF v_class NOT IN ('food', 'school') THEN
    RAISE EXCEPTION 'Invalid reward_class %', v_class;
  END IF;

  IF v_title IS NULL OR length(trim(v_title)) = 0 THEN
    RAISE EXCEPTION 'Reward title required';
  END IF;

  INSERT INTO public.granted_rewards(
    template_id, class_id, teacher_id, student_id, title, description, icon, status,
    reward_type, doors, note, reward_class)
  VALUES (
    p_template_id, p_class_id, auth.uid(), p_student_id, v_title, v_desc, v_icon, 'granted',
    COALESCE(v_type, 'direct'), COALESCE(v_doors, 3), p_note, v_class)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text, text, text) TO authenticated;

-- ----------------------------------------------------------------------------
-- 5) spend_door_on_item: match door eligibility to the item's class, and record
--    which kind of door was spent (the revealed-preference signal).
--
--    A food item can be bought with a food_only or an 'either' door; a school
--    item with a school_only or an 'either' door. Single-purpose doors are
--    spent first so the flexible 'either' door is saved for a genuine choice.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.spend_door_on_item(p_template_id uuid)
RETURNS public.granted_rewards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_tpl public.reward_templates;
  v_class_id uuid;
  v_door_id uuid;
  v_door_elig text;
  v_status public.granted_reward_status;
  v_row public.granted_rewards;
BEGIN
  SELECT * INTO v_tpl FROM public.reward_templates WHERE id = p_template_id AND is_active = true;
  IF v_tpl.id IS NULL THEN
    RAISE EXCEPTION 'Item not found';
  END IF;

  SELECT e.class_id INTO v_class_id
  FROM public.class_enrollments e
  JOIN public.classes c ON c.id = e.class_id
  WHERE e.student_id = auth.uid()
    AND c.teacher_id = v_tpl.teacher_id
    AND (v_tpl.class_id IS NULL OR v_tpl.class_id = e.class_id)
  LIMIT 1;
  IF v_class_id IS NULL THEN
    RAISE EXCEPTION 'Not eligible for this item';
  END IF;

  -- Pick a door whose eligibility permits this item's class. Prefer a
  -- single-purpose door (eligibility = '<class>_only') before an 'either' door.
  SELECT id, eligibility INTO v_door_id, v_door_elig
  FROM public.earned_rewards
  WHERE user_id = auth.uid()
    AND source_teacher_id = v_tpl.teacher_id
    AND claimed = false
    AND eligibility IN (v_tpl.reward_class || '_only', 'either')
  ORDER BY (eligibility = 'either'), created_at ASC
  LIMIT 1;
  IF v_door_id IS NULL THEN
    RAISE EXCEPTION 'No % doors from this teacher', v_tpl.reward_class;
  END IF;

  UPDATE public.earned_rewards
  SET claimed = true, claimed_at = now()
  WHERE id = v_door_id;

  v_status := CASE WHEN v_tpl.reward_type = 'game'
                   THEN 'granted'::public.granted_reward_status
                   ELSE 'redeem_requested'::public.granted_reward_status END;

  INSERT INTO public.granted_rewards(
    template_id, class_id, teacher_id, student_id, title, description, icon,
    status, reward_type, doors, reward_class, door_eligibility, requested_at)
  VALUES (
    v_tpl.id, v_class_id, v_tpl.teacher_id, auth.uid(), v_tpl.title, v_tpl.description, v_tpl.icon,
    v_status, v_tpl.reward_type, v_tpl.doors, v_tpl.reward_class, v_door_elig,
    CASE WHEN v_status = 'redeem_requested' THEN now() ELSE NULL END)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.spend_door_on_item(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.spend_door_on_item(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.spend_door_on_item(uuid) TO authenticated;

-- ----------------------------------------------------------------------------
-- 6) get_my_teachers: break the door balance down by eligibility so the student
--    UI can show what each item can actually be bought with.
-- ----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_my_teachers();
CREATE OR REPLACE FUNCTION public.get_my_teachers()
RETURNS TABLE (
  teacher_id uuid,
  first_name text,
  last_name text,
  email text,
  door_count bigint,
  either_doors bigint,
  food_doors bigint,
  school_doors bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.id, t.first_name, t.last_name, t.email,
         COALESCE(d.total, 0)  AS door_count,
         COALESCE(d.either, 0) AS either_doors,
         COALESCE(d.food, 0)   AS food_doors,
         COALESCE(d.school, 0) AS school_doors
  FROM (
    SELECT DISTINCT c.teacher_id
    FROM public.class_enrollments e
    JOIN public.classes c ON c.id = e.class_id
    WHERE e.student_id = auth.uid()
  ) tc
  JOIN public.user_profiles t ON t.id = tc.teacher_id
  LEFT JOIN LATERAL (
    SELECT
      count(*)                                          AS total,
      count(*) FILTER (WHERE er.eligibility = 'either')      AS either,
      count(*) FILTER (WHERE er.eligibility = 'food_only')   AS food,
      count(*) FILTER (WHERE er.eligibility = 'school_only') AS school
    FROM public.earned_rewards er
    WHERE er.user_id = auth.uid()
      AND er.source_teacher_id = t.id
      AND er.claimed = false
  ) d ON true
  ORDER BY t.last_name NULLS LAST, t.first_name NULLS LAST;
$$;
REVOKE ALL ON FUNCTION public.get_my_teachers() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_teachers() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_teachers() TO authenticated;

-- ----------------------------------------------------------------------------
-- 7) Reward-preference analytics: food vs school, for the calling teacher.
--    "choice_*" counts only rewards a student got by spending an 'either' door
--    (a genuine free choice). "all_*" counts every reward of that class.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_reward_preference_stats(p_class_id uuid DEFAULT NULL)
RETURNS TABLE (
  choice_food   bigint,
  choice_school bigint,
  all_food      bigint,
  all_school    bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    count(*) FILTER (WHERE door_eligibility = 'either' AND reward_class = 'food')   AS choice_food,
    count(*) FILTER (WHERE door_eligibility = 'either' AND reward_class = 'school') AS choice_school,
    count(*) FILTER (WHERE reward_class = 'food')   AS all_food,
    count(*) FILTER (WHERE reward_class = 'school') AS all_school
  FROM public.granted_rewards g
  WHERE g.teacher_id = auth.uid()
    AND (p_class_id IS NULL OR g.class_id = p_class_id)
    AND g.status <> 'revoked';
$$;
REVOKE ALL ON FUNCTION public.get_reward_preference_stats(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_reward_preference_stats(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_reward_preference_stats(uuid) TO authenticated;

-- ----------------------------------------------------------------------------
-- 8) Student assessments (e.g. EOC scores) for doors-vs-performance analysis.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_assessments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  student_id      uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  class_id        uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  assessment_name text NOT NULL,
  score           numeric NOT NULL,
  max_score       numeric,
  term            text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, student_id, assessment_name)
);
CREATE INDEX IF NOT EXISTS idx_assessments_teacher ON public.student_assessments(teacher_id, assessment_name);

ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS assess_teacher_all ON public.student_assessments';
  EXECUTE 'DROP POLICY IF EXISTS assess_student_read ON public.student_assessments';
END $$;

-- Teacher owns the scores they record; the student may read their own.
CREATE POLICY assess_teacher_all ON public.student_assessments
  FOR ALL USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY assess_student_read ON public.student_assessments
  FOR SELECT USING (student_id = auth.uid());

-- Upsert one score (teacher must teach a class the student is enrolled in).
CREATE OR REPLACE FUNCTION public.upsert_student_assessment(
  p_student_id uuid,
  p_assessment_name text,
  p_score numeric,
  p_max_score numeric DEFAULT NULL,
  p_class_id uuid DEFAULT NULL,
  p_term text DEFAULT NULL
) RETURNS public.student_assessments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row public.student_assessments;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.class_enrollments e
    JOIN public.classes c ON c.id = e.class_id
    WHERE e.student_id = p_student_id AND c.teacher_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Student is not in any of your classes';
  END IF;

  IF p_assessment_name IS NULL OR length(trim(p_assessment_name)) = 0 THEN
    RAISE EXCEPTION 'Assessment name required';
  END IF;

  INSERT INTO public.student_assessments(
    teacher_id, student_id, class_id, assessment_name, score, max_score, term)
  VALUES (
    auth.uid(), p_student_id, p_class_id, trim(p_assessment_name), p_score, p_max_score, p_term)
  ON CONFLICT (teacher_id, student_id, assessment_name)
  DO UPDATE SET
    score = EXCLUDED.score,
    max_score = EXCLUDED.max_score,
    class_id = EXCLUDED.class_id,
    term = EXCLUDED.term,
    updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.upsert_student_assessment(uuid, text, numeric, numeric, uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.upsert_student_assessment(uuid, text, numeric, numeric, uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.upsert_student_assessment(uuid, text, numeric, numeric, uuid, text) TO authenticated;

-- Distinct assessment names the teacher has recorded (for a picker).
CREATE OR REPLACE FUNCTION public.get_my_assessment_names()
RETURNS TABLE (assessment_name text, recorded_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT assessment_name, count(*)
  FROM public.student_assessments
  WHERE teacher_id = auth.uid()
  GROUP BY assessment_name
  ORDER BY assessment_name;
$$;
REVOKE ALL ON FUNCTION public.get_my_assessment_names() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_assessment_names() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_assessment_names() TO authenticated;

-- Doors earned (from this teacher) vs an assessment score, per student in a
-- class. Drives the correlation table/scatter in the teacher Insights view.
CREATE OR REPLACE FUNCTION public.get_doors_vs_assessment(
  p_class_id uuid,
  p_assessment_name text
)
RETURNS TABLE (
  student_id   uuid,
  first_name   text,
  last_name    text,
  email        text,
  doors_earned bigint,
  score        numeric,
  max_score    numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = p_class_id AND c.teacher_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized for this class';
  END IF;

  RETURN QUERY
  SELECT
    p.id, p.first_name, p.last_name, p.email,
    COALESCE((
      SELECT count(*) FROM public.earned_rewards er
      WHERE er.user_id = p.id AND er.source_teacher_id = auth.uid()
    ), 0) AS doors_earned,
    a.score,
    a.max_score
  FROM public.class_enrollments e
  JOIN public.user_profiles p ON p.id = e.student_id
  LEFT JOIN public.student_assessments a
    ON a.student_id = p.id
   AND a.teacher_id = auth.uid()
   AND a.assessment_name = p_assessment_name
  WHERE e.class_id = p_class_id
  ORDER BY p.last_name NULLS LAST, p.first_name NULLS LAST;
END;
$$;
REVOKE ALL ON FUNCTION public.get_doors_vs_assessment(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_doors_vs_assessment(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_doors_vs_assessment(uuid, text) TO authenticated;

COMMENT ON TABLE public.student_assessments IS
  'Teacher-recorded assessment scores (e.g. EOC) for doors-vs-performance research.';

-- A shared class goal: when the class has been sent N doors total, they hit a
-- reward (e.g. movie day). Builds community, not just individual competition.
CREATE TABLE IF NOT EXISTS public.class_goals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id     uuid NOT NULL UNIQUE REFERENCES public.classes(id) ON DELETE CASCADE,
  title        text NOT NULL,
  target_doors int NOT NULL CHECK (target_doors > 0),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.class_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS class_goals_teacher ON public.class_goals;
DROP POLICY IF EXISTS class_goals_student_read ON public.class_goals;
CREATE POLICY class_goals_teacher ON public.class_goals
  FOR ALL USING (public.is_class_teacher(class_id)) WITH CHECK (public.is_class_teacher(class_id));
CREATE POLICY class_goals_student_read ON public.class_goals
  FOR SELECT USING (public.is_enrolled_in_class(class_id));

-- Goal + current progress (doors the teacher has sent to this class so far)
CREATE OR REPLACE FUNCTION public.get_class_goal(p_class_id uuid)
RETURNS TABLE (title text, target_doors int, progress bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT (public.is_class_teacher(p_class_id) OR public.is_enrolled_in_class(p_class_id)) THEN
    RAISE EXCEPTION 'Not authorized for this class';
  END IF;

  RETURN QUERY
  SELECT g.title, g.target_doors,
    COALESCE((
      SELECT sum(dd.doors_sent)
      FROM public.door_distributions dd
      JOIN public.classes c ON c.id = p_class_id
      WHERE dd.distributor_id = c.teacher_id
        AND dd.recipient_id IN (
          SELECT e.student_id FROM public.class_enrollments e WHERE e.class_id = p_class_id
        )
    ), 0)::bigint AS progress
  FROM public.class_goals g
  WHERE g.class_id = p_class_id;
END;
$$;
REVOKE ALL ON FUNCTION public.get_class_goal(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_class_goal(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_class_goal(uuid) TO authenticated;

-- Teacher sets/updates the goal
CREATE OR REPLACE FUNCTION public.set_class_goal(p_class_id uuid, p_title text, p_target int)
RETURNS public.class_goals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_row public.class_goals;
BEGIN
  IF NOT public.is_class_teacher(p_class_id) THEN
    RAISE EXCEPTION 'Not authorized for this class';
  END IF;
  IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
    RAISE EXCEPTION 'Goal title required';
  END IF;
  IF p_target IS NULL OR p_target <= 0 THEN
    RAISE EXCEPTION 'Target must be greater than 0';
  END IF;

  INSERT INTO public.class_goals(class_id, title, target_doors)
  VALUES (p_class_id, trim(p_title), p_target)
  ON CONFLICT (class_id) DO UPDATE
    SET title = excluded.title, target_doors = excluded.target_doors, updated_at = now()
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.set_class_goal(uuid, text, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_class_goal(uuid, text, int) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_class_goal(uuid, text, int) TO authenticated;

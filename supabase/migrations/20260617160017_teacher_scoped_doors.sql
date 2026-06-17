-- Doors become teacher-scoped: a door records which teacher issued it.
-- A teacher's items can only be bought with that teacher's doors; general
-- (home) games accept any door.

ALTER TABLE public.earned_rewards
  ADD COLUMN IF NOT EXISTS source_teacher_id uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_earned_rewards_teacher_unclaimed
  ON public.earned_rewards(user_id, source_teacher_id) WHERE claimed = false;

-- Backfill existing teacher-sent doors by matching the stored teacher name.
UPDATE public.earned_rewards er
SET source_teacher_id = up.id
FROM public.user_profiles up
WHERE er.source_type = 'teacher'
  AND er.source_teacher_id IS NULL
  AND up.user_type = 'teacher'
  AND btrim(coalesce(up.first_name,'') || ' ' || coalesce(up.last_name,'')) = er.source_name;

-- add_earned_reward gains an optional teacher id (drop old 5-arg, create 6-arg)
DROP FUNCTION IF EXISTS public.add_earned_reward(uuid, text, text, text, int);
CREATE OR REPLACE FUNCTION public.add_earned_reward(
  p_user_id uuid,
  p_source_type text,
  p_source_name text,
  p_description text DEFAULT NULL,
  p_doors_earned int DEFAULT 1,
  p_source_teacher_id uuid DEFAULT NULL
) RETURNS public.earned_rewards
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.earned_rewards(user_id, source_type, source_name, description, doors_earned, source_teacher_id)
  VALUES (p_user_id, p_source_type::text, p_source_name, p_description, p_doors_earned, p_source_teacher_id)
  RETURNING *;
$$;
REVOKE ALL ON FUNCTION public.add_earned_reward(uuid, text, text, text, int, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_earned_reward(uuid, text, text, text, int, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.add_earned_reward(uuid, text, text, text, int, uuid) TO authenticated;

-- Student's teachers + how many of each teacher's doors they hold
CREATE OR REPLACE FUNCTION public.get_my_teachers()
RETURNS TABLE (teacher_id uuid, first_name text, last_name text, email text, door_count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT t.id, t.first_name, t.last_name, t.email,
         COALESCE((
           SELECT count(*) FROM public.earned_rewards er
           WHERE er.user_id = auth.uid() AND er.source_teacher_id = t.id AND er.claimed = false
         ), 0)
  FROM (
    SELECT DISTINCT c.teacher_id
    FROM public.class_enrollments e
    JOIN public.classes c ON c.id = e.class_id
    WHERE e.student_id = auth.uid()
  ) tc
  JOIN public.user_profiles t ON t.id = tc.teacher_id
  ORDER BY t.last_name NULLS LAST, t.first_name NULLS LAST;
$$;
REVOKE ALL ON FUNCTION public.get_my_teachers() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_teachers() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_teachers() TO authenticated;

-- Student spends one of a teacher's doors on that teacher's item.
-- direct item -> claim goes to teacher's Pending queue (redeem_requested)
-- game item   -> a 'granted' try the student then plays (record_reward_game)
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

  SELECT id INTO v_door_id
  FROM public.earned_rewards
  WHERE user_id = auth.uid()
    AND source_teacher_id = v_tpl.teacher_id
    AND claimed = false
  ORDER BY created_at ASC
  LIMIT 1;
  IF v_door_id IS NULL THEN
    RAISE EXCEPTION 'No doors from this teacher';
  END IF;

  UPDATE public.earned_rewards
  SET claimed = true, claimed_at = now()
  WHERE id = v_door_id;

  v_status := CASE WHEN v_tpl.reward_type = 'game'
                   THEN 'granted'::public.granted_reward_status
                   ELSE 'redeem_requested'::public.granted_reward_status END;

  INSERT INTO public.granted_rewards(
    template_id, class_id, teacher_id, student_id, title, description, icon,
    status, reward_type, doors, requested_at)
  VALUES (
    v_tpl.id, v_class_id, v_tpl.teacher_id, auth.uid(), v_tpl.title, v_tpl.description, v_tpl.icon,
    v_status, v_tpl.reward_type, v_tpl.doors,
    CASE WHEN v_status = 'redeem_requested' THEN now() ELSE NULL END)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.spend_door_on_item(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.spend_door_on_item(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.spend_door_on_item(uuid) TO authenticated;

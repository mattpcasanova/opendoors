-- Let teachers attach an encouraging note when granting a reward.
DROP FUNCTION IF EXISTS public.grant_classroom_reward(uuid, uuid, uuid, text, text, text);
CREATE OR REPLACE FUNCTION public.grant_classroom_reward(
  p_class_id uuid,
  p_student_id uuid,
  p_template_id uuid DEFAULT NULL,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_icon text DEFAULT NULL,
  p_note text DEFAULT NULL
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
    SELECT title, description, icon, reward_type, doors
      INTO v_title, v_desc, v_icon, v_type, v_doors
    FROM public.reward_templates
    WHERE id = p_template_id AND teacher_id = auth.uid();
  END IF;

  v_title := COALESCE(v_title, p_title);
  v_desc := COALESCE(v_desc, p_description);
  v_icon := COALESCE(v_icon, p_icon);

  IF v_title IS NULL OR length(trim(v_title)) = 0 THEN
    RAISE EXCEPTION 'Reward title required';
  END IF;

  INSERT INTO public.granted_rewards(
    template_id, class_id, teacher_id, student_id, title, description, icon, status,
    reward_type, doors, note)
  VALUES (
    p_template_id, p_class_id, auth.uid(), p_student_id, v_title, v_desc, v_icon, 'granted',
    COALESCE(v_type, 'direct'), COALESCE(v_doors, 3), p_note)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text, text) TO authenticated;

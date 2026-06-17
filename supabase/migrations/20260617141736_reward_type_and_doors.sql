-- Teacher rewards can be a direct gift or a "play to win" game with a door
-- count (3/5/7) that sets the odds (more doors = lower odds = better prize).

ALTER TABLE public.reward_templates
  ADD COLUMN IF NOT EXISTS reward_type text NOT NULL DEFAULT 'direct'
    CHECK (reward_type IN ('direct', 'game')),
  ADD COLUMN IF NOT EXISTS doors smallint NOT NULL DEFAULT 3
    CHECK (doors IN (3, 5, 7));

ALTER TABLE public.granted_rewards
  ADD COLUMN IF NOT EXISTS reward_type text NOT NULL DEFAULT 'direct'
    CHECK (reward_type IN ('direct', 'game')),
  ADD COLUMN IF NOT EXISTS doors smallint NOT NULL DEFAULT 3
    CHECK (doors IN (3, 5, 7));

-- Snapshot reward_type + doors when granting (from the template or params)
CREATE OR REPLACE FUNCTION public.grant_classroom_reward(
  p_class_id uuid,
  p_student_id uuid,
  p_template_id uuid DEFAULT NULL,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_icon text DEFAULT NULL
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
    reward_type, doors)
  VALUES (
    p_template_id, p_class_id, auth.uid(), p_student_id, v_title, v_desc, v_icon, 'granted',
    COALESCE(v_type, 'direct'), COALESCE(v_doors, 3))
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text) TO authenticated;

-- Student records the result of playing a game-type reward (one shot):
-- win  -> redeem_requested (goes to teacher's Pending queue to confirm)
-- lose -> lost (used up)
CREATE OR REPLACE FUNCTION public.record_reward_game(p_granted_id uuid, p_won boolean)
RETURNS public.granted_rewards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row public.granted_rewards;
BEGIN
  UPDATE public.granted_rewards
  SET status = CASE WHEN p_won THEN 'redeem_requested'::public.granted_reward_status
                    ELSE 'lost'::public.granted_reward_status END,
      requested_at = CASE WHEN p_won THEN now() ELSE requested_at END,
      updated_at = now()
  WHERE id = p_granted_id
    AND student_id = auth.uid()
    AND status = 'granted'
    AND reward_type = 'game'
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Cannot record result for this reward';
  END IF;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.record_reward_game(uuid, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_reward_game(uuid, boolean) FROM anon;
GRANT EXECUTE ON FUNCTION public.record_reward_game(uuid, boolean) TO authenticated;

-- ============================================================================
-- Group rewards: a class-wide reward students fund by pooling their own doors.
--
-- Different from class_goals (which auto-tracks doors the TEACHER sent). Here
-- the teacher sets a target, and STUDENTS choose to contribute the doors they
-- hold from that teacher toward a shared prize (e.g. "Pizza party at 100 doors").
-- A contribution spends the student's eligible teacher-doors, matching the
-- reward's class (food/school) the same way spending on an item does.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.group_rewards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id    uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  reward_class  text NOT NULL DEFAULT 'school' CHECK (reward_class IN ('food', 'school')),
  target_doors  int NOT NULL CHECK (target_doors > 0),
  is_active     boolean NOT NULL DEFAULT true,
  fulfilled_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_group_rewards_class ON public.group_rewards(class_id) WHERE is_active;

CREATE TABLE IF NOT EXISTS public.group_reward_contributions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_reward_id  uuid NOT NULL REFERENCES public.group_rewards(id) ON DELETE CASCADE,
  student_id       uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  doors            int NOT NULL CHECK (doors > 0),
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_grc_group ON public.group_reward_contributions(group_reward_id);
CREATE INDEX IF NOT EXISTS idx_grc_student ON public.group_reward_contributions(student_id);

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
ALTER TABLE public.group_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_reward_contributions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS group_rewards_teacher ON public.group_rewards';
  EXECUTE 'DROP POLICY IF EXISTS group_rewards_student_read ON public.group_rewards';
  EXECUTE 'DROP POLICY IF EXISTS grc_student_own ON public.group_reward_contributions';
  EXECUTE 'DROP POLICY IF EXISTS grc_teacher_read ON public.group_reward_contributions';
  EXECUTE 'DROP POLICY IF EXISTS grc_no_direct_insert ON public.group_reward_contributions';
END $$;

CREATE POLICY group_rewards_teacher ON public.group_rewards
  FOR ALL USING (public.is_class_teacher(class_id)) WITH CHECK (public.is_class_teacher(class_id));
CREATE POLICY group_rewards_student_read ON public.group_rewards
  FOR SELECT USING (public.is_enrolled_in_class(class_id));

-- Contributions: a student reads their own; the owning teacher reads all for
-- their group rewards. All writes go through the SECURITY DEFINER RPC.
CREATE POLICY grc_student_own ON public.group_reward_contributions
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY grc_teacher_read ON public.group_reward_contributions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.group_rewards g
    WHERE g.id = group_reward_contributions.group_reward_id
      AND public.is_class_teacher(g.class_id)));
CREATE POLICY grc_no_direct_insert ON public.group_reward_contributions
  FOR INSERT WITH CHECK (false);

-- ----------------------------------------------------------------------------
-- Teacher: create / update / delete a group reward
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_group_reward(
  p_class_id uuid,
  p_title text,
  p_target int,
  p_description text DEFAULT NULL,
  p_reward_class text DEFAULT 'school'
) RETURNS public.group_rewards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE v_row public.group_rewards;
BEGIN
  IF NOT public.is_class_teacher(p_class_id) THEN
    RAISE EXCEPTION 'Not authorized for this class';
  END IF;
  IF p_title IS NULL OR length(trim(p_title)) = 0 THEN
    RAISE EXCEPTION 'Group reward title required';
  END IF;
  IF p_target IS NULL OR p_target <= 0 THEN
    RAISE EXCEPTION 'Target must be greater than 0';
  END IF;
  IF COALESCE(p_reward_class, 'school') NOT IN ('food', 'school') THEN
    RAISE EXCEPTION 'Invalid reward_class %', p_reward_class;
  END IF;

  INSERT INTO public.group_rewards(class_id, teacher_id, title, description, reward_class, target_doors)
  VALUES (p_class_id, auth.uid(), trim(p_title), p_description, COALESCE(p_reward_class, 'school'), p_target)
  RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.create_group_reward(uuid, text, int, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_group_reward(uuid, text, int, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_group_reward(uuid, text, int, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.deactivate_group_reward(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.group_rewards
  SET is_active = false, updated_at = now()
  WHERE id = p_id AND public.is_class_teacher(class_id);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not authorized for this group reward';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.deactivate_group_reward(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.deactivate_group_reward(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.deactivate_group_reward(uuid) TO authenticated;

-- ----------------------------------------------------------------------------
-- Student: contribute doors to a group reward.
-- Consumes the student's eligible unclaimed teacher-doors (single-purpose
-- before "either"), capped at the doors still needed.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.contribute_to_group_reward(p_group_id uuid, p_doors int)
RETURNS public.group_reward_contributions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_gr public.group_rewards;
  v_progress int;
  v_remaining int;
  v_take int;
  v_consumed int;
  v_row public.group_reward_contributions;
BEGIN
  IF p_doors IS NULL OR p_doors <= 0 THEN
    RAISE EXCEPTION 'Contribute at least 1 door';
  END IF;

  SELECT * INTO v_gr FROM public.group_rewards
  WHERE id = p_group_id AND is_active = true;
  IF v_gr.id IS NULL THEN
    RAISE EXCEPTION 'Group reward not found';
  END IF;

  IF NOT public.is_enrolled_in_class(v_gr.class_id) THEN
    RAISE EXCEPTION 'You are not in this class';
  END IF;

  SELECT COALESCE(sum(doors), 0) INTO v_progress
  FROM public.group_reward_contributions
  WHERE group_reward_id = p_group_id;

  v_remaining := v_gr.target_doors - v_progress;
  IF v_remaining <= 0 THEN
    RAISE EXCEPTION 'This group reward is already complete';
  END IF;
  v_take := LEAST(p_doors, v_remaining);

  -- Spend v_take eligible doors from this teacher (single-purpose first).
  WITH picks AS (
    SELECT id FROM public.earned_rewards
    WHERE user_id = auth.uid()
      AND source_teacher_id = v_gr.teacher_id
      AND claimed = false
      AND eligibility IN (v_gr.reward_class || '_only', 'either')
    ORDER BY (eligibility = 'either'), created_at ASC
    LIMIT v_take
  )
  UPDATE public.earned_rewards e
  SET claimed = true, claimed_at = now()
  FROM picks
  WHERE e.id = picks.id;

  GET DIAGNOSTICS v_consumed = ROW_COUNT;
  IF v_consumed < v_take THEN
    -- Not enough eligible doors; the UPDATE rolls back with this exception.
    RAISE EXCEPTION 'You only have % eligible % door(s)', v_consumed, v_gr.reward_class;
  END IF;

  INSERT INTO public.group_reward_contributions(group_reward_id, student_id, doors)
  VALUES (p_group_id, auth.uid(), v_take)
  RETURNING * INTO v_row;

  -- Mark fulfilled the moment the pool reaches the target.
  IF v_progress + v_take >= v_gr.target_doors THEN
    UPDATE public.group_rewards
    SET fulfilled_at = COALESCE(fulfilled_at, now()), updated_at = now()
    WHERE id = p_group_id;
  END IF;

  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.contribute_to_group_reward(uuid, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.contribute_to_group_reward(uuid, int) FROM anon;
GRANT EXECUTE ON FUNCTION public.contribute_to_group_reward(uuid, int) TO authenticated;

-- ----------------------------------------------------------------------------
-- Reads
-- ----------------------------------------------------------------------------

-- Teacher: active group rewards for one class, with progress + contributor count.
CREATE OR REPLACE FUNCTION public.get_class_group_rewards(p_class_id uuid)
RETURNS TABLE (
  id           uuid,
  title        text,
  description  text,
  reward_class text,
  target_doors int,
  progress     bigint,
  contributors bigint,
  fulfilled_at timestamptz,
  created_at   timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_class_teacher(p_class_id) THEN
    RAISE EXCEPTION 'Not authorized for this class';
  END IF;

  RETURN QUERY
  SELECT g.id, g.title, g.description, g.reward_class, g.target_doors,
    COALESCE(c.total, 0)::bigint AS progress,
    COALESCE(c.people, 0)::bigint AS contributors,
    g.fulfilled_at, g.created_at
  FROM public.group_rewards g
  LEFT JOIN LATERAL (
    SELECT sum(doors) AS total, count(DISTINCT student_id) AS people
    FROM public.group_reward_contributions rc
    WHERE rc.group_reward_id = g.id
  ) c ON true
  WHERE g.class_id = p_class_id AND g.is_active = true
  ORDER BY g.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.get_class_group_rewards(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_class_group_rewards(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_class_group_rewards(uuid) TO authenticated;

-- Student: active group rewards across the classes they share with one teacher,
-- with shared progress and how much the student has personally chipped in.
CREATE OR REPLACE FUNCTION public.get_group_rewards_for_teacher(p_teacher_id uuid)
RETURNS TABLE (
  id              uuid,
  class_id        uuid,
  class_name      text,
  title           text,
  description     text,
  reward_class    text,
  target_doors    int,
  progress        bigint,
  my_contribution bigint,
  fulfilled_at    timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT g.id, g.class_id, cl.name, g.title, g.description, g.reward_class, g.target_doors,
    COALESCE((SELECT sum(doors) FROM public.group_reward_contributions rc
              WHERE rc.group_reward_id = g.id), 0)::bigint AS progress,
    COALESCE((SELECT sum(doors) FROM public.group_reward_contributions rc
              WHERE rc.group_reward_id = g.id AND rc.student_id = auth.uid()), 0)::bigint AS my_contribution,
    g.fulfilled_at
  FROM public.group_rewards g
  JOIN public.classes cl ON cl.id = g.class_id
  JOIN public.class_enrollments e ON e.class_id = g.class_id AND e.student_id = auth.uid()
  WHERE g.teacher_id = p_teacher_id AND g.is_active = true
  ORDER BY g.created_at DESC;
$$;
REVOKE ALL ON FUNCTION public.get_group_rewards_for_teacher(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_group_rewards_for_teacher(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_group_rewards_for_teacher(uuid) TO authenticated;

COMMENT ON TABLE public.group_rewards IS
  'Class-wide rewards students fund by pooling the doors they hold from the teacher.';

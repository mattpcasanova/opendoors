-- ============================================================================
-- School system: classes, enrollments, teacher reward templates, and granted
-- classroom perks with a teacher-confirmed redemption lifecycle.
--
-- Education pivot, phase 1:
--   * Teachers (user_profiles.user_type = 'teacher') own classes; the owner
--     seeds teacher designation + class enrollments directly via SQL.
--   * Teachers create reward templates, grant perks to enrolled students, and
--     confirm redemption requests.
--   * Doors (game plays) continue to flow through the existing distributor
--     pipeline; this migration just lets teachers use it too.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Allow 'teacher' as an earned_rewards source_type
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'earned_rewards_source_type_check'
      AND conrelid = 'public.earned_rewards'::regclass
      AND pg_get_constraintdef(oid) LIKE '%teacher%'
  ) THEN
    ALTER TABLE public.earned_rewards
      DROP CONSTRAINT IF EXISTS earned_rewards_source_type_check;

    ALTER TABLE public.earned_rewards
      ADD CONSTRAINT earned_rewards_source_type_check
      CHECK (source_type IN (
        'ad_watch', 'referral', 'distributor', 'achievement',
        'lesson', 'survey', 'teacher'
      ));

    RAISE NOTICE 'Added teacher to earned_rewards source_type';
  END IF;
END $$;

COMMENT ON COLUMN public.earned_rewards.source_type IS
  'Type of reward source: ad_watch, referral, distributor, achievement, lesson, survey, or teacher';

-- ----------------------------------------------------------------------------
-- 2) Let teachers distribute doors via the existing privileged function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_door_distribution(
  distributor_id uuid,
  recipient_id uuid,
  organization_id uuid,
  doors_sent integer,
  reason text
) RETURNS public.door_distributions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dist public.door_distributions;
  v_authorized boolean;
BEGIN
  -- validate sender is a distributor OR a teacher
  SELECT COALESCE(user_type IN ('distributor', 'teacher'), false)
    INTO v_authorized
  FROM public.user_profiles
  WHERE id = distributor_id;

  IF NOT v_authorized THEN
    RAISE EXCEPTION 'Not authorized to distribute doors';
  END IF;

  INSERT INTO public.door_distributions(distributor_id, recipient_id, organization_id, doors_sent, reason)
  VALUES (distributor_id, recipient_id, organization_id, doors_sent, reason)
  RETURNING * INTO v_dist;

  RETURN v_dist;
END;
$$;

REVOKE ALL ON FUNCTION public.create_door_distribution(uuid, uuid, uuid, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_door_distribution(uuid, uuid, uuid, integer, text) TO authenticated;

-- ----------------------------------------------------------------------------
-- 3) Tables
-- ----------------------------------------------------------------------------

-- classes: a teacher's named class/period
CREATE TABLE IF NOT EXISTS public.classes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  name            text NOT NULL,
  description     text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);

-- class_enrollments: which student is in which class
CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id  uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_enroll_student ON public.class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enroll_class ON public.class_enrollments(class_id);

-- reward_templates: teacher-defined perk types they can grant.
-- class_id NULL => usable across all of the teacher's classes.
CREATE TABLE IF NOT EXISTS public.reward_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  class_id    uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  icon        text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_templates_teacher ON public.reward_templates(teacher_id);

-- granted_rewards: an instance of a perk granted to a specific student.
-- title/description/icon are denormalized snapshots so editing or deleting a
-- template never corrupts already-issued perks.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'granted_reward_status') THEN
    CREATE TYPE public.granted_reward_status AS ENUM
      ('granted', 'redeem_requested', 'redeemed', 'revoked', 'denied');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.granted_rewards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id   uuid REFERENCES public.reward_templates(id) ON DELETE SET NULL,
  class_id      uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id    uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  student_id    uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  icon          text,
  status        public.granted_reward_status NOT NULL DEFAULT 'granted',
  requested_at  timestamptz,
  redeemed_at   timestamptz,
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_granted_student ON public.granted_rewards(student_id);
CREATE INDEX IF NOT EXISTS idx_granted_teacher_status ON public.granted_rewards(teacher_id, status);

-- ----------------------------------------------------------------------------
-- 4) Row Level Security
-- ----------------------------------------------------------------------------
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.granted_rewards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (idempotent re-run)
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS classes_teacher_write ON public.classes';
  EXECUTE 'DROP POLICY IF EXISTS classes_student_read ON public.classes';
  EXECUTE 'DROP POLICY IF EXISTS enroll_teacher_read ON public.class_enrollments';
  EXECUTE 'DROP POLICY IF EXISTS enroll_student_read ON public.class_enrollments';
  EXECUTE 'DROP POLICY IF EXISTS enroll_no_direct_insert ON public.class_enrollments';
  EXECUTE 'DROP POLICY IF EXISTS templates_teacher_all ON public.reward_templates';
  EXECUTE 'DROP POLICY IF EXISTS templates_student_read ON public.reward_templates';
  EXECUTE 'DROP POLICY IF EXISTS granted_teacher_read ON public.granted_rewards';
  EXECUTE 'DROP POLICY IF EXISTS granted_student_read ON public.granted_rewards';
  EXECUTE 'DROP POLICY IF EXISTS granted_no_direct_insert ON public.granted_rewards';
  EXECUTE 'DROP POLICY IF EXISTS granted_no_direct_update ON public.granted_rewards';
END $$;

-- classes: teacher full control of their own; enrolled students may read
CREATE POLICY classes_teacher_write ON public.classes
  FOR ALL USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY classes_student_read ON public.classes
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.class_enrollments e
    WHERE e.class_id = classes.id AND e.student_id = auth.uid()));

-- class_enrollments: the class teacher reads the roster; student reads own rows.
-- Inserts are seeded by the owner (service role) or a future RPC, never client.
CREATE POLICY enroll_teacher_read ON public.class_enrollments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_enrollments.class_id AND c.teacher_id = auth.uid()));
CREATE POLICY enroll_student_read ON public.class_enrollments
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY enroll_no_direct_insert ON public.class_enrollments
  FOR INSERT WITH CHECK (false);

-- reward_templates: teacher full control of own; enrolled students may read
CREATE POLICY templates_teacher_all ON public.reward_templates
  FOR ALL USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());
CREATE POLICY templates_student_read ON public.reward_templates
  FOR SELECT USING (EXISTS (
    SELECT 1
    FROM public.class_enrollments e
    JOIN public.classes c ON c.id = e.class_id
    WHERE e.student_id = auth.uid()
      AND c.teacher_id = reward_templates.teacher_id
      AND (reward_templates.class_id IS NULL OR reward_templates.class_id = e.class_id)));

-- granted_rewards: teacher reads what they granted, student reads own.
-- All writes go through SECURITY DEFINER RPCs.
CREATE POLICY granted_teacher_read ON public.granted_rewards
  FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY granted_student_read ON public.granted_rewards
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY granted_no_direct_insert ON public.granted_rewards
  FOR INSERT WITH CHECK (false);
CREATE POLICY granted_no_direct_update ON public.granted_rewards
  FOR UPDATE USING (false);

-- ----------------------------------------------------------------------------
-- 5) SECURITY DEFINER functions for cross-user writes
-- ----------------------------------------------------------------------------

-- Teacher grants a perk to an enrolled student
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
AS $$
DECLARE
  v_row public.granted_rewards;
  v_title text;
  v_desc text;
  v_icon text;
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
    SELECT title, description, icon
      INTO v_title, v_desc, v_icon
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
    template_id, class_id, teacher_id, student_id, title, description, icon, status)
  VALUES (
    p_template_id, p_class_id, auth.uid(), p_student_id, v_title, v_desc, v_icon, 'granted')
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_classroom_reward(uuid, uuid, uuid, text, text, text) TO authenticated;

-- Student requests redemption (granted -> redeem_requested)
CREATE OR REPLACE FUNCTION public.request_reward_redemption(p_granted_id uuid)
RETURNS public.granted_rewards
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row public.granted_rewards;
BEGIN
  UPDATE public.granted_rewards
  SET status = 'redeem_requested', requested_at = now(), updated_at = now()
  WHERE id = p_granted_id
    AND student_id = auth.uid()
    AND status = 'granted'
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Cannot request redemption for this reward';
  END IF;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.request_reward_redemption(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_reward_redemption(uuid) TO authenticated;

-- Teacher resolves a redemption: confirm -> redeemed, deny -> denied, revoke -> revoked
CREATE OR REPLACE FUNCTION public.resolve_reward_redemption(p_granted_id uuid, p_action text)
RETURNS public.granted_rewards
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row public.granted_rewards;
  v_status public.granted_reward_status;
BEGIN
  v_status := CASE p_action
    WHEN 'confirm' THEN 'redeemed'::public.granted_reward_status
    WHEN 'deny'    THEN 'denied'::public.granted_reward_status
    WHEN 'revoke'  THEN 'revoked'::public.granted_reward_status
    ELSE NULL
  END;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Invalid action %', p_action;
  END IF;

  UPDATE public.granted_rewards
  SET status = v_status,
      redeemed_at = CASE WHEN v_status = 'redeemed' THEN now() ELSE redeemed_at END,
      updated_at = now()
  WHERE id = p_granted_id
    AND teacher_id = auth.uid()
  RETURNING * INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Not authorized to resolve this reward';
  END IF;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_reward_redemption(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_reward_redemption(uuid, text) TO authenticated;

-- Teacher reads the roster for one of their classes (bypasses user_profiles RLS,
-- but validates the caller owns the class). Mirrors get_distributor_history.
CREATE OR REPLACE FUNCTION public.get_class_roster(p_class_id uuid)
RETURNS TABLE (
  student_id uuid,
  email text,
  first_name text,
  last_name text,
  enrolled_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = p_class_id AND c.teacher_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized for this class';
  END IF;

  RETURN QUERY
  SELECT p.id, p.email, p.first_name, p.last_name, e.created_at
  FROM public.class_enrollments e
  JOIN public.user_profiles p ON p.id = e.student_id
  WHERE e.class_id = p_class_id
  ORDER BY p.last_name NULLS LAST, p.first_name NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.get_class_roster(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_class_roster(uuid) TO authenticated;

-- ----------------------------------------------------------------------------
-- 6) Realtime: publish granted_rewards so student/teacher views update live
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.granted_rewards';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

ALTER TABLE public.granted_rewards REPLICA IDENTITY FULL;

COMMENT ON TABLE public.granted_rewards IS
  'Classroom perks granted to students; teacher-confirmed redemption lifecycle. Realtime-enabled.';

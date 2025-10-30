-- Implement proper RLS and SECURITY DEFINER functions for MVP

-- 1) Enable RLS on critical tables
ALTER TABLE IF EXISTS public.door_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.earned_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.door_notifications ENABLE ROW LEVEL SECURITY;

-- 2) Drop existing policies if any (idempotent)
DO $$
BEGIN
  -- door_distributions
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'door_distributions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "distributor_read_own" ON public.door_distributions';
    EXECUTE 'DROP POLICY IF EXISTS "recipient_read_own" ON public.door_distributions';
    EXECUTE 'DROP POLICY IF EXISTS "admin_full_access" ON public.door_distributions';
    EXECUTE 'DROP POLICY IF EXISTS "distributor_insert_via_fn_only" ON public.door_distributions';
  END IF;

  -- earned_rewards
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'earned_rewards') THEN
    EXECUTE 'DROP POLICY IF EXISTS "rewards_owner_read" ON public.earned_rewards';
    EXECUTE 'DROP POLICY IF EXISTS "rewards_owner_update_claim" ON public.earned_rewards';
    EXECUTE 'DROP POLICY IF EXISTS "rewards_insert_via_fn_only" ON public.earned_rewards';
  END IF;

  -- door_notifications
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'door_notifications') THEN
    EXECUTE 'DROP POLICY IF EXISTS "notif_owner_read" ON public.door_notifications';
    EXECUTE 'DROP POLICY IF EXISTS "notif_owner_update_read" ON public.door_notifications';
    EXECUTE 'DROP POLICY IF EXISTS "notif_insert_via_fn_only" ON public.door_notifications';
  END IF;
END $$;

-- 3) Create strict policies

-- door_distributions read policies
CREATE POLICY "distributor_read_own" ON public.door_distributions
  FOR SELECT USING (distributor_id = auth.uid());

CREATE POLICY "recipient_read_own" ON public.door_distributions
  FOR SELECT USING (recipient_id = auth.uid());

-- deny direct inserts into door_distributions; only via function
CREATE POLICY "distributor_insert_via_fn_only" ON public.door_distributions
  FOR INSERT WITH CHECK (false);

-- earned_rewards
CREATE POLICY "rewards_owner_read" ON public.earned_rewards
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "rewards_owner_update_claim" ON public.earned_rewards
  FOR UPDATE USING (user_id = auth.uid());

-- deny direct inserts into earned_rewards; only via function
CREATE POLICY "rewards_insert_via_fn_only" ON public.earned_rewards
  FOR INSERT WITH CHECK (false);

-- door_notifications
CREATE POLICY "notif_owner_read" ON public.door_notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notif_owner_update_read" ON public.door_notifications
  FOR UPDATE USING (user_id = auth.uid());

-- deny direct inserts into door_notifications; only via function
CREATE POLICY "notif_insert_via_fn_only" ON public.door_notifications
  FOR INSERT WITH CHECK (false);

-- 4) Functions (SECURITY DEFINER) for privileged inserts

-- create_door_distribution
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
  v_is_distributor boolean;
BEGIN
  -- validate sender is a distributor
  SELECT COALESCE(user_type = 'distributor', false)
    INTO v_is_distributor
  FROM public.user_profiles
  WHERE id = distributor_id;

  IF NOT v_is_distributor THEN
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

-- add_earned_reward
CREATE OR REPLACE FUNCTION public.add_earned_reward(
  p_user_id uuid,
  p_source_type text,
  p_source_name text,
  p_description text DEFAULT NULL,
  p_doors_earned int DEFAULT 1
) RETURNS public.earned_rewards
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.earned_rewards(user_id, source_type, source_name, description, doors_earned)
  VALUES (p_user_id, p_source_type::text, p_source_name, p_description, p_doors_earned)
  RETURNING *;
$$;

REVOKE ALL ON FUNCTION public.add_earned_reward(uuid, text, text, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_earned_reward(uuid, text, text, text, int) TO authenticated;

-- create_door_notification
CREATE OR REPLACE FUNCTION public.create_door_notification(
  p_user_id uuid,
  p_distributor_name text,
  p_doors_sent int,
  p_reason text
) RETURNS public.door_notifications
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO public.door_notifications(user_id, distributor_name, doors_sent, reason)
  VALUES (p_user_id, p_distributor_name, p_doors_sent, p_reason)
  RETURNING *;
$$;

REVOKE ALL ON FUNCTION public.create_door_notification(uuid, text, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_door_notification(uuid, text, int, text) TO authenticated;

COMMENT ON FUNCTION public.create_door_distribution(uuid, uuid, uuid, integer, text) IS 'Privileged insert for door_distributions';
COMMENT ON FUNCTION public.add_earned_reward(uuid, text, text, text, int) IS 'Privileged insert for earned_rewards';
COMMENT ON FUNCTION public.create_door_notification(uuid, text, int, text) IS 'Privileged insert for door_notifications';



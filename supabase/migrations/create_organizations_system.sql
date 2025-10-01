-- =====================================================
-- ORGANIZATIONS SYSTEM SETUP
-- This migration creates the multi-role system for users, distributors, and admins
-- =====================================================

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_organizations_name ON public.organizations USING btree (name) TABLESPACE pg_default;

-- 2. Add columns to user_profiles
-- First add columns as nullable, then set defaults, then make NOT NULL where needed
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS user_type TEXT NULL;

ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS organization_id UUID NULL;

ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS doors_available INTEGER NULL;

ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS doors_distributed INTEGER NULL;

-- Update existing rows to have default values
UPDATE public.user_profiles 
SET user_type = 'user' 
WHERE user_type IS NULL;

UPDATE public.user_profiles 
SET doors_available = 0 
WHERE doors_available IS NULL;

UPDATE public.user_profiles 
SET doors_distributed = 0 
WHERE doors_distributed IS NULL;

-- Now make NOT NULL with defaults for future rows
ALTER TABLE public.user_profiles 
  ALTER COLUMN user_type SET DEFAULT 'user',
  ALTER COLUMN user_type SET NOT NULL;

ALTER TABLE public.user_profiles 
  ALTER COLUMN doors_available SET DEFAULT 0,
  ALTER COLUMN doors_available SET NOT NULL;

ALTER TABLE public.user_profiles 
  ALTER COLUMN doors_distributed SET DEFAULT 0,
  ALTER COLUMN doors_distributed SET NOT NULL;

-- Add foreign key constraint for organization_id
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_organization_id_fkey 
  FOREIGN KEY (organization_id) 
  REFERENCES public.organizations(id) 
  ON DELETE SET NULL;

-- Add check constraint for user_type
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_user_type_check 
  CHECK (user_type IN ('user', 'distributor', 'admin'));

CREATE INDEX IF NOT EXISTS idx_user_profiles_organization ON public.user_profiles USING btree (organization_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON public.user_profiles USING btree (user_type) TABLESPACE pg_default;

-- 3. Create door_distributions table to track who sent doors to whom
CREATE TABLE IF NOT EXISTS public.door_distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  doors_sent INTEGER NOT NULL DEFAULT 1,
  reason TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT door_distributions_pkey PRIMARY KEY (id),
  CONSTRAINT door_distributions_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT door_distributions_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT door_distributions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE,
  CONSTRAINT door_distributions_doors_sent_positive CHECK (doors_sent > 0)
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_door_distributions_distributor ON public.door_distributions USING btree (distributor_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_door_distributions_recipient ON public.door_distributions USING btree (recipient_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_door_distributions_organization ON public.door_distributions USING btree (organization_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_door_distributions_created_at ON public.door_distributions USING btree (created_at DESC) TABLESPACE pg_default;

-- 4. Create distributor_members table (junction table for specific member assignments)
CREATE TABLE IF NOT EXISTS public.distributor_members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL,
  member_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT distributor_members_pkey PRIMARY KEY (id),
  CONSTRAINT distributor_members_unique UNIQUE (distributor_id, member_id),
  CONSTRAINT distributor_members_distributor_id_fkey FOREIGN KEY (distributor_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT distributor_members_member_id_fkey FOREIGN KEY (member_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT distributor_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_distributor_members_distributor ON public.distributor_members USING btree (distributor_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_distributor_members_member ON public.distributor_members USING btree (member_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_distributor_members_organization ON public.distributor_members USING btree (organization_id) TABLESPACE pg_default;

-- 5. Row Level Security Policies

-- Organizations RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own organization" ON public.organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage their organization" ON public.organizations
  FOR ALL
  USING (
    id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Door Distributions RLS
ALTER TABLE public.door_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view distributions they're involved in" ON public.door_distributions
  FOR SELECT
  USING (
    distributor_id = auth.uid() OR 
    recipient_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Distributors can create distributions" ON public.door_distributions
  FOR INSERT
  WITH CHECK (
    distributor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'distributor'
    )
  );

-- Distributor Members RLS
ALTER TABLE public.distributor_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their distributor assignments" ON public.distributor_members
  FOR SELECT
  USING (
    distributor_id = auth.uid() OR 
    member_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can manage distributor members" ON public.distributor_members
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for organizations updated_at
CREATE TRIGGER organizations_updated_at_trigger
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organizations_updated_at();

-- 8. Update earned_rewards to link to door_distributions
ALTER TABLE public.earned_rewards
  ADD COLUMN IF NOT EXISTS distribution_id UUID NULL;

ALTER TABLE public.earned_rewards
  ADD CONSTRAINT earned_rewards_distribution_id_fkey 
  FOREIGN KEY (distribution_id) 
  REFERENCES public.door_distributions(id) 
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_earned_rewards_distribution ON public.earned_rewards USING btree (distribution_id) TABLESPACE pg_default;

COMMENT ON TABLE public.organizations IS 'Organizations that users, distributors, and admins belong to';
COMMENT ON TABLE public.door_distributions IS 'Tracks door distributions from distributors to users';
COMMENT ON TABLE public.distributor_members IS 'Junction table for admin-specified distributor-to-member assignments';
COMMENT ON COLUMN public.user_profiles.user_type IS 'User role: user (default), distributor, or admin';
COMMENT ON COLUMN public.user_profiles.organization_id IS 'Organization the user belongs to (nullable)';
COMMENT ON COLUMN public.user_profiles.doors_available IS 'Number of doors available for distributors to give out';
COMMENT ON COLUMN public.user_profiles.doors_distributed IS 'Total number of doors this distributor has given out';



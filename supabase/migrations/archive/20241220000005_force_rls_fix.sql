-- Force RLS fix - completely rebuild the policies
-- This will remove all existing policies and create new ones

-- First, completely disable RLS
ALTER TABLE public.door_distributions DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (if any exist)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'door_distributions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.door_distributions';
    END LOOP;
END $$;

-- Now create a simple, permissive policy for distributors
ALTER TABLE public.door_distributions ENABLE ROW LEVEL SECURITY;

-- Create a very simple policy that allows distributors to do everything
CREATE POLICY "allow_distributors_all" ON public.door_distributions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'distributor'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'distributor'
    )
  );

-- Allow users to view distributions they're involved in
CREATE POLICY "allow_users_view_own" ON public.door_distributions
  FOR SELECT
  TO authenticated
  USING (
    distributor_id = auth.uid() OR recipient_id = auth.uid()
  );

-- Grant necessary permissions
GRANT ALL ON public.door_distributions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

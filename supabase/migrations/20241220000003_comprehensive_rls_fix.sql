-- Comprehensive RLS fix for door_distributions
-- This ensures distributors can create distributions regardless of organization membership

-- First, let's check and fix any existing policies
DROP POLICY IF EXISTS "Users can view distributions they're involved in" ON public.door_distributions;
DROP POLICY IF EXISTS "Distributors can create distributions" ON public.door_distributions;
DROP POLICY IF EXISTS "Distributors can update their own distributions" ON public.door_distributions;
DROP POLICY IF EXISTS "Distributors can delete their own distributions" ON public.door_distributions;

-- Create a more permissive policy for distributors
CREATE POLICY "Distributors can manage distributions" ON public.door_distributions
  FOR ALL
  USING (
    distributor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'distributor'
    )
  )
  WITH CHECK (
    distributor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'distributor'
    )
  );

-- Allow users to view distributions they're involved in
CREATE POLICY "Users can view their distributions" ON public.door_distributions
  FOR SELECT
  USING (
    distributor_id = auth.uid() OR 
    recipient_id = auth.uid()
  );

-- Allow admins to view all distributions in their organization
CREATE POLICY "Admins can view organization distributions" ON public.door_distributions
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Ensure the table has RLS enabled
ALTER TABLE public.door_distributions ENABLE ROW LEVEL SECURITY;

-- Add a function to check if user is a distributor (for debugging)
CREATE OR REPLACE FUNCTION is_distributor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id AND user_type = 'distributor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_distributor(UUID) TO authenticated;

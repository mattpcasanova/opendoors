-- Fix RLS policies for door_distributions table
-- Drop existing policies and recreate them with proper permissions

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view distributions they're involved in" ON public.door_distributions;
DROP POLICY IF EXISTS "Distributors can create distributions" ON public.door_distributions;

-- Recreate policies with proper permissions
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

-- Add UPDATE policy for distributors to update their own distributions
CREATE POLICY "Distributors can update their own distributions" ON public.door_distributions
  FOR UPDATE
  USING (
    distributor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'distributor'
    )
  );

-- Add DELETE policy for distributors to delete their own distributions (if needed)
CREATE POLICY "Distributors can delete their own distributions" ON public.door_distributions
  FOR DELETE
  USING (
    distributor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'distributor'
    )
  );

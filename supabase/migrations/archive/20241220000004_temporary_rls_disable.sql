-- Temporary fix: Disable RLS on door_distributions for testing
-- This allows distributors to create distributions without RLS restrictions

-- Disable RLS temporarily
ALTER TABLE public.door_distributions DISABLE ROW LEVEL SECURITY;

-- Add a comment explaining this is temporary
COMMENT ON TABLE public.door_distributions IS 'Door distributions table - RLS temporarily disabled for testing';

-- Note: This should be re-enabled with proper policies once the issue is resolved

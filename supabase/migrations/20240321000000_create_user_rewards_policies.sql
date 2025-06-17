-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can update their own rewards" ON public.user_rewards;

-- Enable RLS on user_rewards table
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own rewards
CREATE POLICY "Users can insert their own rewards"
ON public.user_rewards
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own rewards
CREATE POLICY "Users can view their own rewards"
ON public.user_rewards
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy to allow users to update their own rewards
CREATE POLICY "Users can update their own rewards"
ON public.user_rewards
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.user_rewards TO authenticated;
GRANT USAGE ON SEQUENCE public.user_rewards_id_seq TO authenticated; 
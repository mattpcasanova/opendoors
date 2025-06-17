-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.user_rewards;
DROP POLICY IF EXISTS "Users can update their own rewards" ON public.user_rewards;

-- Drop the table if it exists
DROP TABLE IF EXISTS public.user_rewards;

-- Create user_rewards table
CREATE TABLE public.user_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prize_id UUID NOT NULL REFERENCES public.prizes(id) ON DELETE CASCADE,
    qr_code TEXT NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own rewards"
    ON public.user_rewards
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = user_id
    );

CREATE POLICY "Users can view their own rewards"
    ON public.user_rewards
    FOR SELECT
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() = user_id
    );

CREATE POLICY "Users can update their own rewards"
    ON public.user_rewards
    FOR UPDATE
    TO authenticated
    USING (
        auth.role() = 'authenticated' 
        AND auth.uid() = user_id
    )
    WITH CHECK (
        auth.role() = 'authenticated' 
        AND auth.uid() = user_id
    );

-- Grant necessary permissions
GRANT ALL ON public.user_rewards TO authenticated; 
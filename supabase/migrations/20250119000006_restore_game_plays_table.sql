-- Restore game_plays table (it IS being used in the app)
-- This undoes migration 20250119000004

-- Recreate the table
CREATE TABLE IF NOT EXISTS public.game_plays (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  win boolean NOT NULL,
  prize_id uuid,
  chosen_door integer,
  winning_door integer,
  revealed_door integer,
  switched boolean DEFAULT false,
  won boolean DEFAULT false,
  game_duration_seconds integer DEFAULT 0,
  played_at timestamp with time zone DEFAULT now(),
  CONSTRAINT game_plays_pkey PRIMARY KEY (id),
  CONSTRAINT fk_game_plays_prize_id FOREIGN KEY (prize_id) REFERENCES public.prizes(id),
  CONSTRAINT game_plays_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.game_plays ENABLE ROW LEVEL SECURITY;

-- Add policies (same as before)
CREATE POLICY "Users can insert their own game plays"
  ON public.game_plays FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own game plays"
  ON public.game_plays FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.game_plays TO authenticated;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_plays_user_id ON public.game_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_created_at ON public.game_plays(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_plays_prize_id ON public.game_plays(prize_id);

COMMENT ON TABLE public.game_plays IS 'Game history - tracks all games played by users';

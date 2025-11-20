-- Drop the games table (duplicate of game_plays)
-- Keep game_plays as the single source of truth for game history

DROP TABLE IF EXISTS public.games CASCADE;

COMMENT ON TABLE public.game_plays IS 'Single source of truth for all game history. Records every game played by users.';

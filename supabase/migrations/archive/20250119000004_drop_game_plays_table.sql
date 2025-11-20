-- Drop duplicate game_plays table
-- The 'games' table is the one being used in the app, game_plays is a duplicate

-- Drop the table (this will also drop all policies and indexes on it)
DROP TABLE IF EXISTS public.game_plays CASCADE;

COMMENT ON TABLE public.games IS 'Stores all game records. This is the primary game history table.';

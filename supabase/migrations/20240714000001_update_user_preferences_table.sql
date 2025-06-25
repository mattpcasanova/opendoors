-- Drop the old user_preferences table if it exists
DROP TABLE IF EXISTS public.user_preferences;

-- Create the new user_preferences table with boolean columns for each category
CREATE TABLE public.user_preferences (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  food_and_dining boolean NOT NULL DEFAULT false,
  shopping boolean NOT NULL DEFAULT false,
  coffee_and_drinks boolean NOT NULL DEFAULT false,
  entertainment boolean NOT NULL DEFAULT false,
  fitness_and_health boolean NOT NULL DEFAULT false,
  beauty_and_wellness boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now()
); 
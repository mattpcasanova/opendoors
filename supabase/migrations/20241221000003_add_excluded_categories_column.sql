-- Add excluded_categories column to user_settings table
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS excluded_categories TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN public.user_settings.excluded_categories IS 'Array of category names to hide from view (Food, Drinks, etc.)';


-- Add category column to prizes table
ALTER TABLE public.prizes
ADD COLUMN category text;

-- Add comment
COMMENT ON COLUMN public.prizes.category IS 'Category of the prize (food_and_dining, shopping, coffee_and_drinks, entertainment, fitness_and_health, beauty_and_wellness)';

-- Update existing prizes with categories based on their names/types
UPDATE public.prizes 
SET category = CASE 
  WHEN LOWER(name) LIKE '%starbucks%' OR LOWER(name) LIKE '%coffee%' OR LOWER(name) LIKE '%drink%' THEN 'coffee_and_drinks'
  WHEN LOWER(name) LIKE '%mcdonald%' OR LOWER(name) LIKE '%food%' OR LOWER(name) LIKE '%meal%' OR LOWER(name) LIKE '%burger%' THEN 'food_and_dining'
  WHEN LOWER(name) LIKE '%target%' OR LOWER(name) LIKE '%shopping%' OR LOWER(name) LIKE '%retail%' THEN 'shopping'
  WHEN LOWER(name) LIKE '%movie%' OR LOWER(name) LIKE '%entertainment%' OR LOWER(name) LIKE '%theater%' THEN 'entertainment'
  WHEN LOWER(name) LIKE '%fitness%' OR LOWER(name) LIKE '%gym%' OR LOWER(name) LIKE '%health%' THEN 'fitness_and_health'
  WHEN LOWER(name) LIKE '%spa%' OR LOWER(name) LIKE '%beauty%' OR LOWER(name) LIKE '%wellness%' THEN 'beauty_and_wellness'
  ELSE 'food_and_dining' -- Default fallback
END;

-- Update the active_games view to include the category
CREATE OR REPLACE VIEW public.active_games AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.value,
    p.image_url,
    p.logo_url,
    p.prize_type,
    p.category,
    p.stock_quantity,
    p.expires_at,
    p.is_active,
    p.created_at,
    -- Add additional fields that might be needed
    s.name as company_name,
    s.logo_url as sponsor_logo_url,
    -- Add a doors field (default to 3 for Monty Hall game)
    3 as doors,
    -- Add location fields (you may need to adjust these based on your schema)
    NULL as address,
    s.name as location_name,
    -- Add is_special field (you can customize this logic)
    CASE 
        WHEN p.value >= 50 THEN true 
        ELSE false 
    END as is_special
FROM public.prizes p
LEFT JOIN public.sponsors s ON p.sponsor_id = s.id
WHERE p.is_active = true 
  AND (p.expires_at IS NULL OR p.expires_at > NOW())
  AND (p.stock_quantity IS NULL OR p.stock_quantity > 0); 
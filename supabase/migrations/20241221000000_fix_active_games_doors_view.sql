-- Fix active_games view to read doors directly from prizes table
-- This removes hardcoded Target game logic and relies on the doors column in the prizes table

-- First, ensure all Target games in the prizes table have doors = 5
UPDATE prizes
SET doors = 5
WHERE (name ILIKE '%target%' OR description ILIKE '%target%')
  AND (doors IS NULL OR doors != 5);

-- Update the active_games view to read doors directly from prizes table
-- Remove the CASE logic for Target games - just use COALESCE(p.doors, 3)
CREATE OR REPLACE VIEW public.active_games AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.value,
    p.image_url,
    COALESCE(p.logo_url, 'https://boemdxppyuspuhvgfzmb.supabase.co/storage/v1/object/public/logos//opendoors-logo.png') as logo_url,
    p.prize_type,
    p.category, 
    p.stock_quantity,
    p.expires_at,
    p.is_active,
    p.created_at,
    -- Add additional fields that might be needed
    s.name as company_name,
    s.logo_url as sponsor_logo_url,
    -- Read doors directly from prizes table, default to 3 if not set
    COALESCE(p.doors, 3) as doors,
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

-- Grant permissions
GRANT SELECT ON public.active_games TO authenticated;
GRANT SELECT ON public.active_games TO anon;


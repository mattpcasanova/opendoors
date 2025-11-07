-- Update active_games view to use is_special column from prizes table
-- instead of computing it based on value >= 50
-- Note: is_special column already exists in prizes table with default false

-- Drop the existing view first
DROP VIEW IF EXISTS public.active_games;

-- Recreate the view using is_special from prizes table
CREATE VIEW public.active_games AS
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
    -- Include address from prizes table
    p.address,
    -- Use prize location_name if set, otherwise fall back to sponsor name
    COALESCE(p.location_name, s.name) as location_name,
    -- Use is_special from prizes table instead of computing it
    COALESCE(p.is_special, false) as is_special
FROM public.prizes p
LEFT JOIN public.sponsors s ON p.sponsor_id = s.id
WHERE p.is_active = true
  AND (p.expires_at IS NULL OR p.expires_at > NOW())
  AND (p.stock_quantity IS NULL OR p.stock_quantity > 0);

-- Grant permissions
GRANT SELECT ON public.active_games TO authenticated;
GRANT SELECT ON public.active_games TO anon;

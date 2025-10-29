-- Add filter preference columns to user_settings table
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS distance_filter TEXT DEFAULT 'Any',
ADD COLUMN IF NOT EXISTS sort_by TEXT DEFAULT 'Closest',
ADD COLUMN IF NOT EXISTS excluded_categories TEXT[] DEFAULT '{}';

-- Add comments
COMMENT ON COLUMN public.user_settings.distance_filter IS 'User selected distance filter (5 mi, 10 mi, 25 mi, 50 mi, Any)';
COMMENT ON COLUMN public.user_settings.sort_by IS 'User selected sort option (Closest, Suggested, Highest Value, Most Popular)';
COMMENT ON COLUMN public.user_settings.excluded_categories IS 'Array of category names to hide from view (Food, Drinks, etc.)';

-- Update active_games view to include plays count
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
    s.name as company_name,
    s.logo_url as sponsor_logo_url,
    COALESCE(p.doors, 3) as doors,
    p.address,
    COALESCE(p.location_name, s.name) as location_name,
    CASE 
        WHEN p.value >= 50 THEN true 
        ELSE false 
    END as is_special,
    -- Add plays count from game_plays table
    COALESCE(play_counts.plays, 0) as plays
FROM public.prizes p
LEFT JOIN public.sponsors s ON p.sponsor_id = s.id
LEFT JOIN (
    SELECT 
        prize_id,
        COUNT(*) as plays
    FROM public.game_plays
    GROUP BY prize_id
) play_counts ON p.id = play_counts.prize_id
WHERE p.is_active = true 
  AND (p.expires_at IS NULL OR p.expires_at > NOW())
  AND (p.stock_quantity IS NULL OR p.stock_quantity > 0);

-- Grant permissions
GRANT SELECT ON public.active_games TO authenticated;
GRANT SELECT ON public.active_games TO anon;


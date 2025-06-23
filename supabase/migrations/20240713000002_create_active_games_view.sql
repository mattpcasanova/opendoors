-- Create the active_games view
CREATE OR REPLACE VIEW public.active_games AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.value,
    p.image_url,
    p.logo_url,
    p.prize_type,
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

-- Grant permissions
GRANT SELECT ON public.active_games TO authenticated;
GRANT SELECT ON public.active_games TO anon; 
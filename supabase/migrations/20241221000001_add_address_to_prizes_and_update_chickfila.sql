-- Note: active_games is a VIEW, not a table. 
-- To update data, you must UPDATE the underlying prizes table.
-- The view will automatically reflect changes made to the prizes table.

-- Add address column to prizes table if it doesn't exist
ALTER TABLE public.prizes
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add location_name column to prizes table if it doesn't exist
-- This allows prizes to override the sponsor's default location name
ALTER TABLE public.prizes
ADD COLUMN IF NOT EXISTS location_name TEXT;

-- Add comments to the columns
COMMENT ON COLUMN public.prizes.address IS 'Physical address or location of the prize/restaurant';
COMMENT ON COLUMN public.prizes.location_name IS 'Location name override (e.g., "Chick-fil-A (Westfork Plaza)"). If NULL, uses sponsor name.';

-- Update the specific Chick-Fil-A prize to Free Medium Fries at Westfork Plaza
UPDATE public.prizes
SET 
  name = 'Free Medium Fries',
  address = '15901 Pines Blvd, Pembroke Pines, FL 33027',
  location_name = 'Chick-fil-A (Westfork Plaza)'
WHERE id = '88941f29-e02c-4e79-8f00-24f5186d71cf';

-- Update the active_games view to include address from prizes table
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
    -- Include address from prizes table
    p.address,
    -- Use prize location_name if set, otherwise fall back to sponsor name
    COALESCE(p.location_name, s.name) as location_name,
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


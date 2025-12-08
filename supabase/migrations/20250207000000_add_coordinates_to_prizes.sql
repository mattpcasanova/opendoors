-- Add latitude and longitude columns to prizes table
ALTER TABLE public.prizes
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add comments to the columns
COMMENT ON COLUMN public.prizes.latitude IS 'Latitude coordinate of the prize location';
COMMENT ON COLUMN public.prizes.longitude IS 'Longitude coordinate of the prize location';

-- Update AMC Pembroke Lakes 9 coordinates
-- Address: 12085 Pines Blvd, Pembroke Pines, FL 33026
UPDATE public.prizes
SET
  latitude = 26.0101,
  longitude = -80.2962
WHERE location_name = 'AMC Pembroke Lakes 9';

-- Update Chipotle (160th Ave) coordinates
-- Address: 3231 SW 160th Ave Ste 101, Miramar, FL 33027
UPDATE public.prizes
SET
  latitude = 25.9889,
  longitude = -80.4412
WHERE location_name = 'Chipotle (160th Ave)';

-- Update Chick-fil-A (Westfork Plaza) coordinates
-- Address: 15901 Pines Blvd, Pembroke Pines, FL 33027
UPDATE public.prizes
SET
  latitude = 26.0095,
  longitude = -80.3359
WHERE location_name = 'Chick-fil-A (Westfork Plaza)';

-- Verify the updates
SELECT name, location_name, address, latitude, longitude
FROM public.prizes
WHERE location_name IN ('AMC Pembroke Lakes 9', 'Chipotle (160th Ave)', 'Chick-fil-A (Westfork Plaza)')
ORDER BY location_name;

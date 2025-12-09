-- Update prizes for OpenDoors app
-- Run this in your Supabase SQL editor

-- 1. Add AMC Pembroke Lakes 9 prize
INSERT INTO prizes (
  name,
  description,
  category,
  location_name,
  address,
  logo_url,
  doors,
  prize_type,
  redemption_method
) VALUES (
  'AMC Pembroke Lakes 9',
  'Buy 1 movie ticket, get 1 free',
  'entertainment',
  'AMC Pembroke Lakes 9',
  '12085 Pines Blvd, Pembroke Pines, FL 33026',
  'https://boemdxppyuspuhvgfzmb.supabase.co/storage/v1/object/public/logos/amc-logo.png',
  5,
  'entertainment',
  'in_store'
);

-- 2. Add Chipotle (160th Ave) prize
INSERT INTO prizes (
  name,
  description,
  category,
  location_name,
  address,
  logo_url,
  doors,
  prize_type,
  redemption_method
) VALUES (
  'Chipotle (160th Ave)',
  'Free side of guac OR free extra protein',
  'food_and_dining',
  'Chipotle (160th Ave)',
  '3231 SW 160th Ave Ste 101, Miramar, FL 33027',
  'https://boemdxppyuspuhvgfzmb.supabase.co/storage/v1/object/public/logos/chipotle-logo.png',
  3,
  'food',
  'in_store'
);

-- 3. Update Starbucks prize reward
UPDATE prizes
SET description = 'Free Cake Pop'
WHERE name ILIKE '%starbucks%';

-- 4. Add caveat to Chick-fil-A prize
UPDATE prizes
SET description = description || ' (between the hours of 1pm-3pm)'
WHERE name ILIKE '%chick-fil-a%';

-- 5. Remove McDonald's prize
DELETE FROM prizes
WHERE name ILIKE '%mcdonald%';

-- Verify the changes
SELECT id, name, description, category, location_name, address, doors
FROM prizes
ORDER BY name;

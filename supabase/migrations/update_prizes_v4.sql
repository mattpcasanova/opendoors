-- Update prizes for OpenDoors app - Version 4 (Soft Deletes)
-- Run this in your Supabase SQL editor

-- 1. Soft delete McDonald's prize instead of hard delete
--    This preserves the prize for users who have already won it
UPDATE prizes
SET is_active = false
WHERE name ILIKE '%mcdonald%' OR location_name ILIKE '%mcdonald%';

-- 2. Update AMC prize - fix name to be the actual reward
UPDATE prizes
SET name = 'Buy 1 Get 1 Free Movie Ticket'
WHERE location_name = 'AMC Pembroke Lakes 9';

-- 3. Update Chipotle prize - fix name to be the actual reward
UPDATE prizes
SET name = 'Free Guac or Extra Protein'
WHERE location_name = 'Chipotle (160th Ave)';

-- 4. Update Starbucks prize - change description to "Free Cake Pop"
UPDATE prizes
SET description = 'Free Cake Pop'
WHERE location_name ILIKE '%starbucks%';

-- 5. Update Chick-fil-A prize - add time caveat and fix name
UPDATE prizes
SET
  name = 'Free Chicken Sandwich',
  description = 'One free original chicken sandwich (between the hours of 1pm-3pm)'
WHERE location_name ILIKE '%chick-fil-a%';

-- Verify the changes - show only active prizes
SELECT id, name, description, category, location_name, address, doors, logo_url, is_active
FROM prizes
WHERE is_active = true
ORDER BY location_name;

-- Show inactive prizes (McDonald's should be here)
SELECT id, name, description, category, location_name, address, doors, is_active
FROM prizes
WHERE is_active = false
ORDER BY location_name;

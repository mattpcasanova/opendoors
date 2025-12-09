-- Add new prizes for OpenDoors app
-- Run this in your Supabase SQL editor

-- 1. Menchie's Frozen Yogurt
-- Logo URL: [PASTE LOGO URL HERE]
INSERT INTO prizes (
  name,
  description,
  category,
  location_name,
  address,
  logo_url,
  doors,
  prize_type,
  redemption_method,
  is_active
) VALUES (
  'Free 3oz Yogurt',
  'Free 3oz when you buy 6oz or more',
  'food_and_dining',
  'Menchie''s (Cobblestone)',
  '14814 Pines Blvd, Pembroke Pines, FL 33027',
  'https://boemdxppyuspuhvgfzmb.supabase.co/storage/v1/object/public/logos/menchies-logo.png',
  3,
  'food',
  'in_store',
  true
);

-- 2. Lockbox Escape Room
-- Logo URL: [PASTE LOGO URL HERE]
INSERT INTO prizes (
  name,
  description,
  category,
  location_name,
  address,
  logo_url,
  doors,
  prize_type,
  redemption_method,
  is_active
) VALUES (
  '$20 Off Group Booking',
  '$20 off when booking for 4+ people',
  'entertainment',
  'Lockbox Escape Room',
  '8490 W. State Road 84, Davie, FL 33324',
  'https://boemdxppyuspuhvgfzmb.supabase.co/storage/v1/object/public/logos/lockbox-logo.png',
  5,
  'entertainment',
  'in_store',
  true
);

-- 3. Pet Supermarket
-- Logo URL: [PASTE LOGO URL HERE]
INSERT INTO prizes (
  name,
  description,
  category,
  location_name,
  address,
  logo_url,
  doors,
  prize_type,
  redemption_method,
  is_active
) VALUES (
  'Free Pet Toy',
  'Free toy with $30+ food purchase',
  'retail',
  'Pet Supermarket (Weston)',
  '1380 Weston Rd, Weston, FL 33326',
  'https://boemdxppyuspuhvgfzmb.supabase.co/storage/v1/object/public/logos/pet-supermarket-logo.png',
  3,
  'retail',
  'in_store',
  true
);

-- 4. El Car Wash
-- Logo URL: [PASTE LOGO URL HERE]
INSERT INTO prizes (
  name,
  description,
  category,
  location_name,
  address,
  logo_url,
  doors,
  prize_type,
  redemption_method,
  is_active
) VALUES (
  'Free Tire Shine',
  'Free tire shine with full wash',
  'retail',
  'El Car Wash (Silverlakes)',
  '181 NW 180th Ave, Pembroke Pines, FL 33029',
  'https://boemdxppyuspuhvgfzmb.supabase.co/storage/v1/object/public/logos/el-car-wash-logo.png',
  3,
  'retail',
  'in_store',
  true
);

-- 5. CVS Photo Printing
-- Logo URL: [PASTE LOGO URL HERE]
INSERT INTO prizes (
  name,
  description,
  category,
  location_name,
  address,
  logo_url,
  doors,
  prize_type,
  redemption_method,
  is_active
) VALUES (
  '10 Free Photo Prints',
  '10 free prints with 50+ order',
  'retail',
  'CVS (Pembroke Pines)',
  '17201 Pines Blvd, Pembroke Pines, FL 33029',
  'https://boemdxppyuspuhvgfzmb.supabase.co/storage/v1/object/public/logos/cvs-logo.png',
  3,
  'retail',
  'in_store',
  true
);

-- Verify the new prizes were added
SELECT name, description, category, location_name, address, doors
FROM prizes
WHERE location_name IN (
  'Menchie''s (Cobblestone)',
  'Lockbox Escape Room',
  'Pet Supermarket (Weston)',
  'El Car Wash (Silverlakes)',
  'CVS (Pembroke Pines)'
)
ORDER BY location_name;

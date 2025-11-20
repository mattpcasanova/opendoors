-- Update Starbucks logos specifically
UPDATE prizes 
SET logo_url = 'https://boemdxppyuspuhvgfzmb.supabase.co/storage/v1/object/public/logos//starbucks-logo.png'
WHERE name ILIKE '%starbucks%' 
   OR description ILIKE '%starbucks%'
   OR name ILIKE '%coffee%' AND description ILIKE '%starbucks%'; 
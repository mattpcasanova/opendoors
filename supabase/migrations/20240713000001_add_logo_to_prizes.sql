-- Add logo column to prizes table
ALTER TABLE public.prizes 
ADD COLUMN logo_url TEXT DEFAULT 'https://opendoors-logo-default.png';

-- Add comment to the column
COMMENT ON COLUMN public.prizes.logo_url IS 'URL to the company logo image. Defaults to OpenDoors logo if not specified.'; 
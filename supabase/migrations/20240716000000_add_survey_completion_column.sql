-- Add has_completed_survey column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN has_completed_survey BOOLEAN DEFAULT FALSE;

-- Add comment to explain the column
COMMENT ON COLUMN user_profiles.has_completed_survey IS 'Whether the user has completed the initial survey after signup';

-- Update existing user profiles to have survey completed (for existing users)
UPDATE user_profiles 
SET has_completed_survey = TRUE 
WHERE has_completed_survey IS NULL; 
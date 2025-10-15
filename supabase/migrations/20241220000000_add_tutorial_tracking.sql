-- Add tutorial completion tracking to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN tutorial_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have tutorial_completed = false
UPDATE user_profiles 
SET tutorial_completed = FALSE 
WHERE tutorial_completed IS NULL;

-- Migration: Update user_rewards table to support unique reward instances per user

-- 1. Add a unique UUID id column if not present
ALTER TABLE user_rewards
ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid() PRIMARY KEY;

-- 2. Add reward_code and logo_url columns if not present
ALTER TABLE user_rewards
ADD COLUMN IF NOT EXISTS reward_code text;
ALTER TABLE user_rewards
ADD COLUMN IF NOT EXISTS logo_url text;

-- 3. Ensure qr_code, claimed_at, expires_at, created_at columns exist
ALTER TABLE user_rewards
ADD COLUMN IF NOT EXISTS qr_code text;
ALTER TABLE user_rewards
ADD COLUMN IF NOT EXISTS claimed_at timestamptz;
ALTER TABLE user_rewards
ADD COLUMN IF NOT EXISTS expires_at date;
ALTER TABLE user_rewards
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 4. Add index on user_id for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);

-- 5. Add foreign key to prizes table
ALTER TABLE user_rewards
ADD CONSTRAINT fk_user_rewards_prize_id FOREIGN KEY (prize_id) REFERENCES prizes(id) ON DELETE CASCADE;

-- 6. (Optional) Migrate existing data: If any rows are missing id, generate them
UPDATE user_rewards SET id = gen_random_uuid() WHERE id IS NULL;

-- 7. Ensure id is unique
ALTER TABLE user_rewards ADD CONSTRAINT user_rewards_id_unique UNIQUE (id); 
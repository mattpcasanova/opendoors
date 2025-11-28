-- Script to safely delete user matt.casanovax@gmail.com and all related data
-- Run this in Supabase SQL Editor

-- First, find the user ID by email
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get user ID from email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = 'matt.casanovax@gmail.com';

    -- Show what we found
    RAISE NOTICE 'Found user ID: %', target_user_id;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email matt.casanovax@gmail.com not found';
    END IF;

    -- Delete from game_plays (this is blocking the user deletion)
    DELETE FROM game_plays WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted game_plays';

    -- Delete from ad_watches if table exists
    BEGIN
        DELETE FROM ad_watches WHERE user_id = target_user_id;
        RAISE NOTICE 'Deleted ad_watches';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'Table ad_watches does not exist, skipping';
    END;

    -- Delete from user_referrals if table exists
    BEGIN
        DELETE FROM user_referrals
        WHERE referrer_id = target_user_id OR referred_id = target_user_id;
        RAISE NOTICE 'Deleted user_referrals';
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'Table user_referrals does not exist, skipping';
    END;

    -- Delete from user_profiles
    DELETE FROM user_profiles WHERE id = target_user_id;
    RAISE NOTICE 'Deleted user_profiles';

    -- Delete from auth.users (Supabase auth table)
    DELETE FROM auth.users WHERE id = target_user_id;
    RAISE NOTICE 'Deleted auth.users';

    RAISE NOTICE 'User % deleted successfully', 'matt.casanovax@gmail.com';
END $$;

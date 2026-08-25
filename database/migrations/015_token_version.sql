-- Migration 015: Add token_version to profiles for token invalidation
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;

-- Optional: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_token_version ON public.profiles(token_version);

-- Update existing profiles to have token_version = 0
UPDATE public.profiles SET token_version = 0 WHERE token_version IS NULL;
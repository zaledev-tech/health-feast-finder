-- Fix critical security issue: Update existing profile policies
-- First check what policies exist and update them properly

-- Update the existing public profile policy to require authentication
DROP POLICY IF EXISTS "Users can view all public profiles" ON public.profiles;

-- Create new policy that requires authentication to view profiles  
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add privacy control column for future discoverability features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Add security audit columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
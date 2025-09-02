-- Fix critical security issue: Public profile exposure
-- Update profiles table RLS policy to require authentication
DROP POLICY IF EXISTS "Users can view all public profiles" ON public.profiles;

-- Create new policy that requires authentication to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Ensure users can only update their own profiles with proper security
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update only their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add privacy control column for future discoverability features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;

-- Create index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Add security audit columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Create function to update login tracking
CREATE OR REPLACE FUNCTION public.update_user_login_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    last_login_at = NOW(),
    login_count = COALESCE(login_count, 0) + 1
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to track logins (this will fire on auth.users updates)
DROP TRIGGER IF EXISTS on_user_login ON auth.users;
CREATE TRIGGER on_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_user_login_stats();

-- Create security events table for monitoring
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on security events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events (for now, restrict to service role)
CREATE POLICY "Service role can manage security events" 
ON public.security_events 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_events (user_id, event_type, event_data, ip_address, user_agent)
  VALUES (p_user_id, p_event_type, p_event_data, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
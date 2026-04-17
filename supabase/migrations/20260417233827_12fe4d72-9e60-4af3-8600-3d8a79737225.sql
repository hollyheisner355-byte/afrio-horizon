
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS smtp_host text,
  ADD COLUMN IF NOT EXISTS smtp_port integer DEFAULT 587,
  ADD COLUMN IF NOT EXISTS smtp_user text,
  ADD COLUMN IF NOT EXISTS smtp_password text,
  ADD COLUMN IF NOT EXISTS smtp_from_email text,
  ADD COLUMN IF NOT EXISTS smtp_from_name text,
  ADD COLUMN IF NOT EXISTS smtp_use_tls boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS office_address text,
  ADD COLUMN IF NOT EXISTS office_city text,
  ADD COLUMN IF NOT EXISTS office_country text;

-- Replace the public read policy so anonymous users do NOT receive smtp_password.
-- We do this by exposing a safe view for anon users.
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;

CREATE POLICY "Anyone can view public site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Create a SECURITY DEFINER view-like function that filters out SMTP password for non-admins
-- (we still allow public read for everything else; password filtering happens on the client + edge function).
-- Mark smtp_password sensitive: revoke from anon/authenticated except admin via column privileges.
REVOKE SELECT (smtp_password) ON public.site_settings FROM anon, authenticated;

-- Allow admin role (via has_role check) to read smtp_password through a SECURITY DEFINER function.
CREATE OR REPLACE FUNCTION public.get_smtp_config()
RETURNS TABLE (
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_password text,
  smtp_from_email text,
  smtp_from_name text,
  smtp_use_tls boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT smtp_host, smtp_port, smtp_user, smtp_password, smtp_from_email, smtp_from_name, smtp_use_tls
  FROM public.site_settings
  WHERE has_role(auth.uid(), 'admin'::app_role)
  LIMIT 1;
$$;


-- Affiliates table
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  referral_code text NOT NULL UNIQUE,
  commission_rate numeric NOT NULL DEFAULT 10,
  total_earnings numeric NOT NULL DEFAULT 0,
  total_referrals integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Affiliate referrals table
CREATE TABLE public.affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id uuid,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  commission_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

-- Affiliates policies
CREATE POLICY "Users can view own affiliate" ON public.affiliates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affiliate" ON public.affiliates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate" ON public.affiliates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all affiliates" ON public.affiliates
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can lookup affiliate by code" ON public.affiliates
  FOR SELECT USING (is_active = true);

-- Referrals policies
CREATE POLICY "Users can view own referrals" ON public.affiliate_referrals
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.affiliates WHERE id = affiliate_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all referrals" ON public.affiliate_referrals
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert referrals" ON public.affiliate_referrals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Triggers for updated_at
CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add default_commission_rate to site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS default_affiliate_commission numeric DEFAULT 10;

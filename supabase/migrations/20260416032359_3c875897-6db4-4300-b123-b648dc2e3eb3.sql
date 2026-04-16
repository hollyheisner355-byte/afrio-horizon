
CREATE TABLE public.email_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  body_html text NOT NULL,
  template_type text NOT NULL DEFAULT 'custom',
  status text NOT NULL DEFAULT 'pending',
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all email notifications"
  ON public.email_notifications FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view emails sent to them"
  ON public.email_notifications FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_email_notifications_updated_at
  BEFORE UPDATE ON public.email_notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

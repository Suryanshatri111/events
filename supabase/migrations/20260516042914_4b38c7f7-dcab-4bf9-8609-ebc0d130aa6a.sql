
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Event Types
CREATE TABLE public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view event_types" ON public.event_types FOR SELECT USING (true);
CREATE POLICY "admins manage event_types" ON public.event_types FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  sport_type TEXT NOT NULL,
  venue TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  price_inr NUMERIC(10,2) NOT NULL DEFAULT 0,
  capacity INTEGER,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view active events" ON public.events FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enquiries
CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone create enquiry" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "admins view enquiries" ON public.enquiries FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update enquiries" ON public.enquiries FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete enquiries" ON public.enquiries FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Contact Details
CREATE TABLE public.contact_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  type TEXT NOT NULL, -- email, phone, address, person
  value TEXT NOT NULL,
  person_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone view active contacts" ON public.contact_details FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage contacts" ON public.contact_details FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Seed event types
INSERT INTO public.event_types (sport_name, description, icon) VALUES
  ('Cricket', 'T20, ODI, and Test format matches & tournaments', 'trophy'),
  ('Football', 'League matches and friendly tournaments', 'circle'),
  ('Badminton', 'Singles and doubles championships', 'zap'),
  ('Tennis', 'Court-based singles & doubles events', 'circle-dot'),
  ('Kabaddi', 'Pro-style kabaddi tournaments', 'shield');

INSERT INTO public.contact_details (label, type, value, person_name, display_order) VALUES
  ('Event Manager', 'person', '+91 98765 43210', 'Rohit Sharma', 1),
  ('Email', 'email', 'info@boundaryline.in', NULL, 2),
  ('Office', 'address', 'Pavilion Stand, MG Road, Bangalore 560001', NULL, 3);

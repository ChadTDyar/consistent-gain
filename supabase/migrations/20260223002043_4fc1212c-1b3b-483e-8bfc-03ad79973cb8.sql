
-- Create testimonials table for collecting user feedback
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  location TEXT,
  quote TEXT NOT NULL,
  achievement TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Users can submit their own testimonials
CREATE POLICY "Users can insert own testimonials"
ON public.testimonials FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own testimonials
CREATE POLICY "Users can view own testimonials"
ON public.testimonials FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own testimonials
CREATE POLICY "Users can update own testimonials"
ON public.testimonials FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own testimonials
CREATE POLICY "Users can delete own testimonials"
ON public.testimonials FOR DELETE
USING (auth.uid() = user_id);

-- Anyone can view approved testimonials (for landing page display)
CREATE POLICY "Anyone can view approved testimonials"
ON public.testimonials FOR SELECT
USING (is_approved = true);

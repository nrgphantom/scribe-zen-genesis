
-- Create subscribers table to track subscription information
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT DEFAULT 'free',
  subscription_end TIMESTAMPTZ,
  chapters_generated INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create book_generations table to track user's book generation history
CREATE TABLE public.book_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_title TEXT NOT NULL,
  book_description TEXT,
  book_type TEXT NOT NULL,
  total_chapters INTEGER NOT NULL,
  chapters_generated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_generations ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON public.subscribers
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscription" ON public.subscribers
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create policies for book_generations table
CREATE POLICY "Users can view their own book generations" ON public.book_generations
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own book generations" ON public.book_generations
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own book generations" ON public.book_generations
FOR UPDATE
USING (user_id = auth.uid());

-- Create policies for edge functions to bypass RLS
CREATE POLICY "Service role can manage subscribers" ON public.subscribers
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage book generations" ON public.book_generations
FOR ALL
USING (true)
WITH CHECK (true);

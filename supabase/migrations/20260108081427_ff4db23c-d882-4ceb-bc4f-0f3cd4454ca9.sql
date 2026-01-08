-- Create stress_checkins table to store user check-in data
CREATE TABLE public.stress_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  feelings TEXT[] NOT NULL,
  intensity INTEGER DEFAULT 50,
  activities TEXT[] DEFAULT '{}',
  companions TEXT[] DEFAULT '{}',
  locations TEXT[] DEFAULT '{}',
  journal_prompts JSONB DEFAULT '{}',
  freeform_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stress_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own check-ins" 
ON public.stress_checkins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins" 
ON public.stress_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins" 
ON public.stress_checkins 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-ins" 
ON public.stress_checkins 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster user queries
CREATE INDEX idx_stress_checkins_user_id ON public.stress_checkins(user_id);
CREATE INDEX idx_stress_checkins_created_at ON public.stress_checkins(created_at DESC);
-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create conversations table
CREATE TABLE public.lumina_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.lumina_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.lumina_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lumina_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lumina_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
ON public.lumina_conversations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
ON public.lumina_conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
ON public.lumina_conversations FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
ON public.lumina_conversations FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for messages
CREATE POLICY "Users can view messages of their conversations" 
ON public.lumina_messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.lumina_conversations 
  WHERE id = conversation_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their conversations" 
ON public.lumina_messages FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.lumina_conversations 
  WHERE id = conversation_id AND user_id = auth.uid()
));

-- Indexes
CREATE INDEX idx_lumina_conversations_user_id ON public.lumina_conversations(user_id);
CREATE INDEX idx_lumina_conversations_updated_at ON public.lumina_conversations(updated_at DESC);
CREATE INDEX idx_lumina_messages_conversation_id ON public.lumina_messages(conversation_id);

-- Update timestamp trigger
CREATE TRIGGER update_lumina_conversations_updated_at
BEFORE UPDATE ON public.lumina_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
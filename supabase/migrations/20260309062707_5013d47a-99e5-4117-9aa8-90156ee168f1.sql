
-- Chatbot training pairs
CREATE TABLE public.chatbot_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  response TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.chatbot_training ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage training" ON public.chatbot_training FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can read active training" ON public.chatbot_training FOR SELECT USING (active = true);

-- Chatbot settings (key-value)
CREATE TABLE public.chatbot_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage settings" ON public.chatbot_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can read settings" ON public.chatbot_settings FOR SELECT USING (true);

-- Insert default settings
INSERT INTO public.chatbot_settings (key, value) VALUES
  ('bot_name', 'AtlasWave Assistant'),
  ('greeting', 'Hello! 👋 Welcome to AtlasWave Travel & Tours. How can I help you today?'),
  ('fallback', 'I''m not sure about that. Would you like to speak with a human agent?'),
  ('bot_enabled', 'true'),
  ('whatsapp_enabled', 'false');

-- Chat logs
CREATE TABLE public.chat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID,
  user_name TEXT NOT NULL DEFAULT 'Guest',
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  matched BOOLEAN NOT NULL DEFAULT true,
  feedback TEXT CHECK (feedback IN ('positive', 'negative')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage logs" ON public.chat_logs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can insert logs" ON public.chat_logs FOR INSERT WITH CHECK (true);

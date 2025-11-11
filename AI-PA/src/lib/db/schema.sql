-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  favourite_heroes TEXT[] DEFAULT '{}',
  favourite_artists TEXT[] DEFAULT '{}',
  mood_preferences JSONB DEFAULT '{"relaxing": true, "energetic": true, "sad": true}',
  time_preferences JSONB DEFAULT '{"night": "relaxing", "morning": "energetic", "travel": "energetic"}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recent Listening Table
CREATE TABLE IF NOT EXISTS recent_listening (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  mood TEXT,
  hero TEXT,
  time_context TEXT,
  track_id TEXT,
  track_name TEXT,
  artist_name TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Automation Rules Table
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('night', 'travel', 'mood')),
  playlist_query TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Spotify User Tokens Table
CREATE TABLE IF NOT EXISTS spotify_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_listening ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotify_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own listening history" ON recent_listening
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own listening history" ON recent_listening
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own automation rules" ON automation_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own automation rules" ON automation_rules
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own spotify tokens" ON spotify_tokens
  FOR ALL USING (auth.uid() = user_id);


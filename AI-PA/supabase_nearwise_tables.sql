-- NearWise Tables for AI Local Discovery Feature
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Table: nearwise_saved_locations
-- Stores user's saved/favorite locations
CREATE TABLE IF NOT EXISTS nearwise_saved_locations (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    place_id TEXT NOT NULL,
    place_name TEXT NOT NULL,
    place_category TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    phone TEXT,
    rating DECIMAL(3, 2),
    notes TEXT,
    saved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, place_id)
);

-- Table: nearwise_preferences
-- Stores user preferences for NearWise feature
CREATE TABLE IF NOT EXISTS nearwise_preferences (
    preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    preferred_radius INTEGER DEFAULT 10,
    preferred_categories TEXT[] DEFAULT ARRAY['all'],
    notification_enabled BOOLEAN DEFAULT true,
    notification_types TEXT[] DEFAULT ARRAY['new_opening', 'event', 'offer'],
    auto_detect_location BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table: nearwise_notifications
-- Stores notification subscriptions and alerts for NearWise
CREATE TABLE IF NOT EXISTS nearwise_notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- 'new_opening', 'event', 'offer', 'trending'
    place_id TEXT,
    place_name TEXT,
    place_category TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'read', 'dismissed'
    scheduled_time TIMESTAMP,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    metadata JSONB, -- Additional data like coordinates, distance, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: nearwise_search_history
-- Stores user's search history for analytics and personalization
CREATE TABLE IF NOT EXISTS nearwise_search_history (
    search_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    search_query TEXT,
    search_category TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius INTEGER,
    results_count INTEGER,
    searched_at TIMESTAMP DEFAULT NOW()
);

-- Table: nearwise_place_reviews
-- Stores user reviews and ratings for places (optional, for future enhancement)
CREATE TABLE IF NOT EXISTS nearwise_place_reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    place_id TEXT NOT NULL,
    place_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    visit_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, place_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_nearwise_saved_locations_user_id ON nearwise_saved_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_nearwise_saved_locations_place_id ON nearwise_saved_locations(place_id);
CREATE INDEX IF NOT EXISTS idx_nearwise_preferences_user_id ON nearwise_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_nearwise_notifications_user_id ON nearwise_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_nearwise_notifications_status ON nearwise_notifications(status);
CREATE INDEX IF NOT EXISTS idx_nearwise_search_history_user_id ON nearwise_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_nearwise_place_reviews_user_id ON nearwise_place_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_nearwise_place_reviews_place_id ON nearwise_place_reviews(place_id);

-- Enable Row Level Security (RLS)
ALTER TABLE nearwise_saved_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nearwise_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE nearwise_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nearwise_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nearwise_place_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nearwise_saved_locations
CREATE POLICY "Users can view their own saved locations"
    ON nearwise_saved_locations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved locations"
    ON nearwise_saved_locations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved locations"
    ON nearwise_saved_locations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved locations"
    ON nearwise_saved_locations FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for nearwise_preferences
CREATE POLICY "Users can view their own preferences"
    ON nearwise_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON nearwise_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON nearwise_preferences FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for nearwise_notifications
CREATE POLICY "Users can view their own notifications"
    ON nearwise_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON nearwise_notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON nearwise_notifications FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for nearwise_search_history
CREATE POLICY "Users can view their own search history"
    ON nearwise_search_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
    ON nearwise_search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for nearwise_place_reviews
CREATE POLICY "Users can view all reviews"
    ON nearwise_place_reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own reviews"
    ON nearwise_place_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON nearwise_place_reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
    ON nearwise_place_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nearwise_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_nearwise_preferences_updated_at
    BEFORE UPDATE ON nearwise_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_nearwise_updated_at();

CREATE TRIGGER update_nearwise_place_reviews_updated_at
    BEFORE UPDATE ON nearwise_place_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_nearwise_updated_at();

-- Insert default preferences for existing users (optional)
-- Uncomment the following line if you want to create default preferences for all existing users
-- INSERT INTO nearwise_preferences (user_id)
-- SELECT user_id FROM users
-- ON CONFLICT (user_id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'NearWise tables created successfully!';
    RAISE NOTICE 'Tables created: nearwise_saved_locations, nearwise_preferences, nearwise_notifications, nearwise_search_history, nearwise_place_reviews';
    RAISE NOTICE 'Indexes and RLS policies have been applied.';
END $$;


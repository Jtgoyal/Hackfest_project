-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS attendee_feedback CASCADE;
DROP TABLE IF EXISTS live_chats CASCADE;
DROP TABLE IF EXISTS api_data CASCADE;

-- Create attendee_feedback table
CREATE TABLE attendee_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL,
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create live_chats table
CREATE TABLE live_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    sentiment_score NUMERIC(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create api_data table
CREATE TABLE api_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    raw_data JSONB NOT NULL,
    processed_flag BOOLEAN DEFAULT FALSE,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_attendee_feedback_source ON attendee_feedback(source);
CREATE INDEX idx_attendee_feedback_sentiment ON attendee_feedback(sentiment);
CREATE INDEX idx_attendee_feedback_timestamp ON attendee_feedback(timestamp);

CREATE INDEX idx_live_chats_user_id ON live_chats(user_id);
CREATE INDEX idx_live_chats_session_id ON live_chats(session_id);
CREATE INDEX idx_live_chats_timestamp ON live_chats(timestamp);
CREATE INDEX idx_live_chats_sentiment_score ON live_chats(sentiment_score);

CREATE INDEX idx_api_data_platform ON api_data(platform);
CREATE INDEX idx_api_data_processed_flag ON api_data(processed_flag);
CREATE INDEX idx_api_data_retrieved_at ON api_data(retrieved_at); 
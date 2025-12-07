-- Biomedical Analyst Roleplay Platform - Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users (Lecturers)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: students
CREATE TABLE IF NOT EXISTS students (
    nim VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: datasets (Enhanced for Meta-Prompt Architecture)
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    metadata_summary TEXT,
    columns_list TEXT[],  -- Array of column names
    sample_data TEXT,  -- CSV format, first 5 rows
    data_quality_notes TEXT,  -- Known data issues for educational scenarios
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: assignments
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_nim VARCHAR(50) REFERENCES students(nim) ON DELETE CASCADE,
    dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
    scenario_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_nim)
);

-- Table: chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    sender VARCHAR(20) CHECK (sender IN ('student', 'ai')) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Index for chat messages
CREATE INDEX IF NOT EXISTS idx_chat_assignment ON chat_messages(assignment_id, timestamp);

-- Table: submissions
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    link_url TEXT NOT NULL,
    submission_type VARCHAR(20) CHECK (submission_type IN ('progress', 'final')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for submissions
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id, created_at);

-- Table: grades
CREATE TABLE IF NOT EXISTS grades (
    assignment_id UUID PRIMARY KEY REFERENCES assignments(id) ON DELETE CASCADE,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Optional: Row Level Security (RLS) policies
-- Uncomment if you want to enable RLS

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for students (students can only see their own data)
-- CREATE POLICY "Students can view own data" ON students
--     FOR SELECT USING (nim = current_user);

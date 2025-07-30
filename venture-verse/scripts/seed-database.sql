-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('founder', 'manager');
CREATE TYPE idea_status AS ENUM ('submitted', 'under_review', 'funded', 'rejected');
CREATE TYPE decision_type AS ENUM ('approved', 'rejected');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    founder_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    market_size TEXT NOT NULL,
    business_model TEXT NOT NULL,
    status idea_status DEFAULT 'submitted',
    ai_score INTEGER,
    ai_recommendations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    criteria JSONB NOT NULL,
    overall_score INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create manager_decisions table
CREATE TABLE IF NOT EXISTS manager_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES users(id) ON DELETE CASCADE,
    decision decision_type NOT NULL,
    funding_amount NUMERIC,
    competitor_analysis TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_decisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'manager'
        )
    );

-- RLS Policies for ideas table
CREATE POLICY "Founders can view their own ideas" ON ideas
    FOR SELECT USING (auth.uid() = founder_id);

CREATE POLICY "Founders can insert their own ideas" ON ideas
    FOR INSERT WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Founders can update their own ideas" ON ideas
    FOR UPDATE USING (auth.uid() = founder_id);

CREATE POLICY "Managers can view all ideas" ON ideas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'manager'
        )
    );

CREATE POLICY "Managers can update idea status" ON ideas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'manager'
        )
    );

-- RLS Policies for assessments table
CREATE POLICY "Users can view assessments for their ideas" ON assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ideas
            WHERE ideas.id = assessments.idea_id 
            AND (ideas.founder_id = auth.uid() OR EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid() AND users.role = 'manager'
            ))
        )
    );

CREATE POLICY "System can insert assessments" ON assessments
    FOR INSERT WITH CHECK (true);

-- RLS Policies for manager_decisions table
CREATE POLICY "Users can view decisions for their ideas" ON manager_decisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ideas
            WHERE ideas.id = manager_decisions.idea_id 
            AND (ideas.founder_id = auth.uid() OR EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid() AND users.role = 'manager'
            ))
        )
    );

CREATE POLICY "Managers can insert decisions" ON manager_decisions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.role = 'manager'
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_ideas_founder_id ON ideas(founder_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_category ON ideas(category);
CREATE INDEX idx_ideas_created_at ON ideas(created_at);
CREATE INDEX idx_assessments_idea_id ON assessments(idea_id);
CREATE INDEX idx_manager_decisions_idea_id ON manager_decisions(idea_id);
CREATE INDEX idx_manager_decisions_manager_id ON manager_decisions(manager_id);

-- Insert sample data
INSERT INTO users (id, role, name, email) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'founder', 'Alice Johnson', 'alice@example.com'),
    ('550e8400-e29b-41d4-a716-446655440002', 'founder', 'Bob Smith', 'bob@example.com'),
    ('550e8400-e29b-41d4-a716-446655440003', 'manager', 'Carol Davis', 'carol@example.com'),
    ('550e8400-e29b-41d4-a716-446655440004', 'manager', 'David Wilson', 'david@example.com');

-- Insert sample ideas
INSERT INTO ideas (id, founder_id, title, description, category, market_size, business_model, status, ai_score, ai_recommendations) VALUES
    (
        '660e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440001',
        'EcoTrack - Sustainable Living App',
        'A mobile app that helps users track their carbon footprint, suggests eco-friendly alternatives, and connects them with local sustainable businesses. Features include carbon tracking, green challenges, and a marketplace for eco-products.',
        'Sustainability',
        'Large ($10M - $100M)',
        'Freemium',
        'submitted',
        78,
        '{"innovation": 75, "market_fit": 85, "team_strength": 70, "revenue_potential": 80, "recommendations": ["Focus on user acquisition through partnerships with environmental organizations", "Develop a robust carbon calculation algorithm", "Consider B2B partnerships with corporations for employee wellness programs"], "strengths": ["Growing market demand for sustainability", "Clear value proposition", "Multiple revenue streams"], "concerns": ["Competition from established players", "User retention challenges", "Regulatory compliance requirements"]}'
    ),
    (
        '660e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440002',
        'MindfulAI - Mental Health Companion',
        'An AI-powered mental health platform that provides personalized therapy sessions, mood tracking, and crisis intervention. Uses natural language processing to offer 24/7 support and connects users with licensed therapists when needed.',
        'Healthcare',
        'Very Large ($100M - $1B)',
        'B2C Subscription',
        'funded',
        85,
        '{"innovation": 90, "market_fit": 85, "team_strength": 80, "revenue_potential": 85, "recommendations": ["Ensure HIPAA compliance from day one", "Build strong partnerships with healthcare providers", "Focus on clinical validation of AI algorithms"], "strengths": ["High market demand", "Strong technical innovation", "Scalable business model"], "concerns": ["Regulatory hurdles", "Privacy and security requirements", "Need for clinical validation"]}'
    ),
    (
        '660e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440001',
        'CodeMentor Pro - AI Coding Assistant',
        'An advanced AI coding assistant that not only helps write code but also reviews, optimizes, and teaches best practices. Integrates with popular IDEs and provides real-time feedback on code quality, security, and performance.',
        'Technology',
        'Medium ($1M - $10M)',
        'B2B SaaS',
        'rejected',
        65,
        '{"innovation": 60, "market_fit": 70, "team_strength": 65, "revenue_potential": 65, "recommendations": ["Differentiate from existing AI coding tools", "Focus on specific programming languages or domains", "Build strong integration partnerships"], "strengths": ["Growing developer market", "Clear business model", "Technical feasibility"], "concerns": ["Intense competition from GitHub Copilot and similar tools", "Differentiation challenges", "High customer acquisition costs"]}'
    );

-- Insert sample assessments
INSERT INTO assessments (idea_id, criteria, overall_score, completed_at) VALUES
    (
        '660e8400-e29b-41d4-a716-446655440001',
        '{"innovation": 75, "market_fit": 85, "team_strength": 70, "revenue_potential": 80}',
        78,
        NOW()
    ),
    (
        '660e8400-e29b-41d4-a716-446655440002',
        '{"innovation": 90, "market_fit": 85, "team_strength": 80, "revenue_potential": 85}',
        85,
        NOW()
    ),
    (
        '660e8400-e29b-41d4-a716-446655440003',
        '{"innovation": 60, "market_fit": 70, "team_strength": 65, "revenue_potential": 65}',
        65,
        NOW()
    );

-- Insert sample manager decisions
INSERT INTO manager_decisions (idea_id, manager_id, decision, funding_amount, competitor_analysis, notes) VALUES
    (
        '660e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003',
        'approved',
        250000,
        'While there are existing mental health apps, the AI-powered personalized approach and crisis intervention features set this apart. The market is large and growing, with increasing awareness of mental health importance.',
        'Strong technical team and clear go-to-market strategy. Recommend focusing on regulatory compliance early and building partnerships with healthcare systems.'
    ),
    (
        '660e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440004',
        'rejected',
        NULL,
        'The AI coding assistant market is highly competitive with well-funded players like GitHub Copilot, AWS CodeWhisperer, and others. The proposed solution lacks clear differentiation.',
        'While the technical execution seems solid, the market positioning and differentiation strategy need significant work. Recommend pivoting to a more specific niche or finding unique value proposition.'
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
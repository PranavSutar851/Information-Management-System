-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('founder', 'manager');
CREATE TYPE idea_status AS ENUM ('submitted', 'under_review', 'funded', 'rejected');
CREATE TYPE decision_type AS ENUM ('approved', 'rejected');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role user_role NOT NULL DEFAULT 'founder',
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ideas table
CREATE TABLE public.ideas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    founder_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    market_size TEXT NOT NULL,
    business_model TEXT NOT NULL,
    status idea_status DEFAULT 'submitted',
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE public.assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
    criteria JSONB NOT NULL, -- {innovation: number, market_fit: number, team_strength: number, revenue_potential: number}
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create manager_decisions table
CREATE TABLE public.manager_decisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
    manager_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    decision decision_type NOT NULL,
    funding_amount DECIMAL(12, 2),
    competitor_analysis TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ideas updated_at
CREATE TRIGGER update_ideas_updated_at
    BEFORE UPDATE ON public.ideas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_decisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Managers can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

-- RLS Policies for ideas table
CREATE POLICY "Founders can view their own ideas" ON public.ideas
    FOR SELECT USING (
        founder_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "Founders can insert their own ideas" ON public.ideas
    FOR INSERT WITH CHECK (founder_id = auth.uid());

CREATE POLICY "Founders can update their own ideas" ON public.ideas
    FOR UPDATE USING (founder_id = auth.uid());

CREATE POLICY "Managers can update idea status" ON public.ideas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

-- RLS Policies for assessments table
CREATE POLICY "Anyone can view assessments for ideas they can see" ON public.assessments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ideas
            WHERE id = assessments.idea_id AND (
                founder_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users
                    WHERE id = auth.uid() AND role = 'manager'
                )
            )
        )
    );

CREATE POLICY "System can insert assessments" ON public.assessments
    FOR INSERT WITH CHECK (true);

-- RLS Policies for manager_decisions table
CREATE POLICY "Anyone can view decisions for ideas they can see" ON public.manager_decisions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ideas
            WHERE id = manager_decisions.idea_id AND (
                founder_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.users
                    WHERE id = auth.uid() AND role = 'manager'
                )
            )
        )
    );

CREATE POLICY "Managers can insert decisions" ON public.manager_decisions
    FOR INSERT WITH CHECK (
        manager_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "Managers can update their own decisions" ON public.manager_decisions
    FOR UPDATE USING (
        manager_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'manager'
        )
    );

-- Create indexes for better performance
CREATE INDEX idx_ideas_founder_id ON public.ideas(founder_id);
CREATE INDEX idx_ideas_status ON public.ideas(status);
CREATE INDEX idx_ideas_created_at ON public.ideas(created_at DESC);
CREATE INDEX idx_assessments_idea_id ON public.assessments(idea_id);
CREATE INDEX idx_manager_decisions_idea_id ON public.manager_decisions(idea_id);
CREATE INDEX idx_manager_decisions_manager_id ON public.manager_decisions(manager_id);

-- Create view for ideas with related data
CREATE VIEW public.ideas_with_details AS
SELECT 
    i.*,
    u.name as founder_name,
    u.email as founder_email,
    u.avatar_url as founder_avatar,
    a.criteria as assessment_criteria,
    a.overall_score as assessment_score,
    a.completed_at as assessment_completed_at,
    md.decision,
    md.funding_amount,
    md.competitor_analysis,
    md.notes as decision_notes,
    md.created_at as decision_created_at,
    mu.name as manager_name
FROM public.ideas i
LEFT JOIN public.users u ON i.founder_id = u.id
LEFT JOIN public.assessments a ON i.id = a.idea_id
LEFT JOIN public.manager_decisions md ON i.id = md.idea_id
LEFT JOIN public.users mu ON md.manager_id = mu.id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
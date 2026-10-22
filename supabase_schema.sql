-- ==============================================================================
-- SUPABASE DATABASE SCHEMA: DCC STRATEGIC ASSESSMENT & GOOGLE FORMS INTEGRATION
-- Target Application: ECWA Umuahia DCC Strategic Feedback Hub
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Existing Tables if recreating (safe idempotent setup)
-- Note: Run in Supabase SQL Editor

-- 3. Forms Table (Holds metadata for forms: DCC, LC, LCC)
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. DCC & General Form Submissions Table
-- Specifically tailored to capture the full DCC Strategic Assessment workflow (22 Steps)
CREATE TABLE IF NOT EXISTS public.dcc_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,
    form_type TEXT DEFAULT 'DCC Strategic Assessment' NOT NULL,
    
    -- Respondent Information (Step 1)
    respondent_name TEXT NOT NULL,
    respondent_office TEXT NOT NULL,
    respondent_phone TEXT,
    respondent_email TEXT,
    info_source TEXT,
    info_source_other TEXT,
    lc_lcc_name TEXT,
    
    -- Complete Structured Payload (all 22 steps / sections A-V)
    payload JSONB NOT NULL,
    
    -- Submission Metadata
    submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_dcc_submissions_submitted_at ON public.dcc_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_dcc_submissions_respondent ON public.dcc_submissions(respondent_name);
CREATE INDEX IF NOT EXISTS idx_dcc_submissions_payload_gin ON public.dcc_submissions USING GIN (payload);
CREATE INDEX IF NOT EXISTS idx_forms_slug ON public.forms(slug);

-- 6. Seed the DCC Form Record
INSERT INTO public.forms (slug, title, description, is_active)
VALUES (
    'dcc-assessment',
    'District Church Council Strategic Assessment',
    'Baseline data collection for the development and implementation of the UMDCC DCC strategic plan (Sections A-V).',
    TRUE
)
ON CONFLICT (slug) DO UPDATE 
SET title = EXCLUDED.title, description = EXCLUDED.description;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Anon/Respondents can INSERT only; NO public read access.
-- Only authenticated users (admins/DCC executives) can read submissions.
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcc_submissions ENABLE ROW LEVEL SECURITY;

-- Forms RLS: Public can view active forms
DROP POLICY IF EXISTS "Public can view active forms" ON public.forms;
CREATE POLICY "Public can view active forms"
    ON public.forms FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

-- DCC Submissions RLS:
-- 1. Anonymous respondents & authenticated users can INSERT submissions
DROP POLICY IF EXISTS "Anyone can submit DCC assessment" ON public.dcc_submissions;
CREATE POLICY "Anyone can submit DCC assessment"
    ON public.dcc_submissions FOR INSERT TO anon, authenticated
    WITH CHECK (
        respondent_name IS NOT NULL AND 
        respondent_office IS NOT NULL AND 
        length(trim(respondent_name)) > 0 AND 
        length(trim(respondent_office)) > 0
    );

-- 2. STRICT PRIVACY: Anonymous users CANNOT select/read submitted form responses.
-- Only authenticated users (e.g. DCC secretariats / admins logged into Supabase) can view.
DROP POLICY IF EXISTS "Only authenticated administrators can read DCC submissions" ON public.dcc_submissions;
CREATE POLICY "Only authenticated administrators can read DCC submissions"
    ON public.dcc_submissions FOR SELECT TO authenticated
    USING (TRUE);

-- 3. Prevent anonymous update or deletion of submitted responses
DROP POLICY IF EXISTS "Disallow public updates" ON public.dcc_submissions;
CREATE POLICY "Disallow public updates"
    ON public.dcc_submissions FOR UPDATE TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "Disallow public deletes" ON public.dcc_submissions;
CREATE POLICY "Disallow public deletes"
    ON public.dcc_submissions FOR DELETE TO authenticated
    USING (TRUE);

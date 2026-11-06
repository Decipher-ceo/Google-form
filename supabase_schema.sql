-- ==============================================================================
-- SUPABASE DATABASE SCHEMA: DCC, LC, AND LCC STRATEGIC PORTALS
-- Target Application: ECWA Umuahia DCC Strategic Feedback Hub
-- Safe, Idempotent Migration: Creates missing tables and preserves existing data.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Forms Registry Table (Parent definition for DCC, LC, LCC)
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. DCC Submissions Table (Executive 22-step DCC Strategic Assessment)
CREATE TABLE IF NOT EXISTS public.dcc_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,
    form_type TEXT DEFAULT 'DCC Strategic Assessment' NOT NULL,
    respondent_name TEXT NOT NULL,
    respondent_office TEXT NOT NULL,
    respondent_phone TEXT,
    respondent_email TEXT,
    info_source TEXT,
    info_source_other TEXT,
    lc_lcc_name TEXT,
    payload JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. LC Submissions Table (11-section Local Church Questionnaire for all 66 Churches)
CREATE TABLE IF NOT EXISTS public.lc_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,
    form_type TEXT DEFAULT 'Local Church Questionnaire' NOT NULL,
    church_id TEXT,
    church_name TEXT NOT NULL,
    lcc_name TEXT NOT NULL,
    pastor_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    state TEXT,
    community_lga TEXT,
    payload JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. LCC Submissions Table (10-section LCC Questionnaire for 9 Councils)
CREATE TABLE IF NOT EXISTS public.lcc_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,
    form_type TEXT DEFAULT 'LCC Questionnaire' NOT NULL,
    lcc_council_id TEXT,
    lcc_council_name TEXT NOT NULL,
    constituted_year TEXT,
    payload JSONB NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_forms_slug ON public.forms(slug);

CREATE INDEX IF NOT EXISTS idx_dcc_submissions_submitted_at ON public.dcc_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_dcc_submissions_respondent ON public.dcc_submissions(respondent_name);
CREATE INDEX IF NOT EXISTS idx_dcc_submissions_payload_gin ON public.dcc_submissions USING GIN (payload);

CREATE INDEX IF NOT EXISTS idx_lc_submissions_submitted_at ON public.lc_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_lc_submissions_church ON public.lc_submissions(church_name);
CREATE INDEX IF NOT EXISTS idx_lc_submissions_lcc ON public.lc_submissions(lcc_name);
CREATE INDEX IF NOT EXISTS idx_lc_submissions_payload_gin ON public.lc_submissions USING GIN (payload);

CREATE INDEX IF NOT EXISTS idx_lcc_submissions_submitted_at ON public.lcc_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_lcc_submissions_council ON public.lcc_submissions(lcc_council_name);
CREATE INDEX IF NOT EXISTS idx_lcc_submissions_payload_gin ON public.lcc_submissions USING GIN (payload);

-- 7. Seed Form Definitions
INSERT INTO public.forms (slug, title, description, is_active)
VALUES 
    (
        'dcc-assessment',
        'District Church Council Strategic Assessment',
        'Baseline data collection for the development and implementation of the UMDCC DCC strategic plan (Sections A-V).',
        TRUE
    ),
    (
        'lc-questionnaire',
        'Local Church Questionnaire',
        'Comprehensive baseline assessment for all 66 Local Church congregations across 9 LCCs.',
        TRUE
    ),
    (
        'lcc-questionnaire',
        'Local Church Council Questionnaire',
        'Strategic assessment for the 9 Local Church Councils of ECWA Umuahia District.',
        TRUE
    )
ON CONFLICT (slug) DO UPDATE 
SET title = EXCLUDED.title, description = EXCLUDED.description, is_active = EXCLUDED.is_active;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Security: Unauthenticated visitors can INSERT valid responses.
-- Only authenticated administrators logged into Supabase can read, update, or delete.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lcc_submissions ENABLE ROW LEVEL SECURITY;

-- FORMS POLICIES
DROP POLICY IF EXISTS "Public can view active forms" ON public.forms;
CREATE POLICY "Public can view active forms"
    ON public.forms FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

-- DCC SUBMISSIONS POLICIES
DROP POLICY IF EXISTS "Anyone can submit DCC assessment" ON public.dcc_submissions;
CREATE POLICY "Anyone can submit DCC assessment"
    ON public.dcc_submissions FOR INSERT TO anon, authenticated
    WITH CHECK (
        respondent_name IS NOT NULL AND 
        respondent_office IS NOT NULL AND 
        length(trim(respondent_name)) > 0 AND 
        length(trim(respondent_office)) > 0
    );

DROP POLICY IF EXISTS "Only authenticated administrators can read DCC submissions" ON public.dcc_submissions;
CREATE POLICY "Only authenticated administrators can read DCC submissions"
    ON public.dcc_submissions FOR SELECT TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "Disallow public updates" ON public.dcc_submissions;
CREATE POLICY "Disallow public updates"
    ON public.dcc_submissions FOR UPDATE TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "Disallow public deletes" ON public.dcc_submissions;
CREATE POLICY "Disallow public deletes"
    ON public.dcc_submissions FOR DELETE TO authenticated
    USING (TRUE);

-- LC SUBMISSIONS POLICIES
DROP POLICY IF EXISTS "Anyone can submit LC questionnaire" ON public.lc_submissions;
CREATE POLICY "Anyone can submit LC questionnaire"
    ON public.lc_submissions FOR INSERT TO anon, authenticated
    WITH CHECK (
        church_name IS NOT NULL AND 
        length(trim(church_name)) > 0
    );

DROP POLICY IF EXISTS "Only authenticated administrators can read LC submissions" ON public.lc_submissions;
CREATE POLICY "Only authenticated administrators can read LC submissions"
    ON public.lc_submissions FOR SELECT TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "Disallow public LC updates" ON public.lc_submissions;
CREATE POLICY "Disallow public LC updates"
    ON public.lc_submissions FOR UPDATE TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "Disallow public LC deletes" ON public.lc_submissions;
CREATE POLICY "Disallow public LC deletes"
    ON public.lc_submissions FOR DELETE TO authenticated
    USING (TRUE);

-- LCC SUBMISSIONS POLICIES
DROP POLICY IF EXISTS "Anyone can submit LCC questionnaire" ON public.lcc_submissions;
CREATE POLICY "Anyone can submit LCC questionnaire"
    ON public.lcc_submissions FOR INSERT TO anon, authenticated
    WITH CHECK (
        lcc_council_name IS NOT NULL AND 
        length(trim(lcc_council_name)) > 0
    );

DROP POLICY IF EXISTS "Only authenticated administrators can read LCC submissions" ON public.lcc_submissions;
CREATE POLICY "Only authenticated administrators can read LCC submissions"
    ON public.lcc_submissions FOR SELECT TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "Disallow public LCC updates" ON public.lcc_submissions;
CREATE POLICY "Disallow public LCC updates"
    ON public.lcc_submissions FOR UPDATE TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "Disallow public LCC deletes" ON public.lcc_submissions;
CREATE POLICY "Disallow public LCC deletes"
    ON public.lcc_submissions FOR DELETE TO authenticated
    USING (TRUE);

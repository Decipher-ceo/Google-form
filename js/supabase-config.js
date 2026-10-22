/**
 * Supabase Client Configuration & Integration Manager
 * ECWA Umuahia DCC Strategic Assessment & Research Portal
 * 
 * NOTE: Only the public SUPABASE_ANON_KEY and SUPABASE_URL should be set here.
 * Never expose the SUPABASE_SERVICE_ROLE_KEY or database passwords in frontend code.
 */

const SUPABASE_ENV = {
    // Supabase Project URL
    url: window.SUPABASE_URL || localStorage.getItem('supabase_project_url') || 'https://kgwdnjnxsgxpkwbfihfn.supabase.co',
    
    // Supabase Publishable / Anon Key
    anonKey: window.SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || 'sb_publishable_GbWrw_GcCq2bc-E0SdrwIw_m7zPyhP0'
};

class SupabaseManager {
    constructor() {
        this.client = null;
        this.isReady = false;
        this.init();
    }

    init() {
        if (!SUPABASE_ENV.url || !SUPABASE_ENV.anonKey) {
            console.info('[Supabase] Project URL or Anon Key not yet set. Submissions will safely fallback to local storage.');
            this.isReady = false;
            return false;
        }

        if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
            console.warn('[Supabase] Supabase JS library not loaded. Ensure script is included in HTML.');
            this.isReady = false;
            return false;
        }

        try {
            this.client = window.supabase.createClient(SUPABASE_ENV.url, SUPABASE_ENV.anonKey);
            this.isReady = true;
            console.log('[Supabase] Client initialized successfully.');
            return true;
        } catch (err) {
            console.error('[Supabase] Initialization error:', err);
            this.isReady = false;
            return false;
        }
    }

    /**
     * Submit DCC Strategic Assessment response to Supabase
     * @param {Object} data - Key-value pair of form inputs
     * @returns {Promise<{success: boolean, error?: any, data?: any}>}
     */
    async submitDCCAssessment(data) {
        if (!this.isReady && !this.init()) {
            return { success: false, reason: 'unconfigured' };
        }

        try {
            const submissionPayload = {
                form_type: 'DCC Strategic Assessment',
                respondent_name: (data.dcc_respondent_name || 'Anonymous').trim(),
                respondent_office: (data.dcc_respondent_office || 'Not Specified').trim(),
                respondent_phone: data.dcc_respondent_phone || null,
                respondent_email: data.dcc_respondent_email || null,
                info_source: data.dcc_info_source || null,
                info_source_other: data.dcc_info_source_other || null,
                lc_lcc_name: data.dcc_lc_lcc_name || null,
                payload: data,
                submitted_at: new Date().toISOString()
            };

            const { data: result, error } = await this.client
                .from('dcc_submissions')
                .insert([submissionPayload])
                .select('id, submitted_at');

            if (error) {
                console.error('[Supabase] Insert error:', error);
                return { success: false, error };
            }

            return { success: true, data: result };
        } catch (err) {
            console.error('[Supabase] Unexpected submission exception:', err);
            return { success: false, error: err };
        }
    }
}

// Global singleton instance
window.supabaseManager = new SupabaseManager();

/**
 * Supabase Client Configuration & Integration Manager
 * ECWA Umuahia DCC Strategic Assessment & Research Portal
 * Supports DCC, Local Church (LC), and Local Church Council (LCC) Submissions
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
     * Note: Uses return=minimal by not chaining .select() so anonymous respondents
     * are not blocked by the private SELECT Row Level Security policy.
     * @param {Object} data - Key-value pair of form inputs
     * @returns {Promise<{success: boolean, error?: any}>}
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

            const { error } = await this.client
                .from('dcc_submissions')
                .insert([submissionPayload]);

            if (error) {
                console.error('[Supabase] DCC Insert error:', error);
                return { success: false, error };
            }

            return { success: true };
        } catch (err) {
            console.error('[Supabase] Unexpected DCC submission exception:', err);
            return { success: false, error: err };
        }
    }

    /**
     * Submit Local Church (LC) Questionnaire response to Supabase
     * @param {Object} church - Selected church metadata from data.js
     * @param {Object} data - Complete key-value pair of form inputs across all 11 sections
     * @returns {Promise<{success: boolean, error?: any}>}
     */
    async submitLCQuestionnaire(church, data) {
        if (!this.isReady && !this.init()) {
            return { success: false, reason: 'unconfigured' };
        }

        try {
            const submissionPayload = {
                form_type: 'Local Church Questionnaire',
                church_id: String(church ? church.id : (data.church_id || '')),
                church_name: (church ? church.rawName : (data.church_name || 'Unknown Church')).trim(),
                lcc_name: (church ? church.lccName : (data.lcc_name || '')).trim(),
                pastor_name: data.q_current_pastor || null,
                contact_phone: data.q_contact_phone || null,
                contact_email: data.q_contact_email || null,
                state: data.q_state || null,
                community_lga: data.q_community_lga || null,
                payload: data,
                submitted_at: new Date().toISOString()
            };

            const { error } = await this.client
                .from('lc_submissions')
                .insert([submissionPayload]);

            if (error) {
                console.error('[Supabase] LC Insert error:', error);
                return { success: false, error };
            }

            return { success: true };
        } catch (err) {
            console.error('[Supabase] Unexpected LC submission exception:', err);
            return { success: false, error: err };
        }
    }

    /**
     * Submit Local Church Council (LCC) Questionnaire response to Supabase
     * @param {Object} council - Selected LCC council metadata from data.js
     * @param {Object} data - Complete key-value pair of form inputs across all 10 sections
     * @returns {Promise<{success: boolean, error?: any}>}
     */
    async submitLCCQuestionnaire(council, data) {
        if (!this.isReady && !this.init()) {
            return { success: false, reason: 'unconfigured' };
        }

        try {
            const submissionPayload = {
                form_type: 'LCC Questionnaire',
                lcc_council_id: String(council ? council.id : (data.lcc_council_id || '')),
                lcc_council_name: (council ? council.name : (data.lcc_council || 'Unknown LCC')).trim(),
                constituted_year: data.lcc_q_constituted_year || null,
                payload: data,
                submitted_at: new Date().toISOString()
            };

            const { error } = await this.client
                .from('lcc_submissions')
                .insert([submissionPayload]);

            if (error) {
                console.error('[Supabase] LCC Insert error:', error);
                return { success: false, error };
            }

            return { success: true };
        } catch (err) {
            console.error('[Supabase] Unexpected LCC submission exception:', err);
            return { success: false, error: err };
        }
    }

    /**
     * Retrieve all pending offline submissions across all 3 portals without modifying them
     */
    getPendingSubmissions() {
        return {
            dcc: JSON.parse(localStorage.getItem('dcc_questionnaire_submissions') || '[]'),
            lc: JSON.parse(localStorage.getItem('lc_questionnaire_submissions') || '[]'),
            lcc: JSON.parse(localStorage.getItem('lcc_questionnaire_submissions') || '[]')
        };
    }

    /**
     * Safely recover and sync any pending offline submissions to Supabase
     */
    async syncPendingSubmissions() {
        if (!this.isReady && !this.init()) {
            console.warn('[Supabase Sync] Client not ready for sync.');
            return { synced: 0, failed: 0 };
        }

        const pending = this.getPendingSubmissions();
        let syncedCount = 0;
        let failedCount = 0;

        // 1. Sync DCC pending
        const remainingDCC = [];
        for (const item of pending.dcc) {
            const res = await this.submitDCCAssessment(item);
            if (res.success) {
                syncedCount++;
            } else {
                remainingDCC.push(item);
                failedCount++;
            }
        }
        localStorage.setItem('dcc_questionnaire_submissions', JSON.stringify(remainingDCC));

        // 2. Sync LC pending
        const remainingLC = [];
        for (const item of pending.lc) {
            const churchMeta = { id: item.church_id, rawName: item.church_name, lccName: item.lcc_name };
            const res = await this.submitLCQuestionnaire(churchMeta, item);
            if (res.success) {
                syncedCount++;
            } else {
                remainingLC.push(item);
                failedCount++;
            }
        }
        localStorage.setItem('lc_questionnaire_submissions', JSON.stringify(remainingLC));

        // 3. Sync LCC pending
        const remainingLCC = [];
        for (const item of pending.lcc) {
            const councilMeta = { id: item.lcc_council_id, name: item.lcc_council };
            const res = await this.submitLCCQuestionnaire(councilMeta, item);
            if (res.success) {
                syncedCount++;
            } else {
                remainingLCC.push(item);
                failedCount++;
            }
        }
        localStorage.setItem('lcc_questionnaire_submissions', JSON.stringify(remainingLCC));

        console.log(`[Supabase Sync] Finished: ${syncedCount} synced, ${failedCount} preserved locally.`);
        return { synced: syncedCount, failed: failedCount };
    }
}

// Global singleton instance
window.supabaseManager = new SupabaseManager();

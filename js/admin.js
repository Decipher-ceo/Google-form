/**
 * Administrator Response Management Portal Controller (js/admin.js)
 * ECWA Umuahia DCC Strategic Planning & Research Hub
 * 
 * Features:
 * - Supabase Authentication (Login, Session persistence, Logout, Password reset)
 * - Live Dashboard Overview with accurate counts and recent activity
 * - Searchable, sortable, paginated tables for DCC, LC, and LCC submissions
 * - Individual Full-Response Inspector with Section-by-Section Q&A and Print/PDF
 * - CSV Report Exporters for all 3 questionnaires
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Global State ---
    const state = {
        session: null,
        user: null,
        activeTab: 'overview',
        data: {
            dcc: [],
            lc: [],
            lcc: []
        },
        filters: {
            dcc: { search: '', sort: 'newest', page: 1, limit: 10 },
            lc: { search: '', lcc: '', sort: 'newest', page: 1, limit: 10 },
            lcc: { search: '', sort: 'newest', page: 1, limit: 10 }
        },
        selectedSubmission: null
    };

    // --- DOM Elements ---
    const authView = document.getElementById('admin-login-view');
    const dashboardView = document.getElementById('admin-dashboard-view');
    const userInfoPill = document.getElementById('admin-user-info');
    const userEmailSpan = document.getElementById('admin-user-email');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const loginForm = document.getElementById('admin-login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginSubmitBtn = document.getElementById('login-submit-btn');
    const loginAlert = document.getElementById('login-alert');

    // Password reset modal elements
    const forgotLink = document.getElementById('forgot-password-link');
    const forgotModal = document.getElementById('forgot-modal');
    const closeForgotBtn = document.getElementById('close-forgot-modal-btn');
    const cancelForgotBtn = document.getElementById('cancel-forgot-btn');
    const sendResetBtn = document.getElementById('send-reset-btn');
    const resetEmailInput = document.getElementById('reset-email');

    // Dashboard navigation & refresh
    const refreshBtn = document.getElementById('refresh-dashboard-btn');
    const lastUpdatedText = document.getElementById('last-updated-time');
    const dashTabs = document.querySelectorAll('.dash-tab');

    // Detail modal elements
    const detailModal = document.getElementById('detail-modal');
    const closeDetailBtn = document.getElementById('close-detail-modal-btn');
    const dismissDetailBtn = document.getElementById('dismiss-detail-btn');
    const detailTitle = document.getElementById('detail-title');
    const detailBadge = document.getElementById('detail-badge');
    const detailSummaryCard = document.getElementById('detail-summary-card');
    const detailSectionsContainer = document.getElementById('detail-sections-container');

    // Table elements
    const dccTableBody = document.getElementById('dcc-table-body');
    const lcTableBody = document.getElementById('lc-table-body');
    const lccTableBody = document.getElementById('lcc-table-body');

    // --- Helper: Format Dates ---
    function formatDate(isoString) {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return isoString;
        }
    }

    function timeAgo(isoString) {
        if (!isoString) return '';
        try {
            const diff = (new Date() - new Date(isoString)) / 1000;
            if (diff < 60) return 'Just now';
            if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
            if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
            return `${Math.floor(diff / 86400)}d ago`;
        } catch (e) {
            return '';
        }
    }

    // --- 1. AUTHENTICATION & SESSION MANAGEMENT ---
    async function initAuth() {
        if (!window.supabaseManager || !window.supabaseManager.client) {
            console.error('[Admin] Supabase client is not available.');
            showLoginAlert('Database connection is not configured. Please verify your settings.');
            return;
        }

        const client = window.supabaseManager.client;

        try {
            const { data: { session }, error } = await client.auth.getSession();
            if (error) {
                console.warn('[Admin] Session retrieval error:', error);
            }
            handleSessionChange(session);

            client.auth.onAuthStateChange((_event, newSession) => {
                handleSessionChange(newSession);
            });
        } catch (err) {
            console.error('[Admin] Unexpected auth check error:', err);
        }
    }

    function handleSessionChange(session) {
        state.session = session;
        state.user = session ? session.user : null;

        if (session && session.user) {
            authView.style.display = 'none';
            dashboardView.style.display = 'block';
            userInfoPill.style.display = 'flex';
            userEmailSpan.textContent = session.user.email || 'Administrator';
            loadAllSubmissions();
        } else {
            authView.style.display = 'flex';
            dashboardView.style.display = 'none';
            userInfoPill.style.display = 'none';
        }
    }

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearLoginAlert();

            const email = loginEmailInput.value.trim();
            const password = loginPasswordInput.value;

            if (!email || !password) {
                showLoginAlert('Please enter both your email address and password.');
                return;
            }

            loginSubmitBtn.disabled = true;
            loginSubmitBtn.innerHTML = `Signing In... <span class="spinner" style="display:inline-block;animation:spin 1s linear infinite;">⏳</span>`;

            try {
                const client = window.supabaseManager.client;
                const { data, error } = await client.auth.signInWithPassword({ email, password });

                if (error) {
                    console.error('[Admin Login] Failed:', error);
                    showLoginAlert(getFriendlyAuthErrorMessage(error.message));
                    return;
                }

                showToast('Welcome back! Signed in successfully.', 'success');
                handleSessionChange(data.session);
            } catch (err) {
                console.error('[Admin Login] Exception:', err);
                showLoginAlert('An unexpected connection error occurred. Please try again.');
            } finally {
                loginSubmitBtn.disabled = false;
                loginSubmitBtn.innerHTML = `Sign In to Dashboard <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>`;
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const client = window.supabaseManager.client;
                await client.auth.signOut();
                showToast('Signed out successfully.', 'info');
                handleSessionChange(null);
            } catch (err) {
                console.error('[Admin Logout] Error:', err);
            }
        });
    }

    // Forgot Password Modal
    if (forgotLink && forgotModal) {
        forgotLink.addEventListener('click', () => {
            resetEmailInput.value = loginEmailInput.value.trim();
            forgotModal.classList.add('active');
        });
    }

    const closeForgot = () => forgotModal.classList.remove('active');
    if (closeForgotBtn) closeForgotBtn.addEventListener('click', closeForgot);
    if (cancelForgotBtn) cancelForgotBtn.addEventListener('click', closeForgot);

    if (sendResetBtn && resetEmailInput) {
        sendResetBtn.addEventListener('click', async () => {
            const email = resetEmailInput.value.trim();
            if (!email) {
                showToast('Please enter your email address.', 'error');
                return;
            }

            sendResetBtn.disabled = true;
            sendResetBtn.textContent = 'Sending...';

            try {
                const client = window.supabaseManager.client;
                const { error } = await client.auth.resetPasswordForEmail(email);
                if (error) {
                    showToast(error.message, 'error');
                } else {
                    showToast('Password reset link sent to your email!', 'success');
                    closeForgot();
                }
            } catch (err) {
                showToast('Failed to send reset link.', 'error');
            } finally {
                sendResetBtn.disabled = false;
                sendResetBtn.textContent = 'Send Reset Link';
            }
        });
    }

    function showLoginAlert(msg) {
        if (!loginAlert) return;
        loginAlert.textContent = msg;
        loginAlert.style.display = 'block';
    }

    function clearLoginAlert() {
        if (!loginAlert) return;
        loginAlert.style.display = 'none';
        loginAlert.textContent = '';
    }

    function getFriendlyAuthErrorMessage(rawMsg) {
        if (!rawMsg) return 'Invalid credentials.';
        const lower = rawMsg.toLowerCase();
        if (lower.includes('invalid login credentials')) {
            return 'Incorrect email or password. Please verify your credentials and try again.';
        }
        if (lower.includes('email not confirmed')) {
            return 'This administrator email has not been confirmed yet. Please check your inbox or confirm in Supabase.';
        }
        return rawMsg;
    }

    // --- 2. DATA RETRIEVAL (DCC, LC, LCC) ---
    async function loadAllSubmissions() {
        if (!state.session) return;
        const client = window.supabaseManager.client;

        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = `Refreshing... ⏳`;
        }

        try {
            // 1. Fetch DCC Submissions
            const dccRes = await client
                .from('dcc_submissions')
                .select('*')
                .order('submitted_at', { ascending: false });

            state.data.dcc = dccRes.data || [];

            // 2. Fetch LC Submissions
            const lcRes = await client
                .from('lc_submissions')
                .select('*')
                .order('submitted_at', { ascending: false });

            state.data.lc = lcRes.data || [];

            // 3. Fetch LCC Submissions
            const lccRes = await client
                .from('lcc_submissions')
                .select('*')
                .order('submitted_at', { ascending: false });

            state.data.lcc = lccRes.data || [];

            // Update UI metrics & tables
            updateDashboardMetrics();
            renderRecentActivity();
            renderDCCTable();
            renderLCTable();
            renderLCCTable();

            if (lastUpdatedText) {
                lastUpdatedText.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }
        } catch (err) {
            console.error('[Admin] Error loading submissions:', err);
            showToast('Unable to load some responses. Check database tables and RLS permissions.', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg> Refresh Data`;
            }
        }
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadAllSubmissions);
    }

    // Update Overview Metrics
    function updateDashboardMetrics() {
        const dccCount = state.data.dcc.length;
        const lcCount = state.data.lc.length;
        const lccCount = state.data.lcc.length;
        const totalCount = dccCount + lcCount + lccCount;

        // Top summary metrics
        setElText('stat-total-submissions', totalCount);
        setElText('stat-dcc-count', dccCount);
        setElText('stat-lc-count', lcCount);
        setElText('stat-lcc-count', lccCount);

        // Tab badge pills
        setElText('tab-badge-dcc', dccCount);
        setElText('tab-badge-lc', lcCount);
        setElText('tab-badge-lcc', lccCount);

        // Hub Cards
        setElText('hub-dcc-count', dccCount);
        setElText('hub-lc-count', lcCount);
        setElText('hub-lcc-count', lccCount);

        setElText('hub-dcc-last-date', dccCount > 0 ? formatDate(state.data.dcc[0].submitted_at) : 'None yet');
        setElText('hub-lc-last-date', lcCount > 0 ? formatDate(state.data.lc[0].submitted_at) : 'None yet');
        setElText('hub-lcc-last-date', lccCount > 0 ? formatDate(state.data.lcc[0].submitted_at) : 'None yet');
    }

    function setElText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // Render Recent Activity Feed
    function renderRecentActivity() {
        const listEl = document.getElementById('recent-activity-list');
        if (!listEl) return;

        // Merge all submissions and sort by submitted_at DESC
        const allItems = [
            ...state.data.dcc.map(item => ({ ...item, _portal: 'DCC', _title: `${item.respondent_name || 'Respondent'} (${item.respondent_office || 'DCC'})` })),
            ...state.data.lc.map(item => ({ ...item, _portal: 'LC', _title: `${item.church_name} (${item.lcc_name || 'Council'})` })),
            ...state.data.lcc.map(item => ({ ...item, _portal: 'LCC', _title: `${item.lcc_council_name || 'Council'} Questionnaire` }))
        ].sort((a, b) => new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0));

        if (allItems.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state-box">
                    <div class="empty-icon">📥</div>
                    <h4>No submissions yet</h4>
                    <p>As respondents submit questionnaires, their entries will immediately show up here.</p>
                </div>
            `;
            return;
        }

        const recent5 = allItems.slice(0, 5);
        listEl.innerHTML = recent5.map(item => {
            let badgeClass = 'badge-dcc';
            if (item._portal === 'LC') badgeClass = 'badge-lc';
            if (item._portal === 'LCC') badgeClass = 'badge-lcc';

            return `
                <div class="recent-item-row">
                    <div class="recent-item-left">
                        <span class="recent-type-badge ${badgeClass}">${item._portal}</span>
                        <div class="recent-title-group">
                            <span class="recent-title">${escapeHtml(item._title)}</span>
                            <span class="recent-meta">${formatDate(item.submitted_at)}</span>
                        </div>
                    </div>
                    <div class="recent-item-right">
                        <span class="recent-time">${timeAgo(item.submitted_at)}</span>
                        <button class="btn btn-sm btn-outline" onclick="window.adminManager.openDetail('${item._portal.toLowerCase()}', '${item.id}')">
                            View &rarr;
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- 3. QUESTIONNAIRE TABLES (DCC, LC, LCC) ---

    // DCC Table Rendering
    function renderDCCTable() {
        if (!dccTableBody) return;
        const filter = state.filters.dcc;
        let items = [...state.data.dcc];

        // Search Filter
        if (filter.search) {
            const q = filter.search.toLowerCase();
            items = items.filter(r =>
                (r.respondent_name && r.respondent_name.toLowerCase().includes(q)) ||
                (r.respondent_office && r.respondent_office.toLowerCase().includes(q)) ||
                (r.respondent_phone && r.respondent_phone.toLowerCase().includes(q))
            );
        }

        // Sort
        items.sort((a, b) => {
            const tA = new Date(a.submitted_at || 0);
            const tB = new Date(b.submitted_at || 0);
            return filter.sort === 'newest' ? tB - tA : tA - tB;
        });

        // Pagination
        const total = items.length;
        const start = (filter.page - 1) * filter.limit;
        const paginated = items.slice(start, start + filter.limit);

        if (total === 0) {
            dccTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="empty-state-box">
                            <div class="empty-icon">📋</div>
                            <h4>No DCC responses found</h4>
                            <p>${filter.search ? 'No responses match your search. Try clearing your filters.' : 'No DCC assessments have been submitted yet.'}</p>
                        </div>
                    </td>
                </tr>
            `;
            updatePaginationUI('dcc', 0, 0, 0);
            return;
        }

        dccTableBody.innerHTML = paginated.map((item, idx) => `
            <tr>
                <td><strong>#${start + idx + 1}</strong></td>
                <td><strong>${escapeHtml(item.respondent_name || 'Anonymous')}</strong></td>
                <td>${escapeHtml(item.respondent_office || 'Not Specified')}</td>
                <td>${escapeHtml(item.respondent_phone || '—')}</td>
                <td>${formatDate(item.submitted_at)}</td>
                <td class="text-right">
                    <button class="btn btn-sm btn-primary" onclick="window.adminManager.openDetail('dcc', '${item.id}')">
                        View Full Submission
                    </button>
                </td>
            </tr>
        `).join('');

        updatePaginationUI('dcc', total, start + 1, Math.min(start + filter.limit, total));
    }

    // LC Table Rendering
    function renderLCTable() {
        if (!lcTableBody) return;
        const filter = state.filters.lc;
        let items = [...state.data.lc];

        // Search Filter
        if (filter.search) {
            const q = filter.search.toLowerCase();
            items = items.filter(r =>
                (r.church_name && r.church_name.toLowerCase().includes(q)) ||
                (r.lcc_name && r.lcc_name.toLowerCase().includes(q)) ||
                (r.pastor_name && r.pastor_name.toLowerCase().includes(q))
            );
        }

        // LCC Council Dropdown Filter
        if (filter.lcc) {
            items = items.filter(r => r.lcc_name && r.lcc_name.toLowerCase() === filter.lcc.toLowerCase());
        }

        // Sort
        items.sort((a, b) => {
            const tA = new Date(a.submitted_at || 0);
            const tB = new Date(b.submitted_at || 0);
            return filter.sort === 'newest' ? tB - tA : tA - tB;
        });

        // Pagination
        const total = items.length;
        const start = (filter.page - 1) * filter.limit;
        const paginated = items.slice(start, start + filter.limit);

        if (total === 0) {
            lcTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="empty-state-box">
                            <div class="empty-icon">⛪</div>
                            <h4>No Local Church responses found</h4>
                            <p>${filter.search || filter.lcc ? 'No responses match your filters. Try clearing your filters.' : 'No local church questionnaires have been submitted yet.'}</p>
                        </div>
                    </td>
                </tr>
            `;
            updatePaginationUI('lc', 0, 0, 0);
            return;
        }

        lcTableBody.innerHTML = paginated.map((item, idx) => `
            <tr>
                <td><strong>#${start + idx + 1}</strong></td>
                <td><strong>${escapeHtml(item.church_name || 'Unknown Church')}</strong></td>
                <td><span class="tab-pill">${escapeHtml(item.lcc_name || '—')}</span></td>
                <td>${escapeHtml(item.pastor_name || '—')}</td>
                <td>${escapeHtml(item.state || '—')}</td>
                <td>${formatDate(item.submitted_at)}</td>
                <td class="text-right">
                    <button class="btn btn-sm btn-primary" onclick="window.adminManager.openDetail('lc', '${item.id}')">
                        View Full Submission
                    </button>
                </td>
            </tr>
        `).join('');

        updatePaginationUI('lc', total, start + 1, Math.min(start + filter.limit, total));
    }

    // LCC Table Rendering
    function renderLCCTable() {
        if (!lccTableBody) return;
        const filter = state.filters.lcc;
        let items = [...state.data.lcc];

        // Search Filter
        if (filter.search) {
            const q = filter.search.toLowerCase();
            items = items.filter(r =>
                r.lcc_council_name && r.lcc_council_name.toLowerCase().includes(q)
            );
        }

        // Sort
        items.sort((a, b) => {
            const tA = new Date(a.submitted_at || 0);
            const tB = new Date(b.submitted_at || 0);
            return filter.sort === 'newest' ? tB - tA : tA - tB;
        });

        // Pagination
        const total = items.length;
        const start = (filter.page - 1) * filter.limit;
        const paginated = items.slice(start, start + filter.limit);

        if (total === 0) {
            lccTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="empty-state-box">
                            <div class="empty-icon">👥</div>
                            <h4>No LCC Council responses found</h4>
                            <p>${filter.search ? 'No councils match your search.' : 'No LCC questionnaires have been submitted yet.'}</p>
                        </div>
                    </td>
                </tr>
            `;
            updatePaginationUI('lcc', 0, 0, 0);
            return;
        }

        lccTableBody.innerHTML = paginated.map((item, idx) => {
            const payload = item.payload || {};
            const reportedCount = payload.lcc_q_num_churches || '—';
            return `
                <tr>
                    <td><strong>#${start + idx + 1}</strong></td>
                    <td><strong>${escapeHtml(item.lcc_council_name || 'Unknown LCC')}</strong></td>
                    <td>${escapeHtml(item.constituted_year || payload.lcc_q_constituted_year || '—')}</td>
                    <td>${escapeHtml(reportedCount)}</td>
                    <td>${formatDate(item.submitted_at)}</td>
                    <td class="text-right">
                        <button class="btn btn-sm btn-primary" onclick="window.adminManager.openDetail('lcc', '${item.id}')">
                            View Full Submission
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        updatePaginationUI('lcc', total, start + 1, Math.min(start + filter.limit, total));
    }

    function updatePaginationUI(portal, total, from, to) {
        const infoEl = document.getElementById(`${portal}-pagination-info`);
        const prevBtn = document.getElementById(`${portal}-prev-btn`);
        const nextBtn = document.getElementById(`${portal}-next-btn`);

        if (infoEl) infoEl.textContent = total > 0 ? `Showing ${from}–${to} of ${total} responses` : `0 responses`;
        if (prevBtn) prevBtn.disabled = state.filters[portal].page <= 1;
        if (nextBtn) nextBtn.disabled = to >= total;
    }

    // Filter event listeners
    setupFilterEvents('dcc', renderDCCTable);
    setupFilterEvents('lc', renderLCTable);
    setupFilterEvents('lcc', renderLCCTable);

    function setupFilterEvents(portal, renderFn) {
        const searchInput = document.getElementById(`${portal}-search-input`);
        const sortSelect = document.getElementById(`${portal}-sort-select`);
        const prevBtn = document.getElementById(`${portal}-prev-btn`);
        const nextBtn = document.getElementById(`${portal}-next-btn`);
        const lccSelect = document.getElementById('lc-filter-lcc');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                state.filters[portal].search = e.target.value.trim();
                state.filters[portal].page = 1;
                renderFn();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                state.filters[portal].sort = e.target.value;
                state.filters[portal].page = 1;
                renderFn();
            });
        }

        if (portal === 'lc' && lccSelect) {
            lccSelect.addEventListener('change', (e) => {
                state.filters.lc.lcc = e.target.value;
                state.filters.lc.page = 1;
                renderFn();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (state.filters[portal].page > 1) {
                    state.filters[portal].page--;
                    renderFn();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                state.filters[portal].page++;
                renderFn();
            });
        }
    }

    // --- 4. INDIVIDUAL RESPONSE VIEWER & PRINTABLE REPORT ---
    function openSubmissionDetail(portal, id) {
        const item = state.data[portal].find(r => r.id === id);
        if (!item) {
            showToast('Unable to find this submission.', 'error');
            return;
        }

        state.selectedSubmission = { portal, item };
        const payload = item.payload || {};

        // Configure Title & Badge
        if (portal === 'dcc') {
            detailBadge.className = 'church-badge badge-rose';
            detailBadge.textContent = 'DCC Strategic Assessment';
            detailTitle.textContent = `${item.respondent_name || 'Executive'} — ${item.respondent_office || 'DCC Officer'}`;
        } else if (portal === 'lc') {
            detailBadge.className = 'church-badge';
            detailBadge.textContent = 'Local Church Questionnaire';
            detailTitle.textContent = `${item.church_name} (${item.lcc_name || 'LCC'})`;
        } else {
            detailBadge.className = 'church-badge badge-amber';
            detailBadge.textContent = 'LCC Council Questionnaire';
            detailTitle.textContent = `${item.lcc_council_name} Council Assessment`;
        }

        // Summary Card
        detailSummaryCard.innerHTML = `
            <div class="summary-data-item">
                <span class="label">Reference ID</span>
                <span class="value" style="font-size:0.85rem; font-family:monospace;">${item.id}</span>
            </div>
            <div class="summary-data-item">
                <span class="label">Submitted At</span>
                <span class="value">${formatDate(item.submitted_at)}</span>
            </div>
            <div class="summary-data-item">
                <span class="label">Respondent / Church</span>
                <span class="value">${escapeHtml(item.respondent_name || item.church_name || item.lcc_council_name || '—')}</span>
            </div>
            <div class="summary-data-item">
                <span class="label">Office / Council</span>
                <span class="value">${escapeHtml(item.respondent_office || item.lcc_name || '—')}</span>
            </div>
            ${item.contact_phone || item.respondent_phone ? `
            <div class="summary-data-item">
                <span class="label">Contact Phone</span>
                <span class="value">${escapeHtml(item.contact_phone || item.respondent_phone)}</span>
            </div>` : ''}
            ${item.contact_email || item.respondent_email ? `
            <div class="summary-data-item">
                <span class="label">Contact Email</span>
                <span class="value">${escapeHtml(item.contact_email || item.respondent_email)}</span>
            </div>` : ''}
        `;

        // Render Grouped Questions & Answers
        detailSectionsContainer.innerHTML = renderFormattedSections(portal, payload, item);
        detailModal.classList.add('active');
    }

    const closeDetail = () => detailModal.classList.remove('active');
    if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeDetail);
    if (dismissDetailBtn) dismissDetailBtn.addEventListener('click', closeDetail);

    // Human-friendly Q&A Section Renderer
    function renderFormattedSections(portal, payload, item) {
        const keys = Object.keys(payload);
        if (keys.length === 0) {
            return `<div class="empty-state-box"><h4>No detailed payload found</h4></div>`;
        }

        // Group keys logically
        const sectionsMap = buildSectionsMap(portal, payload, item);

        return sectionsMap.map(sec => `
            <div class="detail-section-block">
                <div class="detail-section-title">${escapeHtml(sec.title)}</div>
                <div class="detail-qa-list">
                    ${sec.items.map(qa => `
                        <div class="detail-qa-item">
                            <span class="detail-question-text">${escapeHtml(qa.label)}</span>
                            <div class="detail-answer-box ${qa.highlight ? 'answer-highlight' : ''}">${formatAnswerValue(qa.value)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    function buildSectionsMap(portal, payload, item) {
        const sections = [];

        if (portal === 'dcc') {
            // Section 1: Respondent info
            sections.push({
                title: 'Respondent Information',
                items: [
                    { label: 'Name of respondent', value: payload.dcc_respondent_name || item.respondent_name },
                    { label: 'Position / office', value: payload.dcc_respondent_office || item.respondent_office },
                    { label: 'Phone number', value: payload.dcc_respondent_phone || item.respondent_phone },
                    { label: 'Email address', value: payload.dcc_respondent_email || item.respondent_email },
                    { label: 'Source of information', value: payload.dcc_info_source, highlight: true },
                    { label: 'Source of information (other details)', value: payload.dcc_info_source_other },
                    { label: 'Name of LC and LCC', value: payload.dcc_name_lc_lcc }
                ].filter(i => i.value !== undefined && i.value !== '')
            });

            // Auto-gather remaining DCC keys into organized blocks
            const gathered = gatherRemainingKeys(payload, [
                'dcc_respondent_name', 'dcc_respondent_office', 'dcc_respondent_phone',
                'dcc_respondent_email', 'dcc_info_source', 'dcc_info_source_other', 'dcc_name_lc_lcc',
                'form_type', 'submitted_at'
            ]);

            if (gathered.length > 0) {
                sections.push({
                    title: 'Strategic Assessment Questions & Responses',
                    items: gathered
                });
            }
        } else if (portal === 'lc') {
            sections.push({
                title: 'General Information & Registration',
                items: [
                    { label: 'Church Name', value: item.church_name, highlight: true },
                    { label: 'Parent LCC Council', value: item.lcc_name },
                    { label: 'Resident Pastor', value: payload.q_current_pastor || item.pastor_name },
                    { label: 'Year Founded', value: payload.q_founded_year },
                    { label: 'Year Constituted', value: payload.q_constituted_year },
                    { label: 'Mother Church', value: payload.q_mother_church },
                    { label: 'Church Full Address', value: payload.q_full_address },
                    { label: 'Community & LGA', value: payload.q_community_lga },
                    { label: 'State', value: payload.q_state }
                ].filter(i => i.value !== undefined && i.value !== '')
            });

            const gathered = gatherRemainingKeys(payload, [
                'church_name', 'lcc_name', 'church_id', 'q_current_pastor',
                'q_founded_year', 'q_constituted_year', 'q_mother_church',
                'q_full_address', 'q_community_lga', 'q_state', 'submitted_at'
            ]);

            if (gathered.length > 0) {
                sections.push({
                    title: 'Detailed Questionnaire Answers',
                    items: gathered
                });
            }
        } else {
            // LCC
            sections.push({
                title: 'Council Information',
                items: [
                    { label: 'LCC Council Name', value: item.lcc_council_name, highlight: true },
                    { label: 'Year Constituted', value: payload.lcc_q_constituted_year || item.constituted_year },
                    { label: 'Reported Number of Churches', value: payload.lcc_q_num_churches }
                ].filter(i => i.value !== undefined && i.value !== '')
            });

            const gathered = gatherRemainingKeys(payload, [
                'lcc_council', 'lcc_council_name', 'lcc_council_id', 'lcc_q_constituted_year',
                'submitted_at', 'form_type'
            ]);

            if (gathered.length > 0) {
                sections.push({
                    title: 'Council Strategy & Profile Responses',
                    items: gathered
                });
            }
        }

        return sections;
    }

    function gatherRemainingKeys(payload, excludeKeys) {
        return Object.keys(payload)
            .filter(k => !excludeKeys.includes(k) && payload[k] !== undefined && payload[k] !== '')
            .map(k => ({
                label: humanizeKey(k),
                value: payload[k]
            }));
    }

    function humanizeKey(key) {
        return key
            .replace(/^dcc_sec[A-Z]_/i, '')
            .replace(/^dcc_/i, '')
            .replace(/^lcc_q_/i, '')
            .replace(/^q_/i, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    function formatAnswerValue(val) {
        if (val === null || val === undefined || val === '') return '—';
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        if (typeof val === 'object') {
            try {
                return JSON.stringify(val, null, 2);
            } catch (e) {
                return String(val);
            }
        }
        return escapeHtml(String(val));
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- 5. CSV EXPORT ENGINE ---
    function exportPortalCSV(portal) {
        const items = state.data[portal];
        if (!items || items.length === 0) {
            showToast('No responses available to export.', 'info');
            return;
        }

        showToast('Preparing CSV report...', 'info');

        try {
            // Collect all unique payload keys
            const allPayloadKeys = new Set();
            items.forEach(item => {
                const p = item.payload || {};
                Object.keys(p).forEach(k => allPayloadKeys.add(k));
            });
            const payloadKeyList = Array.from(allPayloadKeys);

            // Construct Headers
            const headers = ['Reference ID', 'Submission Date'];
            if (portal === 'dcc') {
                headers.push('Respondent Name', 'Position / Office', 'Phone Number', 'Email', 'Source of Info', 'LC / LCC Name');
            } else if (portal === 'lc') {
                headers.push('Church ID', 'Church Name', 'LCC Council', 'Resident Pastor', 'State', 'Community / LGA', 'Phone', 'Email');
            } else {
                headers.push('LCC Council ID', 'LCC Council Name', 'Constituted Year');
            }

            // Append humanized question headers
            payloadKeyList.forEach(k => headers.push(humanizeKey(k)));

            // Construct Rows
            const rows = items.map(item => {
                const p = item.payload || {};
                const row = [item.id, formatDate(item.submitted_at)];

                if (portal === 'dcc') {
                    row.push(
                        item.respondent_name || '',
                        item.respondent_office || '',
                        item.respondent_phone || '',
                        item.respondent_email || '',
                        item.info_source || '',
                        item.lc_lcc_name || ''
                    );
                } else if (portal === 'lc') {
                    row.push(
                        item.church_id || '',
                        item.church_name || '',
                        item.lcc_name || '',
                        item.pastor_name || '',
                        item.state || '',
                        item.community_lga || '',
                        item.contact_phone || '',
                        item.contact_email || ''
                    );
                } else {
                    row.push(
                        item.lcc_council_id || '',
                        item.lcc_council_name || '',
                        item.constituted_year || ''
                    );
                }

                // Append payload values
                payloadKeyList.forEach(k => {
                    const val = p[k];
                    if (val === undefined || val === null) {
                        row.push('');
                    } else if (typeof val === 'object') {
                        row.push(JSON.stringify(val));
                    } else {
                        row.push(String(val));
                    }
                });

                return row;
            });

            // Convert to CSV text
            const csvContent = [headers, ...rows]
                .map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
                .join('\r\n');

            // Download Trigger
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const dateStr = new Date().toISOString().split('T')[0];
            a.href = url;
            a.download = `ECWA_${portal.toUpperCase()}_Responses_${dateStr}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('Report downloaded successfully!', 'success');
        } catch (err) {
            console.error('[CSV Export] Error:', err);
            showToast('Failed to export CSV report.', 'error');
        }
    }

    // --- 6. TAB SWITCHING ---
    function switchTab(targetTab) {
        state.activeTab = targetTab;

        dashTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === targetTab);
        });

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        const activePane = document.getElementById(`tab-content-${targetTab}`);
        if (activePane) activePane.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    dashTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    function clearFilters(portal) {
        state.filters[portal].search = '';
        state.filters[portal].page = 1;
        if (portal === 'lc') state.filters.lc.lcc = '';

        const searchInput = document.getElementById(`${portal}-search-input`);
        const lccSelect = document.getElementById('lc-filter-lcc');
        if (searchInput) searchInput.value = '';
        if (lccSelect) lccSelect.value = '';

        if (portal === 'dcc') renderDCCTable();
        if (portal === 'lc') renderLCTable();
        if (portal === 'lcc') renderLCCTable();

        showToast('Filters cleared.', 'info');
    }

    // --- Expose Public API for Inline Handlers ---
    window.adminManager = {
        switchTab,
        openDetail: openSubmissionDetail,
        exportCSV: exportPortalCSV,
        clearFilters,
        refresh: loadAllSubmissions
    };

    // --- Start Auth Check ---
    initAuth();
});

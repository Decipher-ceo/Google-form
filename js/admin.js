/**
 * Administrator Response Management Portal Controller (js/admin.js)
 * ECWA Umuahia DCC Strategic Planning & Research Hub
 * 
 * Features:
 * - Supabase Authentication (Login, Session persistence, Logout, Password reset)
 * - Live Dashboard Overview with accurate counts, visual analytics, and recent activity
 * - Searchable, sortable, paginated tables for DCC, LC, and LCC submissions
 * - Individual Full-Response Inspector preserving original sections, question labels, and unanswered states
 * - Print-to-PDF and structured text download for individual submissions
 * - Filter-aware CSV Report Exporters for all 3 questionnaires
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
            const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
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
                const { data, error } = await client.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    showLoginAlert(formatAuthError(error.message));
                } else {
                    showToast('Welcome back! Signed in successfully.', 'success');
                    handleSessionChange(data.session);
                }
            } catch (err) {
                console.error('[Admin Login] Exception:', err);
                showLoginAlert('Connection failed. Please check your internet connection.');
            } finally {
                loginSubmitBtn.disabled = false;
                loginSubmitBtn.innerHTML = `
                    Sign In to Dashboard
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                `;
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
            forgotModal.style.display = 'flex';
        });
    }

    const closeForgot = () => {
        forgotModal.classList.remove('active');
        forgotModal.style.display = 'none';
    };
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
        loginAlert.textContent = '';
        loginAlert.style.display = 'none';
    }

    function formatAuthError(rawMsg) {
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

            // Update UI metrics, visual charts & tables
            updateDashboardMetrics();
            renderVisualAnalytics();
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

    // Render Data Visualizations
    function renderVisualAnalytics() {
        const lccContainer = document.getElementById('lcc-progress-list');
        const targetContainer = document.getElementById('target-progress-list');

        const allLCCs = [
            'Bende LCC', 'Ibeku LCC', 'Item LCC', 'Etiti LCC', 
            'Mbano LCC', 'Ohafia LCC', 'Ohuhu LCC', 'Olokoro LCC', 'Owerri LCC'
        ];

        // 1. Calculate LC responses per LCC
        if (lccContainer) {
            const lcCountsByLcc = {};
            allLCCs.forEach(c => lcCountsByLcc[c] = 0);

            state.data.lc.forEach(r => {
                if (r.lcc_name) {
                    const match = allLCCs.find(c => c.toLowerCase() === r.lcc_name.toLowerCase()) || r.lcc_name;
                    lcCountsByLcc[match] = (lcCountsByLcc[match] || 0) + 1;
                }
            });

            const maxCount = Math.max(1, ...Object.values(lcCountsByLcc));

            lccContainer.innerHTML = allLCCs.map(lcc => {
                const count = lcCountsByLcc[lcc] || 0;
                const pct = Math.min(100, Math.round((count / Math.max(maxCount, 8)) * 100));
                return `
                    <div class="chart-bar-row">
                        <div class="chart-bar-meta">
                            <span class="chart-bar-label">${escapeHtml(lcc)}</span>
                            <span class="chart-bar-count">${count} church${count === 1 ? '' : 'es'}</span>
                        </div>
                        <div class="chart-bar-track">
                            <div class="chart-bar-fill fill-emerald" style="width: ${Math.max(count > 0 ? 6 : 0, pct)}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 2. Target Progress & Distribution
        if (targetContainer) {
            const dccCount = state.data.dcc.length;
            const lcCount = state.data.lc.length;
            const lccCount = state.data.lcc.length;

            const targets = [
                { label: 'Local Churches (Target: 66)', current: lcCount, target: 66, fillClass: 'fill-emerald' },
                { label: 'LCC Councils (Target: 9)', current: lccCount, target: 9, fillClass: 'fill-amber' },
                { label: 'DCC Strategic Assessment (Target: 1)', current: dccCount, target: 1, fillClass: 'fill-rose' }
            ];

            targetContainer.innerHTML = targets.map(t => {
                const pct = Math.min(100, Math.round((t.current / t.target) * 100));
                return `
                    <div class="chart-bar-row">
                        <div class="chart-bar-meta">
                            <span class="chart-bar-label">${t.label}</span>
                            <span class="chart-bar-count">${t.current} / ${t.target} (${pct}%)</span>
                        </div>
                        <div class="chart-bar-track">
                            <div class="chart-bar-fill ${t.fillClass}" style="width: ${Math.max(t.current > 0 ? 5 : 0, pct)}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
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

    // --- 3. FILTER & SEARCH ENGINE ---
    function getFilteredItems(portal) {
        const filter = state.filters[portal];
        let items = [...(state.data[portal] || [])];

        if (portal === 'dcc' && filter.search) {
            const q = filter.search.toLowerCase();
            items = items.filter(r =>
                (r.respondent_name && r.respondent_name.toLowerCase().includes(q)) ||
                (r.respondent_office && r.respondent_office.toLowerCase().includes(q)) ||
                (r.respondent_phone && r.respondent_phone.toLowerCase().includes(q)) ||
                (r.respondent_email && r.respondent_email.toLowerCase().includes(q))
            );
        } else if (portal === 'lc') {
            if (filter.search) {
                const q = filter.search.toLowerCase();
                items = items.filter(r =>
                    (r.church_name && r.church_name.toLowerCase().includes(q)) ||
                    (r.lcc_name && r.lcc_name.toLowerCase().includes(q)) ||
                    (r.pastor_name && r.pastor_name.toLowerCase().includes(q)) ||
                    (r.state && r.state.toLowerCase().includes(q)) ||
                    (r.community_lga && r.community_lga.toLowerCase().includes(q))
                );
            }
            if (filter.lcc) {
                items = items.filter(r => r.lcc_name && r.lcc_name.toLowerCase() === filter.lcc.toLowerCase());
            }
        } else if (portal === 'lcc' && filter.search) {
            const q = filter.search.toLowerCase();
            items = items.filter(r =>
                (r.lcc_council_name && r.lcc_council_name.toLowerCase().includes(q)) ||
                (r.constituted_year && r.constituted_year.toLowerCase().includes(q))
            );
        }

        // Sort
        items.sort((a, b) => {
            const tA = new Date(a.submitted_at || 0);
            const tB = new Date(b.submitted_at || 0);
            return filter.sort === 'newest' ? tB - tA : tA - tB;
        });

        return items;
    }

    // DCC Table Rendering
    function renderDCCTable() {
        if (!dccTableBody) return;
        const filter = state.filters.dcc;
        const items = getFilteredItems('dcc');

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
        const items = getFilteredItems('lc');

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
        const items = getFilteredItems('lcc');

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

    // --- 4. INDIVIDUAL RESPONSE VIEWER & REPORT GENERATOR ---
    async function openSubmissionDetail(portal, id) {
        let item = state.data[portal].find(r => r.id === id);

        // Fallback: If not in memory or payload missing, query Supabase directly
        if (!item || !item.payload || Object.keys(item.payload).length === 0) {
            try {
                const tableName = portal === 'dcc' ? 'dcc_submissions' : (portal === 'lc' ? 'lc_submissions' : 'lcc_submissions');
                const client = window.supabaseManager && window.supabaseManager.client;
                if (client) {
                    const { data, error } = await client.from(tableName).select('*').eq('id', id).single();
                    if (!error && data) {
                        item = data;
                    }
                }
            } catch (err) {
                console.warn('[Admin] Single record fetch exception:', err);
            }
        }

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

        // Display Modal
        detailModal.classList.add('active');
        detailModal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }

    const closeDetail = () => {
        detailModal.classList.remove('active');
        detailModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    };

    if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeDetail);
    if (dismissDetailBtn) dismissDetailBtn.addEventListener('click', closeDetail);

    // Human-friendly Q&A Section Renderer
    function renderFormattedSections(portal, payload, item) {
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
        const schema = window.FORM_SCHEMAS && window.FORM_SCHEMAS[portal];
        if (!schema || schema.length === 0) {
            return fallbackSectionsMap(portal, payload, item);
        }

        const coveredKeys = new Set();
        const sections = [];

        schema.forEach(sec => {
            const items = [];
            sec.questions.forEach(q => {
                coveredKeys.add(q.name);
                const rawVal = payload[q.name] !== undefined ? payload[q.name] : item[q.name];
                items.push({
                    label: q.label,
                    value: rawVal
                });
            });

            sections.push({
                title: sec.title,
                items: items
            });
        });

        // Append any extra keys submitted in payload
        const excludeKeys = ['church_id', 'lcc_id', 'form_type', 'submitted_at', 'id', 'created_at', 'payload'];
        const extraItems = [];
        Object.keys(payload).forEach(k => {
            if (!coveredKeys.has(k) && !excludeKeys.includes(k) && payload[k] !== undefined && payload[k] !== '') {
                extraItems.push({
                    label: humanizeKey(k),
                    value: payload[k]
                });
            }
        });

        if (extraItems.length > 0) {
            sections.push({
                title: 'Additional Recorded Details',
                items: extraItems
            });
        }

        return sections;
    }

    function fallbackSectionsMap(portal, payload, item) {
        const sections = [];
        const gathered = gatherRemainingKeys(payload, ['church_id', 'lcc_id', 'form_type', 'submitted_at']);
        sections.push({
            title: `${portal.toUpperCase()} Questionnaire Responses`,
            items: gathered
        });
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
            .replace(/^dcc_sec[A-Z0-9]_/i, '')
            .replace(/^dcc_/i, '')
            .replace(/^lcc_q_/i, '')
            .replace(/^q_/i, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    function formatAnswerValue(val) {
        if (val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
            return '<span class="unanswered">Not answered</span>';
        }
        if (typeof val === 'boolean') {
            return val ? '<span class="badge-pill badge-success">Yes</span>' : '<span class="badge-pill">No</span>';
        }
        if (Array.isArray(val)) {
            return `<ul class="answer-list" style="margin:0; padding-left:20px;">${val.map(v => `<li>${escapeHtml(String(v))}</li>`).join('')}</ul>`;
        }
        if (typeof val === 'object') {
            try {
                return `<pre style="margin:0; font-family:monospace; font-size:0.85rem;">${escapeHtml(JSON.stringify(val, null, 2))}</pre>`;
            } catch (e) {
                return escapeHtml(String(val));
            }
        }
        return escapeHtml(String(val)).replace(/\n/g, '<br>');
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

    // --- 5. REPORT DOWNLOAD ENGINE ---
    function downloadCurrentSubmission() {
        if (!state.selectedSubmission || !state.selectedSubmission.item) {
            showToast('No submission is currently open.', 'error');
            return;
        }

        const { portal, item } = state.selectedSubmission;
        const payload = item.payload || {};
        const sections = buildSectionsMap(portal, payload, item);

        let reportText = `================================================================================\n`;
        reportText += `ECWA UMUAHIA DISTRICT CHURCH COUNCIL — STRATEGIC PLANNING & RESEARCH UNIT\n`;
        reportText += `OFFICIAL QUESTIONNAIRE SUBMISSION RECORD\n`;
        reportText += `================================================================================\n\n`;

        reportText += `Questionnaire Type : ${portal.toUpperCase()} Questionnaire\n`;
        reportText += `Reference ID       : ${item.id}\n`;
        reportText += `Submission Date    : ${formatDate(item.submitted_at)}\n`;
        reportText += `Respondent / Church: ${item.respondent_name || item.church_name || item.lcc_council_name || 'N/A'}\n`;
        reportText += `Office / Council   : ${item.respondent_office || item.lcc_name || 'N/A'}\n`;
        if (item.contact_phone || item.respondent_phone) {
            reportText += `Contact Phone      : ${item.contact_phone || item.respondent_phone}\n`;
        }
        if (item.contact_email || item.respondent_email) {
            reportText += `Contact Email      : ${item.contact_email || item.respondent_email}\n`;
        }
        reportText += `\n--------------------------------------------------------------------------------\n`;
        reportText += `DETAILED RESPONSES GROUPED BY SECTION\n`;
        reportText += `--------------------------------------------------------------------------------\n\n`;

        sections.forEach((sec) => {
            reportText += `[${sec.title}]\n`;
            sec.items.forEach(qa => {
                const answerStr = (qa.value !== null && qa.value !== undefined && qa.value !== '') ? String(qa.value) : 'Not answered';
                reportText += `  Q: ${qa.label}\n`;
                reportText += `  A: ${answerStr}\n\n`;
            });
            reportText += `\n`;
        });

        reportText += `================================================================================\n`;
        reportText += `End of Submission Record — Generated from Supabase Single Source of Truth\n`;
        reportText += `================================================================================\n`;

        const safeName = (item.church_name || item.respondent_name || item.lcc_council_name || 'record').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `${portal.toUpperCase()}_Submission_${safeName}_${new Date(item.submitted_at || Date.now()).toISOString().slice(0, 10)}.txt`;

        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Submission downloaded successfully!', 'success');
    }

    // --- 6. CSV EXPORT ENGINE ---
    function exportPortalCSV(portal) {
        const items = getFilteredItems(portal);
        if (!items || items.length === 0) {
            showToast('No responses available to export.', 'info');
            return;
        }

        showToast(`Exporting ${items.length} ${portal.toUpperCase()} response(s)...`, 'info');

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

            // Append question headers
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

            showToast('CSV Report downloaded successfully!', 'success');
        } catch (err) {
            console.error('[CSV Export] Error:', err);
            showToast('Failed to export CSV report.', 'error');
        }
    }

    // --- 7. TAB SWITCHING ---
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
        downloadCurrentSubmission,
        clearFilters,
        refresh: loadAllSubmissions
    };

    // --- Start Auth Check ---
    initAuth();
});

/**
 * ECWA Umuahia District Church Council - Strategic Planning & Research Data Portal
 * Handles SPA navigation across Hero Portal, 61 Local Churches Directory, 9 LCC Directory, 
 * 61 Local Church Survey, 10-Section LCC Questionnaire, and Full DCC Strategic Questionnaire.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // CHURCH DIRECTORY DATA (61 LOCAL CHURCHES)
    // ==========================================
    const CHURCH_NAMES = [
        "Afara", "Akanu", "Akokwa", "Akpahia", "Aladinma", "Amaeke Ibeku", "Amaeke Item",
        "Amangwu", "Amainyinta", "Amaoba", "Amaokwe", "Amawom Olokoro", "Amakohia Etiti",
        "Apuanu", "Arochukwu", "Asaga", "Awa Oguta", "ECWA Gospel Igbere", "Eziafor",
        "Ikenanzizi", "Irete", "Isieke", "Isiadu", "Isiama", "Itaja Olokoro 1", "Nkpa",
        "Nkporo", "Nkwere", "Nnonuo", "Nzerem", "Obinze", "Ogboko (Ozuitem 3)", "Okaiuga",
        "Okoko", "Okonaku", "Okwe", "Old Umuahia", "Orodo", "Orieamaenyi", "Orji Owerri",
        "Otulu", "Ozuitem 1", "Ozuitem 2", "Township 1", "Township 2", "Ubaha", "Ubakala",
        "Umudike", "Umuduru", "Umuegwu Okpuala", "Umuejere", "Umueze 1", "Umuezeala-Ama Mbano",
        "Umujiriji (Ehume)", "Umuneke", "Umunnuma", "Umuariam", "Unity Church", "Uzuakoli",
        "World Bank Owerri", "World Bank Umuahia"
    ];

    const congregationsList = CHURCH_NAMES.map((name, index) => {
        const id = index + 1;
        const displayName = name.startsWith("ECWA") ? name : `ECWA ${name}`;
        return {
            id: id,
            rawName: name,
            displayName: displayName,
            searchSlug: name.toLowerCase().replace(/[^a-z0-9]/g, '')
        };
    });

    // ==========================================
    // LCC DIRECTORY DATA (9 LOCAL CHURCH COUNCILS)
    // Alphabetical order: Bende, Etiti, Ibeku, Item, Mbano, Ohafia, Ohuhu, Olokoro, Owerri
    // ==========================================
    const LCC_NAMES = [
        "Bende", "Etiti", "Ibeku", "Item", "Mbano", "Ohafia", "Ohuhu", "Olokoro", "Owerri"
    ];

    const lccList = LCC_NAMES.map((name, index) => {
        const id = index + 1;
        return {
            id: id,
            rawName: name,
            displayName: `${name} LCC`,
            searchSlug: name.toLowerCase().replace(/[^a-z0-9]/g, '')
        };
    });

    const GOOGLE_APPS_SCRIPT_CODE = `// ECWA Umuahia DCC Data Collector Webhook Code
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([new Date().toISOString(), JSON.stringify(data)]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    const homeView = document.getElementById('home-view');
    const localChurchDirectoryView = document.getElementById('local-church-directory-view');
    const lccDirectoryView = document.getElementById('lcc-directory-view');
    const surveyView = document.getElementById('survey-view');
    const lccSurveyView = document.getElementById('lcc-survey-view');
    const dccSurveyView = document.getElementById('dcc-survey-view');
    const successView = document.getElementById('success-view');

    // Hero Buttons
    const btnHeroLocalChurch = document.getElementById('btn-hero-local-church');
    const btnHeroLcc = document.getElementById('btn-hero-lcc');
    const btnHeroDcc = document.getElementById('btn-hero-dcc');
    const heroResumeCard = document.getElementById('hero-resume-card');
    const heroResumeBtn = document.getElementById('hero-resume-btn');
    const heroDiscardDraftBtn = document.getElementById('hero-discard-draft-btn');
    const resumeChurchName = document.getElementById('resume-church-name');
    const resumeStepNum = document.getElementById('resume-step-num');
    const resumeTimestamp = document.getElementById('resume-timestamp');

    // 61 Church Directory Elements
    const directoryGrid = document.getElementById('directory-grid');
    const searchInput = document.getElementById('church-search');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const searchResetBtn = document.getElementById('search-reset-btn');
    const noResultsState = document.getElementById('no-results-state');
    const churchCountBadge = document.getElementById('church-count-badge');

    // 9 LCC Directory Elements
    const lccDirectoryGrid = document.getElementById('lcc-directory-grid');
    const lccSearchInput = document.getElementById('lcc-search');
    const lccSearchClearBtn = document.getElementById('lcc-search-clear-btn');

    // Nav Bar Elements
    const navHomeBtn = document.getElementById('nav-home-btn');
    const navBackendBtn = document.getElementById('nav-backend-btn');
    const brandLogoLink = document.getElementById('brand-logo');
    const backHomeBtns = document.querySelectorAll('.btn-back-home');

    // 61 Church Survey UI
    const surveyForm = document.getElementById('survey-form');
    const formChurchIdInput = document.getElementById('form-church-id');
    const selectedChurchBadge = document.getElementById('selected-church-badge');
    const surveyMainTitle = document.getElementById('survey-main-title');
    const exitSurveyBtn = document.getElementById('exit-survey-btn');
    const prevStepBtn = document.getElementById('prev-step-btn');
    const nextStepBtn = document.getElementById('next-step-btn');
    const surveyProgressFill = document.getElementById('survey-progress-fill');
    const stepIndicators = document.querySelectorAll('#survey-view .step-indicator');
    const formSteps = document.querySelectorAll('#survey-view .form-step');

    // LCC Survey UI
    const lccSurveyForm = document.getElementById('lcc-survey-form');
    const formLccIdInput = document.getElementById('form-lcc-id');
    const selectedLccBadge = document.getElementById('selected-lcc-badge');
    const lccSurveyMainTitle = document.getElementById('lcc-survey-main-title');
    const exitLccSurveyBtn = document.getElementById('exit-lcc-survey-btn');
    const prevLccStepBtn = document.getElementById('prev-lcc-step-btn');
    const nextLccStepBtn = document.getElementById('next-lcc-step-btn');
    const lccProgressFill = document.getElementById('lcc-progress-fill');
    const lccStepIndicators = document.querySelectorAll('.lcc-step-ind');
    const lccFormSteps = document.querySelectorAll('.lcc-form-step');
    const lccNameSelect = document.getElementById('lcc-q-name');

    // DCC Survey UI
    const dccSurveyForm = document.getElementById('dcc-survey-form');
    const exitDccSurveyBtn = document.getElementById('exit-dcc-survey-btn');
    const prevDccStepBtn = document.getElementById('prev-dcc-step-btn');
    const nextDccStepBtn = document.getElementById('next-dcc-step-btn');
    const dccProgressFill = document.getElementById('dcc-progress-fill');
    const dccStepIndicators = document.querySelectorAll('.dcc-step-ind');
    const dccFormSteps = document.querySelectorAll('.dcc-form-step');

    // Success Page Elements
    const successHomeBtn = document.getElementById('success-home-btn');
    const viewPayloadBtn = document.getElementById('view-payload-btn');
    const payloadDrawer = document.getElementById('payload-drawer');
    const payloadCodeBlock = document.getElementById('payload-code');
    const successChurchDisplay = document.getElementById('success-church-display');
    const successTimestampDisplay = document.getElementById('success-timestamp');

    // DCC Reserved Access Modal Elements
    const dccAccessModal = document.getElementById('dcc-access-modal');
    const closeDccModalBtn = document.getElementById('close-dcc-modal-btn');
    const understoodDccBtn = document.getElementById('understood-dcc-btn');

    // Backend Modal Elements
    const backendModal = document.getElementById('backend-modal');
    const closeBackendModalBtn = document.getElementById('close-backend-modal-btn');
    const backendEndpointInput = document.getElementById('backend-endpoint-input');
    const saveBackendBtn = document.getElementById('save-backend-btn');
    const testBackendBtn = document.getElementById('test-backend-btn');
    const clearBackendBtn = document.getElementById('clear-backend-btn');
    const copyAppsScriptBtn = document.getElementById('copy-apps-script-btn');
    const backendStatusText = document.getElementById('backend-status-text');
    const statusDot = document.getElementById('status-dot');

    // ==========================================
    // STATE MANAGEMENT
    // ==========================================
    let currentStep = 1;
    let lccCurrentStep = 1;
    let dccCurrentStep = 1;
    let selectedChurch = null;
    let selectedLcc = null;
    let activeEndpointUrl = localStorage.getItem('church_survey_endpoint_url') || "";

    if (churchCountBadge) {
        churchCountBadge.textContent = `${congregationsList.length} Churches`;
    }

    // ==========================================
    // BACKEND MODAL LOGIC
    // ==========================================
    function updateBackendStatusUI() {
        if (activeEndpointUrl && activeEndpointUrl.trim().length > 0) {
            backendStatusText.innerHTML = `Status: <strong>Connected to Live Webhook</strong> (${activeEndpointUrl.substring(0, 32)}...)`;
            statusDot.classList.add('connected');
            backendEndpointInput.value = activeEndpointUrl;
        } else {
            backendStatusText.innerHTML = `Status: <strong>Local Sandbox Mode</strong>`;
            statusDot.classList.remove('connected');
            backendEndpointInput.value = "";
        }
    }

    if (navBackendBtn) {
        navBackendBtn.addEventListener('click', () => {
            updateBackendStatusUI();
            backendModal.style.display = 'flex';
        });
    }

    if (closeBackendModalBtn) {
        closeBackendModalBtn.addEventListener('click', () => backendModal.style.display = 'none');
    }

    backendModal.addEventListener('click', (e) => {
        if (e.target === backendModal) backendModal.style.display = 'none';
    });

    saveBackendBtn.addEventListener('click', () => {
        const url = backendEndpointInput.value.trim();
        if (url.length > 0) {
            localStorage.setItem('church_survey_endpoint_url', url);
            activeEndpointUrl = url;
            alert('Webhook endpoint saved successfully!');
        } else {
            localStorage.removeItem('church_survey_endpoint_url');
            activeEndpointUrl = "";
            alert('Reset to Sandbox mode.');
        }
        updateBackendStatusUI();
    });

    clearBackendBtn.addEventListener('click', () => {
        localStorage.removeItem('church_survey_endpoint_url');
        activeEndpointUrl = "";
        backendEndpointInput.value = "";
        updateBackendStatusUI();
        alert('Reset to Sandbox mode.');
    });

    if (copyAppsScriptBtn) {
        copyAppsScriptBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE).then(() => alert('Script copied to clipboard!'));
        });
    }

    // ==========================================
    // SPA ROUTER & NAVIGATION
    // ==========================================
    function switchActiveView(targetView) {
        const activeView = document.querySelector('.view.active');
        if (activeView === targetView) return;
        
        if (activeView) {
            activeView.style.opacity = '0';
            activeView.style.transform = 'translateY(12px)';
            
            setTimeout(() => {
                activeView.classList.remove('active');
                targetView.classList.add('active');
                targetView.offsetHeight;
                targetView.style.opacity = '1';
                targetView.style.transform = 'translateY(0)';
            }, 250);
        } else {
            targetView.classList.add('active');
            targetView.style.opacity = '1';
            targetView.style.transform = 'translateY(0)';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showHomePage() {
        switchActiveView(homeView);
        updateHeroResumeCard();
    }

    function showLocalChurchDirectoryPage() {
        switchActiveView(localChurchDirectoryView);
        renderDirectory();
    }

    function showLccDirectoryPage() {
        switchActiveView(lccDirectoryView);
        renderLccDirectory();
    }

    function showSurveyPage(church) {
        selectedChurch = church;
        formChurchIdInput.value = church.id;
        selectedChurchBadge.textContent = `${church.displayName} (#${church.id})`;
        surveyMainTitle.textContent = `Questionnaire: ${church.displayName}`;
        switchActiveView(surveyView);
        resetSurveyState(false);
        setStep(1);
    }

    function showLccSurveyPage(lcc) {
        selectedLcc = lcc;
        formLccIdInput.value = lcc.id;
        selectedLccBadge.textContent = `LCC: ${lcc.rawName}`;
        lccSurveyMainTitle.textContent = `LCC Strategic Questionnaire: ${lcc.displayName}`;
        if (lccNameSelect) lccNameSelect.value = lcc.rawName;
        switchActiveView(lccSurveyView);
        resetLccSurveyState();
        setLccStep(1);
    }

    function showDccSurveyPage() {
        switchActiveView(dccSurveyView);
        resetDccSurveyState();
        setDccStep(1);
    }

    function showSuccessPage(entityName, submittedPayload) {
        successChurchDisplay.textContent = entityName || 'Entity';
        successTimestampDisplay.textContent = new Date().toLocaleString();
        payloadCodeBlock.textContent = JSON.stringify(submittedPayload, null, 2);
        switchActiveView(successView);
    }

    // Hero Action Card Buttons
    if (btnHeroLocalChurch) btnHeroLocalChurch.addEventListener('click', showLocalChurchDirectoryPage);
    if (btnHeroLcc) btnHeroLcc.addEventListener('click', showLccDirectoryPage);
    if (btnHeroDcc) {
        btnHeroDcc.addEventListener('click', () => {
            if (dccAccessModal) dccAccessModal.style.display = 'flex';
        });
    }

    // Nav Bar / Back Buttons
    if (navHomeBtn) navHomeBtn.addEventListener('click', showHomePage);
    if (brandLogoLink) brandLogoLink.addEventListener('click', (e) => { e.preventDefault(); showHomePage(); });
    backHomeBtns.forEach(btn => btn.addEventListener('click', showHomePage));

    if (exitSurveyBtn) exitSurveyBtn.addEventListener('click', showLocalChurchDirectoryPage);
    if (exitLccSurveyBtn) exitLccSurveyBtn.addEventListener('click', showLccDirectoryPage);
    if (exitDccSurveyBtn) exitDccSurveyBtn.addEventListener('click', showHomePage);
    if (successHomeBtn) successHomeBtn.addEventListener('click', showHomePage);

    // DCC Reserved Access Modal Handlers
    if (closeDccModalBtn) closeDccModalBtn.addEventListener('click', () => dccAccessModal.style.display = 'none');
    if (understoodDccBtn) understoodDccBtn.addEventListener('click', () => dccAccessModal.style.display = 'none');
    if (dccAccessModal) {
        dccAccessModal.addEventListener('click', (e) => {
            if (e.target === dccAccessModal) dccAccessModal.style.display = 'none';
        });
    }

    // ==========================================
    // DIRECTORIES RENDER & FILTER
    // ==========================================
    function renderDirectory() {
        directoryGrid.innerHTML = '';
        congregationsList.forEach(church => {
            const btn = document.createElement('button');
            btn.className = 'church-btn';
            btn.id = `church-btn-${church.id}`;
            btn.setAttribute('type', 'button');
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" />
                </svg>
                <span>${church.displayName}</span>
                <span class="church-btn-icon">#${church.id} • ECWA Umuahia</span>
            `;
            btn.addEventListener('click', () => showSurveyPage(church));
            directoryGrid.appendChild(btn);
        });
    }

    function filterDirectory() {
        const query = searchInput.value.toLowerCase().trim();
        const cleanQuery = query.replace(/[^a-z0-9]/g, '');
        let visibleCount = 0;
        if (searchClearBtn) searchClearBtn.style.display = query ? 'block' : 'none';
        congregationsList.forEach(church => {
            const btn = document.getElementById(`church-btn-${church.id}`);
            if (!btn) return;
            const isMatch = church.displayName.toLowerCase().includes(query) || church.rawName.toLowerCase().includes(query) || church.id.toString() === query || (cleanQuery.length > 0 && church.searchSlug.includes(cleanQuery));
            if (isMatch) { btn.style.display = 'flex'; visibleCount++; }
            else { btn.style.display = 'none'; }
        });
        if (noResultsState) {
            directoryGrid.style.display = visibleCount === 0 ? 'none' : 'grid';
            noResultsState.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }

    if (searchInput) searchInput.addEventListener('input', filterDirectory);
    if (searchClearBtn) searchClearBtn.addEventListener('click', () => { searchInput.value = ''; filterDirectory(); });
    if (searchResetBtn) searchResetBtn.addEventListener('click', () => { searchInput.value = ''; filterDirectory(); });

    function renderLccDirectory() {
        lccDirectoryGrid.innerHTML = '';
        lccList.forEach(lcc => {
            const btn = document.createElement('button');
            btn.className = 'church-btn lcc-card-btn';
            btn.id = `lcc-btn-${lcc.id}`;
            btn.setAttribute('type', 'button');
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                </svg>
                <span>${lcc.displayName}</span>
                <span class="church-btn-icon">LCC #${lcc.id} • ECWA Umuahia DCC</span>
            `;
            btn.addEventListener('click', () => showLccSurveyPage(lcc));
            lccDirectoryGrid.appendChild(btn);
        });
    }

    function filterLccDirectory() {
        const query = lccSearchInput.value.toLowerCase().trim();
        if (lccSearchClearBtn) lccSearchClearBtn.style.display = query ? 'block' : 'none';
        lccList.forEach(lcc => {
            const btn = document.getElementById(`lcc-btn-${lcc.id}`);
            if (!btn) return;
            const isMatch = lcc.displayName.toLowerCase().includes(query) || lcc.rawName.toLowerCase().includes(query);
            btn.style.display = isMatch ? 'flex' : 'none';
        });
    }

    if (lccSearchInput) lccSearchInput.addEventListener('input', filterLccDirectory);
    if (lccSearchClearBtn) lccSearchClearBtn.addEventListener('click', () => { lccSearchInput.value = ''; filterLccDirectory(); });

    // ==========================================
    // SURVEY STEPPER LOGIC (61 CHURCH & LCC & DCC)
    // ==========================================
    function setStep(stepNumber) {
        currentStep = stepNumber;
        formSteps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step, 10) === currentStep) step.classList.add('active');
        });
        stepIndicators.forEach(ind => {
            const indStep = parseInt(ind.dataset.step, 10);
            ind.classList.remove('active', 'completed');
            if (indStep === currentStep) ind.classList.add('active');
            else if (indStep < currentStep) ind.classList.add('completed');
        });
        if (surveyProgressFill) surveyProgressFill.style.width = `${((currentStep - 1) / (formSteps.length - 1)) * 100}%`;
        if (prevStepBtn) prevStepBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
        if (nextStepBtn) nextStepBtn.textContent = currentStep === formSteps.length ? 'Submit Questionnaire' : 'Next Step';
        if (surveyView) surveyView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (nextStepBtn) nextStepBtn.addEventListener('click', () => { if (currentStep < formSteps.length) setStep(currentStep + 1); else submitChurchForm(); });
    if (prevStepBtn) prevStepBtn.addEventListener('click', () => { if (currentStep > 1) setStep(currentStep - 1); });

    function setLccStep(stepNumber) {
        lccCurrentStep = stepNumber;
        lccFormSteps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.lccStep, 10) === lccCurrentStep) step.classList.add('active');
        });
        lccStepIndicators.forEach(ind => {
            const indStep = parseInt(ind.dataset.lccStep, 10);
            ind.classList.remove('active', 'completed');
            if (indStep === lccCurrentStep) ind.classList.add('active');
            else if (indStep < lccCurrentStep) ind.classList.add('completed');
        });
        if (lccProgressFill) lccProgressFill.style.width = `${((lccCurrentStep - 1) / (lccFormSteps.length - 1)) * 100}%`;
        if (prevLccStepBtn) prevLccStepBtn.style.visibility = lccCurrentStep === 1 ? 'hidden' : 'visible';
        if (nextLccStepBtn) nextLccStepBtn.textContent = lccCurrentStep === lccFormSteps.length ? 'Submit LCC Questionnaire' : 'Next Step';
        if (lccSurveyView) lccSurveyView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (nextLccStepBtn) nextLccStepBtn.addEventListener('click', () => { if (lccCurrentStep < lccFormSteps.length) setLccStep(lccCurrentStep + 1); else submitLccForm(); });
    if (prevLccStepBtn) prevLccStepBtn.addEventListener('click', () => { if (lccCurrentStep > 1) setLccStep(lccCurrentStep - 1); });

    function setDccStep(stepNumber) {
        dccCurrentStep = stepNumber;
        dccFormSteps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.dccStep, 10) === dccCurrentStep) step.classList.add('active');
        });
        dccStepIndicators.forEach(ind => {
            const indStep = parseInt(ind.dataset.dccStep, 10);
            ind.classList.remove('active', 'completed');
            if (indStep === dccCurrentStep) ind.classList.add('active');
            else if (indStep < dccCurrentStep) ind.classList.add('completed');
        });
        if (dccProgressFill) dccProgressFill.style.width = `${((dccCurrentStep - 1) / (dccFormSteps.length - 1)) * 100}%`;
        if (prevDccStepBtn) prevDccStepBtn.style.visibility = dccCurrentStep === 1 ? 'hidden' : 'visible';
        if (nextDccStepBtn) nextDccStepBtn.textContent = dccCurrentStep === dccFormSteps.length ? 'Submit DCC Questionnaire' : 'Next Step';
        if (dccSurveyView) dccSurveyView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (nextDccStepBtn) nextDccStepBtn.addEventListener('click', () => { if (dccCurrentStep < dccFormSteps.length) setDccStep(dccCurrentStep + 1); else submitDccForm(); });
    if (prevDccStepBtn) prevDccStepBtn.addEventListener('click', () => { if (dccCurrentStep > 1) setDccStep(dccCurrentStep - 1); });

    dccStepIndicators.forEach(ind => {
        ind.addEventListener('click', () => {
            const targetStep = parseInt(ind.dataset.dccStep, 10);
            if (targetStep && targetStep !== dccCurrentStep) setDccStep(targetStep);
        });
    });

    // ==========================================
    // FORM RESET & SUBMISSIONS
    // ==========================================
    function resetSurveyState(clearChurch = true) {
        if (surveyForm) surveyForm.reset();
        if (clearChurch) selectedChurch = null;
        currentStep = 1;
    }

    function resetLccSurveyState() {
        if (lccSurveyForm) lccSurveyForm.reset();
        lccCurrentStep = 1;
    }

    function resetDccSurveyState() {
        if (dccSurveyForm) dccSurveyForm.reset();
        dccCurrentStep = 1;
    }

    function submitChurchForm() {
        nextStepBtn.disabled = true;
        nextStepBtn.textContent = 'Submitting...';
        const formData = new FormData(surveyForm);
        const payload = {
            type: 'LOCAL_CHURCH_QUESTIONNAIRE',
            church_id: selectedChurch ? selectedChurch.id : 1,
            church_name: selectedChurch ? selectedChurch.displayName : "Local Church",
            timestamp: new Date().toISOString(),
            responses: Object.fromEntries(formData.entries())
        };
        setTimeout(() => {
            nextStepBtn.disabled = false;
            showSuccessPage(selectedChurch ? selectedChurch.displayName : 'Local Church', payload);
        }, 500);
    }

    function submitLccForm() {
        nextLccStepBtn.disabled = true;
        nextLccStepBtn.textContent = 'Submitting...';
        const formData = new FormData(lccSurveyForm);
        const lccName = formData.get('lcc_q_name') || (selectedLcc ? selectedLcc.rawName : 'LCC');
        const payload = {
            type: 'LCC_QUESTIONNAIRE',
            lcc_name: lccName,
            timestamp: new Date().toISOString(),
            responses: Object.fromEntries(formData.entries())
        };
        setTimeout(() => {
            nextLccStepBtn.disabled = false;
            showSuccessPage(`${lccName} LCC`, payload);
        }, 500);
    }

    function submitDccForm() {
        nextDccStepBtn.disabled = true;
        nextDccStepBtn.textContent = 'Submitting DCC Survey...';
        const formData = new FormData(dccSurveyForm);
        const payload = {
            type: 'DCC_EXECUTIVE_QUESTIONNAIRE',
            dcc_name: "ECWA Umuahia DCC",
            timestamp: new Date().toISOString(),
            responses: Object.fromEntries(formData.entries())
        };

        try {
            const stored = JSON.parse(localStorage.getItem('dcc_survey_responses') || "[]");
            stored.push(payload);
            localStorage.setItem('dcc_survey_responses', JSON.stringify(stored));
        } catch (e) { console.warn(e); }

        const endpoint = localStorage.getItem('church_survey_endpoint_url') || activeEndpointUrl;
        if (endpoint && endpoint.trim().length > 0) {
            fetch(endpoint, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(err => console.error(err));
        }

        setTimeout(() => {
            nextDccStepBtn.disabled = false;
            showSuccessPage("ECWA Umuahia DCC Executive", payload);
        }, 500);
    }

    function updateHeroResumeCard() {
        if (heroResumeCard) heroResumeCard.style.display = 'none';
    }

    if (viewPayloadBtn && payloadDrawer) {
        viewPayloadBtn.addEventListener('click', () => {
            payloadDrawer.style.display = payloadDrawer.style.display === 'none' ? 'block' : 'none';
        });
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    showHomePage();
    renderDirectory();
    renderLccDirectory();
});

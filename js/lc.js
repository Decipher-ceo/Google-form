/**
 * Button 1: Local Church Questionnaire Controller (js/lc.js)
 * Manages 66 Local Churches Grouped Under 9 LCCs (3 rows x 3 columns), Search Filter, and Step-by-Step LC Questionnaire Form
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const directoryView = document.getElementById('lc-directory-view');
    const surveyView = document.getElementById('lc-survey-view');
    const directoryGrid = document.getElementById('directory-grid');
    const churchSearchInput = document.getElementById('church-search');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const searchResetBtn = document.getElementById('search-reset-btn');
    const noResultsCard = document.getElementById('no-results-state');
    const selectedBadge = document.getElementById('lc-selected-badge');
    const surveyTitle = document.getElementById('lc-survey-title');
    const formChurchIdInput = document.getElementById('lc-form-church-id');
    const backToDirectoryBtn = document.getElementById('back-to-directory-btn');
    const surveyForm = document.getElementById('lc-survey-form');
    const prevStepBtn = document.getElementById('lc-prev-step-btn');
    const nextStepBtn = document.getElementById('lc-next-step-btn');
    const progressFill = document.getElementById('lc-progress-fill');
    const stepperSteps = document.querySelectorAll('#lc-stepper-steps .step-indicator');
    const formSteps = document.querySelectorAll('#lc-survey-form .form-step');

    let currentStep = 1;
    const totalSteps = formSteps.length;
    let selectedChurch = null;

    // --- Render 66 Churches Grouped by 9 LCCs (3 rows x 3 columns) ---
    function renderChurchDirectory(searchQuery = '') {
        if (!directoryGrid) return;
        directoryGrid.innerHTML = '';

        const query = searchQuery.trim().toLowerCase();
        let totalVisibleChurches = 0;

        LCC_CHURCH_GROUPS.forEach(group => {
            // Find churches belonging to this LCC group
            const groupChurches = CONGREGATIONS.filter(c => c.lccId === group.id);

            // Filter by search query if any
            const matchedChurches = query
                ? groupChurches.filter(c =>
                    c.rawName.toLowerCase().includes(query) ||
                    group.name.toLowerCase().includes(query) ||
                    c.numberStr.includes(query)
                )
                : groupChurches;

            if (matchedChurches.length === 0) {
                return; // Hide this group if no churches match
            }

            totalVisibleChurches += matchedChurches.length;

            // Construct LCC Section Card
            const card = document.createElement('div');
            card.className = 'lc-lcc-section-card';
            card.setAttribute('data-lcc-id', group.id);

            // Card Header
            const header = document.createElement('div');
            header.className = 'lc-lcc-section-header';
            header.innerHTML = `
                <div class="lc-lcc-header-title-wrap">
                    <div class="lc-lcc-header-icon">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 14h6M9 18h6M12 7v3" />
                        </svg>
                    </div>
                    <h3 class="lc-lcc-title">${group.name}</h3>
                </div>
                <span class="lc-lcc-count-badge">${matchedChurches.length} ${matchedChurches.length === 1 ? 'Church' : 'Churches'}</span>
            `;
            card.appendChild(header);

            // Church List Container
            const listEl = document.createElement('ul');
            listEl.className = 'lc-church-list';

            matchedChurches.forEach(church => {
                const li = document.createElement('li');
                li.className = 'lc-church-item';
                li.setAttribute('role', 'button');
                li.setAttribute('tabindex', '0');
                li.setAttribute('title', `Click to open questionnaire for ${church.rawName}`);

                // Highlight match if query present
                let nameHtml = church.rawName;
                if (query && church.rawName.toLowerCase().includes(query)) {
                    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    nameHtml = church.rawName.replace(regex, '<span class="lc-church-highlight">$1</span>');
                }

                li.innerHTML = `
                    <div class="lc-item-left">
                        <span class="lc-item-num">${church.localIndex}</span>
                        <span class="lc-item-name">${nameHtml}</span>
                    </div>
                    <div class="lc-item-arrow">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                `;

                li.addEventListener('click', () => openChurchSurvey(church));
                li.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openChurchSurvey(church);
                    }
                });

                listEl.appendChild(li);
            });

            card.appendChild(listEl);
            directoryGrid.appendChild(card);
        });

        // Toggle No Results State
        if (totalVisibleChurches === 0) {
            if (noResultsCard) noResultsCard.style.display = 'block';
        } else {
            if (noResultsCard) noResultsCard.style.display = 'none';
        }
    }

    // --- Search Filter Logic ---
    if (churchSearchInput) {
        churchSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (searchClearBtn) searchClearBtn.style.display = query ? 'block' : 'none';
            renderChurchDirectory(query);
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
            churchSearchInput.value = '';
            searchClearBtn.style.display = 'none';
            renderChurchDirectory('');
            churchSearchInput.focus();
        });
    }

    if (searchResetBtn) {
        searchResetBtn.addEventListener('click', () => {
            churchSearchInput.value = '';
            if (searchClearBtn) searchClearBtn.style.display = 'none';
            renderChurchDirectory('');
        });
    }

    // --- Open Survey Form for Selected Church ---
    function openChurchSurvey(church) {
        selectedChurch = church;
        if (selectedBadge) selectedBadge.textContent = `${church.rawName} (${church.lccName})`;
        if (surveyTitle) surveyTitle.textContent = `${church.rawName} Congregation Questionnaire`;
        if (formChurchIdInput) formChurchIdInput.value = church.id;

        // Auto-fill Question 3 in Section A (Local Church Council)
        const lccBelongInput = document.getElementById('q-lcc-belong');
        if (lccBelongInput) {
            lccBelongInput.value = church.lccName;
        }

        if (directoryView) directoryView.style.display = 'none';
        if (surveyView) surveyView.style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateStepUI(1);
    }

    // --- Back to Directory Button ---
    if (backToDirectoryBtn) {
        backToDirectoryBtn.addEventListener('click', () => {
            if (surveyView) surveyView.style.display = 'none';
            if (directoryView) directoryView.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Step Navigation & UI Update ---
    function updateStepUI(stepNum) {
        currentStep = stepNum;

        // Progress bar calculation
        const percent = Math.round(((stepNum - 1) / (totalSteps - 1)) * 100);
        if (progressFill) progressFill.style.width = `${percent}%`;

        // Update step indicators
        stepperSteps.forEach((indicator, idx) => {
            const step = idx + 1;
            indicator.classList.remove('active', 'completed');
            if (step === stepNum) indicator.classList.add('active');
            if (step < stepNum) indicator.classList.add('completed');
        });

        // Toggle form step visibility
        formSteps.forEach((stepEl, idx) => {
            stepEl.classList.toggle('active', (idx + 1) === stepNum);
        });

        // Navigation button states
        if (prevStepBtn) {
            prevStepBtn.style.visibility = stepNum === 1 ? 'hidden' : 'visible';
        }
        if (nextStepBtn) {
            if (stepNum === totalSteps) {
                nextStepBtn.innerHTML = `Submit Questionnaire <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;
                nextStepBtn.classList.remove('btn-primary');
                nextStepBtn.classList.add('btn-success');
            } else {
                nextStepBtn.innerHTML = `Next Step <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
                nextStepBtn.classList.remove('btn-success');
                nextStepBtn.classList.add('btn-primary');
            }
        }
    }

    // Allow clicking step indicators directly
    stepperSteps.forEach((indicator) => {
        indicator.style.cursor = 'pointer';
        indicator.addEventListener('click', () => {
            const stepNum = parseInt(indicator.dataset.step, 10);
            if (stepNum && stepNum !== currentStep) {
                updateStepUI(stepNum);
                window.scrollTo({ top: 100, behavior: 'smooth' });
            }
        });
    });

    // --- Validate Current Step Inputs ---
    function validateStep(stepNum) {
        const stepEl = document.querySelector(`#lc-survey-form .form-step[data-step="${stepNum}"]`);
        if (!stepEl) return true;

        const requiredInputs = stepEl.querySelectorAll('[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            const group = input.closest('.form-group');
            if (!input.value.trim()) {
                isValid = false;
                if (group) group.classList.add('has-error');
            } else {
                if (group) group.classList.remove('has-error');
            }
        });

        return isValid;
    }

    function validateAllSteps() {
        let allValid = true;
        let firstFailedStep = null;

        for (let s = 1; s <= totalSteps; s++) {
            if (!validateStep(s)) {
                allValid = false;
                if (!firstFailedStep) firstFailedStep = s;
            }
        }

        if (!allValid) {
            showToast('Please fill out required fields before submitting.', 'error');
            if (firstFailedStep) {
                updateStepUI(firstFailedStep);
                window.scrollTo({ top: 100, behavior: 'smooth' });
            }
        }

        return allValid;
    }

    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                updateStepUI(currentStep - 1);
                window.scrollTo({ top: 100, behavior: 'smooth' });
            }
        });
    }

    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                updateStepUI(currentStep + 1);
                window.scrollTo({ top: 100, behavior: 'smooth' });
            } else {
                // Submit Form
                submitLCForm();
            }
        });
    }

    // --- Submit Local Church Questionnaire ---
    function submitLCForm() {
        if (!validateAllSteps()) return;
        const formData = new FormData(surveyForm);
        const data = Object.fromEntries(formData.entries());
        data.church_name = selectedChurch ? selectedChurch.rawName : 'Unknown Church';
        data.lcc_name = selectedChurch ? selectedChurch.lccName : '';
        data.submitted_at = new Date().toISOString();

        // Webhook URL check
        const endpointUrl = localStorage.getItem('webhookEndpointUrl');

        showToast('Submitting LC Questionnaire response...', 'info');

        if (endpointUrl) {
            fetch(endpointUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(() => {
                showToast('Submission successful! Sent to Data Collector.', 'success');
                finishSubmission();
            })
            .catch(err => {
                console.warn('Webhook error, saved locally:', err);
                saveLocally(data);
            });
        } else {
            saveLocally(data);
        }
    }

    function saveLocally(data) {
        const saved = JSON.parse(localStorage.getItem('lc_questionnaire_submissions') || '[]');
        saved.push(data);
        localStorage.setItem('lc_questionnaire_submissions', JSON.stringify(saved));
        showToast('Questionnaire saved locally!', 'success');
        finishSubmission();
    }

    function finishSubmission() {
        if (surveyForm) surveyForm.reset();
        setTimeout(() => {
            if (surveyView) surveyView.style.display = 'none';
            if (directoryView) directoryView.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1500);
    }

    // Ensure directory view is visible and survey view is hidden on initial load
    if (surveyView) surveyView.style.display = 'none';
    if (directoryView) directoryView.style.display = 'block';

    // Initialize directory with 3x3 grouped LCC sections
    renderChurchDirectory('');
});

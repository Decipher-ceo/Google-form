/**
 * Button 2: LCC Questionnaire Controller (js/lcc.js)
 * Manages 9 LCC Councils Selection and 10-Section LCC Questionnaire Form (Sections A-J)
 */

document.addEventListener('DOMContentLoaded', () => {
    const directoryView = document.getElementById('lcc-directory-view');
    const surveyView = document.getElementById('lcc-survey-view');
    const directoryGrid = document.getElementById('lcc-directory-grid');
    const selectedBadge = document.getElementById('lcc-selected-badge');
    const surveyTitle = document.getElementById('lcc-survey-title');
    const formCouncilIdInput = document.getElementById('lcc-form-council-id');
    const backToDirectoryBtn = document.getElementById('exit-lcc-survey-btn');
    const surveyForm = document.getElementById('lcc-survey-form');
    const prevStepBtn = document.getElementById('lcc-prev-step-btn');
    const nextStepBtn = document.getElementById('lcc-next-step-btn');
    const progressFill = document.getElementById('lcc-progress-fill');
    const stepperSteps = document.querySelectorAll('#lcc-stepper-steps .step-indicator');
    const formSteps = document.querySelectorAll('#lcc-survey-form .form-step');

    let currentStep = 1;
    const totalSteps = formSteps.length;
    let selectedCouncil = null;

    // --- Render 9 LCC Council Cards ---
    function renderLCCDirectory() {
        if (!directoryGrid) return;
        directoryGrid.innerHTML = '';

        LCC_COUNCILS.forEach(council => {
            const card = document.createElement('div');
            card.className = 'hero-action-card card-lcc lcc-council-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.innerHTML = `
                <div class="card-icon-wrapper icon-amber">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${council.name} LCC</h3>
                    <p class="card-desc">${council.desc}</p>
                </div>
                <div class="card-footer-action">
                    <span>Open ${council.name} Questionnaire</span>
                    <svg class="arrow-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                </div>
            `;

            card.addEventListener('click', () => openLCCSurvey(council));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLCCSurvey(council);
                }
            });

            directoryGrid.appendChild(card);
        });
    }

    // --- Open LCC Survey ---
    function openLCCSurvey(council) {
        selectedCouncil = council;
        if (selectedBadge) selectedBadge.textContent = `LCC: ${council.name}`;
        if (surveyTitle) surveyTitle.textContent = `${council.name} LCC Strategic Questionnaire`;
        if (formCouncilIdInput) formCouncilIdInput.value = council.id;

        const nameInput = document.getElementById('lcc-q-name');
        if (nameInput) nameInput.value = `${council.name} LCC`;

        if (directoryView) directoryView.style.display = 'none';
        if (surveyView) surveyView.style.display = 'block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateStepUI(1);
    }

    if (backToDirectoryBtn) {
        backToDirectoryBtn.addEventListener('click', () => {
            if (surveyView) surveyView.style.display = 'none';
            if (directoryView) directoryView.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Step Navigation ---
    function updateStepUI(stepNum) {
        currentStep = stepNum;

        const percent = Math.round(((stepNum - 1) / (totalSteps - 1)) * 100);
        if (progressFill) progressFill.style.width = `${percent}%`;

        stepperSteps.forEach((indicator, idx) => {
            const step = idx + 1;
            indicator.classList.remove('active', 'completed');
            if (step === stepNum) indicator.classList.add('active');
            if (step < stepNum) indicator.classList.add('completed');
        });

        formSteps.forEach((stepEl, idx) => {
            stepEl.classList.toggle('active', (idx + 1) === stepNum);
        });

        if (prevStepBtn) {
            prevStepBtn.style.visibility = stepNum === 1 ? 'hidden' : 'visible';
        }

        if (nextStepBtn) {
            if (stepNum === totalSteps) {
                nextStepBtn.innerHTML = `Submit LCC Survey <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;
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

    function validateStep(stepNum) {
        const stepEl = document.querySelector(`#lcc-survey-form .form-step[data-step="${stepNum}"]`);
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
                submitLCCForm();
            }
        });
    }

    async function submitLCCForm() {
        if (!validateAllSteps()) return;

        const formData = new FormData(surveyForm);
        const data = Object.fromEntries(formData.entries());
        data.lcc_council = selectedCouncil ? selectedCouncil.name : 'Unknown LCC';
        data.lcc_council_id = selectedCouncil ? String(selectedCouncil.id) : (data.lcc_council_id || '');
        data.submitted_at = new Date().toISOString();

        // Prevent double submissions
        if (nextStepBtn) {
            nextStepBtn.disabled = true;
            nextStepBtn.style.opacity = '0.7';
            nextStepBtn.innerHTML = `Submitting... <span class="spinner" style="display:inline-block;animation:spin 1s linear infinite;">⏳</span>`;
        }

        // 1. Primary Destination: Supabase Backend
        if (window.supabaseManager && window.supabaseManager.isReady) {
            showToast('Submitting LCC Questionnaire to Supabase database...', 'info');
            try {
                const res = await window.supabaseManager.submitLCCQuestionnaire(selectedCouncil, data);
                if (res.success) {
                    showToast('LCC Questionnaire recorded successfully in Supabase database!', 'success');
                    finishSubmission();
                    return;
                } else {
                    console.warn('[LCC Form] Supabase submission failed:', res.error);
                    showToast('Database write failed. Preserving response in local storage backup...', 'error');
                    saveLocally(data, true);
                    return;
                }
            } catch (err) {
                console.error('[LCC Form] Unexpected submission error:', err);
                showToast('Connection error. Preserving response in local storage backup...', 'error');
                saveLocally(data, true);
                return;
            } finally {
                if (nextStepBtn) {
                    nextStepBtn.disabled = false;
                    nextStepBtn.style.opacity = '1';
                }
            }
        }

        // 2. Secondary Destination: Configured Webhook (if any)
        const endpointUrl = localStorage.getItem('webhookEndpointUrl');
        if (endpointUrl) {
            showToast('Submitting to configured Data Collector Webhook...', 'info');
            fetch(endpointUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(() => {
                showToast('LCC Questionnaire submitted to Webhook successfully!', 'success');
                finishSubmission();
            })
            .catch(err => {
                console.warn('Webhook endpoint error, saved locally:', err);
                saveLocally(data, true);
            })
            .finally(() => {
                if (nextStepBtn) {
                    nextStepBtn.disabled = false;
                    nextStepBtn.style.opacity = '1';
                }
            });
            return;
        }

        // 3. Fallback: Local Storage (when Supabase is unconfigured and no webhook is set)
        if (nextStepBtn) {
            nextStepBtn.disabled = false;
            nextStepBtn.style.opacity = '1';
        }
        showToast('Supabase unconfigured. Saved to browser local storage.', 'info');
        saveLocally(data, false);
    }

    function saveLocally(data, isFallback = false) {
        const saved = JSON.parse(localStorage.getItem('lcc_questionnaire_submissions') || '[]');
        saved.push(data);
        localStorage.setItem('lcc_questionnaire_submissions', JSON.stringify(saved));
        if (isFallback) {
            showToast('Saved to browser local storage backup (not yet synced to Supabase).', 'warning');
        }
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

    renderLCCDirectory();

    // Auto-sync any previously saved responses from local storage to Supabase
    if (window.supabaseManager && typeof window.supabaseManager.syncPendingSubmissions === 'function') {
        window.supabaseManager.syncPendingSubmissions().then(res => {
            if (res && res.synced > 0) {
                showToast(`${res.synced} previously saved response(s) synced to database!`, 'success');
            }
        }).catch(err => console.debug('[Sync Check]', err));
    }
});

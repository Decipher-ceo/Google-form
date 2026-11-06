/**
 * Button 3: DCC Strategic Questionnaire Controller (js/dcc.js)
 * Manages 22-Step Executive DCC Questionnaire Form (Respondent Info, Sections A-V)
 */

document.addEventListener('DOMContentLoaded', () => {
    const surveyForm = document.getElementById('dcc-survey-form');
    const prevStepBtn = document.getElementById('dcc-prev-step-btn');
    const nextStepBtn = document.getElementById('dcc-next-step-btn');
    const exitBtn = document.getElementById('exit-dcc-survey-btn');
    const progressFill = document.getElementById('dcc-progress-fill');
    const stepperSteps = document.querySelectorAll('#dcc-stepper-steps .step-indicator');
    const formSteps = document.querySelectorAll('#dcc-survey-form .form-step');

    let currentStep = 1;
    const totalSteps = formSteps.length;

    // --- Step Navigation & Progress Bar ---
    function updateStepUI(stepNum) {
        currentStep = stepNum;

        // Progress calculation
        const percent = Math.round(((stepNum - 1) / (totalSteps - 1)) * 100);
        if (progressFill) progressFill.style.width = `${percent}%`;

        // Stepper indicators scroll & update
        stepperSteps.forEach((indicator, idx) => {
            const step = idx + 1;
            indicator.classList.remove('active', 'completed');
            if (step === stepNum) {
                indicator.classList.add('active');
                indicator.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
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
                nextStepBtn.innerHTML = `Submit DCC Assessment <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;
                nextStepBtn.classList.remove('btn-primary');
                nextStepBtn.classList.add('btn-success');
            } else {
                nextStepBtn.innerHTML = `Next Step (${stepNum}/${totalSteps}) <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
                nextStepBtn.classList.remove('btn-success');
                nextStepBtn.classList.add('btn-primary');
            }
        }
    }

    // --- Validation ---
    function validateStep(stepNum) {
        const stepEl = document.querySelector(`#dcc-survey-form .form-step[data-step="${stepNum}"]`);
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
                window.scrollTo({ top: 120, behavior: 'smooth' });
            }
        }

        return allValid;
    }

    // Event Listeners for Nav
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                updateStepUI(currentStep - 1);
                window.scrollTo({ top: 120, behavior: 'smooth' });
            }
        });
    }

    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                updateStepUI(currentStep + 1);
                window.scrollTo({ top: 120, behavior: 'smooth' });
            } else {
                submitDCCForm();
            }
        });
    }

    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to exit the DCC questionnaire? Unsaved entries may be lost.')) {
                window.location.href = 'index.html';
            }
        });
    }

    // Make stepper indicators clickable for easy navigation
    stepperSteps.forEach((indicator, idx) => {
        indicator.style.cursor = 'pointer';
        indicator.addEventListener('click', () => {
            const targetStep = idx + 1;
            updateStepUI(targetStep);
            window.scrollTo({ top: 120, behavior: 'smooth' });
        });
    });

    // --- Submit DCC Assessment ---
    async function submitDCCForm() {
        if (!validateAllSteps()) return;
        const formData = new FormData(surveyForm);
        const data = Object.fromEntries(formData.entries());
        data.form_type = 'DCC Strategic Assessment';
        data.submitted_at = new Date().toISOString();

        // Prevent double submissions
        if (nextStepBtn) {
            nextStepBtn.disabled = true;
            nextStepBtn.style.opacity = '0.7';
            nextStepBtn.innerHTML = `Submitting... <span class="spinner" style="display:inline-block;animation:spin 1s linear infinite;">⏳</span>`;
        }

        // 1. Primary Destination: Supabase Backend
        if (window.supabaseManager && window.supabaseManager.isReady) {
            showToast('Submitting DCC Assessment to Supabase database...', 'info');
            try {
                const res = await window.supabaseManager.submitDCCAssessment(data);
                if (res.success) {
                    showToast('DCC Strategic Assessment recorded successfully in Supabase database!', 'success');
                    finishSubmission();
                    return;
                } else {
                    console.warn('[DCC Form] Supabase submission failed:', res.error);
                    showToast('Database write failed. Preserving response in local storage backup...', 'error');
                    saveLocally(data, true);
                    return;
                }
            } catch (err) {
                console.error('[DCC Form] Unexpected submission error:', err);
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
                showToast('DCC Assessment submitted to Webhook successfully!', 'success');
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
        const saved = JSON.parse(localStorage.getItem('dcc_questionnaire_submissions') || '[]');
        saved.push(data);
        localStorage.setItem('dcc_questionnaire_submissions', JSON.stringify(saved));
        if (isFallback) {
            showToast('Saved to browser local storage backup (not yet synced to Supabase).', 'warning');
        }
        finishSubmission();
    }

    function finishSubmission() {
        if (surveyForm) surveyForm.reset();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    // Initialize UI
    updateStepUI(1);

    // Auto-sync any previously saved responses from local storage to Supabase
    if (window.supabaseManager && typeof window.supabaseManager.syncPendingSubmissions === 'function') {
        window.supabaseManager.syncPendingSubmissions().then(res => {
            if (res && res.synced > 0) {
                showToast(`${res.synced} previously saved response(s) synced to database!`, 'success');
            }
        }).catch(err => console.debug('[Sync Check]', err));
    }
});

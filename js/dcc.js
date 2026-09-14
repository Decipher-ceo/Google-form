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

        if (!isValid) {
            showToast('Please fill out all required fields before proceeding.', 'error');
        }
        return isValid;
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
            if (!validateStep(currentStep)) return;

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
        indicator.addEventListener('click', () => {
            const targetStep = idx + 1;
            updateStepUI(targetStep);
            window.scrollTo({ top: 120, behavior: 'smooth' });
        });
    });

    // --- Submit DCC Assessment ---
    function submitDCCForm() {
        const formData = new FormData(surveyForm);
        const data = Object.fromEntries(formData.entries());
        data.form_type = 'DCC Strategic Assessment';
        data.submitted_at = new Date().toISOString();

        const endpointUrl = localStorage.getItem('webhookEndpointUrl');
        showToast('Submitting DCC Assessment response...', 'info');

        if (endpointUrl) {
            fetch(endpointUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(() => {
                showToast('DCC Strategic Assessment submitted successfully!', 'success');
                finishSubmission();
            })
            .catch(err => {
                console.warn('Endpoint error, saved locally:', err);
                saveLocally(data);
            });
        } else {
            saveLocally(data);
        }
    }

    function saveLocally(data) {
        const saved = JSON.parse(localStorage.getItem('dcc_questionnaire_submissions') || '[]');
        saved.push(data);
        localStorage.setItem('dcc_questionnaire_submissions', JSON.stringify(saved));
        showToast('DCC Strategic Assessment saved locally!', 'success');
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
});

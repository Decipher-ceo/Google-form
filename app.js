/**
 * FAITHFORWARD CHURCH FEEDBACK HUB - APPLICATION LOGIC
 * ECWA Umuahia District Church Council (61 Local Churches)
 * Features SPA routing, search filtering, 5-step survey wizard (Sections A-E), and Data Collector endpoint setup.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // CHURCH DIRECTORY DATA (61 LOCAL CHURCHES)
    // ==========================================
    const CHURCH_NAMES = [
        "Afara",
        "Akanu",
        "Akokwa",
        "Akpahia",
        "Aladinma",
        "Amaeke Ibeku",
        "Amaeke Item",
        "Amangwu",
        "Amainyinta",
        "Amaoba",
        "Amaokwe",
        "Amawom Olokoro",
        "Amakohia Etiti",
        "Apuanu",
        "Arochukwu",
        "Asaga",
        "Awa Oguta",
        "ECWA Gospel Igbere",
        "Eziafor",
        "Ikenanzizi",
        "Irete",
        "Isieke",
        "Isiadu",
        "Isiama",
        "Itaja Olokoro 1",
        "Nkpa",
        "Nkporo",
        "Nkwere",
        "Nnonuo",
        "Nzerem",
        "Obinze",
        "Ogboko (Ozuitem 3)",
        "Okaiuga",
        "Okoko",
        "Okonaku",
        "Okwe",
        "Old Umuahia",
        "Orodo",
        "Orieamaenyi",
        "Orji Owerri",
        "Otulu",
        "Ozuitem 1",
        "Ozuitem 2",
        "Township 1",
        "Township 2",
        "Ubaha",
        "Ubakala",
        "Umudike",
        "Umuduru",
        "Umuegwu Okpuala",
        "Umuejere",
        "Umueze 1",
        "Umuezeala-Ama Mbano",
        "Umujiriji (Ehume)",
        "Umuneke",
        "Umunnuma",
        "Umuariam",
        "Unity Church",
        "Uzuakoli",
        "World Bank Owerri",
        "World Bank Umuahia"
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

    // Apps Script snippet for 1-click clipboard copy
    const GOOGLE_APPS_SCRIPT_CODE = `// ==========================================
// ECWA Umuahia DCC - Survey Data Collector
// Paste this code into Google Sheets -> Extensions -> Apps Script
// ==========================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Create header row if spreadsheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Church ID", "Church Name",
        "Section A: Founded Year", "Section A: Constituted Year", "Section A: Mother Church", "Section A: Full Address", "Section A: Community & LGA", "Section A: State", "Section A: Resident Pastor", "Section A: Phone", "Section A: Email", "Section A: Social Media",
        "Section B: Pioneer Members", "Section B: Pioneer Pastor", "Section B: Pioneer Board", "Section B: History Description", "Section B: Major Milestones", "Section B: Lessons Learned",
        "Section C: Pastoral History Table", "Section C: Notable Developments", "Section C: Current Resident Pastor",
        "Section D: Total Membership (Abroad)", "Section D: Current Membership Category", "Section D: Baptized Last Year", "Section D: New Converts", "Section D: Attendance Trend", "Section D: Membership Matrix Table",
        "Section E: Board Members", "Section E: Men Fellowship Leader", "Section E: Women Fellowship Leader", "Section E: Youth Fellowship Leader", "Section E: All Positions Filled", "Section E: Vacant Positions", "Section E: Leadership Training Needed",
        "Section F: Ministries Matrix Table", "Section F: Ministries Greatest Impact",
        "Section G: Outreaches Count", "Section G: Follow-up Process", "Section G: Future Church Planting",
        "Section H: Properties Matrix Table", "Section H: Ongoing Disputes", "Section H: Planned Projects", "Section H: Properties Assets Needed", "Section H: Acquired Property Use/Location/Size", "Section H: Acquired Property Documents", "Section H: DCC Has Copies", "Section H: Property Current Use",
        "Section I: Financial Sources", "Section I: Financial Challenges", "Section I: Boost Financial Inflow",
        "Section J: Community Needs Description", "Section J: Church Response to Needs", "Section J: Growth Opportunities", "Section J: Demographics", "Section J: Predominant Occupation", "Section J: Community Needs Checklist", "Section J: Community Needs Others",
        "Section K: SWOT Strengths Doing Well", "Section K: SWOT Strengths Thriving", "Section K: SWOT Strengths Resources", "Section K: SWOT Weaknesses Improvements", "Section K: SWOT Weaknesses Lacking", "Section K: SWOT Opportunities", "Section K: SWOT Threats", "Section K: Priority Needs Timeline", "Section K: Five Year Vision", "Section K: Prayer Requests"
      ]);
    }
    
    var data = JSON.parse(e.postData.contents);
    var resp = data.responses || {};
    var secA = resp.section_a || {};
    var secB = resp.section_b || {};
    var secC = resp.section_c || {};
    var secD = resp.section_d || {};
    var secE = resp.section_e || {};
    var secF = resp.section_f || {};
    var secG = resp.section_g || {};
    var secH = resp.section_h || {};
    var secI = resp.section_i || {};
    var secJ = resp.section_j || {};
    var secK = resp.section_k || {};
    
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.church_id || "",
      data.church_name || "",
      secA.founded_year || "",
      secA.constituted_year || "",
      secA.mother_church || "",
      secA.full_address || "",
      secA.community_lga || "",
      secA.state || "",
      secA.current_pastor || "",
      secA.contact_phone || "",
      secA.contact_email || "",
      secA.contact_social || "",
      
      secB.pioneer_members || "",
      secB.pioneer_pastor || "",
      secB.pioneer_board || "",
      secB.church_history || "",
      secB.major_milestones || "",
      secB.history_lessons || "",
      
      secC.pastoral_table ? JSON.stringify(secC.pastoral_table) : "",
      secC.notable_developments || "",
      secC.resident_pastor || "",
      
      secD.total_membership_abroad || "",
      secD.current_membership_category || "",
      secD.baptized_last_year || "",
      secD.new_converts || "",
      secD.attendance_trends || "",
      secD.membership_matrix ? JSON.stringify(secD.membership_matrix) : "",
      
      secE.board_members || "",
      secE.men_leader || "",
      secE.women_leader || "",
      secE.youth_leader || "",
      secE.positions_filled || "",
      secE.vacant_positions || "",
      secE.leadership_training || "",
      
      secF.ministries_matrix ? JSON.stringify(secF.ministries_matrix) : "",
      secF.greatest_impact || "",
      
      secG.outreaches_count || "",
      secG.followup_process || "",
      secG.church_planting_communities || "",
      
      secH.properties_matrix ? JSON.stringify(secH.properties_matrix) : "",
      secH.ongoing_disputes || "",
      secH.planned_projects || "",
      secH.assets_needed || "",
      secH.acquired_property_use || "",
      secH.acquired_property_docs || "",
      secH.dcc_has_copies || "",
      secH.property_in_use || "",
      
      secI.financial_sources || "",
      secI.financial_challenges || "",
      secI.boost_income || "",
      
      secJ.community_needs_desc || "",
      secJ.community_response || "",
      secJ.outreach_opportunities || "",
      secJ.community_demographics || "",
      secJ.community_occupation || "",
      secJ.needs_checklist ? JSON.stringify(secJ.needs_checklist) : "",
      secJ.needs_others || "",
      
      secK.swot_strength_well || "",
      secK.swot_strength_thriving || "",
      secK.swot_strength_resources || "",
      secK.swot_weakness_improvements || "",
      secK.swot_weakness_lacking || "",
      secK.swot_opportunities || "",
      secK.swot_threats || "",
      secK.priority_needs ? JSON.stringify(secK.priority_needs) : "",
      secK.five_year_vision || "",
      secK.prayer_requests || ""
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", result: "Row appended successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    
    // View containers
    const homeView = document.getElementById('home-view');
    const surveyView = document.getElementById('survey-view');
    const successView = document.getElementById('success-view');
    
    // Directory / Search elements
    const directoryGrid = document.getElementById('directory-grid');
    const searchInput = document.getElementById('church-search');
    const searchClearBtn = document.getElementById('search-clear-btn');
    const searchResetBtn = document.getElementById('search-reset-btn');
    const noResultsState = document.getElementById('no-results-state');
    const churchCountBadge = document.getElementById('church-count-badge');
    
    // Survey UI elements
    const surveyForm = document.getElementById('survey-form');
    const formChurchIdInput = document.getElementById('form-church-id');
    const selectedChurchBadge = document.getElementById('selected-church-badge');
    const surveyMainTitle = document.getElementById('survey-main-title');
    
    // Navigation / Button elements
    const navDirectoryBtn = document.getElementById('nav-directory-btn');
    const navBackendBtn = document.getElementById('nav-backend-btn');
    const brandLogoLink = document.getElementById('brand-logo');
    const exitSurveyBtn = document.getElementById('exit-survey-btn');
    const prevStepBtn = document.getElementById('prev-step-btn');
    const nextStepBtn = document.getElementById('next-step-btn');
    const successHomeBtn = document.getElementById('success-home-btn');
    const viewPayloadBtn = document.getElementById('view-payload-btn');
    const payloadDrawer = document.getElementById('payload-drawer');
    const payloadCodeBlock = document.getElementById('payload-code');
    const successChurchDisplay = document.getElementById('success-church-display');
    const successTimestampDisplay = document.getElementById('success-timestamp');
    
    // Modal elements
    const backendModal = document.getElementById('backend-modal');
    const closeBackendModalBtn = document.getElementById('close-backend-modal-btn');
    const backendEndpointInput = document.getElementById('backend-endpoint-input');
    const saveBackendBtn = document.getElementById('save-backend-btn');
    const testBackendBtn = document.getElementById('test-backend-btn');
    const clearBackendBtn = document.getElementById('clear-backend-btn');
    const copyAppsScriptBtn = document.getElementById('copy-apps-script-btn');
    const backendStatusText = document.getElementById('backend-status-text');
    const statusDot = document.getElementById('status-dot');

    // Stepper indicators
    const progressFill = document.getElementById('survey-progress-fill');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const formSteps = document.querySelectorAll('.form-step');

    // ==========================================
    // STATE MANAGEMENT
    // ==========================================
    let currentStep = 1;
    let selectedChurch = null;

    // Load saved backend endpoint
    let activeEndpointUrl = localStorage.getItem('church_survey_endpoint_url') || "";

    // Update count badge text
    if (churchCountBadge) {
        churchCountBadge.textContent = `${congregationsList.length} Local Churches`;
    }

    // ==========================================
    // BACKEND CONFIGURATION MODAL CONTROLS
    // ==========================================
    
    function updateBackendStatusUI() {
        if (activeEndpointUrl && activeEndpointUrl.trim().length > 0) {
            backendStatusText.innerHTML = `Status: <strong>Connected to Live Webhook</strong> (${activeEndpointUrl.substring(0, 35)}...)`;
            statusDot.classList.add('connected');
            backendEndpointInput.value = activeEndpointUrl;
        } else {
            backendStatusText.innerHTML = `Status: <strong>Local Sandbox Mode</strong> (Responses stored locally in browser)`;
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
        closeBackendModalBtn.addEventListener('click', () => {
            backendModal.style.display = 'none';
        });
    }

    backendModal.addEventListener('click', (e) => {
        if (e.target === backendModal) {
            backendModal.style.display = 'none';
        }
    });

    saveBackendBtn.addEventListener('click', () => {
        const url = backendEndpointInput.value.trim();
        if (url.length > 0) {
            localStorage.setItem('church_survey_endpoint_url', url);
            activeEndpointUrl = url;
            alert('Backend Collector endpoint saved successfully! All survey responses will now post to this URL.');
        } else {
            localStorage.removeItem('church_survey_endpoint_url');
            activeEndpointUrl = "";
            alert('Reset to Local Sandbox Mode.');
        }
        updateBackendStatusUI();
    });

    clearBackendBtn.addEventListener('click', () => {
        localStorage.removeItem('church_survey_endpoint_url');
        activeEndpointUrl = "";
        backendEndpointInput.value = "";
        updateBackendStatusUI();
        alert('Reset to Local Sandbox Mode.');
    });

    testBackendBtn.addEventListener('click', () => {
        const testPayload = {
            test: true,
            timestamp: new Date().toISOString(),
            church_id: 1,
            church_name: "ECWA Afara (Test)",
            responses: {
                section_a: {
                    founded_year: "1985",
                    constituted_year: "1992",
                    mother_church: "ECWA Afara Central",
                    full_address: "12 Church Road, Afara, Umuahia",
                    community_lga: "Umuahia North LGA",
                    state: "Abia",
                    current_pastor: "Rev. Dr. Emmanuel",
                    contact_phone: "+2348000000000",
                    contact_email: "afara@ecwa.org",
                    contact_social: "@ecwaafara"
                }
            }
        };

        const targetUrl = backendEndpointInput.value.trim() || activeEndpointUrl;
        if (!targetUrl) {
            alert('Please enter a Webhook URL first to test.');
            return;
        }

        testBackendBtn.disabled = true;
        testBackendBtn.textContent = 'Sending Test...';

        fetch(targetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        }).then(() => {
            alert('Test payload dispatched successfully! Check your Google Sheet / receiver logs.');
        }).catch(err => {
            alert('Error dispatching test payload: ' + err.message);
        }).finally(() => {
            testBackendBtn.disabled = false;
            testBackendBtn.textContent = 'Send Test Response';
        });
    });

    copyAppsScriptBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE).then(() => {
            copyAppsScriptBtn.textContent = 'Copied to Clipboard!';
            setTimeout(() => {
                copyAppsScriptBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    Copy Google Apps Script Code
                `;
            }, 3000);
        }).catch(() => {
            alert('Script copied:\n\n' + GOOGLE_APPS_SCRIPT_CODE);
        });
    });

    // ==========================================
    // SPA ROUTER IMPLEMENTATION
    // ==========================================
    
    function findChurchByIdentifier(identifier) {
        if (!identifier) return null;
        const num = parseInt(identifier, 10);
        if (!isNaN(num)) {
            return congregationsList.find(c => c.id === num);
        }
        const cleanQuery = identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
        return congregationsList.find(c => c.searchSlug === cleanQuery || c.rawName.toLowerCase().includes(identifier.toLowerCase()));
    }

    function router() {
        const urlParams = new URLSearchParams(window.location.search);
        const churchQuery = urlParams.get('church');
        
        if (churchQuery) {
            const foundChurch = findChurchByIdentifier(churchQuery);
            if (foundChurch) {
                showSurveyPage(foundChurch);
                return;
            }
        }
        
        showHomePage();
    }
    
    function showHomePage() {
        if (window.location.search) {
            history.pushState(null, '', window.location.pathname);
        }
        switchActiveView(homeView);
        resetSurveyState();
    }
    
    function showSurveyPage(church) {
        selectedChurch = church;
        formChurchIdInput.value = church.id;
        
        selectedChurchBadge.textContent = `${church.displayName} (#${church.id})`;
        surveyMainTitle.textContent = `Information & Survey: ${church.displayName}`;
        
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get('church') !== String(church.id)) {
            currentUrl.searchParams.set('church', church.id);
            history.pushState({ church: church.id }, '', currentUrl.search);
        }
        
        switchActiveView(surveyView);
        setStep(1);
    }
    
    function showSuccessPage(church, submittedPayload) {
        successChurchDisplay.textContent = church ? church.displayName : 'Local Church';
        
        const now = new Date();
        successTimestampDisplay.textContent = now.toLocaleString();
        
        payloadCodeBlock.textContent = JSON.stringify(submittedPayload, null, 2);
        
        switchActiveView(successView);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    function switchActiveView(targetView) {
        const activeView = document.querySelector('.view.active');
        if (activeView === targetView) return;
        
        if (activeView) {
            activeView.style.opacity = '0';
            activeView.style.transform = 'translateY(15px)';
            
            setTimeout(() => {
                activeView.classList.remove('active');
                
                targetView.classList.add('active');
                targetView.offsetHeight; 
                
                targetView.style.opacity = '1';
                targetView.style.transform = 'translateY(0)';
            }, 300);
        } else {
            targetView.classList.add('active');
            targetView.style.opacity = '1';
            targetView.style.transform = 'translateY(0)';
        }
    }

    window.addEventListener('popstate', router);

    // ==========================================
    // PAGE 1: CHURCH DIRECTORY SETUP
    // ==========================================
    
    function renderDirectory() {
        directoryGrid.innerHTML = '';
        
        congregationsList.forEach(church => {
            const btn = document.createElement('button');
            btn.className = 'church-btn';
            btn.id = `church-btn-${church.id}`;
            btn.setAttribute('type', 'button');
            btn.setAttribute('aria-label', `Select ${church.displayName}`);
            
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" />
                </svg>
                <span>${church.displayName}</span>
                <span class="church-btn-icon">#${church.id} • ECWA Umuahia</span>
            `;
            
            btn.addEventListener('click', () => {
                showSurveyPage(church);
            });
            
            directoryGrid.appendChild(btn);
        });
    }

    function filterDirectory() {
        const query = searchInput.value.toLowerCase().trim();
        const cleanQuery = query.replace(/[^a-z0-9]/g, '');
        let visibleCount = 0;
        
        searchClearBtn.style.display = query ? 'block' : 'none';
        
        congregationsList.forEach(church => {
            const btn = document.getElementById(`church-btn-${church.id}`);
            if (!btn) return;
            
            const isMatch = church.displayName.toLowerCase().includes(query) || 
                            church.rawName.toLowerCase().includes(query) || 
                            church.id.toString() === query || 
                            (cleanQuery.length > 0 && church.searchSlug.includes(cleanQuery));
            
            if (isMatch) {
                btn.style.display = 'flex';
                visibleCount++;
            } else {
                btn.style.display = 'none';
            }
        });
        
        if (visibleCount === 0) {
            directoryGrid.style.display = 'none';
            noResultsState.style.display = 'block';
        } else {
            directoryGrid.style.display = 'grid';
            noResultsState.style.display = 'none';
        }
    }

    searchInput.addEventListener('input', filterDirectory);
    
    searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterDirectory();
        searchInput.focus();
    });
    
    searchResetBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterDirectory();
        searchInput.focus();
    });

    // ==========================================
    // PAGE 2: STEPPER & SURVEY WIZARD LOGIC
    // ==========================================
    
    function setStep(stepNumber) {
        currentStep = stepNumber;
        
        formSteps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step, 10) === currentStep) {
                step.classList.add('active');
            }
        });
        
        // Track highest visited step for visual feedback
        if (!window._highestVisitedStep) window._highestVisitedStep = 1;
        if (currentStep > window._highestVisitedStep) window._highestVisitedStep = currentStep;
        
        stepIndicators.forEach(ind => {
            const indStep = parseInt(ind.dataset.step, 10);
            ind.classList.remove('active', 'completed');
            
            if (indStep === currentStep) {
                ind.classList.add('active');
            } else if (indStep < currentStep || indStep <= window._highestVisitedStep) {
                ind.classList.add('completed');
            }
        });
        
        const totalSteps = formSteps.length || 5;
        const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        
        if (currentStep === 1) {
            prevStepBtn.style.visibility = 'hidden';
        } else {
            prevStepBtn.style.visibility = 'visible';
        }
        
        if (currentStep === totalSteps) {
            nextStepBtn.innerHTML = `
                Submit Survey
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            `;
            nextStepBtn.classList.add('btn-accent-color');
        } else {
            nextStepBtn.innerHTML = `
                Next Step
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                </svg>
            `;
            nextStepBtn.classList.remove('btn-accent-color');
        }
        
        surveyView.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    function validateStep(stepNumber) {
        const stepContainer = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (!stepContainer) return true;
        
        const requiredGroups = stepContainer.querySelectorAll('.form-group.required');
        let isStepValid = true;
        let firstErrorElement = null;
        
        requiredGroups.forEach(group => {
            let isGroupValid = false;
            
            const checkboxes = group.querySelectorAll('input[type="checkbox"]');
            const radios = group.querySelectorAll('input[type="radio"]');
            if (checkboxes.length > 0) {
                const checkedCheckbox = group.querySelector('input[type="checkbox"]:checked');
                isGroupValid = !!checkedCheckbox;
            } else if (radios.length > 0) {
                const checkedRadio = group.querySelector('input[type="radio"]:checked');
                isGroupValid = !!checkedRadio;
            } else {
                const inputs = group.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], input[type="number"], textarea');
                let hasFilledInput = false;
                inputs.forEach(inp => {
                    if (inp.value.trim().length > 0) {
                        hasFilledInput = true;
                    }
                });
                isGroupValid = hasFilledInput;
            }
            
            if (!isGroupValid) {
                isStepValid = false;
                group.classList.add('has-error');
                group.classList.add('shake');
                
                setTimeout(() => {
                    group.classList.remove('shake');
                }, 400);
                
                if (!firstErrorElement) {
                    firstErrorElement = group;
                }
            } else {
                group.classList.remove('has-error');
            }
        });
        
        if (firstErrorElement) {
            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return isStepValid;
    }
    
    nextStepBtn.addEventListener('click', () => {
        if (currentStep < formSteps.length) {
            setStep(currentStep + 1);
        } else {
            submitForm();
        }
    });
    
    prevStepBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            setStep(currentStep - 1);
        }
    });
    
    // Allow clicking on any step indicator to jump directly to that step
    stepIndicators.forEach(ind => {
        ind.addEventListener('click', () => {
            const targetStep = parseInt(ind.dataset.step, 10);
            if (targetStep && targetStep !== currentStep) {
                setStep(targetStep);
            }
        });
    });

    // ==========================================
    // INTERACTIVE SELECTION FEEDBACK & CHAR LIMITS
    // ==========================================
    
    document.querySelectorAll('.radio-container input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const name = e.target.name;
            document.querySelectorAll(`input[name="${name}"]`).forEach(siblingRadio => {
                siblingRadio.closest('.radio-container').classList.remove('selected-option');
            });
            
            if (e.target.checked) {
                e.target.closest('.radio-container').classList.add('selected-option');
                const group = e.target.closest('.form-group');
                if (group) group.classList.remove('has-error');
            }
        });
    });

    function setupCharCounter(textarea, counterDisplay, maxLimit = 3000) {
        if (!textarea || !counterDisplay) return;
        textarea.addEventListener('input', () => {
            const count = textarea.value.length;
            counterDisplay.textContent = count;
            
            if (count >= maxLimit) {
                counterDisplay.style.color = 'var(--error)';
            } else {
                counterDisplay.style.color = 'var(--text-muted)';
            }
            
            if (count > 0) {
                const group = textarea.closest('.form-group');
                if (group) group.classList.remove('has-error');
            }
        });
    }

    const historyTextarea = document.getElementById('q-church-history');
    const historyCharCount = document.getElementById('history-char-count');
    const trainingTextarea = document.getElementById('q-leadership-training');
    const trainingCharCount = document.getElementById('training-char-count');

    setupCharCounter(historyTextarea, historyCharCount, 3000);
    setupCharCounter(trainingTextarea, trainingCharCount, 3000);

    // Setup character counters for new steps
    setupCharCounter(document.getElementById('q-followup-process'), document.getElementById('followup-char-count'), 3000);
    setupCharCounter(document.getElementById('q-church-planting-communities'), document.getElementById('planting-char-count'), 3000);
    setupCharCounter(document.getElementById('q-infrastructure-projects'), document.getElementById('projects-char-count'), 3000);
    setupCharCounter(document.getElementById('q-financial-challenges'), document.getElementById('challenges-char-count'), 3000);
    setupCharCounter(document.getElementById('q-boost-income'), document.getElementById('boost-char-count'), 3000);
    setupCharCounter(document.getElementById('q-community-response'), document.getElementById('response-char-count'), 3000);
    setupCharCounter(document.getElementById('q-swot-strength-well'), document.getElementById('swot-well-char-count'), 3000);
    setupCharCounter(document.getElementById('q-swot-strength-thriving'), document.getElementById('swot-thriving-char-count'), 3000);
    setupCharCounter(document.getElementById('q-swot-strength-resources'), document.getElementById('swot-resources-char-count'), 3000);
    setupCharCounter(document.getElementById('q-swot-weakness-improvements'), document.getElementById('swot-improvements-char-count'), 3000);
    setupCharCounter(document.getElementById('q-swot-weakness-lacking'), document.getElementById('swot-lacking-char-count'), 3000);
    setupCharCounter(document.getElementById('q-swot-opportunities'), document.getElementById('swot-opportunities-char-count'), 3000);
    setupCharCounter(document.getElementById('q-swot-threats'), document.getElementById('swot-threats-char-count'), 3000);
    setupCharCounter(document.getElementById('q-five-year-vision'), document.getElementById('vision-char-count'), 3000);
    setupCharCounter(document.getElementById('q-prayer-requests'), document.getElementById('prayer-char-count'), 3000);

    // Setup interactive checkbox listener for custom styled checkbox containers
    document.querySelectorAll('.checkbox-container input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', (e) => {
            const container = e.target.closest('.checkbox-container');
            if (e.target.checked) {
                container.classList.add('selected-option');
            } else {
                container.classList.remove('selected-option');
            }
            
            // Clear has-error styling on check box groups when at least one is checked
            const group = e.target.closest('.form-group');
            if (group) {
                const checked = group.querySelectorAll('input[type="checkbox"]:checked');
                if (checked.length > 0) {
                    group.classList.remove('has-error');
                }
            }
        });
        
        // Initial page load styling check
        if (chk.checked) {
            chk.closest('.checkbox-container').classList.add('selected-option');
        }
    });

    // ==========================================
    // SURVEY RESET & FORM SUBMIT
    // ==========================================

    function resetSurveyState() {
        surveyForm.reset();
        
        document.querySelectorAll('.radio-container, .checkbox-container').forEach(c => {
            c.classList.remove('selected-option');
        });
        
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('has-error', 'shake');
        });
        
        if (historyCharCount) historyCharCount.textContent = '0';
        if (trainingCharCount) trainingCharCount.textContent = '0';
        
        const newCountIds = [
            'followup-char-count', 'planting-char-count', 'projects-char-count',
            'challenges-char-count', 'boost-char-count', 'response-char-count',
            'swot-well-char-count', 'swot-thriving-char-count', 'swot-resources-char-count',
            'swot-improvements-char-count', 'swot-lacking-char-count',
            'swot-opportunities-char-count', 'swot-threats-char-count',
            'vision-char-count', 'prayer-char-count'
        ];
        newCountIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '0';
        });
        
        payloadDrawer.style.display = 'none';
        
        selectedChurch = null;
        currentStep = 1;
        window._highestVisitedStep = 1;
    }

    function submitForm() {
        // Validate ALL steps before final submission
        let allValid = true;
        let firstFailedStep = null;
        for (let s = 1; s <= formSteps.length; s++) {
            if (!validateStep(s)) {
                allValid = false;
                if (!firstFailedStep) firstFailedStep = s;
            }
        }
        if (!allValid) {
            // Jump to the first step with errors
            if (firstFailedStep) setStep(firstFailedStep);
            return;
        }
        
        nextStepBtn.disabled = true;
        nextStepBtn.innerHTML = `
            Submitting... 
            <svg class="loading-spinner" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="40" stroke-linecap="round"/>
            </svg>
        `;
        
        const formData = new FormData(surveyForm);
        
        // Extract Pastoral Table Rows
        const pastoralTableData = [];
        for (let i = 1; i <= 4; i++) {
            const name = formData.get(`q_pastor${i}_name`);
            const years = formData.get(`q_pastor${i}_years`);
            const contrib = formData.get(`q_pastor${i}_contrib`);
            if (name || years || contrib) {
                pastoralTableData.push({ pastor: name, years_served: years, major_contributions: contrib });
            }
        }

        // Extract Membership Breakdown Matrix Table
        const categories = ['men', 'women', 'youth', 'children', 'grand'];
        const fields = ['baptized', 'unbaptized', 'workers', 'retirees', 'business', 'farmers', 'unemployed', 'students', 'widows', 'total'];
        const membershipMatrix = {};

        categories.forEach(cat => {
            membershipMatrix[cat] = {};
            fields.forEach(f => {
                const val = formData.get(`q_mem_${cat}_${f}`);
                if (val !== null && val !== "") {
                    membershipMatrix[cat][f] = parseInt(val, 10) || 0;
                }
            });
        });

        // Extract Ministries Active/Revitalization Matrix (Section F)
        const ministries = [
            { key: 'men', name: 'Men Fellowship' },
            { key: 'women', name: 'Women Fellowship' },
            { key: 'youth', name: 'Youth Fellowship' },
            { key: 'children', name: 'Children\'s Ministry' },
            { key: 'sundayschool', name: 'Sunday School' },
            { key: 'evangelism', name: 'Evangelism' },
            { key: 'missions', name: 'Missions and Outreach Team' },
            { key: 'discipleship', name: 'Discipleship Ministry' },
            { key: 'media', name: 'Media Ministry' },
            { key: 'welfare', name: 'Welfare Team' },
            { key: 'education', name: 'Christian Education Leader' },
            { key: 'prayer', name: 'Prayer Band' }
        ];
        const ministriesMatrix = {};
        ministries.forEach(m => {
            ministriesMatrix[m.key] = {
                name: m.name,
                active: formData.get(`q_ministry_active_${m.key}`),
                revitalize: formData.get(`q_ministry_revitalize_${m.key}`)
            };
        });

        // Extract Properties and Assets Matrix (Section H)
        const assets = [
            { key: 'land', name: 'Land' },
            { key: 'buildings', name: 'Church building(s)' },
            { key: 'pastorism', name: 'Pastorium' },
            { key: 'vehicles', name: 'Vehicles' },
            { key: 'equipments', name: 'Equipments' },
            { key: 'furniture', name: 'Furniture(s)/fittings' },
            { key: 'ict', name: 'ICT Equipment' },
            { key: 'generator', name: 'Generator' }
        ];
        const propertiesMatrix = {};
        assets.forEach(a => {
            propertiesMatrix[a.key] = {
                name: a.name,
                has_asset: formData.get(`q_asset_has_${a.key}`),
                documented: formData.get(`q_asset_doc_${a.key}`),
                requires_registration: formData.get(`q_asset_reg_${a.key}`)
            };
        });
        // Handle custom Specify row
        const othersName = formData.get('q_asset_others_name') || 'Others';
        propertiesMatrix['others'] = {
            name: othersName,
            has_asset: formData.get('q_asset_has_others'),
            documented: formData.get('q_asset_doc_others'),
            requires_registration: formData.get('q_asset_reg_others')
        };

        // Extract Community Needs Checklist (Section J)
        const communityNeedsChecklist = {
            youth_development: formData.get('q_community_need_youth') === 'Yes',
            skill_acquisition: formData.get('q_community_need_skills') === 'Yes',
            healthcare_outreach: formData.get('q_community_need_healthcare') === 'Yes',
            educational_support: formData.get('q_community_need_education') === 'Yes',
            water_sanitation: formData.get('q_community_need_water') === 'Yes',
            peace_building: formData.get('q_community_need_peace') === 'Yes',
            evangelism: formData.get('q_community_need_evangelism') === 'Yes'
        };

        // Extract Priority Needs Timeline (Section K)
        const priorityNeedsTimeline = {
            immediate: formData.get('q_priority_need_immediate') === 'Yes',
            medium_term: formData.get('q_priority_need_medium') === 'Yes',
            long_term: formData.get('q_priority_need_long') === 'Yes'
        };

        const payload = {
            church_id: selectedChurch ? selectedChurch.id : parseInt(formChurchIdInput.value, 10),
            church_name: selectedChurch ? selectedChurch.displayName : "Unknown",
            timestamp: new Date().toISOString(),
            metadata: {
                user_agent: navigator.userAgent,
                screen_resolution: `${window.screen.width}x${window.screen.height}`
            },
            responses: {
                section_a: {
                    founded_year: formData.get('q_founded_year'),
                    constituted_year: formData.get('q_constituted_year'),
                    dcc_council: formData.get('q_dcc_council'),
                    mother_church: formData.get('q_mother_church'),
                    full_address: formData.get('q_full_address'),
                    community_lga: formData.get('q_community_lga'),
                    state: formData.get('q_state'),
                    current_pastor: formData.get('q_current_pastor'),
                    contact_phone: formData.get('q_contact_phone'),
                    contact_email: formData.get('q_contact_email'),
                    contact_social: formData.get('q_contact_social')
                },
                section_b: {
                    pioneer_members: formData.get('q_pioneer_members'),
                    pioneer_pastor: formData.get('q_pioneer_pastor'),
                    pioneer_board: formData.get('q_pioneer_board'),
                    church_history: formData.get('q_church_history'),
                    major_milestones: formData.get('q_major_milestones'),
                    history_lessons: formData.get('q_history_lessons')
                },
                section_c: {
                    pastoral_table: pastoralTableData,
                    notable_developments: formData.get('q_notable_developments'),
                    resident_pastor: formData.get('q_resident_pastor_c')
                },
                section_d: {
                    membership_matrix: membershipMatrix,
                    total_membership_abroad: formData.get('q_total_mem_abroad'),
                    current_membership_category: formData.get('q_current_mem_ex_abroad'),
                    baptized_last_year: formData.get('q_baptized_last_year'),
                    new_converts: formData.get('q_new_converts'),
                    attendance_trends: formData.get('q_attendance_trends')
                },
                section_e: {
                    board_members: formData.get('q_board_members'),
                    men_leader: formData.get('q_men_leader'),
                    women_leader: formData.get('q_women_leader'),
                    youth_leader: formData.get('q_youth_leader'),
                    positions_filled: formData.get('q_positions_filled'),
                    vacant_positions: formData.get('q_vacant_positions'),
                    leadership_training: formData.get('q_leadership_training')
                },
                section_f: {
                    ministries_matrix: ministriesMatrix,
                    greatest_impact: formData.get('q_ministry_impact')
                },
                section_g: {
                    outreaches_count: formData.get('q_outreaches_count'),
                    followup_process: formData.get('q_followup_process'),
                    church_planting_communities: formData.get('q_church_planting_communities')
                },
                section_h: {
                    properties_matrix: propertiesMatrix,
                    ongoing_disputes: formData.get('q_property_disputes'),
                    planned_projects: formData.get('q_infrastructure_projects'),
                    assets_needed: formData.get('q_properties_needed'),
                    acquired_property_use: formData.get('q_acquired_property_use'),
                    acquired_property_docs: formData.get('q_acquired_property_docs'),
                    dcc_has_copies: formData.get('q_dcc_has_copies'),
                    property_in_use: formData.get('q_property_in_use')
                },
                section_i: {
                    financial_sources: formData.get('q_financial_sources'),
                    financial_challenges: formData.get('q_financial_challenges'),
                    boost_income: formData.get('q_boost_income')
                },
                section_j: {
                    community_needs_desc: formData.get('q_community_needs_desc'),
                    community_response: formData.get('q_community_response'),
                    outreach_opportunities: formData.get('q_community_outreach_opps'),
                    community_demographics: formData.get('q_community_demographics'),
                    community_occupation: formData.get('q_community_occupation'),
                    needs_checklist: communityNeedsChecklist,
                    needs_others: formData.get('q_community_needs_others')
                },
                section_k: {
                    swot_strength_well: formData.get('q_swot_strength_well'),
                    swot_strength_thriving: formData.get('q_swot_strength_thriving'),
                    swot_strength_resources: formData.get('q_swot_strength_resources'),
                    swot_weakness_improvements: formData.get('q_swot_weakness_improvements'),
                    swot_weakness_lacking: formData.get('q_swot_weakness_lacking'),
                    swot_opportunities: formData.get('q_swot_opportunities'),
                    swot_threats: formData.get('q_swot_threats'),
                    priority_needs: priorityNeedsTimeline,
                    five_year_vision: formData.get('q_five_year_vision'),
                    prayer_requests: formData.get('q_prayer_requests')
                }
            }
        };

        // Save locally to browser local storage array
        try {
            const stored = JSON.parse(localStorage.getItem('church_survey_responses') || "[]");
            stored.push(payload);
            localStorage.setItem('church_survey_responses', JSON.stringify(stored));
        } catch (e) {
            console.warn('LocalStorage error:', e);
        }

        // Post to Webhook Endpoint if configured
        const endpoint = localStorage.getItem('church_survey_endpoint_url') || activeEndpointUrl;
        if (endpoint && endpoint.trim().length > 0) {
            fetch(endpoint, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(err => console.error('Endpoint post error:', err));
        }

        setTimeout(() => {
            nextStepBtn.disabled = false;
            showSuccessPage(selectedChurch, payload);
            resetSurveyState();
        }, 1000);
    }

    // ==========================================
    // NAVIGATION LINKS & GLOBAL ACTION BINDS
    // ==========================================
    
    navDirectoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showHomePage();
    });
    
    brandLogoLink.addEventListener('click', (e) => {
        e.preventDefault();
        showHomePage();
    });
    
    if (exitSurveyBtn) {
        exitSurveyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showHomePage();
        });
    }
    
    successHomeBtn.addEventListener('click', () => {
        showHomePage();
    });
    
    viewPayloadBtn.addEventListener('click', () => {
        if (payloadDrawer.style.display === 'none') {
            payloadDrawer.style.display = 'block';
            viewPayloadBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="18 15 12 9 6 15"/>
                </svg>
                Hide Submission Payload
            `;
            payloadDrawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            payloadDrawer.style.display = 'none';
            viewPayloadBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                </svg>
                Show Submission Payload (JSON)
            `;
        }
    });

    // ==========================================
    // APP INITIALIZATION RUN
    // ==========================================
    renderDirectory();
    router();
});

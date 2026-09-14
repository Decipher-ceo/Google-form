/**
 * Common Shared Functionality across all pages
 * - Theme Switcher (Dark / Light mode)
 * - Toast Notification System
 * - Endpoint / Webhook Modal Management
 * - Draft Save & Restore Utilities
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Switcher ---
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const currentTheme = localStorage.getItem('theme') || 'light';

    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // --- Endpoint Settings Modal ---
    const endpointBtn = document.getElementById('endpoint-settings-btn');
    const endpointModal = document.getElementById('endpoint-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const saveEndpointBtn = document.getElementById('save-endpoint-btn');
    const endpointUrlInput = document.getElementById('webhook-url-input');

    if (endpointBtn && endpointModal) {
        endpointBtn.addEventListener('click', () => {
            if (endpointUrlInput) {
                endpointUrlInput.value = localStorage.getItem('webhookEndpointUrl') || '';
            }
            endpointModal.classList.add('active');
        });
    }

    const closeModal = () => {
        if (endpointModal) endpointModal.classList.remove('active');
    };

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    if (saveEndpointBtn && endpointUrlInput) {
        saveEndpointBtn.addEventListener('click', () => {
            const url = endpointUrlInput.value.trim();
            if (url) {
                localStorage.setItem('webhookEndpointUrl', url);
                showToast('Endpoint URL saved successfully!', 'success');
            } else {
                localStorage.removeItem('webhookEndpointUrl');
                showToast('Endpoint reset to default browser storage.', 'info');
            }
            closeModal();
        });
    }
});

// Toast notification helper
function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

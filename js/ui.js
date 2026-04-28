/**
 * UI.JS — Sticky Banner, Exit Intent y Reemplazo de Enlaces
 */

function initStickyBanner() {
    const sticky = document.querySelector('.va-sticky-wrap');
    const closeBtn = document.getElementById('va-sticky-close');
    if (!sticky) return;

    let isClosed = false;
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sticky.style.display = 'none';
            isClosed = true;
        });
    }

    window.addEventListener('scroll', () => {
        if (isClosed) return;
        sticky.style.display = window.scrollY > 500 ? 'block' : 'none';
    }, { passive: true });
}

let exitIntentShown = false;
let exitTimerInterval = null;

function initExitIntent() {
    const modal = document.getElementById('va-exit-modal');
    if (!modal) return;

    document.addEventListener('mouseleave', (e) => {
        if (e.clientY < 0 && !exitIntentShown) openExitModal();
    });

    window.addEventListener('popstate', () => {
        if (!exitIntentShown) openExitModal();
    });
    history.pushState(null, null, window.location.pathname);
}

function openExitModal() {
    const modal = document.getElementById('va-exit-modal');
    if (!modal) return;
    modal.classList.add('active');
    exitIntentShown = true;
    startExitTimer(5);
}

function closeExitModal() {
    const modal = document.getElementById('va-exit-modal');
    if (modal) modal.classList.remove('active');
    if (exitTimerInterval) clearInterval(exitTimerInterval);
}

function startExitTimer(minutes) {
    let seconds = minutes * 60;
    const minEl = document.getElementById('exit-min');
    const secEl = document.getElementById('exit-sec');

    if (exitTimerInterval) clearInterval(exitTimerInterval);
    exitTimerInterval = setInterval(() => {
        seconds--;
        if (seconds < 0) { clearInterval(exitTimerInterval); return; }
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        if (minEl) minEl.textContent = String(m).padStart(2, '0');
        if (secEl) secEl.textContent = String(s).padStart(2, '0');
    }, 1000);
}

function handleExitCTA() {
    closeExitModal();
    if (window.openCODModal) window.openCODModal();
}

function interceptCheckoutLinks() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href="#checkout"], [data-open-checkout]');
        if (link) {
            e.preventDefault();
            if (window.openDecisionModal) window.openDecisionModal();
        }
    });
}

function initRoadmapV2() {
    console.log('Vertical Roadmap Active');
}

// Exponer globalmente
window.initStickyBanner = initStickyBanner;
window.initExitIntent = initExitIntent;
window.interceptCheckoutLinks = interceptCheckoutLinks;
window.initRoadmapV2 = initRoadmapV2;
window.closeExitModal = closeExitModal;
window.handleExitCTA = handleExitCTA;

/**
 * UI.JS — Sticky Banner, Exit Intent y Reemplazo de Enlaces
 */

function initStickyBanner() {
    const sticky = document.getElementById('va-sticky-bar');
    const closeBtn = document.getElementById('va-sticky-close');
    if (!sticky) return;

    let isClosed = false;
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sticky.style.display = 'none';
            isClosed = true;
        });
    }

    // Puntos de referencia
    const section2 = document.getElementById('section-17-problem-v2');
    const footer = document.getElementById('section-12-footer');

    function updateStickyPosition() {
        if (isClosed) return;

        const scrollY = window.scrollY;
        const s2Top = section2 ? section2.offsetTop : 800;
        const footerTop = footer ? footer.offsetTop : document.body.scrollHeight - 600;
        const viewportHeight = window.innerHeight;

        // Lógica de "Sándwich" dinámico
        if (scrollY > s2Top && (scrollY + viewportHeight) < footerTop) {
            // MODO: FIJO ABAJO
            sticky.classList.add('is-bottom');
            sticky.classList.remove('is-hidden');
        } else if ((scrollY + viewportHeight) >= footerTop) {
            // MODO: REGRESO A POSICIÓN ORIGINAL (ARRIBA)
            sticky.classList.remove('is-bottom');
            sticky.classList.remove('is-hidden');
        } else {
            // MODO: INICIO (ARRIBA)
            sticky.classList.remove('is-bottom');
            sticky.classList.remove('is-hidden');
        }
    }

    window.addEventListener('scroll', updateStickyPosition, { passive: true });
    window.addEventListener('resize', updateStickyPosition, { passive: true });
    updateStickyPosition(); // Ejecución inicial
}

let exitIntentShown = false;
let exitTimerInterval = null;

function initExitIntent() {
    const modal = document.getElementById('va-exit-modal');
    if (!modal) return;

    // Close on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeExitModal();
        }
    });

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

function initScrollGlow() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('glow-active');
            }
        });
    }, { threshold: 0.3, rootMargin: "0px 0px -100px 0px" });

    document.querySelectorAll('.glow-on-scroll').forEach(el => observer.observe(el));
}

function initThemeToggle() {
    const btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.className = 'va-theme-toggle';
    
    // Check initial state from html class (set by inline script)
    const isDark = document.documentElement.classList.contains('dark-theme');
    btn.innerHTML = isDark ? '☀️' : '🌙';
    
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark-theme');
        const darkActive = document.documentElement.classList.contains('dark-theme');
        localStorage.setItem('theme', darkActive ? 'dark' : 'light');
        btn.innerHTML = darkActive ? '☀️' : '🌙';
        
        // Animación de rotación
        btn.style.transform = 'scale(1.1) rotate(360deg)';
        setTimeout(() => btn.style.transform = 'scale(1) rotate(0)', 300);
    });
}

function initRoadmapV2() {
    initScrollGlow();
    // Iniciar theme toggle si no existe
    if (!document.getElementById('theme-toggle-btn')) {
        initThemeToggle();
    }
}

// Exponer globalmente
window.initStickyBanner = initStickyBanner;
window.initExitIntent = initExitIntent;
window.interceptCheckoutLinks = interceptCheckoutLinks;
window.initRoadmapV2 = initRoadmapV2;
window.initScrollGlow = initScrollGlow;
window.initThemeToggle = initThemeToggle;


window.closeExitModal = closeExitModal;
window.handleExitCTA = handleExitCTA;

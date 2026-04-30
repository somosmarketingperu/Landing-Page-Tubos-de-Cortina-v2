/**
 * SCROLL-FX.JS (v4.0 — Full Audit Fix)
 * 
 * FIXES:
 * - Cursor: simplified, no opacity hacks, always visible on desktop
 * - Progress bar: created BEFORE scroll handler references it
 * - Tilt: throttled properly
 * - All RAF loops: auto-stop when idle
 */

/* ─────────────────────────────────────────────
   1. SCROLL PROGRESS BAR (must init first)
   ───────────────────────────────────────────── */
function initScrollProgressBar() {
    if (document.getElementById('va-scroll-progress')) return;
    const bar = document.createElement('div');
    bar.id = 'va-scroll-progress';
    document.body.prepend(bar);
    console.log('Scroll Progress Bar: Active');
}

/* ─────────────────────────────────────────────
   2. HERO PARALLAX + TEXT SCRUBBING + PROGRESS
   ───────────────────────────────────────────── */
function initScrollEffects() {
    console.log('Scroll FX Engine v4.0: Active');
    const heroSection = document.getElementById('section-02-hero');
    const scrubTexts  = document.querySelectorAll('.scrub-text');

    let scrollTicking = false;

    function onScroll() {
        const scrollY = window.scrollY;

        // Parallax sutil del Hero
        if (heroSection) {
            const heroWrap = heroSection.querySelector('.va-hero, .va-hero-replica');
            if (heroWrap) heroWrap.style.transform = 'translateY(' + (scrollY * 0.12).toFixed(1) + 'px)';
        }

        // Scroll Progress Bar
        const bar = document.getElementById('va-scroll-progress');
        if (bar) {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            const pct  = docH > 0 ? (scrollY / docH) * 100 : 0;
            bar.style.width = pct.toFixed(1) + '%';
        }

        // Text Scrubbing
        if (scrubTexts.length) {
            const viewH = window.innerHeight;
            const start = viewH * 0.85;
            const end   = viewH * 0.4;
            scrubTexts.forEach(function(text) {
                var top      = text.getBoundingClientRect().top;
                var progress = Math.min(1, Math.max(0, (start - top) / (start - end)));
                text.style.setProperty('--scrub-progress', progress.toFixed(3));
            });
        }

        scrollTicking = false;
    }

    window.addEventListener('scroll', function() {
        if (!scrollTicking) {
            requestAnimationFrame(onScroll);
            scrollTicking = true;
        }
    }, { passive: true });

    onScroll();
}

/* ─────────────────────────────────────────────
   3. COUNT-UP
   ───────────────────────────────────────────── */
function initCountUp() {
    var targets = document.querySelectorAll('[data-countup]');
    if (!targets.length) return;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function animateCount(el) {
        var target = parseFloat(el.dataset.countup);
        var suffix = el.dataset.suffix || '';
        var prefix = el.dataset.prefix || '';
        var dur    = parseInt(el.dataset.dur, 10) || 1800;
        var dec    = el.dataset.dec ? parseInt(el.dataset.dec, 10) : 0;
        var start  = performance.now();

        function step(now) {
            var elapsed  = now - start;
            var progress = Math.min(elapsed / dur, 1);
            var val      = easeOut(progress) * target;
            el.textContent = prefix + val.toFixed(dec) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
            if (e.isIntersecting && !e.target.dataset.counted) {
                e.target.dataset.counted = '1';
                animateCount(e.target);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });

    targets.forEach(function(el) { obs.observe(el); });
    console.log('Count-Up: ' + targets.length + ' elementos');
}

/* ─────────────────────────────────────────────
   4. SOCIAL PROOF TOASTS (FOMO)
   ───────────────────────────────────────────── */
function initSocialProofToasts() {
    var data = [
        { name: 'Decoraciones Luna', city: 'Huancayo',    emoji: '🏠', action: 'acaba de pedir 15 cajas' },
        { name: 'Distribuidora S&M', city: 'Juliaca',     emoji: '📦', action: 'generó OC por 40 cajas' },
        { name: 'Multiservicios Hogar', city: 'Cusco',    emoji: '✅', action: 'acaba de confirmar su lote' },
        { name: 'Almacén de Cortinas', city: 'Piura',     emoji: '🛒', action: 'pidió envío por Shalom' },
        { name: 'Estilo & Diseño',   city: 'Trujillo',    emoji: '🚚', action: 'pidió 120 tubos para tienda' },
        { name: 'Bazar Anita',       city: 'Iquitos',     emoji: '✈️', action: 'pidió envío aéreo urgente' },
        { name: 'Sr. Huamán',       city: 'Puno',        emoji: '💰', action: 'hizo su 3er pedido mayorista' },
        { name: 'Hogar Confort SAC', city: 'Chimbote',    emoji: '⭐', action: 'ya está distribuyendo en Ancash' },
        { name: 'Comercial Tovar',   city: 'Tacna',       emoji: '📲', action: 'coordina envío a frontera' },
        { name: 'Cortinas & Más',    city: 'Arequipa',    emoji: '🔥', action: 'agotó stock en 3 días' },
    ];

    var container = document.getElementById('va-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'va-toast-container';
        document.body.appendChild(container);
    }

    var idx = 0;

    function showToast() {
        var activeModal = document.querySelector('#va-exit-modal.active, #cod-modal-backdrop.open, .dec-backdrop.open');
        if (activeModal) return;

        var d = data[idx % data.length];
        idx++;

        var toast = document.createElement('div');
        toast.className = 'va-toast';
        toast.innerHTML =
            '<div class="va-toast-avatar">' + d.emoji + '</div>' +
            '<div class="va-toast-text">' +
                '<span class="va-toast-name">' + d.name + ' — ' + d.city + '</span>' +
                '<span class="va-toast-action">' + d.action + '</span>' +
            '</div>' +
            '<div class="va-toast-dot"></div>';
        container.appendChild(toast);

        setTimeout(function() {
            toast.classList.add('toast-out');
            setTimeout(function() { toast.remove(); }, 450);
        }, 4000);
    }

    // 🕒 Cronograma de Intenciones de Compra:
    // 1. Primera intención: 30 segundos
    setTimeout(showToast, 30000);

    // 2. Segunda intención: 3 minutos
    setTimeout(showToast, 180000);

    // 3. Siguientes: Cada 5 minutos (contados desde la aparición de la primera a los 30s)
    // Esto significa que la tercera aparece a los 5m 30s, la cuarta a los 10m 30s, etc.
    setTimeout(function() {
        showToast();
        setInterval(showToast, 300000);
    }, 330000);

    console.log('Social Proof Toasts: Active');
}

/* ─────────────────────────────────────────────
   5. TILT 3D — Throttled, solo desktop
   ───────────────────────────────────────────── */
function initTiltEffect() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var cards = document.querySelectorAll('.va-arg-card, .va-auth-item, .va-prob-card');
    if (!cards.length) return;

    var MAX_TILT = 7;

    cards.forEach(function(card) {
        card.style.willChange = 'transform';
        var tiltPending = false;
        var lastE = null;

        card.addEventListener('mousemove', function(e) {
            lastE = e;
            if (!tiltPending) {
                tiltPending = true;
                requestAnimationFrame(function() {
                    if (!lastE) { tiltPending = false; return; }
                    var rect = card.getBoundingClientRect();
                    var cx = rect.left + rect.width / 2;
                    var cy = rect.top  + rect.height / 2;
                    var dx = (lastE.clientX - cx) / (rect.width / 2);
                    var dy = (lastE.clientY - cy) / (rect.height / 2);
                    card.style.transform  = 'perspective(700px) rotateX(' + (-dy * MAX_TILT).toFixed(2) + 'deg) rotateY(' + (dx * MAX_TILT).toFixed(2) + 'deg) scale(1.025)';
                    card.style.boxShadow  = (-dx * 10).toFixed(1) + 'px ' + (-dy * 6).toFixed(1) + 'px 28px rgba(200,130,100,0.2)';
                    card.style.transition = 'none';
                    tiltPending = false;
                });
            }
        }, { passive: true });

        card.addEventListener('mouseleave', function() {
            lastE = null;
            card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
            card.style.transform  = '';
            card.style.boxShadow  = '';
        });
    });

    console.log('Tilt Effect: ' + cards.length + ' tarjetas');
}

/* ─────────────────────────────────────────────
   6. CUSTOM CURSOR — Simplified, bulletproof
   
   PREVIOUS BUGS FIXED:
   - opacity hack with mouseleave/mouseenter caused invisible cursor on load
   - transform: translate(-50%,-50%) in CSS conflicted with JS positioning
   - Ring RAF loop ran infinitely even when idle
   
   THIS VERSION:
   - CSS: display:none by default, display:block in (hover:hover) media query
   - JS: creates elements, positions via left/top with manual centering offsets
   - No opacity toggles, no transform in CSS
   - Ring RAF auto-stops when caught up to mouse
   ───────────────────────────────────────────── */
function initCustomCursor() {
    // Only on real desktop with mouse
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var dot  = document.getElementById('va-cursor-dot');
    var ring = document.getElementById('va-cursor-ring');

    if (!dot) {
        dot = document.createElement('div');
        dot.id = 'va-cursor-dot';
        document.body.appendChild(dot);
    }
    if (!ring) {
        ring = document.createElement('div');
        ring.id = 'va-cursor-ring';
        document.body.appendChild(ring);
    }

    // Sizes for centering (must match CSS)
    var DOT_SIZE  = 8;
    var RING_SIZE = 34;

    // Aumentar z-index para estar sobre la cinemática (999999)
    if (dot) dot.style.zIndex = "1000000";
    if (ring) ring.style.zIndex = "1000000";

    var mouseX = 0, mouseY = 0;
    var ringX  = 0, ringY  = 0;
    var ringMoving = false;
    var hasMoved = false;

    // Solo ocultar si NO hay movimiento previo (evita parpadeos en re-init)
    if (!dot.style.left) dot.style.visibility = 'hidden';
    if (!ring.style.left) ring.style.visibility = 'hidden';

    // DOT: updates immediately on every mouse move
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Show on first move
        if (!hasMoved) {
            hasMoved = true;
            ringX = mouseX;
            ringY = mouseY;
            dot.style.visibility  = 'visible';
            ring.style.visibility = 'visible';
        }

        // Position dot centered on cursor
        dot.style.left = (mouseX - DOT_SIZE / 2) + 'px';
        dot.style.top  = (mouseY - DOT_SIZE / 2) + 'px';

        // Start ring animation if not already running
        if (!ringMoving) {
            ringMoving = true;
            requestAnimationFrame(tickRing);
        }
    });

    // RING: follows mouse with smooth lag via lerp
    function tickRing() {
        ringX += (mouseX - ringX) * 0.13;
        ringY += (mouseY - ringY) * 0.13;

        ring.style.left = (ringX - RING_SIZE / 2) + 'px';
        ring.style.top  = (ringY - RING_SIZE / 2) + 'px';

        var dist = Math.abs(mouseX - ringX) + Math.abs(mouseY - ringY);
        if (dist > 0.5) {
            requestAnimationFrame(tickRing);
        } else {
            // Snap to exact position and stop
            ring.style.left = (mouseX - RING_SIZE / 2) + 'px';
            ring.style.top  = (mouseY - RING_SIZE / 2) + 'px';
            ringMoving = false;
        }
    }

    // Expand ring on interactive elements
    var HOVER_SEL = 'a, button, [role="button"], .va-arg-card, .va-auth-item, .va-sticky-btn, .va-hero-cta-btn, .va-final-cta, .va-cta-shimmer, .va-calc-cta, .va-btn-primary, input[type="range"], .cod-qty-card, .cod-pay-btn';

    document.addEventListener('mouseover', function(e) {
        if (e.target.closest(HOVER_SEL)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', function(e) {
        if (e.target.closest(HOVER_SEL)) document.body.classList.remove('cursor-hover');
    });

    console.log('Custom Cursor: Active');
}

/* ─────────────────────────────────────────────
   7. SHIMMER — Apply to all CTAs
   ───────────────────────────────────────────── */
function initCTAShimmer() {
    var selectors = [
        '.va-hero-cta-btn',
        '.va-sticky-btn',
        '.va-exit-cta',
        '.va-final-cta',
        '.va-calc-cta',
        '.va-btn-primary',
        'a[href="#checkout"]',
        '[data-open-checkout]',
    ];
    var els = document.querySelectorAll(selectors.join(','));
    els.forEach(function(el) { el.classList.add('va-cta-shimmer'); });
    console.log('CTA Shimmer: ' + els.length + ' botones');
}

/* ─────────────────────────────────────────────
   8. CINEMATIC INTRO (ABYSS + GLASS SHATTER)
   ───────────────────────────────────────────── */
function initPreloader() {
    var cinematic = document.getElementById('cinematic-intro');
    if (!cinematic) return;

    // Bloquear scroll mientras se reproduce la cinemática
    document.body.style.overflow = 'hidden';

    // Calcular cuánto tiempo llevamos cargando la página
    var elapsed = performance.now();
    var targetTime = 6300; // 6.3 segundos de coreografía (5s intro + 0.8s shatter + margen)
    var remaining = Math.max(0, targetTime - elapsed);

    setTimeout(function() {
        // Desvanecer cinemática
        cinematic.classList.add('loaded');
        
        // Restaurar scroll
        document.body.style.overflow = '';
        
        // Retirar del DOM y apagar motor WebGL tras la transición (1.2s)
        setTimeout(function() {
            if (cinematic.parentNode) cinematic.parentNode.removeChild(cinematic);
            window.dispatchEvent(new Event('abyss-destroy')); // Libera memoria GPU
        }, 1200);
        
        console.log('Cinematic Intro: Completed');
    }, remaining);
}

/* ─────────────────────────────────────────────
   9. MAGNETIC BUTTONS — Desktop only
   Buttons subtly follow the cursor when hovering
   ───────────────────────────────────────────── */
function initMagneticButtons() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var selectors = [
        '.va-btn-primary',
        '.va-sticky-btn',
        '.va-final-cta',
        '.va-calc-cta',
        '.va-hero-cta-btn',
        '.va-flyer-cta-text',
        '.va-comp-seal',
    ];
    var btns = document.querySelectorAll(selectors.join(','));
    if (!btns.length) return;

    btns.forEach(function(btn) {
        btn.classList.add('va-magnetic');

        btn.addEventListener('mousemove', function(e) {
            var rect = btn.getBoundingClientRect();
            var x = e.clientX - rect.left - rect.width / 2;
            var y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = 'translate(' + (x * 0.2).toFixed(1) + 'px, ' + (y * 0.2).toFixed(1) + 'px)';
        }, { passive: true });

        btn.addEventListener('mouseleave', function() {
            btn.style.transform = '';
        });
    });

    console.log('Magnetic Buttons: ' + btns.length + ' botones');
}

/* ─────────────────────────────────────────────
   10. SCROLL-HIGHLIGHT LINES — Reveal text line-by-line
   ───────────────────────────────────────────── */
function initHighlightLines() {
    var lines = document.querySelectorAll('.va-highlight-line');
    if (!lines.length) return;

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('hl-active');
            }
        });
    }, { threshold: 0.6, rootMargin: '0px 0px -80px 0px' });

    lines.forEach(function(line) { observer.observe(line); });
    console.log('Highlight Lines: ' + lines.length + ' líneas');
}

/* ─────────────────────────────────────────────
   11. SECTION FADE TRANSITIONS
   Auto-applies gradient transitions between sections
   ───────────────────────────────────────────── */
function initSectionFades() {
    // Apply fade to sections that transition into a different-colored next section
    var fadeSections = document.querySelectorAll(
        '.va-hero, .va-solution-v2, .va-kit-replica, .va-profile-v2, .va-ba-v2, .va-test-v2, .va-flyer-final'
    );
    fadeSections.forEach(function(section) {
        section.classList.add('va-section-fade');
    });
    console.log('Section Fades: ' + fadeSections.length + ' transiciones');
}

/* ─────────────────────────────────────────────
   EXPORTS
   ───────────────────────────────────────────── */
window.initScrollEffects     = initScrollEffects;
window.initScrollProgressBar = initScrollProgressBar;
window.initCountUp           = initCountUp;
window.initSocialProofToasts = initSocialProofToasts;
window.initTiltEffect        = initTiltEffect;
window.initCustomCursor      = initCustomCursor;
window.initCTAShimmer        = initCTAShimmer;
window.initPreloader         = initPreloader;
window.initMagneticButtons   = initMagneticButtons;
window.initHighlightLines    = initHighlightLines;
window.initSectionFades      = initSectionFades;


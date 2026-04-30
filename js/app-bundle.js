/**
 * APP-BUNDLE.JS — Inicializador principal (v3.0)
 * Escucha 'sectionsLoaded' e inicializa TODOS los módulos,
 * incluyendo el motor de efectos premium.
 */

document.addEventListener('sectionsLoaded', () => {
    // ── BRANDING CORPORATIVO PREMIUM ──
    const bannerStyle = 'background: #1c1917; color: #c88264; padding: 15px 30px; border-radius: 12px; font-weight: 900; font-size: 16px; border: 2px solid #c88264; text-shadow: 0 0 10px rgba(200,130,100,0.5);';
    const tagStyle    = 'background: #c88264; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 10px;';
    const infoStyle   = 'color: #a8a29e; font-size: 11px; font-family: "Courier New", monospace;';
    const linkStyle   = 'color: #25d366; font-weight: bold; text-decoration: underline; font-size: 12px;';

    console.log('%c SOMOS MARKETING PERÚ E.I.R.L. ', bannerStyle);
    console.log('%c 🏛️ RUC: 20615554384 | 📍 Jr. Virrey Manuel Guirior 260, Magdalena del Mar, Lima ', infoStyle);
    console.log('%c 📞 +51 999 900 396 | 📧 contacto@somosmarketingperu.com ', infoStyle);
    console.log('%c © 2026 Todos los derechos reservados. ', 'color: #78716c; font-size: 10px;');
    
    console.log('%c------------------------------------------------------------------', 'color: #444;');
    
    console.log('%c MARKETING INTELLIGENCE ', tagStyle);
    console.log('  ↳ Conversion Engine: Optimized for B2B Distribution ✅');
    console.log('  ↳ SEO Strategy: High Indexability & Semantic Hierarchy 🚀');
    console.log('  ↳ Direct Contact: %chttps://wa.me/51999900396?text=Consulta%20desde%20Consola', linkStyle);

    console.log('%c ENGINEERING DEBUG ', tagStyle);
    console.log(`  ↳ Viewport: ${window.innerWidth}x${window.innerHeight}px`);
    console.log(`  ↳ Device Pixel Ratio: ${window.devicePixelRatio.toFixed(2)}`);
    console.log(`  ↳ Graphics: Three.js & GSAP Animation Engine v4.0`);

    console.log('%c------------------------------------------------------------------', 'color: #444;');
    
    // ── INTERACTION TRACKER (UX/MARKETING/GA) ──
    const trackInteraction = (label) => {
        // Log profesional en consola
        console.log(`%c[TRACKING] Interaction: ${label} %c| Time: ${new Date().toLocaleTimeString()}`, 'color: #c88264; font-weight: bold;', 'color: #78716c;');
        
        // ENVÍO A GOOGLE ANALYTICS (vía GTM DataLayer)
        if (window.dataLayer) {
            window.dataLayer.push({
                'event': 'ua_interaction',
                'event_category': 'Engagement',
                'event_action': 'Click',
                'event_label': label
            });
        }
    };

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, a.btn, .va-btn');
        if (btn) {
            const label = btn.innerText || btn.getAttribute('aria-label') || 'Action Button';
            trackInteraction(label.trim().substring(0, 30));
        }
    });

    console.log('🚀 APP-BUNDLE: Inicializando módulos...');

    const modules = [
        // ── PRELOADER: dismiss immediately ──
        { name: 'Preloader',           fn: () => typeof initPreloader         === 'function' && initPreloader()         },

        // ── MUST INIT FIRST: DOM elements needed by other modules ──
        { name: 'Scroll Progress Bar',   fn: () => typeof initScrollProgressBar  === 'function' && initScrollProgressBar()  },
        { name: 'Scroll Effects',        fn: () => typeof initScrollEffects      === 'function' && initScrollEffects()      },

        // ── Core UI ──
        { name: 'Modales (Decisión)',  fn: () => typeof initDecisionModal      === 'function' && initDecisionModal()      },
        { name: 'Modales (COD)',       fn: () => typeof initCODModal           === 'function' && initCODModal()           },
        { name: 'Interceptores',       fn: () => typeof interceptCheckoutLinks === 'function' && interceptCheckoutLinks() },
        { name: 'Calculadora',         fn: () => typeof initCalculator         === 'function' && initCalculator()         },
        { name: 'Sticky Banner',       fn: () => typeof initStickyBanner       === 'function' && initStickyBanner()       },
        { name: 'Exit Intent',         fn: () => typeof initExitIntent         === 'function' && initExitIntent()         },
        { name: 'Roadmap V2',          fn: () => typeof initRoadmapV2          === 'function' && initRoadmapV2()          },
        { name: 'Libro Reclamaciones', fn: () => typeof initClaimsForm         === 'function' && initClaimsForm()         },

        // ── PREMIUM ANIMATION ENGINE ──
        { name: 'CTA Shimmer',         fn: () => typeof initCTAShimmer         === 'function' && initCTAShimmer()         },
        { name: 'Count-Up Numbers',    fn: () => typeof initCountUp            === 'function' && initCountUp()            },
        { name: 'Social Proof Toasts', fn: () => typeof initSocialProofToasts  === 'function' && initSocialProofToasts()  },
        { name: 'Tilt 3D Cards',       fn: () => typeof initTiltEffect         === 'function' && initTiltEffect()         },
        { name: 'Custom Cursor',       fn: () => typeof initCustomCursor       === 'function' && initCustomCursor()       },
        { name: 'Magnetic Buttons',    fn: () => typeof initMagneticButtons    === 'function' && initMagneticButtons()    },
        { name: 'Highlight Lines',     fn: () => typeof initHighlightLines     === 'function' && initHighlightLines()     },
        { name: 'Section Fades',       fn: () => typeof initSectionFades       === 'function' && initSectionFades()       },
        { name: 'Abyss WebGL BG',      fn: () => typeof initAbyssBackground    === 'function' && initAbyssBackground()    },
    ];

    modules.forEach(m => {
        try {
            m.fn();
            console.log('  ✅ ' + m.name);
        } catch (err) {
            console.error('  ❌ ' + m.name + ':', err);
        }
    });

    console.log('%c------------------------------------------------------------------', infoStyle);
    console.log('✅ APP-BUNDLE: Listo.');
});


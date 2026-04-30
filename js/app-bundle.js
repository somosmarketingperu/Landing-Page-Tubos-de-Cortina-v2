/**
 * APP-BUNDLE.JS — Inicializador principal (v3.0)
 * Escucha 'sectionsLoaded' e inicializa TODOS los módulos,
 * incluyendo el motor de efectos premium.
 */

document.addEventListener('sectionsLoaded', () => {
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

    console.log('✅ APP-BUNDLE: Listo.');
});


/**
 * MAIN.JS — Iniciador Global (v3.0 — Fixed Init Order)
 * Escucha el evento 'sectionsLoaded' del loader.js e inicializa todos los módulos.
 */

document.addEventListener('sectionsLoaded', () => {
    console.log('🚀 Inicializando módulos Premium...');

    const modules = [
        // ── MUST INIT FIRST: DOM elements needed by other modules ──
        { name: 'Scroll Progress Bar',   init: () => typeof initScrollProgressBar  === 'function' && initScrollProgressBar()  },
        { name: 'Scroll Effects',        init: () => typeof initScrollEffects      === 'function' && initScrollEffects()      },

        // ── Core UI ──
        { name: 'Modales (Decisión)', init: () => typeof initDecisionModal   === 'function' && initDecisionModal()   },
        { name: 'Modales (COD)',      init: () => typeof initCODModal        === 'function' && initCODModal()        },
        { name: 'Interceptores',      init: () => typeof interceptCheckoutLinks === 'function' && interceptCheckoutLinks() },
        { name: 'Calculadora',        init: () => typeof initCalculator      === 'function' && initCalculator()      },
        { name: 'Sticky Banner',      init: () => typeof initStickyBanner    === 'function' && initStickyBanner()    },
        { name: 'Exit Intent',        init: () => typeof initExitIntent      === 'function' && initExitIntent()      },
        { name: 'Roadmap V2',         init: () => typeof initRoadmapV2       === 'function' && initRoadmapV2()       },

        // ── PREMIUM ANIMATION ENGINE ──
        { name: 'CTA Shimmer',           init: () => typeof initCTAShimmer         === 'function' && initCTAShimmer()         },
        { name: 'Count-Up Numbers',      init: () => typeof initCountUp            === 'function' && initCountUp()            },
        { name: 'Social Proof Toasts',   init: () => typeof initSocialProofToasts  === 'function' && initSocialProofToasts()  },
        { name: 'Tilt 3D Cards',         init: () => typeof initTiltEffect         === 'function' && initTiltEffect()         },
        { name: 'Custom Cursor',         init: () => typeof initCustomCursor       === 'function' && initCustomCursor()       },
        { name: 'Spiral Canvas BG',      init: () => typeof initSpiralBackground   === 'function' && initSpiralBackground()   },
    ];

    modules.forEach(m => {
        try {
            console.log('  ↳ ' + m.name);
            m.init();
        } catch (err) {
            console.error('❌ Error inicializando ' + m.name + ':', err);
        }
    });

    console.log('✅ Todos los módulos inicializados.');
});


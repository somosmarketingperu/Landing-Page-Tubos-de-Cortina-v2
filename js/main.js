/**
 * MAIN.JS — Iniciador Global (v3.0 — Fixed Init Order)
 * Escucha el evento 'sectionsLoaded' del loader.js e inicializa todos los módulos.
 */

document.addEventListener('sectionsLoaded', () => {
    // ── BRANDING PROFESIONAL EN CONSOLA ──
    const bannerStyle = 'background: #1c1917; color: #c88264; padding: 10px 20px; border-radius: 8px; font-weight: 900; font-size: 14px; border: 1px solid #c88264;';
    const infoStyle   = 'color: #78716c; font-size: 11px; font-family: monospace;';
    const successStyle = 'color: #10b981; font-weight: bold;';

    console.log('%c SOMOS MARKETING PERÚ | Premium Landing Engine v3.0 ', bannerStyle);
    console.log('%c🚀 Architecture: Modular v3.0 | Fonts: Montserrat & Poppins | Core: Three.js & GSAP', infoStyle);
    console.log('%c------------------------------------------------------------------', infoStyle);

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
            m.init();
            console.log(`%c  ✔ ${m.name.padEnd(25)} [READY]`, 'color: #c88264; font-size: 10px;');
        } catch (err) {
            console.error(`%c  ✘ Error inicializando ${m.name}:`, 'color: #ef4444; font-weight: bold;', err);
        }
    });

    console.log('%c------------------------------------------------------------------', infoStyle);
    console.log('%c✅ DESARROLLADO POR SOMOS MARKETING PERÚ | Todos los sistemas activos.', successStyle);
});


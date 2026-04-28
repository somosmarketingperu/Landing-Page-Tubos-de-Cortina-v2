/**
 * MAIN.JS — Iniciador Global (Robust Version)
 * Escucha el evento 'sectionsLoaded' del loader.js e inicializa los módulos.
 */

document.addEventListener('sectionsLoaded', () => {
    console.log('🚀 Inicializando módulos...');

    const modules = [
        { name: 'Modales (Decisión)', init: () => typeof initDecisionModal === 'function' && initDecisionModal() },
        { name: 'Modales (COD)',      init: () => typeof initCODModal      === 'function' && initCODModal()      },
        { name: 'Interceptores',      init: () => typeof interceptCheckoutLinks === 'function' && interceptCheckoutLinks() },
        { name: 'Calculadora',        init: () => typeof initCalculator    === 'function' && initCalculator()    },
        { name: 'Sticky Banner',      init: () => typeof initStickyBanner   === 'function' && initStickyBanner()  },
        { name: 'Exit Intent',        init: () => typeof initExitIntent     === 'function' && initExitIntent()    },
        { name: 'Roadmap V2',         init: () => typeof initRoadmapV2      === 'function' && initRoadmapV2()      }
    ];

    modules.forEach(m => {
        try {
            console.log(`- Cargando: ${m.name}...`);
            m.init();
        } catch (err) {
            console.error(`❌ Error inicializando ${m.name}:`, err);
        }
    });

    console.log('✅ Proceso de inicialización finalizado.');
});

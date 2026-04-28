/**
 * APP-BUNDLE.JS — Inicializador principal
 * Escucha 'sectionsLoaded' e inicializa todos los módulos.
 */

document.addEventListener('sectionsLoaded', () => {
    console.log('🚀 APP-BUNDLE: Inicializando módulos...');

    const modules = [
        { name: 'Modales (Decisión)',  fn: () => typeof initDecisionModal      === 'function' && initDecisionModal()      },
        { name: 'Modales (COD)',       fn: () => typeof initCODModal           === 'function' && initCODModal()           },
        { name: 'Interceptores',       fn: () => typeof interceptCheckoutLinks === 'function' && interceptCheckoutLinks() },
        { name: 'Calculadora',         fn: () => typeof initCalculator         === 'function' && initCalculator()         },
        { name: 'Sticky Banner',       fn: () => typeof initStickyBanner       === 'function' && initStickyBanner()       },
        { name: 'Exit Intent',         fn: () => typeof initExitIntent         === 'function' && initExitIntent()         },
        { name: 'Roadmap V2',          fn: () => typeof initRoadmapV2          === 'function' && initRoadmapV2()          },
    ];

    modules.forEach(m => {
        try {
            m.fn();
            console.log(`✅ ${m.name}`);
        } catch (err) {
            console.error(`❌ Error en ${m.name}:`, err);
        }
    });

    console.log('✅ APP-BUNDLE: Listo.');
});

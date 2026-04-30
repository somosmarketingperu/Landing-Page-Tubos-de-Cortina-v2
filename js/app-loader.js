/**
 * SECTION LOADER (v2.2)
 * Carga los 17 módulos de contenido + 1 modal global (13-checkout)
 * El modal se inyecta directamente en body (position:fixed, z-index alto)
 */

const SECTIONS = [
    '16-sticky',
    '01-header',
    '02-hero',            // 1. PROMESA DE VALOR
    '17-problem-v2',      // 2. PROBLEMA (consciencia)
    '14-solucion',         // 2.5 ALIVIO EMOCIONAL (beneficios directos)
    '14-solucion-v2',     // 3. SOLUCIÓN TÉCNICA (ingeniería)
    '05-kit-v2',          // 4. PRODUCTO / OFERTA (consciencia)
    '03-calc-v2',         // 5. CALCULADORA — cuánto gana (aquí el cerebro quiere números)
    '07-args-v2',         // 6. BENEFICIOS
    '18-before-after-v2', // 7. ANTES / DESPUÉS del producto
    '04-profile-v2',      // 8. SEGMENTACIÓN — para quién es
    '07b-business-trend',  // 8.5 TENDENCIA NEGOCIOS (infografía técnica)
    '06-auth-v2',         // 9. AUTORIDAD — 30 años Ricmar, RUC 20
    '15-roadmap-v2',      // 10. PROCESO DE COMPRA — cómo funciona el 20/80
    '08-comp',            // 11. COMPARATIVA — vs competencia local
    '09-table',           // 12. TABLA DE PRECIOS — niveles de inversión
    '10-test-v2',         // 13. PRUEBA SOCIAL / TESTIMONIOS
    '11-flyer-v2',        // 14. CTA FINAL
    '12-footer',
    '21-legal',

    // --- SECCIONES DESACTIVADAS (código intacto, no se cargan) ---
    // '17-problem',       // duplicado de 17-problem-v2
    // '14-solucion',      // duplicado de 14-solucion-v2
    // '07-args',          // duplicado de 07-args-v2
    // '18-before-after',  // duplicado de 18-before-after-v2
    // '04-profile',       // duplicado de 04-profile-v2
    // '06-auth',          // duplicado de 06-auth-v2
    // '15-roadmap',       // duplicado de 15-roadmap-v2
    // '05-kit',           // duplicado de 05-kit-v2
    // '09-table-v2',      // duplicado de 09-table
    // '10-test',          // duplicado de 10-test-v2
    // '11-flyer',         // duplicado de 11-flyer-v2
    // '02-hero-v2',       // versión alternativa del hero
];

/**
 * Carga el modal de checkout globalmente, fuera del flujo de secciones.
 * Lo inyecta directamente en <body> para que position:fixed funcione correctamente.
 */
async function loadModal() {
    try {
        // CSS del modal
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'sections/13-checkout/style.css?v=4.1';
        document.head.appendChild(link);

        // HTML del modal → directo en body
        const response = await fetch('sections/13-checkout/content.html?v=4.1');
        if (response.ok) {
            const html = await response.text();
            const wrapper = document.createElement('div');
            wrapper.id = 'section-13-checkout';
            wrapper.innerHTML = html;
            document.body.appendChild(wrapper);
        } else {
            console.warn('[Loader] No se pudo cargar el modal 13-checkout');
        }
    } catch (error) {
        console.error('[Loader] Error cargando modal:', error);
    }
}

/**
 * Carga el modal de intención de salida
 */
async function loadExitIntent() {
    try {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'sections/19-exit-intent/style.css?v=4.1';
        document.head.appendChild(link);

        const response = await fetch('sections/19-exit-intent/content.html?v=4.1');
        if (response.ok) {
            const html = await response.text();
            const wrapper = document.createElement('div');
            wrapper.id = 'section-19-exit-intent';
            wrapper.innerHTML = html;
            document.body.appendChild(wrapper);
        }
    } catch (error) {
        console.error('[Loader] Error cargando exit-intent:', error);
    }
}

async function loadSections() {
    const container = document.getElementById('main-content');
    if (!container) return;

    try {
        // 1. Cargar modales globales
        await loadModal();
        await loadExitIntent();

        // 2. Cargar secciones de contenido
        for (const section of SECTIONS) {
            try {
                const sectionWrapper = document.createElement('div');
                sectionWrapper.id = `section-${section}`;
                container.appendChild(sectionWrapper);

                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = `sections/${section}/style.css?v=4.1`;
                document.head.appendChild(link);

                const response = await fetch(`sections/${section}/content.html?v=4.1`);
                if (response.ok) {
                    const html = await response.text();
                    sectionWrapper.innerHTML = html;
                } else {
                    console.warn(`[Loader] Sección no encontrada: ${section}`);
                }
            } catch (error) {
                console.error(`[Loader] Error en sección ${section}:`, error);
            }
        }
    } catch (error) {
        console.error('[Loader] Fatal error during loadSections:', error);
    } finally {
        console.log('%c[SYSTEM] Dispatching sectionsLoaded event...', 'color: #c88264; font-weight: bold;');
        document.dispatchEvent(new CustomEvent('sectionsLoaded'));
        // NOTE: initScrollEffects is now called from main.js in correct order
        // (after progress bar DOM element is created)
    }
}

document.addEventListener('DOMContentLoaded', loadSections);


/**
 * SECTION LOADER (v2.2)
 * Carga los 17 módulos de contenido + 1 modal global (13-checkout)
 * El modal se inyecta directamente en body (position:fixed, z-index alto)
 */

const SECTIONS = [
    '16-sticky',
    '01-header',
    '02-hero',           // Promesa de Valor
    '17-problem',        // Niveles de Consciencia: PROBLEMA
    '14-solucion',       // Niveles de Consciencia: SOLUCIÓN
    '07-args',           // Beneficios
    '18-before-after',   // Confianza / Transformación
    '04-profile',        // Segmentación
    '06-auth',           // Autoridad
    '15-roadmap',        // Logística B2B
    '05-kit',            // Oferta Detallada
    '03-calc',           // Calculadora de Ganancia
    '08-comp',           // Comparativa Retail
    '09-table',          // Tabla de Volumen
    '10-test',           // Prueba Social
    '11-flyer',          // Cierre / Flyer
    '12-footer'
    // '13-checkout' se carga como modal global (ver loadModal)
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
        link.href = 'sections/13-checkout/style.css';
        document.head.appendChild(link);

        // HTML del modal → directo en body
        const response = await fetch('sections/13-checkout/content.html');
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

async function loadSections() {
    const container = document.getElementById('main-content');
    if (!container) return;

    // 1. Cargar el modal primero (necesita estar en el DOM antes que sectionsLoaded)
    await loadModal();

    // 2. Cargar secciones de contenido
    for (const section of SECTIONS) {
        try {
            const sectionWrapper = document.createElement('div');
            sectionWrapper.id = `section-${section}`;
            container.appendChild(sectionWrapper);

            // CSS de la sección (en paralelo con el fetch del HTML)
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `sections/${section}/style.css`;
            document.head.appendChild(link);

            // HTML de la sección
            const response = await fetch(`sections/${section}/content.html`);
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

    // 3. Notificar que todo el DOM está listo
    document.dispatchEvent(new CustomEvent('sectionsLoaded'));
}

document.addEventListener('DOMContentLoaded', loadSections);

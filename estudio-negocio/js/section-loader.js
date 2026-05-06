const SECTIONS = [
    '01-portada',
    '03-body',
    '15-referencias'
];

async function loadSections() {
    const container = document.getElementById('sections-container');
    if (!container) return;

    for (const section of SECTIONS) {
        try {
            const sectionWrapper = document.createElement('div');
            sectionWrapper.id = `section-${section}`;
            container.appendChild(sectionWrapper);

            // Load CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = `sections/${section}/style.css`;
            document.head.appendChild(link);

            // Fetch content
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

    console.log('[Loader] Todas las secciones cargadas.');
    document.dispatchEvent(new CustomEvent('sectionsLoaded'));
}

window.addEventListener('DOMContentLoaded', loadSections);

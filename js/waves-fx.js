/**
 * WAVES-FX.JS — Versión Modular (CSS Variables)
 */
(function() {
    class WavesFX {
        constructor(container) {
            this.container = container;
            this.sourceText = container.querySelector('.waves-h1')?.textContent.trim() || "";
            if (!this.sourceText) return;
            this.init();
        }

        init() {
            // Limpiar y construir estructura
            this.container.innerHTML = `<div class="waves-header">${this.sourceText.split('').map((char, i) => `
                <span class="waves-letter ${char === ' ' ? 'is-space' : ''}" style="--idx: ${i}">
                    <span class="l-main">${char}</span>
                    <span class="l-copy c-1" aria-hidden="true">${char}</span>
                    <span class="l-copy c-2" aria-hidden="true">${char}</span>
                    <span class="l-copy c-3" aria-hidden="true">${char}</span>
                    <span class="l-copy c-4" aria-hidden="true">${char}</span>
                </span>`).join('')}</div>`;

            this.container.setAttribute('data-initialized', 'true');
            
            // Mouse Tracking (Solo actualiza variables CSS)
            document.addEventListener('mousemove', (e) => this.update(e));
            
            // Efecto de respiración automático (idle)
            this.idle();
        }

        update(e) {
            const rect = this.container.getBoundingClientRect();
            // Normalizar de -1 a 1
            const x = (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
            const y = (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
            
            this.container.style.setProperty('--mx', x.toFixed(3));
            this.container.style.setProperty('--my', y.toFixed(3));
        }

        idle() {
            let t = 0;
            const loop = () => {
                if (this.container.style.getPropertyValue('--mx') === '') {
                    const x = Math.sin(t / 50) * 0.2;
                    const y = Math.cos(t / 50) * 0.1;
                    this.container.style.setProperty('--mx', x.toFixed(3));
                    this.container.style.setProperty('--my', y.toFixed(3));
                }
                t++;
                requestAnimationFrame(loop);
            };
            // loop(); // Opcional: activar si quieres movimiento sin mouse
        }
    }

    function initWaves() {
        document.querySelectorAll('.waves-container').forEach(el => {
            if (!el.hasAttribute('data-initialized')) new WavesFX(el);
        });
    }

    document.addEventListener('sectionsLoaded', initWaves);
    if (document.readyState === 'complete') setTimeout(initWaves, 500);
    else window.addEventListener('load', initWaves);
})();




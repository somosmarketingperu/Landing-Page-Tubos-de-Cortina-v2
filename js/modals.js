/**
 * MODALS.JS — Control de Modales (Decisión e Intercepción)
 */

function initDecisionModal() {
    const backdrop = document.getElementById('decision-modal-backdrop');
    if (!backdrop) return;

    // Cerrar
    const closeBtn = document.getElementById('dec-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDecisionModal);
    }
    
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeDecisionModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.classList.contains('open')) closeDecisionModal();
    });

    // Opción A: Pedido online → abrir checkout
    const orderBtn = document.getElementById('dec-btn-order');
    if (orderBtn) {
        orderBtn.addEventListener('click', () => {
            closeDecisionModal();
            openCODModal();
        });
    }

    // Opción B: WhatsApp
    const wspBtn = document.getElementById('dec-btn-wsp');
    if (wspBtn) {
        wspBtn.addEventListener('click', () => {
            closeDecisionModal();
            const msg = encodeURIComponent('Hola! Quisiera más información sobre los Kits de Tubo de Cortina Extensibles (hasta 3m) con acabado Rejilla Elegante para distribuir en mi ciudad. ¿Cuál es el precio por caja y qué incluye el envío?');
            window.open(`https://wa.me/${WA_EMPRESA}?text=${msg}`, '_blank');
        });
    }
}

function openDecisionModal() {
    const backdrop = document.getElementById('decision-modal-backdrop');
    if (!backdrop) return;
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeDecisionModal() {
    const backdrop = document.getElementById('decision-modal-backdrop');
    if (!backdrop) return;
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
}

// Exponer globalmente
window.initDecisionModal = initDecisionModal;
window.openDecisionModal = openDecisionModal;
window.closeDecisionModal = closeDecisionModal;

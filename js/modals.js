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

/**
 * LEGAL MODALS LOGIC
 */
function openLegalModal(type) {
    const modal = document.getElementById(`legal-${type}-modal`);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLegalModal(type) {
    const modal = document.getElementById(`legal-${type}-modal`);
    if (modal) {
        modal.classList.remove('active');
        // Only restore overflow if no other big modal is open
        const codModal = document.getElementById('cod-modal-backdrop');
        if (!codModal || !codModal.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    }
}

// Cerrar modales legales con clic fuera o Escape
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('legal-modal-backdrop')) {
        e.target.classList.remove('active');
        const codModal = document.getElementById('cod-modal-backdrop');
        if (!codModal || !codModal.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    }
});

window.openLegalModal = openLegalModal;
window.closeLegalModal = closeLegalModal;

/**
 * CLAIMS FORM SUBMISSION
 */
function initClaimsForm() {
    const form = document.getElementById('claims-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('.claims-submit');
        const originalText = btn.textContent;
        
        btn.disabled = true;
        btn.textContent = '⏳ PROCESANDO...';

        const formData = {
            secretKey: APPS_SECRET_KEY,
            type: 'claim',
            nombre: form.querySelector('input[placeholder="Ej: Juan Pérez"]').value,
            documento: form.querySelector('input[placeholder="Número de documento"]').value,
            telefono: form.querySelector('input[placeholder="9XXXXXXXX"]').value,
            email: form.querySelector('input[placeholder="tu@correo.com"]').value,
            tipoBien: form.querySelector('select').value,
            detalle: form.querySelector('textarea').value
        };

        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Apps Script requiere no-cors o redirección
            body: JSON.stringify(formData)
        })
        .then(() => {
            form.innerHTML = `
                <div style="text-align:center; padding: 40px 20px;">
                    <div style="font-size: 50px; margin-bottom: 20px;">✅</div>
                    <h3 style="color:var(--dark); margin-bottom:10px;">¡RECLAMACIÓN REGISTRADA!</h3>
                    <p style="font-size:14px; color:#666; line-height:1.6;">
                        Hemos recibido tu solicitud. Te hemos enviado una copia en PDF a <strong>${formData.email}</strong>.<br><br>
                        Un asesor revisará el caso y te responderá en un plazo máximo de 15 días hábiles.
                    </p>
                    <button onclick="closeLegalModal('claims')" class="claims-submit" style="margin-top:20px; width:100%;">CERRAR</button>
                </div>
            `;
        })
        .catch(err => {
            console.error('Error enviando reclamación:', err);
            btn.disabled = false;
            btn.textContent = '❌ ERROR AL ENVIAR. REINTENTAR';
        });
    });
}
window.initClaimsForm = initClaimsForm;

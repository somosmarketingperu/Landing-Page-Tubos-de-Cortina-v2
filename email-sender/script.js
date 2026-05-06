const CONFIG = {
    URL: 'https://script.google.com/macros/s/AKfycbwvlNkBzNsNgeqIa1-4PtDId191IV80Kad5-BDFAlT0mIU6cxP-MYfscd3HFEfGzLeL/exec',
    KEY: 'TCP2026-SOMOS-MKT-PERÜ-SECURE-8f3k9'
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('email-form');
    const sendBtn = document.getElementById('send-btn');
    const loader = document.getElementById('loader');
    
    // Preview Logic
    const nameInput = document.getElementById('client-name');
    const msgInput = document.getElementById('message-context');
    const previewName = document.getElementById('preview-name');
    const previewMsg = document.getElementById('preview-msg');

    nameInput.addEventListener('input', (e) => {
        previewName.textContent = e.target.value || '[Nombre Cliente]';
    });

    msgInput.addEventListener('input', (e) => {
        previewMsg.textContent = e.target.value || 'Es un placer saludarte. Adjuntamos la información estratégica solicitada...';
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            secretKey: CONFIG.KEY,
            type: 'custom_info', // Nuevo tipo para el script
            email: document.getElementById('dest-email').value,
            nombre: document.getElementById('client-name').value,
            mensaje: document.getElementById('message-context').value,
            infoType: document.querySelector('input[name="info-type"]:checked').value
        };

        try {
            setLoading(true);
            
            const response = await fetch(CONFIG.URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Dossier enviado con éxito a ' + data.email);
                form.reset();
                resetPreview();
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Error al enviar: ' + error.message);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        sendBtn.disabled = isLoading;
        loader.style.display = isLoading ? 'inline-block' : 'none';
        sendBtn.querySelector('span').textContent = isLoading ? 'ENVIANDO...' : '🚀 ENVIAR DOSSIER PREMIUM';
    }

    function resetPreview() {
        previewName.textContent = '[Nombre Cliente]';
        previewMsg.textContent = 'Es un placer saludarte. Adjuntamos la información estratégica solicitada...';
    }
});

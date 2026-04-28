/**
 * CHECKOUT.JS — Lógica del Modal de Pedido (3 Pasos)
 */

function initCODModal() {
    const backdrop = document.getElementById('cod-modal-backdrop');
    if (!backdrop) return;

    document.getElementById('cod-close-btn').addEventListener('click', closeCODModal);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeCODModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.classList.contains('open')) closeCODModal();
    });

    document.getElementById('cod-next-1').addEventListener('click', () => goToStep(2));
    document.getElementById('cod-next-2').addEventListener('click', () => { if (validateStep2()) goToStep(3); });
    document.getElementById('cod-back-2').addEventListener('click', () => goToStep(1));
    document.getElementById('cod-back-3').addEventListener('click', () => goToStep(2));

    document.getElementById('cod-pay-transfer').addEventListener('click', () => setPaymentMode('transfer'));
    document.getElementById('cod-pay-cod').addEventListener('click',      () => setPaymentMode('cod'));
    document.getElementById('cod-pay-recojo').addEventListener('click',   () => setPaymentMode('recojo'));

    document.querySelectorAll('.cod-qty-radio').forEach(radio => {
        radio.addEventListener('change', () => {
            state.cajas = parseInt(radio.value, 10);
            document.getElementById('cod-custom-cajas').value = '';
            // Actualizar clase selected en tarjetas
            document.querySelectorAll('.cod-qty-card').forEach(card => card.classList.remove('selected'));
            radio.closest('.cod-qty-card').classList.add('selected');
            updatePriceSummary();
        });
    });

    const customInput = document.getElementById('cod-custom-cajas');
    document.getElementById('cod-qty-minus').addEventListener('click', () => {
        const v = Math.max(1, (parseInt(customInput.value, 10) || 1) - 1);
        customInput.value = v;
        setCustomQty(v);
    });
    document.getElementById('cod-qty-plus').addEventListener('click', () => {
        const v = Math.min(100, (parseInt(customInput.value, 10) || 0) + 1);
        customInput.value = v;
        setCustomQty(v);
    });
    customInput.addEventListener('input', () => {
        const v = parseInt(customInput.value, 10);
        if (!isNaN(v) && v >= 1) setCustomQty(v);
    });

    document.getElementById('cod-departamento').addEventListener('change', (e) => {
        populateAgencias(e.target.value);
    });

    document.getElementById('cod-recog-yo').addEventListener('change', () => {
        state.recogedorEsYo = true;
        document.getElementById('cod-recog-fields').style.display = 'none';
    });
    document.getElementById('cod-recog-otro').addEventListener('change', () => {
        state.recogedorEsYo = false;
        document.getElementById('cod-recog-fields').style.display = 'block';
    });

    document.getElementById('cod-toggle-boleta').addEventListener('click', () => setComprobanteType('boleta'));
    document.getElementById('cod-toggle-factura').addEventListener('click', () => setComprobanteType('factura'));

    document.getElementById('cod-confirm-btn').addEventListener('click', handleConfirm);
    document.getElementById('cod-pdf-btn').addEventListener('click', generatePDF);
    document.getElementById('cod-email-btn').addEventListener('click', handleEmailResend);

    renderAlmacenes();
    setPaymentMode('transfer', true);

    // Marcar tarjeta por defecto como seleccionada
    const defaultRadio = document.querySelector('.cod-qty-radio:checked');
    if (defaultRadio) defaultRadio.closest('.cod-qty-card').classList.add('selected');
}

function openCODModal() {
    const backdrop = document.getElementById('cod-modal-backdrop');
    if (!backdrop) return;
    goToStep(1, true);
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCODModal() {
    const backdrop = document.getElementById('cod-modal-backdrop');
    if (!backdrop) return;
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
}

function goToStep(step, silent = false) {
    state.currentStep = step;
    document.querySelectorAll('.cod-step-content').forEach(el => el.classList.remove('active'));
    document.getElementById('cod-step-' + step).classList.add('active');
    updateProgressUI(step);
    if (step === 3) syncFinalSummary();
    if (!silent) { const b = document.querySelector('.cod-body'); if (b) b.scrollTop = 0; }
}

function updateProgressUI(step) {
    const fills = { 1: '16.6%', 2: '50%', 3: '90%' };
    document.getElementById('cod-progress-fill').style.width = fills[step] || '16.6%';
    [1, 2, 3].forEach(i => {
        const lbl = document.getElementById('cod-lbl-' + i);
        const dot = document.getElementById('cod-dot-' + i);
        lbl.classList.remove('active', 'done');
        if (i < step)  { lbl.classList.add('done');   dot.textContent = '✓'; }
        if (i === step){ lbl.classList.add('active');  dot.textContent = String(i); }
        if (i > step)  { dot.textContent = String(i); }
    });
}

function setPaymentMode(mode, silent = false) {
    state.shippingMode = mode;

    document.getElementById('cod-pay-transfer').classList.toggle('active', mode === 'transfer');
    document.getElementById('cod-pay-cod').classList.toggle('active', mode === 'cod');
    document.getElementById('cod-pay-recojo').classList.toggle('active', mode === 'recojo');

    const anchorBar = document.getElementById('cod-anchor-bar');
    if (anchorBar) {
        if (mode === 'transfer') {
            anchorBar.className = 'cod-price-anchor-bar';
            anchorBar.innerHTML = '<span>✅ Con transferencia pagas <strong>S/. 27 exacto</strong> por tubo. Envío gratis.</span>';
        } else if (mode === 'cod') {
            anchorBar.className = 'cod-price-anchor-bar warning';
            anchorBar.innerHTML = '<span>⚠️ Contra entrega: <strong>Adelanto 20%</strong> para alistar · Pagas el <strong>80% restante en Agencia Shalom destino</strong>.</span>';
        } else {
            anchorBar.className = 'cod-price-anchor-bar warning';
            anchorBar.innerHTML = '<span>🏢 Recojo en Almacén Lima: <strong>Adelanto 20%</strong> para activar pedido · Paga el 80% al recoger · Solo con coordinación previa.</span>';
        }
    }

    const bankData = document.getElementById('cod-bank-data');
    if (bankData) bankData.style.display = (mode !== 'recojo') ? 'block' : 'none';

    const fleteRow = document.getElementById('cod-flete-row');
    const adRow    = document.getElementById('cod-adelanto-row');
    const saRow    = document.getElementById('cod-saldo-row');
    if (fleteRow) fleteRow.style.display = (mode === 'cod') ? 'flex' : 'none';
    if (adRow)    adRow.style.display    = (mode === 'cod') ? 'flex' : 'none';
    if (saRow)    saRow.style.display    = (mode === 'cod') ? 'flex' : 'none';

    const shalomWrap = document.getElementById('cod-shipping-shalom');
    const recWrap    = document.getElementById('cod-shipping-recojo');
    if (shalomWrap) shalomWrap.style.display = (mode !== 'recojo') ? 'block' : 'none';
    if (recWrap)    recWrap.style.display    = (mode === 'recojo') ? 'block' : 'none';

    if (!silent) updatePriceSummary();
}

function updatePriceSummary() {
    const ord = calculateOrder(state.cajas, state.shippingMode);
    
    const subtotalEl = document.getElementById('cod-sum-subtotal');
    if (subtotalEl) subtotalEl.textContent = 'S/. ' + fmt(ord.subtotal);

    // Actualizar label de precio por tubo dinámicamente
    const unitsLabel = document.getElementById('cod-sum-units-label');
    if (unitsLabel) unitsLabel.textContent = ord.tubos + ' tubos × S/. ' + ord.precioUnit.toFixed(2);

    const fleteEl = document.getElementById('cod-sum-flete');
    if (fleteEl) fleteEl.textContent = ord.flete > 0 ? 'S/. ' + fmt(ord.flete) : 'GRATIS ✅';

    document.getElementById('cod-sum-total').textContent      = 'S/. ' + fmt(ord.total);
    document.getElementById('cod-sum-unit-price').textContent = 'S/. ' + ord.unitCost.toFixed(2);
    document.getElementById('cod-sum-profit').textContent     = 'S/. ' + fmt(ord.profitMin) + ' – S/. ' + fmt(ord.profitMax);

    const adEl = document.getElementById('cod-sum-adelanto');
    const saEl = document.getElementById('cod-sum-saldo');
    if (adEl) adEl.textContent = 'S/. ' + fmt(ord.adelanto);
    if (saEl) saEl.textContent = 'S/. ' + fmt(ord.saldo);

    // Mostrar badge de descuento si aplica
    const discountBadge = document.getElementById('cod-discount-badge');
    if (discountBadge) {
        if (ord.precioUnit < 27) {
            discountBadge.textContent = '🎉 Precio especial: S/. ' + ord.precioUnit.toFixed(2) + '/tubo (' + getTierLabel(state.cajas) + ')';
            discountBadge.style.display = 'block';
        } else {
            discountBadge.style.display = 'none';
        }
    }
}

function renderAlmacenes() {
    const list = document.getElementById('cod-almacenes-list');
    if (!list) return;
    list.innerHTML = '';
    ALMACENES_LIMA.forEach(function(addr, idx) {
        const item = document.createElement('div');
        item.className = 'cod-almacen-item' + (state.almacenIndex === idx ? ' active' : '');
        item.innerHTML =
            '<input type="radio" name="almacen-choice" class="cod-almacen-radio"' + (state.almacenIndex === idx ? ' checked' : '') + '>' +
            '<div class="cod-almacen-info">' +
                '<span class="cod-almacen-name">ALMACÉN ' + (idx + 1) + '</span>' +
                '<span class="cod-almacen-addr">' + addr + '</span>' +
            '</div>';
        item.onclick = function() {
            state.almacenIndex = idx;
            renderAlmacenes();
        };
        list.appendChild(item);
    });
}

function setCustomQty(cajas) {
    state.cajas = cajas;
    document.querySelectorAll('.cod-qty-radio').forEach(function(r) { r.checked = false; });
    updatePriceSummary();
}

function populateAgencias(dept) {
    const agenciaSelect = document.getElementById('cod-agencia');
    agenciaSelect.innerHTML = '';
    if (!dept) {
        agenciaSelect.innerHTML = '<option value="">— Primero selecciona el departamento —</option>';
        agenciaSelect.disabled = true;
        return;
    }
    const agencias = SHALOM_AGENCIAS[dept] || [];
    if (agencias.length === 0) {
        agenciaSelect.innerHTML = '<option value="">Sin cobertura Shalom en este departamento</option>';
        agenciaSelect.disabled = true;
    } else {
        agenciaSelect.innerHTML = '<option value="">— Selecciona tu agencia —</option>';
        agencias.forEach(function(ag) {
            const opt = document.createElement('option');
            opt.value = ag;
            opt.textContent = ag;
            agenciaSelect.appendChild(opt);
        });
        agenciaSelect.disabled = false;
    }
}

function setComprobanteType(type) {
    state.comprobanteType = type;
    document.getElementById('cod-toggle-boleta').classList.toggle('active', type === 'boleta');
    document.getElementById('cod-toggle-factura').classList.toggle('active', type === 'factura');
    document.getElementById('cod-fields-boleta').style.display  = type === 'boleta'  ? 'block' : 'none';
    document.getElementById('cod-fields-factura').style.display = type === 'factura' ? 'block' : 'none';
}

function syncFinalSummary() {
    const ord = calculateOrder(state.cajas, state.shippingMode);
    var destino = '—';
    if (state.shippingMode === 'recojo') {
        destino = 'RECOJO: ' + ALMACENES_LIMA[state.almacenIndex];
    } else {
        destino = document.getElementById('cod-agencia').value || '—';
    }

    document.getElementById('fs-prod').textContent     = ord.tubos + ' Tubos · ' + ord.cajas + (ord.cajas === 1 ? ' Caja' : ' Cajas');
    document.getElementById('fs-subtotal').textContent = 'S/. ' + fmt(ord.subtotal);
    document.getElementById('fs-flete').textContent    = ord.flete > 0 ? 'S/. ' + fmt(ord.flete) : 'GRATIS ✅';
    var precioTuboEl = document.getElementById('fs-precio-tubo');
    if (precioTuboEl) precioTuboEl.textContent = 'S/. ' + ord.precioUnit.toFixed(2) + (ord.precioUnit < 27 ? ' 🎉' : '');

    var modalTxt = 'Transferencia Bancaria 🏦';
    if (state.shippingMode === 'cod')    modalTxt = 'Contra Entrega 🚚 (Adelanto 20% / Saldo 80%)';
    if (state.shippingMode === 'recojo') modalTxt = 'Recojo en Almacén 🏢';

    document.getElementById('fs-modalidad').textContent = modalTxt;
    document.getElementById('fs-total').textContent     = 'S/. ' + fmt(ord.total);
    document.getElementById('fs-agencia').textContent   = destino;

    const adRow = document.getElementById('fs-adelanto-row');
    const saRow = document.getElementById('fs-saldo-row');
    if (adRow) {
        adRow.style.display = (state.shippingMode === 'cod') ? 'flex' : 'none';
        document.getElementById('fs-adelanto').textContent = 'S/. ' + fmt(ord.adelanto);
    }
    if (saRow) {
        saRow.style.display = (state.shippingMode === 'cod') ? 'flex' : 'none';
        document.getElementById('fs-saldo').textContent = 'S/. ' + fmt(ord.saldo);
    }
}

function validateStep2() {
    var valid = true;
    const nombre = document.getElementById('cod-nombre').value.trim();
    const wsp    = document.getElementById('cod-wsp').value.trim();
    if (!nombre || nombre.length < 3) { showFieldError('cod-nombre', 'Ingresa tu nombre completo'); valid = false; }
    if (!wsp || !/^9\d{8}$/.test(wsp.replace(/\s/g, ''))) { showFieldError('cod-wsp', 'WhatsApp válido: 9XXXXXXXX'); valid = false; }
    if (state.shippingMode !== 'recojo') {
        const dept    = document.getElementById('cod-departamento').value;
        const agencia = document.getElementById('cod-agencia').value;
        if (!dept)    { showFieldError('cod-departamento', 'Selecciona el departamento'); valid = false; }
        if (!agencia) { showFieldError('cod-agencia', 'Selecciona la agencia'); valid = false; }
    }
    if (!state.recogedorEsYo) {
        const rn = document.getElementById('cod-recog-nombre').value.trim();
        const rd = document.getElementById('cod-recog-dni').value.trim();
        if (!rn) { showFieldError('cod-recog-nombre', 'Nombre del recogedor'); valid = false; }
        if (!rd || !/^\d{8}$/.test(rd)) { showFieldError('cod-recog-dni', 'DNI 8 dígitos'); valid = false; }
    }
    return valid;
}

function validateStep3() {
    var valid = true;
    const tipo = state.comprobanteType;
    if (tipo === 'boleta') {
        const dni   = document.getElementById('cod-dni').value.trim();
        const email = document.getElementById('cod-email-boleta').value.trim();
        if (!dni || !/^(\d{8}|\d{11})$/.test(dni)) { showFieldError('cod-dni', 'Ingresa tu DNI (8 dígitos) o RUC (11 dígitos)'); valid = false; }
        if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) { showFieldError('cod-email-boleta', 'Email inválido'); valid = false; }
    } else {
        const ruc   = document.getElementById('cod-ruc').value.trim();
        const razon = document.getElementById('cod-razon').value.trim();
        const dir   = document.getElementById('cod-dir-fiscal').value.trim();
        const email = document.getElementById('cod-email-factura').value.trim();
        if (!ruc || !/^\d{11}$/.test(ruc)) { showFieldError('cod-ruc', 'RUC 11 dígitos'); valid = false; }
        if (!razon) { showFieldError('cod-razon', 'Razón social'); valid = false; }
        if (!dir)   { showFieldError('cod-dir-fiscal', 'Dirección fiscal'); valid = false; }
        if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) { showFieldError('cod-email-factura', 'Email inválido'); valid = false; }
    }
    return valid;
}

function showFieldError(inputId, msg) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const wrap   = input.closest('.cod-input-wrap') || input.parentElement;
    const parent = input.closest('.cod-form-group') || (wrap && wrap.parentElement);
    if (parent) parent.querySelectorAll('.cod-error-msg').forEach(function(e) { e.remove(); });
    if (wrap) wrap.classList.add('error');
    const errEl = document.createElement('small');
    errEl.className = 'cod-error-msg';
    errEl.style.cssText = 'color:#ef4444;font-size:10px;font-weight:700;margin-top:4px;display:block';
    errEl.textContent = '⚠ ' + msg;
    if (parent) parent.appendChild(errEl);
    input.addEventListener('input', function() {
        errEl.remove();
        if (wrap) wrap.classList.remove('error');
    }, { once: true });
}

function handleConfirm() {
    if (!validateStep3()) return;
    const ord    = calculateOrder(state.cajas, state.shippingMode);
    const nombre = document.getElementById('cod-nombre').value.trim();
    const wsp    = document.getElementById('cod-wsp').value.trim();
    const email  = (state.comprobanteType === 'boleta')
        ? document.getElementById('cod-email-boleta').value.trim()
        : document.getElementById('cod-email-factura').value.trim();

    if (!state.ocNumber) {
        const now = new Date();
        state.ocNumber = 'OC-' + now.getFullYear() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') + '-' +
            (Math.floor(Math.random() * 9000) + 1000);
    }
    const ocN = state.ocNumber;

    var recogedorLinea = nombre + ' (mismo comprador)';
    if (!state.recogedorEsYo) {
        recogedorLinea = document.getElementById('cod-recog-nombre').value + ' — DNI: ' + document.getElementById('cod-recog-dni').value;
    }

    var destino = state.shippingMode === 'recojo'
        ? ALMACENES_LIMA[state.almacenIndex]
        : document.getElementById('cod-agencia').value;

    var modalidad = state.shippingMode === 'transfer' ? 'Transferencia'
        : (state.shippingMode === 'cod' ? 'Contra Entrega' : 'Recojo Almacén');

    var lines = [
        '🛒 *NUEVA ORDEN DE COMPRA GENERADA*',
        '━━━━━━━━━━━━━━━━━━━━━━',
        '📋 *N° OC: ' + ocN + '*',
        '👤 *Comprador:* ' + nombre,
        '📱 *WhatsApp:* ' + wsp,
        '📧 *Email:* ' + email,
        '',
        '📦 *DETALLE:* ' + ord.cajas + ' cajas (' + ord.tubos + ' tubos)',
        '💰 *TOTAL:* S/. ' + fmt(ord.total),
        state.shippingMode === 'cod' ? '💳 *ADELANTO (20%):* S/. ' + fmt(ord.adelanto) : '',
        '💳 *MODALIDAD:* ' + modalidad,
        '📍 *DESTINO:* ' + destino,
        '👤 *RECOGE:* ' + recogedorLinea,
        '━━━━━━━━━━━━━━━━━━━━━━',
        '_Generado desde cortinas-peru.web.app_'
    ].filter(Boolean).join('%0A');

    window.open('https://wa.me/' + WA_EMPRESA + '?text=' + lines, '_blank');
    sendToAppsScript(nombre, email, ocN);

    document.getElementById('cod-pdf-btn').disabled = false;
    document.getElementById('cod-email-btn').style.display = 'block';
    document.getElementById('cod-pdf-lock').innerHTML = '<span>✅ ¡Pedido confirmado!</span>';
    document.getElementById('cod-pdf-lock').classList.add('unlocked');
}

async function handleEmailResend() {
    const btn    = document.getElementById('cod-email-btn');
    const nombre = document.getElementById('cod-nombre').value.trim();
    const email  = (state.comprobanteType === 'boleta')
        ? document.getElementById('cod-email-boleta').value.trim()
        : document.getElementById('cod-email-factura').value.trim();

    btn.textContent = '⏳ Enviando...';
    const ok = await sendToAppsScript(nombre, email, state.ocNumber);
    if (ok) {
        btn.textContent = '✅ ¡Enviado!';
        btn.disabled = true;
    } else {
        btn.textContent = '❌ Error';
        setTimeout(function() { btn.textContent = '✉️ Re-enviar PDF al Correo'; }, 3000);
    }
}

window.initCODModal  = initCODModal;
window.openCODModal  = openCODModal;
window.closeCODModal = closeCODModal;

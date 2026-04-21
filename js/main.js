/**
 * TUBOS DE CORTINA V2.3 — MAIN LOGIC
 * Decision Modal + COD Modal (3 pasos) + Calculadora B2B + Sticky Banner
 * =========================================================================
 */

document.addEventListener('sectionsLoaded', () => {
    initDecisionModal();
    initCODModal();
    initCalculator();
    initStickyBanner();
    interceptCheckoutLinks();
    initPricingTableToggle();
});

/* ═══════════════════════════════════════════════════════════════
   0.  CONFIGURACIÓN DE INTEGRACIONES
   ═══════════════════════════════════════════════════════════════ */

// URL del Google Apps Script (Web App)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwtzNEYYIb9HHxNLvhe3IfQE29jTM3UynhYypmYr1YpoUS_HU6CrJhLsmoNPECuYWf1/exec';
// Debe coincidir con CONFIG.SECRET_KEY en el .gs, funciona como token de acceso
const APPS_SECRET_KEY = 'TCP2026-SOMOS-MKT-PERÜ-SECURE-8f3k9';

/* ═══════════════════════════════════════════════════════════════
   1.  DATOS DE NEGOCIO & PRECIOS
   ═══════════════════════════════════════════════════════════════ */

const PRECIO_TUBO   = 27;   // Precio de venta oficial al distribuidor
const TUBOS_CAJA    = 12;
const EMBALAJE_FIJO = 20;
const WA_EMPRESA    = '51999900396';

/** Flete Shalom por tramos según volumen */
function getFleteInfo(cajas) {
    if (cajas <= 0)  return { flete: 0,   pct: 0  };
    if (cajas === 1) return { flete: 35,  pct: 17 };
    if (cajas <= 3)  return { flete: 42,  pct: 6  };
    if (cajas <= 7)  return { flete: 50,  pct: 5  };
    if (cajas <= 12) return { flete: 100, pct: 4  };
    if (cajas <= 19) return { flete: 130, pct: 3  };
    return                  { flete: 150, pct: 3  };
}

/** Calcula todos los valores del pedido
 *  @param {number} cajas
 *  @param {boolean} esTransferencia - si true, flete y embalaje = 0
 */
function calculateOrder(cajas, esTransferencia = false) {
    cajas = Math.max(1, Math.floor(cajas || 1));
    const tubos    = cajas * TUBOS_CAJA;
    const subtotal = tubos * PRECIO_TUBO;
    const { flete: fleteBase, pct: fletePct } = getFleteInfo(cajas);
    const flete    = esTransferencia ? 0 : fleteBase;
    const embalaje = esTransferencia ? 0 : EMBALAJE_FIJO;
    const total    = subtotal + flete + embalaje;
    const unitCost = (total / tubos);
    const codTotal = subtotal + fleteBase + EMBALAJE_FIJO; // total si fuera COD
    const saving   = codTotal - total;                      // ahorro vs COD
    // Margen estimado: cliente puede vender entre S/.35 y S/.50
    const profitMin = Math.round(tubos * (35 - PRECIO_TUBO));  // precio venta mín S/.35
    const profitMax = Math.round(tubos * (40 - PRECIO_TUBO));  // precio venta máx S/.40
    return { cajas, tubos, subtotal, flete, fleteBase, fletePct, embalaje, total, unitCost, codTotal, saving, profitMin, profitMax };
}

function fmt(n) {
    return Number(n).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/* ═══════════════════════════════════════════════════════════════
   2.  AGENCIAS SHALOM POR DEPARTAMENTO
   ═══════════════════════════════════════════════════════════════ */

const SHALOM_AGENCIAS = {
    'AMAZONAS':     ['Chachapoyas - Jr. Ortiz Arrieta (Agencia Principal)'],
    'ANCASH':       ['Huaraz - Av. Luzuriaga 450, Cercado', 'Chimbote - Av. Pardo 789, Centro', 'Nuevo Chimbote - Urb. El Trapecio'],
    'APURIMAC':     ['Abancay - Av. Arenas (Agencia Principal)'],
    'AREQUIPA':     [
        'Arequipa - Av. Parra 379, Cercado', 'Arequipa - Av. Lima 406, Alto Selva Alegre',
        'Arequipa - Av. Ramón Castilla 1000-B, Cayma', 'Arequipa - Av. Yaraví 507 B, Cerro Colorado',
        'Arequipa - Calle Argentina 405-A, Jacobo Hunter', 'Arequipa - Calle Ancash 202, Mariano Melgar',
        'Arequipa - Av. Goyeneche 1422, Miraflores', 'Arequipa - Av. Socabaya 302, Socabaya',
        'Mollendo - Av. Mariscal Castilla 472-A', 'Camaná - Calle Agustín Gamarra 451',
        'Majes (Pedregal) - La Parcela 180, Lote 4',
    ],
    'AYACUCHO':     ['Ayacucho - Jr. Callao (Agencia Principal)'],
    'CAJAMARCA':    ['Cajamarca - Jr. Del Comercio', 'Jaén - Jr. Mariscal Ureta'],
    'CALLAO':       ['Callao - Av. Buenos Aires (Agencia Principal)'],
    'CUSCO':        [
        'Cusco - Arco Ticatica Pustipata', 'Cusco - Calle Ciro Alegría, San Jerónimo',
        'Cusco - Av. La Cultura (San Sebastián)', 'Cusco - Av. Antonio Lorena (Santiago)',
        'Cusco - Av. Industrial, Urb. Bancopata', 'Cusco - Parque Industrial Wanchaq',
        'Cusco - Av. Pachacutec', 'Cusco - Velasco Astete (2 cuadras del aeropuerto)',
        'Calca - Óvalo Puma', 'Sicuani - Óvalo San Andrés',
        'Quillabamba - Urb. Santa Ana', 'Urcos - Frente al estadio',
        'Urubamba - Frente al Hotel San Agustín', 'Espinar - Av. Tintaya',
    ],
    'HUANCAVELICA': ['Huancavelica - Jr. Victoria Garma'],
    'HUANUCO':      ['Huánuco - Av. Alameda de la República', 'Tingo María - Jr. Monzón'],
    'ICA':          ['Ica - Av. Los Maestros', 'Chincha Alta - Av. Benavides', 'Pisco - Jr. Comercio', 'Nazca - Jr. Lima'],
    'JUNIN':        ['Huancayo - Av. Ferrocarril', 'Huancayo - Av. Giráldez', 'Tarma - Jr. Arequipa', 'La Merced - Av. San Martín', 'Satipo - Jr. Manuel Prado'],
    'LA LIBERTAD':  [
        'Trujillo - Calle Liverpool N° 329, Urb. Santa Isabel', 'Trujillo - Av. La Perla Mz. E, Urb. Ingeniería',
        'Trujillo - Calle Atahualpa 481', 'Trujillo - Calle Santa Cruz N° 389 Chicago',
        'Trujillo - Av. Hermanos Uceda Meza N° 269, Miraflores II', 'El Porvenir - Av. Hermanos Angulo 628',
        'La Esperanza - Av. Tahuantinsuyo N° 739', 'Huanchaco - Vía de Evitamiento 576.2',
        'Moche - Av. La Marina Lote 25-B', 'Víctor Larco Herrera - Av. Larco 865',
        'Pacasmayo - Jr. Rimac', 'Chepén - Jr. Unión',
    ],
    'LAMBAYEQUE':   ['Chiclayo - Av. Balta', 'Chiclayo - Av. Salaverry', 'Lambayeque - Jr. 8 de Octubre', 'Ferreñafe - Av. Tacna'],
    'LIMA':         ['Lima Cercado - Av. Argentina', 'Los Olivos - Av. Universitaria Norte', 'SJL - Av. Próceres de la Independencia', 'Ate Vitarte - Av. Nicolás Ayllón', 'Villa El Salvador - Av. El Sol', 'Comas - Av. Universitaria Norte', 'Surco - Av. Benavides'],
    'LORETO':       ['Iquitos - Av. Abelardo Quiñones'],
    'MADRE DE DIOS':['Puerto Maldonado - Av. León Velarde'],
    'MOQUEGUA':     ['Moquegua - Av. Andrés Avelino Cáceres', 'Ilo - Av. Matarín'],
    'PASCO':        ['Cerro de Pasco - Jr. Bolognesi'],
    'PIURA':        ['Piura - Av. Grau', 'Piura - Av. Sánchez Cerro', 'Sullana - Av. Buenos Aires', 'Paita - Jr. Comercio', 'Talara - Av. Aviación', 'Chulucanas - Jr. Grau', 'Catacaos - Jr. Comercio'],
    'PUNO':         ['Juliaca - Jr. Moquegua', 'Juliaca - Urb. Bellavista', 'Puno - Jr. Arequipa', 'Ilave - Jr. Grau', 'Azángaro - Jr. Lima'],
    'SAN MARTIN':   ['Tarapoto - Jr. Jiménez Pimentel', 'Moyobamba - Jr. Pedro Canga', 'Juanjui - Jr. San Martín'],
    'TACNA':        ['Tacna - Av. Industrial', 'Tacna - Av. Pinto'],
    'TUMBES':       ['Tumbes - Av. Tumbes Norte', 'Zarumilla - Jr. Comercio'],
    'UCAYALI':      ['Pucallpa - Jr. Raymondi', 'Aguaytía - Carretera Central'],
};

/* ═══════════════════════════════════════════════════════════════
   3.  ESTADO GLOBAL
   ═══════════════════════════════════════════════════════════════ */

const state = {
    currentStep:      1,
    cajas:            4,
    esTransferencia:  true,   // default: transferencia (precio oficial)
    comprobanteType:  'boleta',
    recogedorEsYo:    true,
};

/* ═══════════════════════════════════════════════════════════════
   4.  MODAL DE DECISIÓN (pre-checkout)
   ═══════════════════════════════════════════════════════════════ */

function initDecisionModal() {
    const backdrop = document.getElementById('decision-modal-backdrop');
    if (!backdrop) return;

    // Cerrar
    document.getElementById('dec-close-btn').addEventListener('click', closeDecisionModal);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeDecisionModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.classList.contains('open')) closeDecisionModal();
    });

    // Opción A: Pedido online → abrir COD form
    document.getElementById('dec-btn-order').addEventListener('click', () => {
        closeDecisionModal();
        openCODModal();
    });

    // Opción B: WhatsApp → abrir chat con mensaje pre-armado
    document.getElementById('dec-btn-wsp').addEventListener('click', () => {
        closeDecisionModal();
        const msg = encodeURIComponent('Hola! Quisiera más información sobre los Tubos de Cortina Luxury 3m para distribuir en mi ciudad. ¿Cuál es el precio por caja y qué incluye el envío?');
        window.open(`https://wa.me/${WA_EMPRESA}?text=${msg}`, '_blank');
    });
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

// Exponer para uso desde el sticky banner y otros toggles
window.openDecisionModal = openDecisionModal;

/* ═══════════════════════════════════════════════════════════════
   5.  MODAL COD — APERTURA Y CIERRE
   ═══════════════════════════════════════════════════════════════ */

function initCODModal() {
    const backdrop = document.getElementById('cod-modal-backdrop');
    if (!backdrop) return;

    //  Cierre
    document.getElementById('cod-close-btn').addEventListener('click', closeCODModal);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) closeCODModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.classList.contains('open')) closeCODModal();
    });

    // Navegación pasos
    document.getElementById('cod-next-1').addEventListener('click', () => goToStep(2));
    document.getElementById('cod-next-2').addEventListener('click', () => { if (validateStep2()) goToStep(3); });
    document.getElementById('cod-back-2').addEventListener('click', () => goToStep(1));
    document.getElementById('cod-back-3').addEventListener('click', () => goToStep(2));

    // Toggle modalidad de pago
    document.getElementById('cod-pay-transfer').addEventListener('click', () => setPaymentMode('transfer'));
    document.getElementById('cod-pay-cod').addEventListener('click',      () => setPaymentMode('cod'));

    // Tarjetas de cantidad
    document.querySelectorAll('.cod-qty-radio').forEach(radio => {
        radio.addEventListener('change', () => {
            state.cajas = parseInt(radio.value, 10);
            document.getElementById('cod-custom-cajas').value = '';
            updatePriceSummary();
            updateTips();
        });
    });

    // Cantidad personalizada
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

    // Dropdown departamento → agencias
    document.getElementById('cod-departamento').addEventListener('change', (e) => {
        populateAgencias(e.target.value);
    });

    // Toggle recogedor
    document.getElementById('cod-recog-yo').addEventListener('change', () => {
        state.recogedorEsYo = true;
        document.getElementById('cod-recog-fields').style.display = 'none';
    });
    document.getElementById('cod-recog-otro').addEventListener('change', () => {
        state.recogedorEsYo = false;
        document.getElementById('cod-recog-fields').style.display = 'block';
    });

    // Toggle boleta / factura
    document.getElementById('cod-toggle-boleta').addEventListener('click', () => setComprobanteType('boleta'));
    document.getElementById('cod-toggle-factura').addEventListener('click', () => setComprobanteType('factura'));

    // Confirmar (WhatsApp)
    document.getElementById('cod-confirm-btn').addEventListener('click', handleConfirm);

    // PDF
    document.getElementById('cod-pdf-btn').addEventListener('click', generatePDF);
    document.getElementById('cod-email-btn').addEventListener('click', () => {
        const nombre = document.getElementById('cod-nombre').value.trim();
        const email = document.getElementById(state.comprobanteType === 'boleta' ? 'cod-email-boleta' : 'cod-email-factura').value.trim();
        const ocN = `OC-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000)+1000}`;
        const btn = document.getElementById('cod-email-btn');
        btn.textContent = '⏳ Enviando correo...';
        sendToAppsScript(nombre, email, ocN).then(() => {
            btn.textContent = '✅ ¡Enviado exitosamente!';
            setTimeout(() => btn.textContent = '✉️ Re-enviar PDF al Correo', 4000);
        });
    });

    // Inicializar en modo transferencia (precio puro)
    setPaymentMode('transfer', true);
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

window.openCODModal = openCODModal;

/* ═══════════════════════════════════════════════════════════════
   6.  NAVEGACIÓN DE PASOS
   ═══════════════════════════════════════════════════════════════ */

function goToStep(step, silent = false) {
    state.currentStep = step;
    document.querySelectorAll('.cod-step-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`cod-step-${step}`).classList.add('active');
    updateProgressUI(step);
    if (step === 3) syncFinalSummary();
    if (!silent) { const b = document.querySelector('.cod-body'); if (b) b.scrollTop = 0; }
}

function updateProgressUI(step) {
    const fills = { 1: '16.6%', 2: '50%', 3: '90%' };
    document.getElementById('cod-progress-fill').style.width = fills[step] || '16.6%';
    [1,2,3].forEach(i => {
        const lbl = document.getElementById(`cod-lbl-${i}`);
        const dot = document.getElementById(`cod-dot-${i}`);
        lbl.classList.remove('active','done');
        if (i < step)  { lbl.classList.add('done');  dot.textContent = '✓'; }
        if (i === step){ lbl.classList.add('active'); dot.textContent = String(i); }
        if (i > step)  { dot.textContent = String(i); }
    });
}

/* ═══════════════════════════════════════════════════════════════
   7.  MODALIDAD DE PAGO: TRANSFER vs COD
   ═══════════════════════════════════════════════════════════════ */

function setPaymentMode(mode, silent = false) {
    state.esTransferencia = (mode === 'transfer');

    // Botones
    document.getElementById('cod-pay-transfer').classList.toggle('active', state.esTransferencia);
    document.getElementById('cod-pay-cod').classList.toggle('active', !state.esTransferencia);

    // Mensaje de anclaje de precio
    const anchorBar = document.getElementById('cod-anchor-bar');
    if (anchorBar) {
        if (state.esTransferencia) {
            anchorBar.className    = 'cod-price-anchor-bar';
            anchorBar.innerHTML    = '<span id="cod-anchor-msg">✅ Con transferencia pagas <strong>S/. 27 exacto</strong> por tubo. Sin flete ni embalaje extra.</span>';
        } else {
            anchorBar.className    = 'cod-price-anchor-bar warning';
            anchorBar.innerHTML    = '<span id="cod-anchor-msg">⚠️ En contra entrega se añaden los costos de logística (flete Shalom + embalaje).</span>';
        }
    }

    // Mostrar/ocultar datos bancarios
    const bankData = document.getElementById('cod-bank-data');
    if (bankData) bankData.style.display = state.esTransferencia ? 'block' : 'none';

    // Mostrar/ocultar filas de flete/embalaje en resumen
    const fleteRow   = document.getElementById('cod-flete-row');
    const embRow     = document.getElementById('cod-embalaje-row');
    const savingVs   = document.getElementById('cod-saving-vs');
    if (fleteRow)  fleteRow.style.display   = state.esTransferencia ? 'none' : 'flex';
    if (embRow)    embRow.style.display     = state.esTransferencia ? 'none' : 'flex';
    if (savingVs)  savingVs.style.display   = state.esTransferencia ? 'flex' : 'none';

    if (!silent) updatePriceSummary();
    updateCardPrices();
}

/* ═══════════════════════════════════════════════════════════════
   8.  CÁLCULO DINÁMICO
   ═══════════════════════════════════════════════════════════════ */

function setCustomQty(cajas) {
    state.cajas = cajas;
    document.querySelectorAll('.cod-qty-radio').forEach(r => r.checked = false);
    updatePriceSummary();
    updateTips();
}

function updatePriceSummary() {
    const ord = calculateOrder(state.cajas, state.esTransferencia);

    // Resumen principal
    document.getElementById('cod-sum-units').textContent     = ord.tubos;
    document.getElementById('cod-sum-subtotal').textContent  = `S/. ${fmt(ord.subtotal)}`;
    document.getElementById('cod-sum-flete').textContent     = `S/. ${fmt(ord.flete)}`;
    document.getElementById('cod-sum-flete-pct').textContent = `(${ord.fletePct}%)`;
    document.getElementById('cod-sum-total').textContent     = `S/. ${fmt(ord.total)}`;
    document.getElementById('cod-sum-unit-price').textContent = `S/. ${ord.unitCost.toFixed(2)}`;
    document.getElementById('cod-sum-profit').textContent    = `S/. ${fmt(ord.profitMin)} – S/. ${fmt(ord.profitMax)}`;

    // Ahorro vs COD (solo en modo transfer)
    const savingEl = document.getElementById('cod-saving-vs-val');
    if (savingEl) savingEl.textContent = `S/. ${fmt(ord.saving)}`;
}

function updateCardPrices() {
    // Actualizar precio y badge de cada tarjeta
    [1, 4, 10].forEach(cajas => {
        const ord = calculateOrder(cajas, state.esTransferencia);
        const priceEl  = document.getElementById(`price-card-${cajas}`);
        const badgeEl  = document.getElementById(`ftbadge-${cajas}`);
        if (priceEl) priceEl.textContent = `S/. ${fmt(ord.total)}`;
        if (badgeEl) {
            if (state.esTransferencia) {
                badgeEl.className   = 'cod-flete-badge low';
                badgeEl.textContent = `✅ S/. 27.00/tubo — Precio oficial`;
            } else {
                badgeEl.className   = `cod-flete-badge ${ord.fletePct >= 14 ? '' : 'low'}`;
                badgeEl.textContent = `+${ord.fletePct}% logística — S/. ${ord.unitCost.toFixed(2)}/tubo`;
            }
        }
    });
}

function updateTips() {
    const tipEl = document.getElementById('cod-rec-tip');
    if (!tipEl) return;
    if (state.cajas < 4) {
        tipEl.style.display = 'block';
        tipEl.textContent   = `💡 Con ${4 - state.cajas} cajas más (desde 4), el flete baja del 17% al 5%. ¡Mejor inversión!`;
    } else {
        tipEl.style.display = 'none';
    }
}

/* ═══════════════════════════════════════════════════════════════
   9.  DROPDOWN AGENCIAS
   ═══════════════════════════════════════════════════════════════ */

function populateAgencias(dept) {
    const agenciaSelect = document.getElementById('cod-agencia');
    agenciaSelect.innerHTML = '';

    if (!dept) {
        agenciaSelect.innerHTML = '<option value="">— Primero selecciona el departamento —</option>';
        agenciaSelect.disabled  = true;
        return;
    }
    const agencias = SHALOM_AGENCIAS[dept] || [];
    if (agencias.length === 0) {
        agenciaSelect.innerHTML = '<option value="">Sin cobertura Shalom en este departamento</option>';
        agenciaSelect.disabled  = true;
    } else {
        const dopt       = document.createElement('option');
        dopt.value       = '';
        dopt.textContent = '— Selecciona tu agencia —';
        agenciaSelect.appendChild(dopt);
        agencias.forEach(ag => {
            const opt      = document.createElement('option');
            opt.value      = ag;
            opt.textContent= ag;
            agenciaSelect.appendChild(opt);
        });
        agenciaSelect.disabled = false;
    }
}

/* ═══════════════════════════════════════════════════════════════
   10. TOGGLE BOLETA / FACTURA
   ═══════════════════════════════════════════════════════════════ */

function setComprobanteType(type) {
    state.comprobanteType = type;
    document.getElementById('cod-toggle-boleta').classList.toggle('active', type === 'boleta');
    document.getElementById('cod-toggle-factura').classList.toggle('active', type === 'factura');
    document.getElementById('cod-fields-boleta').style.display  = type === 'boleta'  ? 'block' : 'none';
    document.getElementById('cod-fields-factura').style.display = type === 'factura' ? 'block' : 'none';
}

/* ═══════════════════════════════════════════════════════════════
   11. RESUMEN FINAL — PASO 3
   ═══════════════════════════════════════════════════════════════ */

function syncFinalSummary() {
    const ord = calculateOrder(state.cajas, state.esTransferencia);
    const agencia = document.getElementById('cod-agencia').value;

    document.getElementById('fs-prod').textContent     = `${ord.tubos} Tubos · ${ord.cajas} ${ord.cajas === 1 ? 'Caja' : 'Cajas'}`;
    document.getElementById('fs-subtotal').textContent = `S/. ${fmt(ord.subtotal)}`;
    document.getElementById('fs-flete').textContent    = state.esTransferencia ? 'GRATIS ✅' : `S/. ${fmt(ord.flete)}`;
    document.getElementById('fs-flete-pct').textContent= state.esTransferencia ? '' : `(${ord.fletePct}%)`;
    document.getElementById('fs-embalaje').textContent = state.esTransferencia ? 'GRATIS ✅' : `S/. ${EMBALAJE_FIJO}`;
    document.getElementById('fs-modalidad').textContent= state.esTransferencia ? 'Transferencia Bancaria 🏦' : 'Contra Entrega 🚚';
    document.getElementById('fs-total').textContent    = `S/. ${fmt(ord.total)}`;
    document.getElementById('fs-agencia').textContent  = agencia || '—';

    // Ocultar filas de cero costo
    const frRow = document.getElementById('fs-flete-row');
    const emRow = document.getElementById('fs-embalaje-row');
    if (frRow) frRow.style.display = 'flex';
    if (emRow) emRow.style.display = 'flex';
}

/* ═══════════════════════════════════════════════════════════════
   12. VALIDACIONES
   ═══════════════════════════════════════════════════════════════ */

function showError(inputId, msg) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const wrap   = input.closest('.cod-input-wrap') || input.parentElement;
    const parent = input.closest('.cod-form-group') || wrap?.parentElement;

    // Limpiar error anterior
    if (parent) parent.querySelectorAll('.cod-error-msg').forEach(e => e.remove());

    // Borde rojo en el wrapper visible
    if (wrap) wrap.classList.add('error');

    const errEl = document.createElement('small');
    errEl.className = 'cod-error-msg';
    errEl.style.cssText = 'color:#ef4444;font-size:10px;font-weight:700;margin-top:4px;display:block';
    errEl.textContent = `⚠ ${msg}`;
    if (parent) parent.appendChild(errEl);

    // Auto-limpiar al escribir
    input.addEventListener('input', () => {
        errEl.remove();
        if (wrap) wrap.classList.remove('error');
    }, { once: true });
    input.focus();
}

function validateStep2() {
    let valid = true;
    const nombre  = document.getElementById('cod-nombre').value.trim();
    const wsp     = document.getElementById('cod-wsp').value.trim();
    const dept    = document.getElementById('cod-departamento').value;
    const agencia = document.getElementById('cod-agencia').value;

    if (!nombre || nombre.length < 3) { showError('cod-nombre', 'Ingresa tu nombre completo'); valid = false; }
    if (!wsp || !/^9\d{8}$/.test(wsp.replace(/\s/g, ''))) { showError('cod-wsp', 'WhatsApp válido: 9XXXXXXXX'); valid = false; }
    if (!dept)    { showError('cod-departamento', 'Selecciona tu departamento'); valid = false; }
    if (!agencia) { showError('cod-agencia', 'Selecciona la agencia Shalom'); valid = false; }

    // Recogedor
    if (!state.recogedorEsYo) {
        const rNombre = document.getElementById('cod-recog-nombre').value.trim();
        const rDni    = document.getElementById('cod-recog-dni').value.trim();
        if (!rNombre || rNombre.length < 3) { showError('cod-recog-nombre', 'Ingresa el nombre del recogedor'); valid = false; }
        if (!rDni || !/^\d{8}$/.test(rDni)) { showError('cod-recog-dni', 'DNI debe tener 8 dígitos'); valid = false; }
    }
    return valid;
}

function validateStep3() {
    let valid = true;
    if (state.comprobanteType === 'boleta') {
        const dni   = document.getElementById('cod-dni').value.trim();
        const email = document.getElementById('cod-email-boleta').value.trim();
        if (!dni || !/^\d{8}$/.test(dni)) { showError('cod-dni', 'El DNI debe tener 8 dígitos'); valid = false; }
        if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) { showError('cod-email-boleta', 'Correo electrónico inválido'); valid = false; }
    } else {
        const ruc    = document.getElementById('cod-ruc').value.trim();
        const razon  = document.getElementById('cod-razon').value.trim();
        const dir    = document.getElementById('cod-dir-fiscal').value.trim();
        const email  = document.getElementById('cod-email-factura').value.trim();
        if (!ruc || !/^\d{11}$/.test(ruc)) { showError('cod-ruc', 'RUC debe tener 11 dígitos'); valid = false; }
        if (!razon || razon.length < 3)    { showError('cod-razon', 'Ingresa la razón social completa'); valid = false; }
        if (!dir)                          { showError('cod-dir-fiscal', 'Ingresa la dirección fiscal'); valid = false; }
        if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) { showError('cod-email-factura', 'Correo electrónico inválido'); valid = false; }
    }
    return valid;
}

/* ═══════════════════════════════════════════════════════════════
   13. CONFIRMACIÓN POR WHATSAPP
   ═══════════════════════════════════════════════════════════════ */

function handleConfirm() {
    if (!validateStep3()) return;

    const ord     = calculateOrder(state.cajas, state.esTransferencia);
    const nombre  = document.getElementById('cod-nombre').value.trim();
    const wsp     = document.getElementById('cod-wsp').value.trim();
    const dept    = document.getElementById('cod-departamento').value;
    const agencia = document.getElementById('cod-agencia').value;
    const tipo    = state.comprobanteType;

    let email = '';
    let cpbtLinea = '';
    let cpbtId = '';
    if (tipo === 'boleta') {
        const dni = document.getElementById('cod-dni').value.trim();
        email     = document.getElementById('cod-email-boleta').value.trim();
        cpbtLinea = `📄 Boleta de Venta · DNI: ${dni}`;
        cpbtId    = dni;
    } else {
        const ruc   = document.getElementById('cod-ruc').value.trim();
        const razon = document.getElementById('cod-razon').value.trim();
        email       = document.getElementById('cod-email-factura').value.trim();
        cpbtLinea   = `🏢 Factura · RUC: ${ruc} · ${razon}`;
        cpbtId      = ruc;
    }

    let recogedorLinea = `👤 ${nombre} (el mismo comprador)`;
    if (!state.recogedorEsYo) {
        const rn = (document.getElementById('cod-recog-nombre')?.value || '').trim();
        const rd = (document.getElementById('cod-recog-dni')?.value   || '').trim();
        recogedorLinea = `👤 ${rn} — DNI: ${rd}`;
    }

    // Generar número de OC y guardarlo en state
    if (!state.ocNumber) {
        const now = new Date();
        state.ocNumber = `OC-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000)+1000}`;
    }
    const ocN = state.ocNumber;
    const deptStr = dept.charAt(0) + dept.slice(1).toLowerCase();

    // ── MENSAJE PARA EL CLIENTE (enviado al número de la empresa) ──
    const msgCliente = [
        `🛒 *NUEVA ORDEN DE COMPRA GENERADA*`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `📋 *N° OC: ${ocN}*`,
        `📅 ${new Date().toLocaleDateString('es-PE', {day:'2-digit',month:'long',year:'numeric'})}`,
        ``,
        `👤 *Comprador:* ${nombre}`,
        `📱 *WhatsApp:* ${wsp}`,
        `📧 *Correo:* ${email}`,
        ``,
        `📦 *DETALLE DEL PEDIDO:*`,
        `• Producto: Tubo Cortina Extensible 3m · Luxury`,
        `• Cantidad: ${ord.cajas} ${ord.cajas===1?'caja':'cajas'} · *${ord.tubos} tubos*`,
        `• Precio oficial: S/. 27.00 c/u`,
        ``,
        `💰 *RESUMEN ECONÓMICO:*`,
        `• Subtotal: S/. ${fmt(ord.subtotal)}`,
        state.esTransferencia
            ? `• Flete + Embalaje: ✅ *GRATIS* (pago anticipado)`
            : `• Flete Shalom: S/. ${fmt(ord.flete)}%0A• Embalaje: S/. ${EMBALAJE_FIJO}`,
        `• *TOTAL: S/. ${fmt(ord.total)}*`,
        ``,
        `💳 *MODALIDAD:* ${state.esTransferencia ? '🏦 TRANSFERENCIA BANCARIA' : '🚚 CONTRA ENTREGA EN SHALOM'}`,
        ``,
        `📍 *AGENCIA DESTINO:*`,
        `${deptStr} — ${agencia}`,
        `Recoge: ${recogedorLinea}`,
        ``,
        `🧾 *COMPROBANTE:* ${cpbtLinea}`,
        ``,
        state.esTransferencia
            ? [
                `⏰ *AVISO DE PAGO:*`,
                `Realizaré la transferencia bancaria dentro de las siguientes *12 horas* y enviaré la constancia de pago por este medio para iniciar el proceso de embalaje y envío a agencia. Aguardo la confirmación de stock por correo a ${email}.`,
              ].join('%0A')
            : `✅ He generado mi Orden de Compra desde la web. Aguardo confirmación de stock.`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `_Orden generada desde cortinas-peru.web.app_`,
    ].filter(Boolean).join('%0A');

    window.open(`https://wa.me/${WA_EMPRESA}?text=${msgCliente}`, '_blank');

    // Llamar al Apps Script en background (enviar email al cliente)
    sendToAppsScript(nombre, email, ocN);

    // ✅ Desbloquear PDF y actualizar UI
    const pdfBtn   = document.getElementById('cod-pdf-btn');
    const emailBtn = document.getElementById('cod-email-btn');
    const lockMsg  = document.getElementById('cod-pdf-lock');
    if (pdfBtn) {
        pdfBtn.disabled = false;
        pdfBtn.textContent = '📄 Descargar Resumen PDF — Listo ✅';
    }
    if (emailBtn) {
        emailBtn.style.display = 'block';
    }
    if (lockMsg) {
        lockMsg.innerHTML = '<span>✅ ¡Pedido confirmado! Ya puedes descargar tu resumen.</span>';
        lockMsg.classList.add('unlocked');
    }
}

/* ═══════════════════════════════════════════════════════════════
   14. ENVÍO AL APPS SCRIPT (email + Drive + Sheets)
   ═══════════════════════════════════════════════════════════════ */

async function sendToAppsScript(nombre, email, ocNumber) {
    if (!APPS_SCRIPT_URL) return;

    const ord  = calculateOrder(state.cajas, state.esTransferencia);
    const tipo = state.comprobanteType;

    // Datos del comprobante
    let dni = '', ruc = '', razon = '', dir = '';
    if (tipo === 'boleta') {
        dni = document.getElementById('cod-dni')?.value.trim() || '';
    } else {
        ruc   = document.getElementById('cod-ruc')?.value.trim()       || '';
        razon = document.getElementById('cod-razon')?.value.trim()     || '';
        dir   = document.getElementById('cod-dir-fiscal')?.value.trim()|| '';
    }

    let recogedor = nombre;
    if (!state.recogedorEsYo) {
        const rn = document.getElementById('cod-recog-nombre')?.value.trim() || '';
        const rd = document.getElementById('cod-recog-dni')?.value.trim()    || '';
        recogedor = `${rn} (DNI: ${rd})`;
    }

    const payload = {
        secretKey       : APPS_SECRET_KEY,
        ocNumber        : ocNumber || state.ocNumber,
        nombre,
        email,
        wsp             : document.getElementById('cod-wsp')?.value.trim() || '',
        departamento    : document.getElementById('cod-departamento')?.value || '',
        agencia         : document.getElementById('cod-agencia')?.value || '',
        recogedor,
        cajas           : ord.cajas,
        tubos           : ord.tubos,
        subtotal        : ord.subtotal,
        flete           : ord.flete,
        embalaje        : ord.embalaje,
        total           : ord.total,
        esTransferencia : state.esTransferencia,
        comprobanteType : tipo,
        dni, ruc, razon, dir,
        pdfBase64       : '',    // placeholder; PDF real se genera en el servidor
        fileName        : `OC-TubosCortina-${ocNumber || ''}.pdf`,
    };

    try {
        const resp = await fetch(APPS_SCRIPT_URL, {
            method  : 'POST',
            headers : { 'Content-Type': 'text/plain' },
            body    : JSON.stringify(payload),
        });
        const json = await resp.json();
        if (json.success) {
            console.log('[Apps Script] ✅ Email enviado:', json.ocNumber);
        } else {
            console.warn('[Apps Script] ⚠️ Respuesta sin éxito:', json.error);
            alert('Hubo un problema al enviar el correo. Por favor verifique el correo ingresado o contacte soporte si el error de Google persiste.');
        }
    } catch (err) {
        // No bloquear al usuario — el email es secundario al WA
        console.warn('[Apps Script] Error de conexión (no crítico):', err.message);
        alert('Hubo un problema comunicándose con los servidores de Google. Asegúrese de que el backend tiene permisos públicos.');
    }
}

/* ═══════════════════════════════════════════════════════════════
   15. GENERACIÓN DE PDF (window.print)
   ═══════════════════════════════════════════════════════════════ */

function generatePDF() {
    const ord     = calculateOrder(state.cajas, state.esTransferencia);
    const nombre  = document.getElementById('cod-nombre').value.trim()     || '—';
    const wsp     = document.getElementById('cod-wsp').value.trim()        || '—';
    const dept    = document.getElementById('cod-departamento').value      || '—';
    const agencia = document.getElementById('cod-agencia').value           || '—';
    const tipo    = state.comprobanteType;
    const modalidad = state.esTransferencia ? 'Transferencia Bancaria 🏦 — Envío Gratis' : 'Contra Entrega 🚚';

    let recogedorHtml = `<tr><td>Quien Recoge</td><td>${nombre} (comprador)</td></tr>`;
    if (!state.recogedorEsYo) {
        const rn = document.getElementById('cod-recog-nombre')?.value.trim() || '—';
        const rd = document.getElementById('cod-recog-dni')?.value.trim()   || '—';
        recogedorHtml = `<tr><td>Quien Recoge</td><td>${rn} — DNI: ${rd}</td></tr>`;
    }

    let cHtml = '';
    let clave  = '';
    if (tipo === 'boleta') {
        const dni   = document.getElementById('cod-dni').value.trim()          || '—';
        const email = document.getElementById('cod-email-boleta').value.trim() || '—';
        cHtml = `<tr><td>Tipo</td><td><strong>Boleta de Venta Electrónica</strong></td></tr>
                 <tr><td>DNI</td><td>${dni}</td></tr>
                 <tr><td>Correo</td><td>${email}</td></tr>`;
        clave = `tu DNI (${dni})`;
    } else {
        const ruc   = document.getElementById('cod-ruc').value.trim()          || '—';
        const razon = document.getElementById('cod-razon').value.trim()        || '—';
        const dir   = document.getElementById('cod-dir-fiscal').value.trim()   || '—';
        const email = document.getElementById('cod-email-factura').value.trim()|| '—';
        cHtml = `<tr><td>Tipo</td><td><strong>Factura Electrónica</strong></td></tr>
                 <tr><td>RUC</td><td>${ruc}</td></tr>
                 <tr><td>Razón Social</td><td>${razon}</td></tr>
                 <tr><td>Dir. Fiscal</td><td>${dir}</td></tr>
                 <tr><td>Correo</td><td>${email}</td></tr>`;
        clave = `tu RUC (${ruc})`;
    }

    const now = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'long', year:'numeric' });
    const ocN = `OC-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}-${Math.floor(Math.random()*9000)+1000}`;

    const bankSection = state.esTransferencia ? `
        <h2>🏦 Datos para Transferencia</h2>
        <table>
          <tr><td>Banco</td><td>Interbank</td></tr>
          <tr><td>Beneficiario</td><td>Somos Marketing Peru E.I.R.L.</td></tr>
          <tr><td>Cuenta Corriente S/.</td><td><strong>200 - 3008139189</strong></td></tr>
          <tr><td>CCI</td><td><strong>003 - 200 - 003008139189 - 35</strong></td></tr>
        </table>
        <div class="note" style="margin-top:10px">📸 Envíanos el comprobante de transferencia por WhatsApp para coordinar el despacho inmediato.</div>
    ` : '';

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Orden de Compra ${ocN} — Tubos de Cortina</title>
  <style>
    body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1c1917; margin: 0; padding: 30px 40px; background:#fff;}
    .header { width: 100%; display: table; margin-bottom: 25px; }
    .header-l { display: table-cell; vertical-align: top; }
    .header-r { display: table-cell; vertical-align: top; text-align: right; }
    .h-logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; display:inline-block; line-height:1; }
    .h-tag { color: #c88264; font-size: 11px; font-weight: 700; letter-spacing: 1px; display:block; margin-bottom:6px; }
    .oc-bg { color: #f0ece8; font-size: 40px; font-weight: 900; line-height: 0.8; margin-bottom: 10px; }
    .oc-pill { background: #c88264; color: white; padding: 10px 20px; border-radius: 8px; display: inline-block; text-align: left; font-size:11px; }
    .page { display: table; width: 100%; }
    .left-col { display: table-cell; width: 50%; vertical-align: top; padding-right: 20px; border-right: 2px solid #f0ece8; }
    .right-col { display: table-cell; width: 50%; vertical-align: top; padding-left: 20px; }
    .sec-t { font-size: 14px; font-weight: 900; margin: 20px 0 10px; color: #c88264; letter-spacing: 0.5px; text-transform: uppercase; }
    .data-tb { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px; }
    .data-tb td { padding: 8px 0; border-bottom: 1px solid #f9f7f5; }
    .data-tb tr td:first-child { font-weight: bold; width: 45%; color: #333; }
    .data-tb tr td:last-child { color: #555; }
    .desc-tb { width: 100%; border-bottom: 1px solid #c88264; padding-bottom: 8px; margin-bottom: 25px; }
    .desc-th { color: #c88264; font-size: 10px; font-weight: bold; }
    .desc-r { text-align: right; width: 80px; }
    .item-row { width: 100%; display: table; font-size: 11px; margin-bottom: 10px; }
    .item-1 { display: table-cell; font-weight: 900; width: 25px; }
    .item-2 { display: table-cell; color: #333; line-height: 1.3; }
    .item-3 { display: table-cell; text-align: right; font-weight: 900; font-size: 14px; width: 90px; }
    .item-sub { display: block; font-size: 9px; color: #888; font-weight: normal; margin-top:2px; }
    .totals { border-bottom: 2px solid #c88264; padding-bottom: 15px; margin-bottom: 15px; margin-top: 50px; text-align: right; }
    .tot-r { font-size: 10px; font-weight: bold; color: #c88264; display: inline-block; width: 90px; text-align: right; margin-right: 15px; }
    .tot-v { font-size: 13px; font-weight: bold; display: inline-block; width: 70px; text-align: right; color:#1c1917; }
    .tot-row { margin-bottom: 10px; }
    .grand { font-size: 16px !important; }
    .note-box { border-radius: 6px; padding: 10px 14px; margin-top: 12px; font-size: 10px; }
    .note-yellow { background: #fff8e1; border: 1px solid #ffe082; color: #795548; font-weight: bold; }
    .note-green { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .qr-box { margin-top: 30px; display: table; width: 100%; }
    .qr-img { display: table-cell; width: 80px; vertical-align:middle; }
    .qr-img img { width: 70px; }
    .qr-txt { display: table-cell; vertical-align: middle; font-size: 9px; color: #666; line-height: 1.4; padding-left: 10px; }
    .footer { margin-top: 25px; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #f0ece8; padding-top: 15px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-l">
       <span class="h-tag">COTIZACIÓN MAYORISTA</span>
       <span class="h-logo">TUBOS DE<br>CORTINA PERÚ</span>
    </div>
    <div class="header-r">
       <div class="oc-bg">ORDEN DE<br>COMPRA</div>
       <div class="oc-pill">
         <strong>Nro. ${ocN}</strong><br>
         <span style="font-weight:normal;">${now} &nbsp;|&nbsp; ${nombre}</span>
       </div>
    </div>
  </div>

  <div class="page">
    <div class="left-col">
      <div class="sec-t" style="margin-top:0;">📋 DATOS DEL COMPRADOR</div>
      <table class="data-tb">
        <tr><td><img src="./img/assets-pdf/Icono Nombre del Beneficiario.png" style="width:12px; vertical-align:middle; margin-right:6px; margin-bottom:2px;">Nombre y Apellidos</td><td>\${nombre}</td></tr>
        <tr><td><img src="./img/assets-pdf/Icono Whatsapp.png" style="width:12px; vertical-align:middle; margin-right:6px; margin-bottom:2px;">WhatsApp</td><td>\${wsp}</td></tr>
        <tr><td><img src="./img/assets-pdf/Icono Direccion.png" style="width:12px; vertical-align:middle; margin-right:6px; margin-bottom:2px;">Departamento</td><td>\${dept}</td></tr>
        <tr><td><img src="./img/assets-pdf/Icono Direccion.png" style="width:12px; vertical-align:middle; margin-right:6px; margin-bottom:2px;">Agencia Shalom</td><td>\${agencia}</td></tr>
        <tr><td><img src="./img/assets-pdf/Icono dni.png" style="width:12px; vertical-align:middle; margin-right:6px; margin-bottom:2px;">Quién Recoge</td><td>\${recogedorHtml}</td></tr>
        <tr><td><img src="./img/assets-pdf/Icono Pago contraentrega.png" style="width:12px; vertical-align:middle; margin-right:6px; margin-bottom:2px;">Modalidad de Pago</td><td>\${modalidad}</td></tr>
      </table>

      <div class="sec-t">🧾 COMPROBANTE</div>
      \${cHtml}

      <div class="note-box note-yellow">
        🔐 La contraseña de este documento (cuando llegue en PDF por email) será: <strong>\${clave}</strong>
      </div>
      <div class="note-box note-green">✅ <strong>\${state.esTransferencia ? 'Transferencia:' : 'Pago al Recibir:'}</strong> \${state.esTransferencia ? 'Flete y embalaje gratis. Envíe voucher.' : 'No requiere adelanto. El monto se abona en la agencia.'}</div>
    </div>

    <div class="right-col">
      <table class="desc-tb">
        <tr><td class="desc-th">DESCRIPCIÓN</td><td class="desc-th desc-r">MONTO</td></tr>
      </table>
      
      <div class="item-row">
         <div class="item-1">1.</div>
         <div class="item-2">
           <strong>Tubo Extensible Luxury (hasta 3m)</strong>
           <span class="item-sub">Lote de \${state.cajas} cajas (\${state.cajas * TUBOS_CAJA} tubos) a S/. 27 c/u</span>
         </div>
         <div class="item-3">S/. \${(state.cajas * TUBOS_CAJA * PRECIO_TUBO).toFixed(2)}</div>
      </div>
      <div class="item-row">
         <div class="item-1">2.</div>
         <div class="item-2">
           <strong>Gastos Logísticos</strong>
           <span class="item-sub">Flete: \${ord.flete === 0 ? '<strong style="color:#27ae60">GRATIS</strong>' : 'S/. '+ord.flete.toFixed(2)} | Embalaje: \${ord.embalaje === 0 ? '<strong style="color:#27ae60">GRATIS</strong>' : 'S/. '+ord.embalaje.toFixed(2)}</span>
         </div>
         <div class="item-3">S/. \${(ord.flete + ord.embalaje).toFixed(2)}</div>
      </div>

      <div class="totals">
        <div class="tot-row"><span class="tot-r">SUBTOTAL (82%):</span><span class="tot-v">S/. \${(ord.total * 0.82).toFixed(2)}</span></div>
        <div class="tot-row"><span class="tot-r">IGV (18%):</span><span class="tot-v">S/. \${(ord.total * 0.18).toFixed(2)}</span></div>
      </div>
      <div style="text-align:right;">
        <span class="tot-r" style="color:#c88264;font-size:12px;">TOTAL:</span>
        <span class="tot-v grand">S/. \${ord.total.toFixed(2)}</span>
      </div>

      <div class="sec-t" style="margin-top:30px;">TÉRMINOS Y CONDICIONES:</div>
      <div class="qr-box">
        <div class="qr-img"><img src="https://quickchart.io/qr?size=300&margin=1&text=https://wa.me/\${WA_EMPRESA}?text=Hola,%20consulta%20por%20mi%20OC:%20\${ocN}"></div>
        <div class="qr-txt">
           Escanee el código QR para autorizar el armado del lote vía WhatsApp con su asesor asignado.
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
      <strong>Tubos de Cortina Perú</strong> — Somos Marketing Perú EIRL · RUC 20615554384<br>
      WhatsApp: +51 999 900 396 · cortinas-peru.web.app<br>
      Este documento es una cotización para venta al por mayor. El pedido se confirma vía WhatsApp. Stock sujeto a disponibilidad.
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=720,height=950');
    if (!win) { alert('Tu navegador bloqueó la ventana emergente. Permite popups para imprimir el PDF.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 800);
}

/* ═══════════════════════════════════════════════════════════════
   15. INTERCEPTAR CTAs → MODAL DE DECISIÓN
   ═══════════════════════════════════════════════════════════════ */

function interceptCheckoutLinks() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href="#checkout"], [data-open-checkout]');
        if (link) {
            e.preventDefault();
            openDecisionModal();
        }
    });
}

/* ═══════════════════════════════════════════════════════════════
   16. CALCULADORA DE GANANCIA (SECCIÓN 03-calc)
   ═══════════════════════════════════════════════════════════════ */

// Datos de la calculadora actualizados a S/. 27
const CALC_DATA = {
    1: { cajas: 1,  tubos: 12,  label: '1 Caja' },
    2: { cajas: 4,  tubos: 48,  label: '4 Cajas ⭐' },
    3: { cajas: 8,  tubos: 96,  label: '8 Cajas' },
    4: { cajas: 10, tubos: 120, label: '10 Cajas' },
    5: { cajas: 20, tubos: 240, label: '20 Cajas' },
};

let calcMode = 'transfer'; // Default: precio puro

function initCalculator() {
    const slider = document.getElementById('cajaSlider');
    if (!slider) return;

    // Tabs transfer / COD
    const tabTransfer = document.getElementById('calc-tab-transfer');
    const tabCod      = document.getElementById('calc-tab-cod');
    if (tabTransfer) tabTransfer.addEventListener('click', () => setCalcTab('transfer'));
    if (tabCod)      tabCod.addEventListener('click',      () => setCalcTab('cod'));

    slider.addEventListener('input', (e) => {
        updateCalcDisplay(parseInt(e.target.value, 10));
        updateCalcLabels(e.target.value);
    });

    // Inicializar
    updateCalcDisplay(2);
    updateCalcLabels('2');
}

function setCalcTab(mode) {
    calcMode = mode;
    document.getElementById('calc-tab-transfer')?.classList.toggle('active', mode === 'transfer');
    document.getElementById('calc-tab-cod')?.classList.toggle('active',      mode === 'cod');
    const sliderVal = parseInt(document.getElementById('cajaSlider')?.value || '2', 10);
    updateCalcDisplay(sliderVal);
}

// Exponer globalmente (usado desde el HTML)
window.setCalcTab = setCalcTab;
window.togglePricingTable = togglePricingTable;

function updateCalcDisplay(idx) {
    const entry = CALC_DATA[idx];
    if (!entry) return;

    const esTransfer = (calcMode === 'transfer');
    const ord        = calculateOrder(entry.cajas, esTransfer);

    const valInvest  = document.getElementById('valInvest');
    const valUnit    = document.getElementById('valUnitProfit');
    const valProfit  = document.getElementById('valProfitTotal');
    const valISub    = document.getElementById('valInvestSub');
    const valUSub    = document.getElementById('valUnitSub');
    const valPSub    = document.getElementById('valProfitSub');
    const compTransfer = document.getElementById('comp-transfer');
    const compCod      = document.getElementById('comp-cod');
    const compSaving   = document.getElementById('comp-saving');

    const ordTransfer = calculateOrder(entry.cajas, true);
    const ordCod      = calculateOrder(entry.cajas, false);

    if (valInvest)  valInvest.textContent  = `S/. ${fmt(ord.total)}`;
    if (valUnit)    valUnit.textContent    = `S/. ${ord.unitCost.toFixed(2)}`;
    if (valProfit)  valProfit.textContent  = `S/. ${fmt(ord.profitMin)} – S/. ${fmt(ord.profitMax)}`;

    if (valISub) valISub.textContent = esTransfer ? 'Pago anticipado · Envío gratis ✅' : 'Pago al recibir en Shalom 🚚';
    if (valUSub) valUSub.textContent = esTransfer ? 'Precio oficial · sin extras' : `+${ordCod.fletePct}% logística incluida`;
    if (valPSub) valPSub.textContent = `${entry.tubos} tubos × S/. ${fmt(ord.profitMin/entry.tubos)} – S/. ${fmt(ord.profitMax/entry.tubos)} de margen`;

    // Contexto: inversión y venta proyectada total
    const revenueMin = entry.tubos * 35;  // precio venta mínimo
    const revenueMax = entry.tubos * 40;  // precio venta máximo
    const investCtx  = document.getElementById('valInvestCtx');
    const revenueEl  = document.getElementById('valRevenueTotal');
    if (investCtx) investCtx.textContent = `S/. ${fmt(ord.total)}`;
    if (revenueEl) revenueEl.textContent = `S/. ${fmt(revenueMin)} – S/. ${fmt(revenueMax)}`;

    if (compTransfer) compTransfer.textContent = `S/. ${fmt(ordTransfer.total)}`;
    if (compCod)      compCod.textContent      = `S/. ${fmt(ordCod.total)}`;
    if (compSaving)   compSaving.textContent   = `S/. ${fmt(ordCod.total - ordTransfer.total)}`;
}

function updateCalcLabels(val) {
    document.querySelectorAll('.va-label-item').forEach(l => {
        l.classList.toggle('va-active', l.dataset.index === String(val));
    });
}

/* ═══════════════════════════════════════════════════════════════
   17. TOGGLE TABLA DE PRECIOS (09-table)
   ═══════════════════════════════════════════════════════════════ */

function initPricingTableToggle() {
    // El toggle se puede llamar también desde el HTML via onclick
}

function togglePricingTable(mode) {
    const tTransfer = document.getElementById('va-table-transfer');
    const tCod      = document.getElementById('va-table-cod');
    const btnT      = document.getElementById('va-toggle-transfer');
    const btnC      = document.getElementById('va-toggle-cod');

    if (!tTransfer || !tCod) return;

    if (mode === 'transfer') {
        tTransfer.style.display = '';
        tCod.style.display      = 'none';
        btnT?.classList.add('active');
        btnC?.classList.remove('active');
    } else {
        tTransfer.style.display = 'none';
        tCod.style.display      = '';
        btnT?.classList.remove('active');
        btnC?.classList.add('active');
    }
}

/* ═══════════════════════════════════════════════════════════════
   18. STICKY BANNER
   ═══════════════════════════════════════════════════════════════ */

function initStickyBanner() {
    const sticky = document.querySelector('.va-sticky-wrap');
    if (!sticky) return;
    window.addEventListener('scroll', () => {
        sticky.style.display = window.scrollY > 500 ? 'block' : 'none';
    }, { passive: true });
}

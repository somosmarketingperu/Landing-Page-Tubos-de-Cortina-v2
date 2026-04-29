/**
 * CALCULATOR.JS — Calculadora de Ganancia y Tablas de Precios
 */

const CALC_DATA = {
    1: { cajas: 1,  tubos: 12,  label: '1 Caja' },
    2: { cajas: 4,  tubos: 48,  label: '4 Cajas ⭐' },
    3: { cajas: 8,  tubos: 96,  label: '8 Cajas' },
    4: { cajas: 10, tubos: 120, label: '10 Cajas' },
    5: { cajas: 20, tubos: 240, label: '20 Cajas' },
};

let calcMode = 'transfer';

function initCalculator() {
    console.log("Initializing Calculator...");
    const slider = document.getElementById('cajaSlider');
    if (!slider) {
        console.warn("Calculator Slider not found!");
        return;
    }

    const tabTransfer = document.getElementById('calc-tab-transfer');
    const tabCod      = document.getElementById('calc-tab-cod');
    
    if (tabTransfer) tabTransfer.addEventListener('click', () => setCalcTab('transfer'));
    if (tabCod)      tabCod.addEventListener('click',      () => setCalcTab('cod'));

    slider.addEventListener('input', function() {
        const val = parseInt(this.value, 10);
        console.log("Slider moved to:", val);
        updateCalcDisplay(val);
        updateCalcLabels(val);
        // ── Sincronizar con el estado global del checkout ──
        const entry = CALC_DATA[val];
        if (entry && typeof state !== 'undefined') {
            state.cajas = entry.cajas;
            // Si el modal de checkout ya está inicializado, refrescar su resumen
            if (typeof updatePriceSummary === 'function') updatePriceSummary();
        }
    });

    try {
        updateCalcDisplay(2);
        updateCalcLabels('2');
    } catch (err) {
        console.error("Error during initial calc display:", err);
    }
}

function setCalcTab(mode) {
    calcMode = mode;
    document.getElementById('calc-tab-transfer')?.classList.toggle('active', mode === 'transfer');
    document.getElementById('calc-tab-cod')?.classList.toggle('active',      mode === 'cod');
    const desc = document.getElementById('calc-desc');
    if (desc) {
        desc.innerHTML = mode === 'transfer'
            ? 'Precio oficial <strong>S/. 27/tubo</strong>. Con transferencia anticipada, el envío es gratis y ese precio es todo lo que pagas.'
            : 'Precio oficial <strong>S/. 27/tubo</strong>. Contra entrega: <strong>adelanto 20%</strong> para alistar + pagas el <strong>80% restante en Agencia Shalom destino</strong>. El flete se suma al total.';
    }
    const sliderVal = parseInt(document.getElementById('cajaSlider')?.value || '2', 10);
    updateCalcDisplay(sliderVal);
}

function updateCalcDisplay(idx) {
    try {
        const entry = CALC_DATA[idx];
        if (!entry) return;

        const ord = calculateOrder(entry.cajas, calcMode);

        const valInvest  = document.getElementById('valInvest');
        const valUnit    = document.getElementById('valUnitProfit');
        const valProfit  = document.getElementById('valProfitTotal');
        const valISub    = document.getElementById('valInvestSub');
        const valUSub    = document.getElementById('valUnitSub');
        const valPSub    = document.getElementById('valProfitSub');

        if (valInvest)  valInvest.textContent  = `S/. ${fmt(ord.total)}`;
        if (valUnit)    valUnit.textContent    = `S/. ${ord.unitCost.toFixed(2)}`;
        if (valProfit)  valProfit.textContent  = `S/. ${fmt(ord.profitMin)} – S/. ${fmt(ord.profitMax)}`;

        if (valISub) {
            if (calcMode === 'transfer') {
                valISub.textContent = 'Pago anticipado · Envío gratis ✅';
            } else {
                valISub.innerHTML = `20% adelanto (<strong>S/. ${fmt(ord.adelanto)}</strong>) + Saldo en Shalom`;
            }
        }
        if (valUSub) {
            valUSub.textContent = (calcMode === 'transfer') ? 'Precio oficial · sin extras' : `Incluye flete Shalom + embalaje`;
        }
        if (valPSub) {
            valPSub.textContent = `${entry.tubos} tubos × S/. ${fmt(ord.profitMin/entry.tubos)} – S/. ${fmt(ord.profitMax/entry.tubos)} de margen`;
        }

        const revenueMin = entry.tubos * 35;
        const revenueMax = entry.tubos * 40;
        const investCtx  = document.getElementById('valInvestCtx');
        const revenueEl  = document.getElementById('valRevenueTotal');
        if (investCtx) investCtx.textContent = `S/. ${fmt(ord.total)}`;
        if (revenueEl) revenueEl.textContent = `S/. ${fmt(revenueMin)} – S/. ${fmt(revenueMax)}`;
    } catch (err) {
        console.error("Error updating calc display:", err);
    }
}

function updateCalcLabels(val) {
    document.querySelectorAll('.va-label-item').forEach(l => {
        l.classList.toggle('va-active', l.dataset.index === String(val));
    });
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

// Exponer globalmente
window.initCalculator = initCalculator;
window.setCalcTab = setCalcTab;
window.togglePricingTable = togglePricingTable;

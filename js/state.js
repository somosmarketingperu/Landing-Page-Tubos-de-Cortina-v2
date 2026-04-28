/**
 * STATE.JS — Estado Global y Lógica de Cálculo
 */

const state = {
    currentStep:      1,
    cajas:            4,
    shippingMode:     'transfer', // 'transfer', 'cod', 'recojo'
    comprobanteType:  'boleta',
    recogedorEsYo:    true,
    almacenIndex:     2, // Comas Principal por defecto
    ocNumber:         null
};

/**
 * Calcula todos los valores del pedido de forma centralizada
 * @param {number} cajas 
 * @param {string} mode - 'transfer', 'cod', 'recojo'
 */
function getPrecioTubo(cajas) {
    for (const tier of PRECIOS_ESCALONADOS) {
        if (cajas >= tier.minCajas) return tier.precio;
    }
    return PRECIO_TUBO;
}

function getTierLabel(cajas) {
    for (const tier of PRECIOS_ESCALONADOS) {
        if (cajas >= tier.minCajas) return tier.label;
    }
    return '1–9 cajas';
}

function calculateOrder(cajas, mode = 'transfer') {
    cajas = Math.max(1, Math.floor(cajas || 1));
    const tubos      = cajas * TUBOS_CAJA;
    const precioUnit = getPrecioTubo(cajas);
    const subtotal   = tubos * precioUnit;
    
    let flete = 0;
    if (mode === 'cod') {
        const shalomPart = Math.max(FLETE_SHALOM_MIN, cajas * FLETE_SHALOM_VAR);
        flete = FLETE_FIJO_LIMA + shalomPart;
    }

    const total    = subtotal + flete;
    const unitCost = total / tubos;
    
    const adelanto = (mode === 'cod') ? (total * 0.20) : 0;
    const saldo    = (mode === 'cod') ? (total * 0.80) : total;

    const fletePct = subtotal > 0 ? Math.round((flete / subtotal) * 100) : 0;
    
    const profitMin = Math.round(tubos * (35 - unitCost));
    const profitMax = Math.round(tubos * (40 - unitCost));
    
    return { 
        cajas, tubos, precioUnit, subtotal, flete, fletePct, total, unitCost, 
        adelanto, saldo, profitMin, profitMax 
    };
}

/**
 * UTILS.JS — Funciones de Utilidad, PDF y API
 */

function fmt(n) {
    return Number(n).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

async function sendToAppsScript(nombre, email, ocNumber) {
    if (!APPS_SCRIPT_URL) return;

    const ord  = calculateOrder(state.cajas, state.shippingMode);
    const tipo = state.comprobanteType;

    var dni = '', ruc = '', razon = '', dir = '';
    if (tipo === 'boleta') {
        dni = (document.getElementById('cod-dni') && document.getElementById('cod-dni').value.trim()) || '';
    } else {
        ruc   = (document.getElementById('cod-ruc')        && document.getElementById('cod-ruc').value.trim())        || '';
        razon = (document.getElementById('cod-razon')      && document.getElementById('cod-razon').value.trim())      || '';
        dir   = (document.getElementById('cod-dir-fiscal') && document.getElementById('cod-dir-fiscal').value.trim()) || '';
    }

    var recogedor = nombre;
    if (!state.recogedorEsYo) {
        const rn = (document.getElementById('cod-recog-nombre') && document.getElementById('cod-recog-nombre').value.trim()) || '';
        const rd = (document.getElementById('cod-recog-dni')    && document.getElementById('cod-recog-dni').value.trim())    || '';
        recogedor = rn + ' (DNI: ' + rd + ')';
    }

    const payload = {
        secretKey       : APPS_SECRET_KEY,
        ocNumber        : ocNumber || state.ocNumber,
        nombre,
        email,
        wsp             : (document.getElementById('cod-wsp')          && document.getElementById('cod-wsp').value.trim())          || '',
        departamento    : (document.getElementById('cod-departamento') && document.getElementById('cod-departamento').value)        || '',
        agencia         : (document.getElementById('cod-agencia')      && document.getElementById('cod-agencia').value)             || '',
        recogedor,
        cajas           : ord.cajas,
        tubos           : ord.tubos,
        subtotal        : ord.subtotal,
        flete           : ord.flete,
        total           : ord.total,
        shippingMode    : state.shippingMode,
        comprobanteType : tipo,
        dni, ruc, razon, dir,
        pdfBase64       : '',
        fileName        : 'OC-TubosCortina-' + (ocNumber || '') + '.pdf',
    };

    try {
        const resp = await fetch(APPS_SCRIPT_URL, {
            method  : 'POST',
            headers : { 'Content-Type': 'text/plain' },
            body    : JSON.stringify(payload),
        });
        const json = await resp.json();
        return json.success;
    } catch (err) {
        console.warn('[Apps Script] Error de conexión:', err.message);
        return false;
    }
}

function generatePDF() {
    const ord     = calculateOrder(state.cajas, state.shippingMode);
    const nombre  = (document.getElementById('cod-nombre')      && document.getElementById('cod-nombre').value.trim())      || '—';
    const wsp     = (document.getElementById('cod-wsp')         && document.getElementById('cod-wsp').value.trim())         || '—';
    const dept    = (document.getElementById('cod-departamento') && document.getElementById('cod-departamento').value)      || '—';
    const agencia = state.shippingMode === 'recojo'
        ? 'RECOJO: ' + ALMACENES_LIMA[state.almacenIndex]
        : ((document.getElementById('cod-agencia') && document.getElementById('cod-agencia').value) || '—');
    const tipo = state.comprobanteType;

    var modalidad = 'Transferencia Bancaria 🏦';
    if (state.shippingMode === 'cod')    modalidad = 'Contra Entrega (Adelanto 20% / Saldo 80%) 🚚';
    if (state.shippingMode === 'recojo') modalidad = 'Recojo en Almacén 🏢';

    var recog = nombre + ' (comprador)';
    if (!state.recogedorEsYo) {
        const rn = (document.getElementById('cod-recog-nombre') && document.getElementById('cod-recog-nombre').value.trim()) || '—';
        const rd = (document.getElementById('cod-recog-dni')    && document.getElementById('cod-recog-dni').value.trim())    || '—';
        recog = rn + ' — DNI: ' + rd;
    }

    var cHtml = '', clave = '';
    if (tipo === 'boleta') {
        const dni   = (document.getElementById('cod-dni')          && document.getElementById('cod-dni').value.trim())          || '—';
        const email = (document.getElementById('cod-email-boleta') && document.getElementById('cod-email-boleta').value.trim()) || '—';
        cHtml = '<tr><td>Tipo</td><td><strong>Boleta de Venta Electrónica</strong></td></tr>' +
                '<tr><td>DNI</td><td>' + dni + '</td></tr>' +
                '<tr><td>Correo</td><td>' + email + '</td></tr>';
        clave = 'tu DNI (' + dni + ')';
    } else {
        const ruc   = (document.getElementById('cod-ruc')           && document.getElementById('cod-ruc').value.trim())           || '—';
        const razon = (document.getElementById('cod-razon')         && document.getElementById('cod-razon').value.trim())         || '—';
        const dir   = (document.getElementById('cod-dir-fiscal')    && document.getElementById('cod-dir-fiscal').value.trim())    || '—';
        const email = (document.getElementById('cod-email-factura') && document.getElementById('cod-email-factura').value.trim()) || '—';
        cHtml = '<tr><td>Tipo</td><td><strong>Factura Electrónica</strong></td></tr>' +
                '<tr><td>RUC</td><td>' + ruc + '</td></tr>' +
                '<tr><td>Razón Social</td><td>' + razon + '</td></tr>' +
                '<tr><td>Dir. Fiscal</td><td>' + dir + '</td></tr>' +
                '<tr><td>Correo</td><td>' + email + '</td></tr>';
        clave = 'tu RUC (' + ruc + ')';
    }

    const now = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    const ocN = state.ocNumber || 'SIN-OC';

    var codPaymentBlock = '';
    if (state.shippingMode === 'cod') {
        codPaymentBlock = '<div class="sec-t" style="margin-top:20px; color:#e74c3c">💳 CRONOGRAMA DE PAGO</div>' +
            '<table class="data-tb">' +
            '<tr><td>Adelanto (20%)</td><td><strong>S/. ' + ord.adelanto.toFixed(2) + '</strong></td></tr>' +
            '<tr><td>Saldo en Destino (80%)</td><td><strong>S/. ' + ord.saldo.toFixed(2) + '</strong></td></tr>' +
            '</table>';
    }

    var transferNote = state.shippingMode === 'transfer'
        ? 'Flete y embalaje gratis. Envíe voucher.'
        : '20% adelanto para despacho + 80% en destino.';
    var transferLabel = state.shippingMode === 'transfer' ? 'Transferencia:' : 'Pago Escalonado:';

    const html = '<!DOCTYPE html>' +
        '<html lang="es"><head><meta charset="UTF-8">' +
        '<title>Orden de Compra ' + ocN + ' — Tubos de Cortina</title>' +
        '<style>' +
        'body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#1c1917;margin:0;padding:30px 40px;background:#fff}' +
        '.header{width:100%;display:table;margin-bottom:25px}' +
        '.header-l{display:table-cell;vertical-align:top}' +
        '.header-r{display:table-cell;vertical-align:top;text-align:right}' +
        '.h-logo{font-size:28px;font-weight:900;letter-spacing:-1px;display:inline-block;line-height:1}' +
        '.h-tag{color:#c88264;font-size:11px;font-weight:700;letter-spacing:1px;display:block;margin-bottom:6px}' +
        '.oc-bg{color:#f0ece8;font-size:40px;font-weight:900;line-height:0.8;margin-bottom:10px}' +
        '.oc-pill{background:#c88264;color:white;padding:10px 20px;border-radius:8px;display:inline-block;text-align:left;font-size:11px}' +
        '.page{display:table;width:100%}' +
        '.left-col{display:table-cell;width:50%;vertical-align:top;padding-right:20px;border-right:2px solid #f0ece8}' +
        '.right-col{display:table-cell;width:50%;vertical-align:top;padding-left:20px}' +
        '.sec-t{font-size:14px;font-weight:900;margin:20px 0 10px;color:#c88264;letter-spacing:0.5px;text-transform:uppercase}' +
        '.data-tb{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:10px}' +
        '.data-tb td{padding:8px 0;border-bottom:1px solid #f9f7f5}' +
        '.data-tb tr td:first-child{font-weight:bold;width:45%;color:#333}' +
        '.data-tb tr td:last-child{color:#555}' +
        '.totals{border-bottom:2px solid #c88264;padding-bottom:15px;margin-bottom:15px;margin-top:50px;text-align:right}' +
        '.tot-r{font-size:10px;font-weight:bold;color:#c88264;display:inline-block;width:90px;text-align:right;margin-right:15px}' +
        '.tot-v{font-size:13px;font-weight:bold;display:inline-block;width:70px;text-align:right;color:#1c1917}' +
        '.tot-row{margin-bottom:10px}' +
        '.grand{font-size:16px!important}' +
        '.note-box{border-radius:6px;padding:10px 14px;margin-top:12px;font-size:10px}' +
        '.note-yellow{background:#fff8e1;border:1px solid #ffe082;color:#795548;font-weight:bold}' +
        '.note-green{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534}' +
        '.footer{margin-top:25px;text-align:center;font-size:9px;color:#999;border-top:1px solid #f0ece8;padding-top:15px;line-height:1.5}' +
        '</style></head><body>' +
        '<div class="header">' +
        '<div class="header-l"><span class="h-tag">COTIZACIÓN MAYORISTA</span><span class="h-logo">TUBOS DE<br>CORTINA PERÚ</span></div>' +
        '<div class="header-r"><div class="oc-bg">ORDEN DE<br>COMPRA</div>' +
        '<div class="oc-pill"><strong>Nro. ' + ocN + '</strong><br><span style="font-weight:normal">' + now + ' | ' + nombre + '</span></div></div>' +
        '</div>' +
        '<div class="page">' +
        '<div class="left-col">' +
        '<div class="sec-t" style="margin-top:0">📋 DATOS DEL COMPRADOR</div>' +
        '<table class="data-tb">' +
        '<tr><td>Nombre y Apellidos</td><td>' + nombre + '</td></tr>' +
        '<tr><td>WhatsApp</td><td>' + wsp + '</td></tr>' +
        '<tr><td>Departamento</td><td>' + dept + '</td></tr>' +
        '<tr><td>Agencia / Almacén</td><td>' + agencia + '</td></tr>' +
        '<tr><td>Quién Recoge</td><td>' + recog + '</td></tr>' +
        '<tr><td>Modalidad de Pago</td><td>' + modalidad + '</td></tr>' +
        '</table>' +
        '<div class="sec-t">🧾 COMPROBANTE</div>' +
        '<table class="data-tb">' + cHtml + '</table>' +
        '<div class="note-box note-yellow">🔐 La contraseña de este documento será: <strong>' + clave + '</strong></div>' +
        '<div class="note-box note-green">✅ <strong>' + transferLabel + '</strong> ' + transferNote + '</div>' +
        '</div>' +
        '<div class="right-col">' +
        '<table style="width:100%;border-bottom:1px solid #c88264;padding-bottom:8px;margin-bottom:25px">' +
        '<tr><td style="color:#c88264;font-size:10px;font-weight:bold">DESCRIPCIÓN</td><td style="color:#c88264;font-size:10px;font-weight:bold;text-align:right;width:80px">MONTO</td></tr>' +
        '</table>' +
        '<div style="display:table;width:100%;font-size:11px;margin-bottom:10px">' +
        '<div style="display:table-cell;font-weight:900;width:25px">1.</div>' +
        '<div style="display:table-cell;color:#333;line-height:1.3"><strong>Kit de Tubo Extensible (Rejilla Elegante)</strong>' +
        '<span style="display:block;font-size:9px;color:#888;margin-top:2px">Lote de ' + state.cajas + ' cajas (' + (state.cajas * TUBOS_CAJA) + ' tubos) a S/. 27 c/u</span></div>' +
        '<div style="display:table-cell;text-align:right;font-weight:900;font-size:14px;width:90px">S/. ' + (state.cajas * TUBOS_CAJA * 27).toFixed(2) + '</div>' +
        '</div>' +
        '<div style="display:table;width:100%;font-size:11px;margin-bottom:10px">' +
        '<div style="display:table-cell;font-weight:900;width:25px">2.</div>' +
        '<div style="display:table-cell;color:#333;line-height:1.3"><strong>Gastos Logísticos (Flete + Emb)</strong>' +
        '<span style="display:block;font-size:9px;color:#888;margin-top:2px">' + (ord.flete === 0 ? 'GRATIS' : 'S/. ' + ord.flete.toFixed(2)) + '</span></div>' +
        '<div style="display:table-cell;text-align:right;font-weight:900;font-size:14px;width:90px">S/. ' + ord.flete.toFixed(2) + '</div>' +
        '</div>' +
        '<div class="totals">' +
        '<div class="tot-row"><span class="tot-r">SUBTOTAL (82%):</span><span class="tot-v">S/. ' + (ord.total * 0.82).toFixed(2) + '</span></div>' +
        '<div class="tot-row"><span class="tot-r">IGV (18%):</span><span class="tot-v">S/. ' + (ord.total * 0.18).toFixed(2) + '</span></div>' +
        '</div>' +
        '<div style="text-align:right"><span class="tot-r" style="color:#c88264;font-size:12px">TOTAL:</span>' +
        '<span class="tot-v grand">S/. ' + ord.total.toFixed(2) + '</span></div>' +
        codPaymentBlock +
        '<div class="sec-t" style="margin-top:30px">TÉRMINOS Y CONDICIONES:</div>' +
        '<div style="margin-top:20px;display:table;width:100%">' +
        '<div style="display:table-cell;width:80px;vertical-align:middle">' +
        '<img src="https://quickchart.io/qr?size=300&margin=1&text=https://wa.me/' + WA_EMPRESA + '?text=Hola,%20consulta%20por%20mi%20OC:%20' + ocN + '" style="width:70px">' +
        '</div>' +
        '<div style="display:table-cell;vertical-align:middle;font-size:9px;color:#666;line-height:1.4;padding-left:10px">' +
        'Escanee el código QR para autorizar el armado del lote vía WhatsApp con su asesor asignado.' +
        '</div></div>' +
        '</div></div>' +
        '<div class="footer"><strong>Tubos de Cortina Perú</strong> — Somos Marketing Perú EIRL · RUC 20615554384<br>' +
        'WhatsApp: +51 999 900 396 · cortinas-peru.web.app<br>' +
        'Este documento es una cotización para venta al por mayor. El pedido se confirma vía WhatsApp. Stock sujeto a disponibilidad.' +
        '</div></body></html>';

    const win = window.open('', '_blank', 'width=720,height=950');
    if (!win) { alert('Tu navegador bloqueó la ventana emergente. Permite popups para imprimir el PDF.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(function() { win.print(); }, 800);
}

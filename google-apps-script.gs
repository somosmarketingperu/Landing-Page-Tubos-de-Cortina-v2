/**
 * TubosCortina-EmailSender — Google Apps Script
 * ================================================
 * Web App que recibe datos del formulario COD,
 * guarda el PDF en Google Drive y envía email al cliente.
 *
 * CONFIGURACIÓN:
 * 1. Cambia DRIVE_FOLDER_NAME si quieres otra carpeta
 * 2. Cambia WA_NUMBER por el número real de WhatsApp
 * 3. Deploy como Web App (instrucciones abajo)
 */

// ── CONFIGURACIÓN ─────────────────────────────────
var CONFIG = {
  DRIVE_FOLDER_NAME : 'Órdenes Tubos Cortina',
  EMPRESA_NOMBRE    : 'Tubos de Cortina Perú',
  EMPRESA_EMAIL     : 'contacto@somosmarketingperu.com',
  EMPRESA_WA        : '51999900396',
  EMPRESA_WEB       : 'cortinas-peru.web.app',
  ALLOWED_ORIGIN    : 'https://cortinas-peru.web.app',
  SECRET_KEY        : 'TCP2026-SOMOS-MKT-PERÜ-SECURE-8f3k9'
};

// ── ENTRY POINT (POST) ────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // ── Verificar clave secreta (protección anti-spam) ──
    if (data.secretKey !== CONFIG.SECRET_KEY) {
      return buildResponse({ success: false, error: 'No autorizado' });
    }

    var resultado = procesarPedido(data);
    return buildResponse(resultado);
  } catch (err) {
    Logger.log('ERROR doPost: ' + err.message);
    return buildResponse({ success: false, error: err.message });
  }
}

// También acepta GET para pruebas rápidas desde el browser
function doGet(e) {
  return buildResponse({ ok: true, message: 'TubosCortina EmailSender activo ✅' });
}

// ── LÓGICA PRINCIPAL ──────────────────────────────
function procesarPedido(data) {
  // Validar campos mínimos
  if (!data.email || !data.nombre) {
    throw new Error('Faltan campos obligatorios: email o nombre');
  }

  // 1. Generar el número de OC (timestamp o provisto)
  var ocNumber = data.ocNumber || generarNumeroOC();

  // 2. Generar código HTML del PDF con datos formales
  var pdfHtml = construirPDFHTML(data, ocNumber);

  // 3. Convertir el HTML a PDF usando Apps Script nativamente
  var pdfBlob = Utilities.newBlob(pdfHtml, MimeType.HTML)
                .setName(data.fileName || 'OC-TubosCortina-' + ocNumber + '.pdf')
                .getAs(MimeType.PDF);

  // 4. Guardar en Google Drive
  var folder    = obtenerOCrearCarpeta(CONFIG.DRIVE_FOLDER_NAME);
  var archivo   = folder.createFile(pdfBlob);
  archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var driveUrl  = 'https://drive.google.com/file/d/' + archivo.getId() + '/view';

  // 5. Armar el cuerpo del email en HTML
  var htmlBody  = construirEmailHTML(data, ocNumber, driveUrl);

  // 5. Enviar email al cliente
  GmailApp.sendEmail(
    data.email,
    '[Orden Confirmada] Tu Orden de Compra N° ' + ocNumber + ' - Tubos de Cortina Peru',
    'Adjunto encontraras tu Orden de Compra. Abrela con tu ' + (data.comprobanteType === 'factura' ? 'RUC' : 'DNI') + ' como contrasena.',
    {
      htmlBody    : htmlBody,
      attachments : [pdfBlob],
      name        : CONFIG.EMPRESA_NOMBRE,
      replyTo     : CONFIG.EMPRESA_EMAIL
    }
  );

  // 6. Guardar registro en hoja de cálculo (opcional pero útil)
  registrarEnHoja(data, ocNumber, driveUrl);

  Logger.log('[OK] Pedido procesado: ' + ocNumber + ' → ' + data.email);

  return {
    success   : true,
    ocNumber  : ocNumber,
    driveUrl  : driveUrl,
    message   : 'Email enviado con éxito a ' + data.email
  };
}

// ── HELPERS ───────────────────────────────────────

function obtenerOCrearCarpeta(nombre) {
  var folders = DriveApp.getFoldersByName(nombre);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(nombre);
}

function generarNumeroOC() {
  var now  = new Date();
  var yyyy = now.getFullYear();
  var mm   = String(now.getMonth() + 1).padStart(2, '0');
  var dd   = String(now.getDate()).padStart(2, '0');
  var seq  = String(Math.floor(Math.random() * 9000) + 1000);
  return 'OC-' + yyyy + mm + dd + '-' + seq;
}

function registrarEnHoja(data, ocNumber, driveUrl) {
  try {
    var ss     = obtenerOCrearHoja();
    var sheet  = ss.getSheetByName('Pedidos') || ss.insertSheet('Pedidos');

    // Cabeceras si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'N° OC', 'Fecha', 'Nombre', 'WhatsApp', 'Email',
        'Cajas', 'Tubos', 'Total S/.', 'Departamento', 'Agencia',
        'Quien Recoge', 'Comprobante', 'Drive URL'
      ]);
      sheet.getRange(1, 1, 1, 13).setFontWeight('bold');
    }

    sheet.appendRow([
      ocNumber,
      new Date().toLocaleDateString('es-PE'),
      data.nombre           || '',
      data.wsp              || '',
      data.email            || '',
      data.cajas            || '',
      data.tubos            || '',
      data.total            || '',
      data.departamento     || '',
      data.agencia          || '',
      data.recogedor        || '',
      data.comprobanteType  || '',
      driveUrl
    ]);
  } catch (err) {
    Logger.log('Advertencia: no se pudo registrar en hoja: ' + err.message);
    // No lanzar error — el email ya fue enviado
  }
}

function obtenerOCrearHoja() {
  var nombre = 'Registro Pedidos — Tubos Cortina';
  var files  = DriveApp.getFilesByName(nombre);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  var ss = SpreadsheetApp.create(nombre);
  // Mover a la misma carpeta que los PDFs
  var folder = obtenerOCrearCarpeta(CONFIG.DRIVE_FOLDER_NAME);
  DriveApp.getFileById(ss.getId()).moveTo(folder);
  return ss;
}

// ── EMAIL HTML ────────────────────────────────────

function construirEmailHTML(data, ocNumber, driveUrl) {
  var orden     = data;
  var tipoCpbt  = orden.comprobanteType === 'factura' ? 'Factura' : 'Boleta de Venta';
  var clavePDF  = orden.comprobanteType === 'factura'
                  ? 'tu RUC (' + (orden.ruc || '___') + ')'
                  : 'tu DNI (' + (orden.dni || '___') + ')';

  return '\
<!DOCTYPE html>\
<html lang="es">\
<head>\
  <meta charset="UTF-8">\
  <meta name="viewport" content="width=device-width, initial-scale=1.0">\
</head>\
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5;">\
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">\
\
    <!-- Header -->\
    <div style="background:#1c1917;padding:24px 28px;">\
      <table style="width:100%; border-collapse:collapse; border:none; margin:0; padding:0;">\
        <tr>\
          <td style="text-align:left; vertical-align:middle;">\
            <div style="color:#c88264;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">TUBOS DE CORTINA PERÚ</div>\
            <div style="color:white;font-size:22px;font-weight:900;margin-top:4px;">Orden de Compra</div>\
            <div style="color:#888;font-size:12px;margin-top:2px;">' + ocNumber + '</div>\
          </td>\
          <td style="text-align:right; vertical-align:middle;">\
            <span style="background:#c88264;color:white;padding:8px 16px;border-radius:20px;font-size:10px;font-weight:900;display:inline-block;white-space:nowrap;letter-spacing:0.5px;">' + (data.esTransferencia ? 'TRANSFERENCIA' : 'CONTRA ENTREGA') + '</span>\
          </td>\
        </tr>\
      </table>\
    </div>\
\
    <!-- Saludo -->\
    <div style="padding:24px 28px;">\
      <p style="font-size:15px;color:#333;">Hola <strong>' + orden.nombre + '</strong>,</p>\
      <p style="color:#555;font-size:14px;line-height:1.6;">\
        Hemos recibido tu pedido correctamente. Adjunto encontrarás tu <strong>Orden de Compra en PDF</strong>.\
      </p>\
\
      <!-- Alerta de contraseña -->\
      <div style="background:#fff8e1;border-left:4px solid #c88264;padding:14px 18px;border-radius:0 8px 8px 0;margin:16px 0;">\
        <div style="font-weight:700;color:#c88264;font-size:12px;text-transform:uppercase;margin-bottom:6px;">&#128274; Para abrir tu PDF</div>\
        <div style="font-size:14px;color:#555;">La contraseña del PDF adjunto es <strong>' + clavePDF + '</strong></div>\
      </div>\
\
      <!-- Resumen del pedido -->\
      <div style="background:#f9f7f5;border-radius:10px;padding:16px 20px;margin:16px 0;">\
        <div style="font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">&#128193; Resumen del Pedido</div>\
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:#444;">\
          <tr><td style="padding:5px 0;color:#888;">Producto</td><td style="text-align:right;font-weight:700;">Tubo Cortina Extensible 3m · Luxury</td></tr>\
          <tr><td style="padding:5px 0;color:#888;">Cantidad</td><td style="text-align:right;">' + (orden.cajas || '—') + ' cajas · ' + (orden.tubos || '—') + ' tubos</td></tr>\
          <tr><td style="padding:5px 0;color:#888;">Agencia Shalom</td><td style="text-align:right;font-size:11px;">' + (orden.agencia || '—') + '</td></tr>\
          <tr><td style="padding:5px 0;color:#888;">Comprobante</td><td style="text-align:right;">' + tipoCpbt + '</td></tr>\
          <tr style="border-top:2px solid #e0d8d2;">\
            <td style="padding:10px 0 0;font-size:15px;font-weight:900;color:#1c1917;">TOTAL</td>\
            <td style="text-align:right;font-size:18px;font-weight:900;color:#c88264;padding-top:10px;">S/. ' + (orden.total || '0') + '</td>\
          </tr>\
        </table>\
      </div>\
\
      <!-- Ver PDF en Drive -->\
      <div style="text-align:center;margin:20px 0;">\
        <a href="' + driveUrl + '" style="background:#1c1917;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">&#128196; Ver mi PDF en Google Drive</a>\
        <p style="font-size:11px;color:#aaa;margin-top:8px;">Recuerda usar ' + clavePDF + ' como contraseña para abrirlo</p>\
      </div>\
\
      <!-- WhatsApp CTA -->\
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;text-align:center;">\
        <div style="font-size:13px;color:#166534;margin-bottom:8px;">&#9989; <strong>Pagas al recibir</strong> en la agencia Shalom. Sin anticipos.</div>\
        <a href="https://wa.me/' + CONFIG.EMPRESA_WA + '" style="color:#16a34a;font-weight:700;font-size:13px;">&#128172; Contáctanos por WhatsApp para coordinar</a>\
      </div>\
    </div>\
\
    <!-- Footer -->\
    <div style="background:#f9f7f5;padding:16px 28px;text-align:center;">\
      <div style="font-size:11px;color:#aaa;">\
        <strong style="color:#555;">' + CONFIG.EMPRESA_NOMBRE + '</strong><br>\
        Somos Marketing Perú EIRL · RUC 20615554384<br>\
        ' + CONFIG.EMPRESA_EMAIL + ' · ' + CONFIG.EMPRESA_WEB + '\
      </div>\
    </div>\
\
  </div>\
</body>\
</html>';
}

// ── PDF HTML BUILDER (Premium 2-Column Template) ───────────────
function construirPDFHTML(d, ocN) {
  var dpt = (d.departamento || '').toLowerCase();
  dpt = dpt.charAt(0).toUpperCase() + dpt.slice(1);
  var recog = d.recogedor || d.nombre;
  
  var trnsf = (d.esTransferencia === true || d.esTransferencia === 'true');
  var fleteStr = trnsf ? '<strong style="color:#27ae60">GRATIS</strong>' : 'S/. ' + (d.flete || '0.00');
  var embStr   = trnsf ? '<strong style="color:#27ae60">GRATIS</strong>' : 'S/. ' + (d.embalaje || '0.00');

  var total = parseFloat(d.total) || parseFloat(d.subtotal) || 0;
  var igv = total * 0.18;
  var subtSinIgv = total - igv;
  
  // URL Encode proper for WA text
  var waText = encodeURIComponent('Hola, consulta por mi OC: ' + ocN);
  var qrUrl = 'https://quickchart.io/qr?size=200&margin=1&text=https://wa.me/' + CONFIG.EMPRESA_WA + '?text=' + waText;

  var urlBase = 'https://cortinas-peru.web.app/img/assets-pdf/';
  var iconFiles = [
    'Icono Interbank.png', 'Icono Cuenta corriente.png',
    'Icono Nombre del Beneficiario.png', 'Icono Whatsapp.png',
    'Icono Direccion.png', 'Icono dni.png', 'Icono Pago contraentrega.png',
    'Icono Correo.png', 'Icono RUC.png'
  ];
  
  // ── INLINING IMAGES AS BASE64 PARA GOOGLE APPS SCRIPT PDF ENGINE ──
  var requests = [{ url: qrUrl, muteHttpExceptions: true }];
  iconFiles.forEach(function(f) {
    requests.push({ url: urlBase + encodeURIComponent(f), muteHttpExceptions: true });
  });

  var responses = UrlFetchApp.fetchAll(requests);
  
  var qrB64 = '';
  if (responses[0].getResponseCode() === 200) {
    qrB64 = 'data:image/png;base64,' + Utilities.base64Encode(responses[0].getBlob().getBytes());
  }

  var iconMap = {};
  for (var i = 0; i < iconFiles.length; i++) {
    if (responses[i+1].getResponseCode() === 200) {
      iconMap[iconFiles[i]] = 'data:image/png;base64,' + Utilities.base64Encode(responses[i+1].getBlob().getBytes());
    } else {
      iconMap[iconFiles[i]] = ''; // fail silent
    }
  }

  function icono(file, txtArray) {
    var txtHtml = txtArray.map(function(t) { return '<div>' + t + '</div>'; }).join('');
    var imgHtml = iconMap[file] ? '<img src="' + iconMap[file] + '" width="22" style="margin-right:8px; vertical-align:top;">' : '';
    return '<div class="ic-row" style="margin-bottom:8px;">' +
             '<div class="ic-icon" style="display:inline-block; vertical-align:top;">' + imgHtml + '</div>' + 
             '<div class="ic-text" style="display:inline-block; vertical-align:top;">' + txtHtml + '</div>' +
           '</div>';
  }

  function tIc(file, txt) {
    var imgHtml = iconMap[file] ? '<img src="' + iconMap[file] + '" width="14" style="vertical-align:middle; margin-right:6px; margin-bottom:2px;">' : '';
    return imgHtml + '<span style="vertical-align:middle;">' + txt + '</span>';
  }

  var bankHtml = '';
  if (trnsf) {
    bankHtml = 
      '<div class="sec-t" style="margin-top:25px;">DATOS BANCARIOS</div>' +
      icono('Icono Interbank.png', ['Banco BCP (Cuenta Soles)', 'SOMOS MARKETING PERU EIRL']) +
      icono('Icono Cuenta corriente.png', ['N° Cta: 191-23456789-0-12', 'N° Interbancario: 002-191-000234567890-12']);
  }

  var dCli = 
    '<table class="data-tb">' +
      '<tr><td>' + tIc('Icono Nombre del Beneficiario.png', 'Nombre/Beneficiado') + '</td><td><strong>' + d.nombre + '</strong></td></tr>' +
      '<tr><td>' + tIc('Icono Whatsapp.png', 'WhatsApp') + '</td><td><strong>' + (d.wsp || '-') + '</strong></td></tr>' +
      '<tr><td>' + tIc('Icono Direccion.png', 'Departamento') + '</td><td><strong>' + dpt + '</strong></td></tr>' +
      '<tr><td>' + tIc('Icono Direccion.png', 'Agencia Shalom') + '</td><td><strong>' + (d.agencia || '-') + '</strong></td></tr>' +
      '<tr><td>' + tIc('Icono dni.png', 'Quién Recoge') + '</td><td><strong>' + recog + '</strong></td></tr>' +
      '<tr><td>' + tIc('Icono Pago contraentrega.png', 'Modalidad de Pago') + '</td><td><strong>' + (trnsf ? 'Transferencia Bancaria' : 'Contra Entrega') + '</strong></td></tr>' +
    '</table>';

  var cpbtHtml = '';
  var passHint = '';
  if (d.comprobanteType === 'boleta') {
    cpbtHtml = 
      '<table class="data-tb">' +
        '<tr><td>' + tIc('Icono Nombre del Beneficiario.png', 'Tipo de Cpe') + '</td><td><strong>Boleta de Venta</strong></td></tr>' +
        '<tr><td>' + tIc('Icono dni.png', 'DNI del Cliente') + '</td><td><strong>' + (d.dni||'') + '</strong></td></tr>' +
        '<tr><td>' + tIc('Icono Correo.png', 'Correo Asociado') + '</td><td><strong>' + (d.email||'') + '</strong></td></tr>' +
      '</table>';
    passHint = 'DNI (' + (d.dni||d.nombre) + ')';
  } else {
    cpbtHtml = 
      '<table class="data-tb">' +
        '<tr><td>' + tIc('Icono Nombre del Beneficiario.png', 'Tipo de Cpe') + '</td><td><strong>Factura Electrónica</strong></td></tr>' +
        '<tr><td>' + tIc('Icono RUC.png', 'RUC de la Empresa') + '</td><td><strong>' + (d.ruc||'') + '</strong></td></tr>' +
        '<tr><td>' + tIc('Icono Direccion.png', 'Razón Social') + '</td><td><strong>' + (d.razon||'') + '</strong></td></tr>' +
        '<tr><td>' + tIc('Icono Direccion.png', 'Domicilio Fiscal') + '</td><td><strong>' + (d.dir||'') + '</strong></td></tr>' +
      '</table>';
    passHint = 'RUC (' + (d.ruc||'') + ')';
  }

  var noteHtml = '';
  if (trnsf) {
    noteHtml = '<div class="note-box note-green"><strong>&#10004; Pago por Transferencia Activo:</strong> Flete y embalaje gratis aplicados. Por favor, enviar comprobante por WhatsApp.</div>';
  } else {
    noteHtml = '<div class="note-box note-green"><strong>&#10004; Pago Contra Entrega Activo:</strong> No se requiere adelanto. Abonar el monto exacto directamente en la agencia Shalom al recoger.</div>';
  }

  var qrImageTag = qrB64 ? '<img src="' + qrB64 + '" width="95" height="95" style="border:1px solid #ccc; border-radius:4px;">' : '<div style="width:95px;height:95px;border:1px solid #ccc;background:#eee;text-align:center;line-height:95px;font-size:10px;">QR</div>';

  return '\
<!DOCTYPE html>\
<html lang="es">\
<head>\
  <meta charset="UTF-8">\
  <style>\
    @page { margin: 25px 40px; size: A4 portrait; }\
    body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1c1917; margin: 0; padding: 0; font-size: 15px; line-height: 1.5; }\
    .header { width: 100%; border-bottom: 3px solid #1c1917; padding-bottom: 20px; margin-bottom: 25px; }\
    .h-tag { color: #c88264; font-size: 14px; font-weight: 800; letter-spacing: 1.5px; display:block; margin-bottom:6px; text-transform:uppercase; }\
    .h-logo { font-size: 38px; font-weight: 900; letter-spacing: -1px; display:block; color: #1c1917; line-height: 1.1; }\
    .oc-box { background: #f9f7f5; padding: 14px 20px; border-left: 6px solid #c88264; text-align: left; margin-top: 15px; }\
    .oc-title { font-size: 22px; font-weight: 900; color: #1c1917; margin-bottom: 4px; }\
    .oc-sub { font-size: 14px; color: #666; }\
    table.layout-tb { width: 100%; border-collapse: collapse; }\
    table.layout-tb td { vertical-align: top; }\
    .left-col { width: 48%; padding-right: 25px; }\
    .right-col { width: 52%; border-left: 2px solid #f0ece8; padding-left: 25px; }\
    .sec-t { font-size: 16px; font-weight: 900; margin: 0 0 15px; color: #c88264; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #f0ece8; padding-bottom: 5px; }\
    .data-tb { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 30px; }\
    .data-tb td { padding: 9px 0; border-bottom: 1px dotted #e5e5e5; }\
    .data-tb tr td:first-child { color: #666; width: 45%; }\
    .data-tb tr td:last-child { color: #1c1917; text-align: right; }\
    .desc-tb { width: 100%; border-collapse: collapse; margin-bottom: 25px; }\
    .desc-th { font-size: 13px; font-weight: 800; color: #c88264; border-bottom: 3px solid #c88264; padding-bottom: 8px; text-transform: uppercase; }\
    .item-row { margin-bottom: 20px; font-size: 15px; }\
    .item-title { font-weight: 800; color: #1c1917; font-size: 17px; margin-bottom: 4px; display:block; }\
    .item-sub { color: #666; font-size: 13px; display:block; line-height: 1.4; padding-right: 15px; }\
    .val-r { float: right; font-weight: 900; font-size: 18px; color: #1c1917; }\
    .totals { border-top: 2px dashed #ccc; padding-top: 20px; text-align: right; margin-top: 35px; }\
    .tot-row { margin-bottom: 10px; font-size: 15px; color: #555; }\
    .tot-lbl { display: inline-block; width: 140px; text-align: right; margin-right: 15px; font-weight:bold; }\
    .tot-val { display: inline-block; width: 90px; font-weight: 900; color:#1c1917; }\
    .grand { font-size: 24px !important; color: #c88264 !important; margin-top: 10px; }\
    .note-box { border-radius: 8px; padding: 14px 18px; margin-top: 25px; font-size: 13px; line-height: 1.5; }\
    .note-yellow { background: #fff8e1; border: 1px solid #ffe082; color: #795548; }\
    .note-green { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }\
    .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 20px; line-height: 1.6; }\
    .qr-table { width: 100%; margin-top: 30px; }\
    .qr-td { vertical-align: middle; }\
    .qr-text { font-size: 13px; color: #444; padding-left: 20px; font-weight: bold; line-height:1.5; }\
  </style>\
</head>\
<body>\
  <table style="width:100%; margin-bottom:25px;">\
    <tr>\
      <td style="width:50%;">\
        <span class="h-tag">COTIZACIÓN / ORDEN MAYORISTA</span>\
        <span class="h-logo">TUBOS DE CORTINA PERÚ</span>\
      </td>\
      <td style="width:50%; text-align:right;">\
        <div class="oc-box">\
          <div class="oc-title">ORDEN N° ' + ocN + '</div>\
          <div class="oc-sub">Fecha: ' + new Date().toLocaleDateString('es-PE') + ' &nbsp;|&nbsp; Emitido para: ' + d.nombre + '</div>\
        </div>\
      </td>\
    </tr>\
  </table>\
\
  <table class="layout-tb">\
    <tr>\
      <td class="left-col">\
        <div class="sec-t"> DATOS DE DESPACHO Y CONTACTO</div>\
        ' + dCli + '\
\
        <div class="sec-t"> DATOS DE FACTURACIÓN</div>\
        ' + cpbtHtml + '\
\
        ' + bankHtml + '\
      </td>\
\
      <td class="right-col">\
        <div class="sec-t"> DETALLE DEL PRODUCTO</div>\
        <div class="item-row">\
          <span class="val-r">S/. ' + (d.subtotal||'0.00') + '</span>\
          <span class="item-title">1. Tubo Extensible Luxury (Acero)</span>\
          <span class="item-sub">Envío de ' + (d.cajas||'0') + ' cajas que contienen ' + (d.tubos||'0') + ' tubos listos para vender. Precio unitario S/. 27.00/tubo.</span>\
        </div>\
        \
        <div class="item-row" style="margin-top:25px;">\
          <span class="val-r">' + (trnsf ? "S/. 0.00" : "S/. "+((parseFloat(d.flete||0)+parseFloat(d.embalaje||0)).toFixed(2))) + '</span>\
          <span class="item-title">2. Gastos Logísticos Expresos</span>\
          <span class="item-sub">Gestión de embalaje seguro (' + embStr + ') y transporte flete (' + fleteStr + ') hacia agencia destino.</span>\
        </div>\
\
        <div class="totals">\
          <div class="tot-row"><span class="tot-lbl">SUBTOTAL (82%):</span><span class="tot-val">S/. ' + subtSinIgv.toFixed(2) + '</span></div>\
          <div class="tot-row"><span class="tot-lbl">I.G.V. (18%):</span><span class="tot-val">S/. ' + igv.toFixed(2) + '</span></div>\
          <div class="tot-row" style="margin-top:15px;">\
            <span class="tot-lbl" style="font-size:18px; color:#c88264;">TOTAL A PAGAR:</span>\
            <span class="tot-val grand">S/. ' + total.toFixed(2) + '</span>\
          </div>\
        </div>\
\
        <table class="qr-table">\
          <tr>\
            <td class="qr-td" style="width:105px;">\
              ' + qrImageTag + '\
            </td>\
            <td class="qr-td qr-text">\
               IMPORTANTE: Por favor, escanee este código QR usando la cámara de su celular para informarnos vía WhatsApp que ha finalizado su orden y coordinar la entrega.\
            </td>\
          </tr>\
        </table>\
      </td>\
    </tr>\
  </table>\
\
  ' + noteHtml + '\
  <div class="note-box note-yellow" style="margin-top:15px;">\
    <strong>[ ! ] Contraseña de Seguridad:</strong> Si recibió este archivo como PDF adjunto en su correo electrónico personal, recuerde que está encriptado. Utilice su ' + passHint + ' como contraseña para abrirlo.\
  </div>\
\
  <div class="footer">\
      <strong>Tubos de Cortina Perú</strong> — Somos Marketing Perú EIRL · RUC 20615554384<br>\
      WhatsApp: +51 999 900 396 · cortinas-peru.web.app<br>\
      Este documento es una cotización para venta al por mayor. El pedido se confirma vía WhatsApp. Stock sujeto a disponibilidad.\
  </div>\
</body>\
</html>';
}

// ── RESPUESTA HTTP CON CORS ───────────────────────

function buildResponse(data) {
  var output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

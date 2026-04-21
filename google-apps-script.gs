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
    '📦 Tu Orden de Compra N° ' + ocNumber + ' — Tubos de Cortina Perú',
    'Adjunto encontrarás tu Orden de Compra. Ábrela con tu ' + (data.comprobanteType === 'factura' ? 'RUC' : 'DNI') + ' como contraseña.',
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
    <div style="background:#1c1917;padding:24px 28px;display:flex;justify-content:space-between;align-items:center;">\
      <div>\
        <div style="color:#c88264;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">TUBOS DE CORTINA PERÚ</div>\
        <div style="color:white;font-size:20px;font-weight:900;margin-top:4px;">Orden de Compra</div>\
        <div style="color:#888;font-size:12px;margin-top:2px;">' + ocNumber + '</div>\
      </div>\
      <div style="background:#c88264;color:white;padding:8px 16px;border-radius:20px;font-size:11px;font-weight:900;">PAGO CONTRA ENTREGA</div>\
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
        <div style="font-weight:700;color:#c88264;font-size:12px;text-transform:uppercase;margin-bottom:6px;">🔐 Para abrir tu PDF</div>\
        <div style="font-size:14px;color:#555;">La contraseña del PDF adjunto es <strong>' + clavePDF + '</strong></div>\
      </div>\
\
      <!-- Resumen del pedido -->\
      <div style="background:#f9f7f5;border-radius:10px;padding:16px 20px;margin:16px 0;">\
        <div style="font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">📋 Resumen del Pedido</div>\
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
        <a href="' + driveUrl + '" style="background:#1c1917;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">📄 Ver mi PDF en Google Drive</a>\
        <p style="font-size:11px;color:#aaa;margin-top:8px;">Recuerda usar ' + clavePDF + ' como contraseña para abrirlo</p>\
      </div>\
\
      <!-- WhatsApp CTA -->\
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;text-align:center;">\
        <div style="font-size:13px;color:#166534;margin-bottom:8px;">🛡️ <strong>Pagas al recibir</strong> en la agencia Shalom. Sin anticipos.</div>\
        <a href="https://wa.me/' + CONFIG.EMPRESA_WA + '" style="color:#16a34a;font-weight:700;font-size:13px;">💬 Contáctanos por WhatsApp para coordinar</a>\
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

  // Cálculo igual a Mancuernas (82% Subt, 18% IGV) pero con Tubos de Cortina
  var total = parseFloat(d.total) || parseFloat(d.subtotal) || 0;
  var igv = total * 0.18;
  var subtSinIgv = total - igv;
  
  var urlBase = 'https://cortinas-peru.web.app/img/assets-pdf/';
  var qrUrl = 'https://quickchart.io/qr?size=300&margin=1&text=https://wa.me/' + CONFIG.EMPRESA_WA + '?text=Hola,%20consulta%20por%20mi%20OC:%20' + ocN;

  function icono(file, txtArray) {
    var txtHtml = txtArray.map(function(t) { return '<div>' + t + '</div>'; }).join('');
    return '<div class="ic-row"><div class="ic-icon"><img src="' + urlBase + encodeURIComponent(file) + '" /></div><div class="ic-text">' + txtHtml + '</div></div>';
  }

  var bankHtml = '';
  if (trnsf) {
    bankHtml = 
      '<div class="sec-t">DATOS BANCARIOS</div>' +
      icono('Icono Interbank.png', ['Banco BCP (Cuenta Soles)', 'SOMOS MARKETING PERU EIRL']) +
      icono('Icono Cuenta corriente.png', ['N° Cta: 191-23456789-0-12', 'N° Interbancario: 002-191-000234567890-12']);
  }

  var cpbtHtml = '';
  if (d.comprobanteType === 'boleta') {
    cpbtHtml = 
      icono('Icono Nombre del Beneficiario.png', ['Comprobante: Boleta Electrónica']) +
      icono('Icono dni.png', ['DNI: ' + (d.dni||'')]);
  } else {
    cpbtHtml = 
      icono('Icono Nombre del Beneficiario.png', ['Comprobante: Factura Electrónica']) +
      icono('Icono RUC.png', ['RUC: ' + (d.ruc||'')]) +
      icono('Icono Direccion.png', ['Razón: ' + (d.razon||''), 'Dir: ' + (d.dir||'')]);
  }

  var dCli = 
    icono('Icono Whatsapp.png', [d.wsp || '-']) +
    icono('Icono Correo.png', [d.email || '-']) +
    icono('Icono Pago contraentrega.png', [trnsf ? 'Transferencia Bancaria' : 'Pagará al recibir en Shalom']) +
    icono('Icono dni.png', ['Cliente / Recoge: ' + recog]);

  var dAgencia = 
    icono('Icono Direccion.png', ['Agencia Shalom', dpt + ' - ' + (d.agencia || '-')]) +
    icono('Icono Whatsapp.png', ['Soporte Web: 999 900 396']) +
    icono('Icono Pagina Web.png', ['cortinas-peru.web.app']);

  return '\
<!DOCTYPE html>\
<html lang="es">\
<head>\
  <meta charset="UTF-8">\
  <style>\
    body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1c1917; margin: 0; padding: 30px 40px; }\
    .header { width: 100%; display: table; margin-bottom: 25px; }\
    .header-l { display: table-cell; vertical-align: top; }\
    .header-r { display: table-cell; vertical-align: top; text-align: right; }\
    .h-logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; display:inline-block; line-height:1; }\
    .h-tag { color: #c88264; font-size: 11px; font-weight: 700; letter-spacing: 1px; display:block; margin-bottom:6px; }\
    .oc-bg { color: #f0ece8; font-size: 40px; font-weight: 900; line-height: 0.8; margin-bottom: 10px; }\
    .oc-pill { background: #c88264; color: white; padding: 10px 20px; border-radius: 8px; display: inline-block; text-align: left; font-size:11px; }\
    .page { display: table; width: 100%; }\
    .left-col { display: table-cell; width: 45%; vertical-align: top; padding-right: 25px; border-right: 2px solid #c88264; }\
    .right-col { display: table-cell; width: 55%; vertical-align: top; padding-left: 25px; }\
    .sec-t { font-size: 13px; font-weight: 900; margin: 25px 0 15px; color: #1c1917; letter-spacing: 0.5px; text-transform: uppercase; }\
    .ic-row { display: table; width: 100%; margin-bottom: 12px; }\
    .ic-icon { display: table-cell; vertical-align: top; width: 25px; padding-top: 2px; }\
    .ic-icon img { width: 14px; }\
    .ic-text { display: table-cell; vertical-align: top; font-size: 10px; color: #555; line-height: 1.4; }\
    .desc-tb { width: 100%; border-bottom: 1px solid #c88264; padding-bottom: 8px; margin-bottom: 25px; }\
    .desc-th { color: #e60000; font-size: 10px; font-weight: bold; }\
    .desc-r { text-align: right; width: 80px; }\
    .item-row { width: 100%; display: table; font-size: 11px; margin-bottom: 10px; }\
    .item-1 { display: table-cell; font-weight: 900; width: 25px; }\
    .item-2 { display: table-cell; color: #333; line-height: 1.3; }\
    .item-3 { display: table-cell; text-align: right; font-weight: 900; font-size: 14px; width: 90px; }\
    .item-sub { display: block; font-size: 9px; color: #888; font-weight: normal; margin-top:2px; }\
    .totals { border-bottom: 2px solid #c88264; padding-bottom: 15px; margin-bottom: 15px; margin-top: 60px; text-align: right; }\
    .tot-r { font-size: 10px; font-weight: bold; color: #e60000; display: inline-block; width: 90px; text-align: right; margin-right: 15px; }\
    .tot-v { font-size: 13px; font-weight: bold; display: inline-block; width: 70px; text-align: right; color:#1c1917; }\
    .tot-row { margin-bottom: 10px; }\
    .grand { font-size: 16px !important; }\
    .qr-box { margin-top: 40px; display: table; width: 100%; }\
    .qr-img { display: table-cell; width: 100px; vertical-align:middle; }\
    .qr-img img { width: 90px; }\
    .qr-txt { display: table-cell; vertical-align: middle; font-size: 10px; color: #666; line-height: 1.4; padding-left: 15px; }\
  </style>\
</head>\
<body>\
  <div class="header">\
    <div class="header-l">\
       <span class="h-tag">COTIZACIÓN MAYORISTA</span>\
       <span class="h-logo">TUBOS DE<br>CORTINA PERÚ</span>\
    </div>\
    <div class="header-r">\
       <div class="oc-bg">ORDEN DE<br>COMPRA</div>\
       <div class="oc-pill">\
         <strong>Nro. ' + ocN + '</strong><br>\
         <span style="font-weight:normal;">' + new Date().toLocaleDateString('es-PE') + ' &nbsp;|&nbsp; ' + d.nombre + '</span>\
       </div>\
    </div>\
  </div>\
\
  <div class="page">\
    <div class="left-col">\
      <div class="sec-t" style="margin-top:0;">DATOS DE LA AGENCIA</div>\
      ' + dAgencia + '\
\
      <div class="sec-t">DATOS DEL CLIENTE</div>\
      ' + dCli + '\
\
      ' + bankHtml + '\
\
      <div class="sec-t">COMPROBANTE</div>\
      ' + cpbtHtml + '\
    </div>\
\
    <div class="right-col">\
      <table class="desc-tb">\
        <tr><td class="desc-th">DESCRIPCIÓN</td><td class="desc-th desc-r">MONTO</td></tr>\
      </table>\
      \
      <div class="item-row">\
         <div class="item-1">1.</div>\
         <div class="item-2">\
           <strong>Tubo Extensible Luxury (hasta 3m)</strong>\
           <span class="item-sub">Lote de ' + (d.cajas||'0') + ' cajas (' + (d.tubos||'0') + ' tubos) a S/. 27 c/u</span>\
         </div>\
         <div class="item-3">S/. ' + (d.subtotal||'0') + '</div>\
      </div>\
      <div class="item-row">\
         <div class="item-1">2.</div>\
         <div class="item-2">\
           <strong>Gastos Logísticos</strong>\
           <span class="item-sub">Flete: ' + fleteStr + ' | Embalaje: ' + embStr + '</span>\
         </div>\
         <div class="item-3">' + (trnsf ? "S/. 0.00" : "S/. "+((parseFloat(d.flete||0)+parseFloat(d.embalaje||0)).toFixed(2))) + '</div>\
      </div>\
\
      <div class="totals">\
        <div class="tot-row"><span class="tot-r">SUBTOTAL (82%):</span><span class="tot-v">S/. ' + subtSinIgv.toFixed(2) + '</span></div>\
        <div class="tot-row"><span class="tot-r">IGV (18%):</span><span class="tot-v">S/. ' + igv.toFixed(2) + '</span></div>\
      </div>\
      <div style="text-align:right;">\
        <span class="tot-r" style="color:#c88264;font-size:12px;">TOTAL:</span>\
        <span class="tot-v grand">S/. ' + total.toFixed(2) + '</span>\
      </div>\
\
      <div class="sec-t" style="margin-top:60px;">TÉRMINOS Y CONDICIONES:</div>\
      <div class="qr-box">\
        <div class="qr-img"><img src="' + qrUrl + '"></div>\
        <div class="qr-txt">\
           Escanea el código QR con la cámara de tu celular para enviarnos automáticamente tu constancia de pago o confirmar stock con un asesor por WhatsApp.\
        </div>\
      </div>\
    </div>\
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

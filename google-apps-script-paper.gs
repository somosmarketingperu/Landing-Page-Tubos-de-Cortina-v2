/**
 * SIC Paper Dispatcher - VERSIÓN CORREGIDA (VIEWER LINKS)
 * =====================================================
 */

var CONFIG = {
  EMPRESA_NOMBRE : 'Somos Marketing Perú',
  SECRET_KEY     : 'SID-PRO-2026-SECURE'
};

// LINKS DE VISUALIZACIÓN (Para evitar errores 404 de descarga directa)
var LINKS = {
  pdf:   'https://drive.google.com/uc?id=1BCeHZlGHm6kPrpE9HHQtXKEqiuKs1Edm&export=download', // El PDF se mantiene en descarga
  video: 'https://drive.google.com/file/d/1gAyNkuO2t8Es8QVEQZ1pu018hkgIPJ2c/view?usp=sharing',
  cap1:  'https://drive.google.com/file/d/191yV9F_CMPzc5XiAqtu-AkKdrT-BREB/view?usp=sharing',
  cap2:  'https://drive.google.com/file/d/1ahu0DNr32uF7rAVH8aqXvdq-E97tfBwm/view?usp=sharing',
  cap3:  'https://drive.google.com/file/d/1R_8D_4I71XiYNFYkA87UfG7WRe29JDR1/view?usp=sharing',
  cap4p: 'https://drive.google.com/file/d/1_kqMtpTKSxrHdScgTvXRJvM7ZmfKJPD8/view?usp=sharing',
  cap4m: 'https://drive.google.com/file/d/1avud20QZmsbK7UL1MhR2qG77-Z9sXMEU/view?usp=sharing',
  cap5:  'https://drive.google.com/file/d/1QvO9vOvOGRzROI6cC1_YKptHTcx5qRE8/view?usp=sharing',
  cap6:  'https://drive.google.com/file/d/1UCfK-tBgOACinNifYj2XKkseG3ZsoMKF/view?usp=sharing'
};

function doPost(e) {
  try {
    var data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }
    if (data.secretKey !== CONFIG.SECRET_KEY) return buildResponse({ success: false, error: 'Key incorrecta' });
    var htmlBody = construirEmailHTML(data);
    GmailApp.sendEmail(data.email, "[ESTUDIO ACADÉMICO] " + data.nombre + ", acceso a investigación SIC", "", {
      htmlBody: htmlBody,
      name: CONFIG.EMPRESA_NOMBRE
    });
    return buildResponse({ success: true });
  } catch (err) {
    return buildResponse({ success: false, error: err.toString() });
  }
}

function construirEmailHTML(data) {
  var abstractReal = "El mercado mayorista peruano se caracteriza por una fuerte centralización en Lima, lo que impone altos costos logísticos y operativos a los minoristas de los diferentes departamentos del Perú, junto con una baja adopción del comercio electrónico (el 72% de las mypes no está preparado) y un incremento en el riesgo de seguridad y extorsión. Esta fricción se agrava por la aversión a la pérdida, que dificulta los pagos anticipados en el canal B2B. El presente trabajo, aborda esta problemática, propone el diseño e implementación del Sistema de Intermediación Comercial (SIC), un embudo de ventas semiautomático fundamentado en cuatro pilares: privacidad corporativa, automatización 24/7 mediante chatbot, eliminación de intermediarios y digitalización de la confianza a través del pago contra entrega, apalancado en la red logística nacional. Los resultados del modelado financiero y de demanda muestran que el punto de equilibrio del SIC es marginal, requiriendo solo 334 unidades mensuales para cubrir costos fijos, una cifra que el sistema supera en más de cuatro veces bajo escenarios conservadores de conversión. Se concluye que el SIC es un modelo viable y robusto que descentraliza el comercio B2B de manera segura, mitiga la aversión a la pérdida del comprador y ofrece un amplio margen de escalabilidad a un portafolio de 1,000 productos.";

  return `
  <!DOCTYPE html><html><body style="font-family:sans-serif; background:#f0f2f5; padding:20px; color:#333; margin:0;">
    <div style="max-width:600px; margin:20px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.1); border-bottom:8px solid #c88264;">
      <div style="background:#1c1917; padding:50px 40px; text-align:center; color:white;">
        <div style="color:#c88264; font-size:11px; font-weight:bold; letter-spacing:4px; text-transform:uppercase; margin-bottom:15px;">DOCUMENTACIÓN TÉCNICA EXCLUSIVA</div>
        <div style="font-size:28px; font-weight:900; letter-spacing:-0.5px; line-height:1.2;">ESTUDIO ACADÉMICO: SISTEMA DE INTERMEDIACIÓN COMERCIAL (SIC)</div>
      </div>
      <div style="padding:45px;">
        <p style="font-size:17px; color:#1c1917;">Estimado/a <strong>${data.nombre}</strong>,</p>
        <p style="font-size:15px; color:#666; line-height:1.6;">Es un placer saludarte. Adjuntamos la investigación comercial estratégica solicitada, desarrollada bajo la autoría intelectual de <strong>Jose Ricardo Garcia Quispe</strong>.</p>
        
        <div style="background:#fdfaf8; border-left:5px solid #c88264; padding:30px; margin:35px 0; border-radius:4px;">
            <div style="font-weight:bold; color:#c88264; font-size:12px; margin-bottom:15px; text-transform:uppercase; letter-spacing:1px;">Resumen Ejecutivo (Abstract):</div>
            <p style="margin:0; font-style:italic; font-size:13px; color:#444; line-height:1.8; text-align:justify;">"${abstractReal}"</p>
        </div>

        <div style="margin-bottom:40px;">
            <div style="font-weight:bold; color:#1c1917; font-size:14px; margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:10px;">DESGLOSE TÉCNICO Y ANEXOS:</div>
            <div style="font-size:13px; line-height:2.4;">
                <div style="border-bottom:1px solid #f9f9f9;">1. Introducción <a href="${LINKS.cap1}" style="float:right; color:#c88264; font-weight:bold; text-decoration:none;">[ANEXO 01]</a></div>
                <div style="border-bottom:1px solid #f9f9f9;">2.2 Estado del arte <a href="${LINKS.cap2}" style="float:right; color:#c88264; font-weight:bold; text-decoration:none;">[ANEXO 02]</a></div>
                <div style="border-bottom:1px solid #f9f9f9;">Capítulo 3. Metodología de la investigación <a href="${LINKS.cap3}" style="float:right; color:#c88264; font-weight:bold; text-decoration:none;">[ANEXO 03]</a></div>
                <div style="border-bottom:1px solid #f9f9f9;">Capítulo 4. Diseño del Sistema (SIC) <a href="${LINKS.cap4p}" style="float:right; color:#c88264; font-weight:bold; text-decoration:none;">[ANEXO 04]</a></div>
                <div style="border-bottom:1px solid #f9f9f9;">Capítulo 5. Análisis de mercado y viabilidad <a href="${LINKS.cap5}" style="float:right; color:#c88264; font-weight:bold; text-decoration:none;">[ANEXO 06]</a></div>
                <div style="border-bottom:1px solid #f9f9f9;">5.2 Distribución y escenarios de venta <a href="${LINKS.cap4m}" style="float:right; color:#c88264; font-weight:bold; text-decoration:none;">[ANEXO 05]</a></div>
                <div>7. Recomendaciones finales <a href="${LINKS.cap6}" style="float:right; color:#c88264; font-weight:bold; text-decoration:none;">[ANEXO 07]</a></div>
            </div>
        </div>

        <div style="background:#1c1917; padding:25px; border-radius:12px; text-align:center; margin-bottom:45px;">
            <div style="color:#c88264; font-size:10px; font-weight:bold; margin-bottom:8px; letter-spacing:2px;">PRESENTACIÓN EN VIDEO (5 MIN)</div>
            <a href="${LINKS.video}" style="color:white; font-weight:bold; text-decoration:none; font-size:16px;">▶️ VER RESUMEN EJECUTIVO DEL SIC</a>
        </div>

        <div style="text-align:center; margin-top:50px;">
          <a href="${LINKS.pdf}" style="background:#c88264; color:white; padding:22px 45px; border-radius:8px; font-weight:bold; text-decoration:none; display:inline-block; font-size:16px; box-shadow:0 10px 25px rgba(200, 130, 100, 0.3);">DESCARGAR PAPER COMPLETO (PDF)</a>
          <div style="margin-top:15px; color:#aaa; font-size:11px;">Peso del archivo: 23.2 MB</div>
        </div>
      </div>

      <div style="background:#f9f7f5; padding:40px; text-align:center; border-top:1px solid #eee; font-size:11px; color:#999; line-height:1.8;">
        <strong>SOMOS MARKETING PERÚ EIRL</strong><br>
        RUC 20615554384 // Lima, Perú<br>
        <span style="color:#bbb;">Investigación técnica de Jose Ricardo Garcia Quispe.</span>
      </div>
    </div>
  </body></html>`;
}

function buildResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

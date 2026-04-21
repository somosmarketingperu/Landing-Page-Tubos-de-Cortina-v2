import os
import re

BASE_PATH = r'c:\Users\user\Documents\ChatBots GitHub\Landing Page Modelo Tubos Cortinas v2\sections'

# Data from Brief
SALE_PRICE = "27.00"
BOX_PRICE = "252.00" # 21 * 12

def update_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# --- 16 STICKY ---
update_file(os.path.join(BASE_PATH, '16-sticky', 'content.html'), 
    '''<div class="va-sticky-wrap">
      <div class="va-sticky-bar">
        <div class="va-sticky-content">
          <span class="va-sticky-icon">🚚</span>
          <p class="va-sticky-text"><strong>¡ÚLTIMOS CUPOS SHALOM!</strong> Flete Cubierto 100% por pago anticipado hoy.</p>
        </div>
        <a href="#checkout" class="va-sticky-btn">¡APROVECHAR YA!</a>
      </div>
    </div>''')

# --- 01 HEADER ---
update_file(os.path.join(BASE_PATH, '01-header', 'content.html'),
    f'''<div class="va-top-container">
      <div class="va-banner">¡ENVÍO A PROVINCIA CON SHALOM! · PAGO CONTRA ENTREGA B2B</div>
      <header class="va-header">
        <div class="va-logo-row">
          <div class="va-lc">LOGO</div>
          <div class="va-lt">TUBOS PERÚ</div>
        </div>
        <a href="#checkout" class="va-hbtn">COMPRAR CAJA (S/. {BOX_PRICE})</a>
      </header>
    </div>''')

# --- 02 HERO ---
update_file(os.path.join(BASE_PATH, '02-hero', 'content.html'),
    '''<section class="hero-seccion-principal">
      <div class="hero-contenedor-layout">
        <div class="hero-columna-texto">
          <div class="hero-etiqueta-superior">IMPORTACIÓN DIRECTA • B2B</div>
          <h1 class="hero-titulo-principal">TUBOS DE CORTINA <span class="hero-texto-resaltado">LUXURY 3M</span></h1>
          <div class="hero-beneficio-fila">
            <span class="check-icono-circulo">✔</span>
            <span class="check-texto-descriptivo">Extensibles hasta 3.00 metros</span>
          </div>
          <div class="hero-beneficio-fila">
            <span class="check-icono-circulo">✔</span>
            <span class="check-texto-descriptivo">Acabado Acero Pulido (No se oxida)</span>
          </div>
          <div class="hero-beneficio-fila">
            <span class="check-icono-circulo">✔</span>
            <span class="check-texto-descriptivo">Pago Contra Entrega vía Shalom</span>
          </div>
          <a href="#checkout" class="hero-boton-comprar">S/. 21.00 / Unidad (Precio Importador)</a>
        </div>
        <div class="hero-columna-imagen">
          <img src="img/prod-real-all-colors.png" alt="Tubos de Cortina Luxury" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">
        </div>
      </div>
    </section>''')

# --- 15 ROADMAP ---
update_file(os.path.join(BASE_PATH, '15-roadmap', 'content.html'),
    '''<section class="va-road">
      <div class="va-road-container">
        <div class="va-road-header">
          <h2 class="va-road-title">TU MERCADERÍA <span class="text-highlight">DE LIMA A TU NEGOCIO</span></h2>
          <p class="va-road-subtitle">Logística Optimizada para el Vendedor de Provincia</p>
        </div>
        <div class="va-road-flow">
          <div class="va-step">
            <div class="va-step-num">01</div>
            <div class="va-step-card">
              <h3 class="va-step-h3">REGISTRO WEB</h3>
              <p class="va-step-p">Generas tu Orden B2B y coordinamos por WhatsApp.</p>
            </div>
          </div>
          <div class="va-step-arrow">→</div>
          <div class="va-step">
            <div class="va-step-num">02</div>
            <div class="va-step-card">
              <h3 class="va-step-h3">GESTIÓN LIMA</h3>
              <p class="va-step-p">Embalamos tu pedido en el almacén central de Lima.</p>
            </div>
          </div>
          <div class="va-step-arrow">→</div>
          <div class="va-step">
            <div class="va-step-num">03</div>
            <div class="va-step-card">
              <h3 class="va-step-h3">SHALOM EXPRESS</h3>
              <p class="va-step-p">Despacho inmediato a tu agencia Shalom más cercana.</p>
            </div>
          </div>
          <div class="va-step-arrow">→</div>
          <div class="va-step">
            <div class="va-step-num">04</div>
            <div class="va-step-card">
              <h3 class="va-step-h3">PAGO AL RECIBIR</h3>
              <p class="va-step-p">Recoges tu mercadería y pagas en agencia. 100% Seguro.</p>
            </div>
          </div>
        </div>
      </div>
    </section>''')

# --- 14 SOLUCION ---
update_file(os.path.join(BASE_PATH, '14-solucion', 'content.html'),
    '''<section class="va-sol">
      <div class="va-sol-container">
        <img src="img/infog-benefits-grid.png" alt="Beneficios Tubos Luxury" style="width:100%; border-radius:20px; box-shadow:0 20px 50px rgba(0,0,0,0.15);">
      </div>
    </section>''')

# --- 03 CALC ---
update_file(os.path.join(BASE_PATH, '03-calc', 'content.html'),
    '''<section class="va-calc-section">
      <div class="va-calc-container">
        <h2 class="va-calc-title">MAXIMIZA TU <span class="va-highlight">RENTABILIDAD</span></h2>
        <div class="va-slider-wrapper">
          <input type="range" class="va-range-slider" id="cajaSlider" min="1" max="3" step="1" value="2">
          <div class="va-labels">
            <span class="va-label-item" data-index="1">1 CAJA (12)</span>
            <span class="va-label-item va-active" data-index="2">4 CAJAS (48)</span>
            <span class="va-label-item" data-index="3">8 CAJAS (96)</span>
          </div>
        </div>
        <div class="va-calc-grid">
          <div class="va-calc-row"><span>Costo Producto (S/ 21 x u)</span><span class="va-val-highlight" id="valSubtotal">S/. 1,008</span></div>
          <div class="va-calc-row"><span>Logística & Envío</span><span id="valFlete">S/. 70</span></div>
          <div class="va-calc-divider"></div>
          <div class="va-calc-row total"><span>INVERSIÓN TOTAL</span><span id="valTotal">S/. 1,078</span></div>
          <div class="va-calc-row unit-highlight">
            <span class="va-label-unit">COSTO REAL PUESTO EN AGENCIA</span>
            <span class="va-val-unit" id="valUnidad">S/. 22.45</span>
          </div>
        </div>
        <div style="margin-top:20px; padding:15px; background:#fdf2f0; border:1px dashed var(--copper); border-radius:8px; font-size:12px; color:var(--copper); text-align:center;">
          💡 <strong>¡SWEET SPOT!</strong> A partir de 4 cajas tu flete baja al 6% de la inversión.
        </div>
      </div>
    </section>''')

# --- 05 KIT ---
update_file(os.path.join(BASE_PATH, '05-kit', 'content.html'),
    '''<section class="va-kit">
      <div class="va-kit-container">
        <img src="img/infog-kit-details-gold.png" alt="Detalle del Kit 18 Piezas" style="width:100%; border-radius:20px; box-shadow:0 30px 60px rgba(0,0,0,0.2);">
      </div>
    </section>''')

# --- 06 AUTH ---
update_file(os.path.join(BASE_PATH, '06-auth', 'content.html'),
    '''<section class="va-auth">
      <div class="va-auth-container">
        <div class="va-auth-flex">
          <div class="va-auth-visual">
              <img src="img/prod-real-stock.png" class="va-auth-img" style="border-radius:15px; border:2px solid var(--copper);">
              <div class="va-auth-badge"><span class="va-badge-tx">STOCK<br>INMEDIATO</span></div>
          </div>
          <div class="va-auth-text">
            <h2 class="va-auth-title">IMPORTACIÓN <span class="va-highlight">DIRECTA</span></h2>
            <p class="va-auth-tagline">Garantizamos el mejor precio para Trujillo, Arequipa y todo el Perú</p>
            <div class="va-auth-card">
              <p class="va-auth-desc">Somos Marketing Perú EIRL gestiona la importación de alto volumen para que tú puedas comprar a precio de Lima desde tu ciudad.</p>
            </div>
          </div>
        </div>
      </div>
    </section>''')

# --- 07 ARGS ---
update_file(os.path.join(BASE_PATH, '07-args', 'content.html'),
    '''<section class="va-args">
      <div class="va-args-container">
        <img src="img/infog-usage-args.png" alt="Por qué vender Tubos Luxury" style="width:100%; border-radius:20px;">
      </div>
    </section>''')

# --- 08 COMP ---
update_file(os.path.join(BASE_PATH, '08-comp', 'content.html'),
    '''<section class="va-comp">
      <div class="va-comp-container">
        <h2 class="va-comp-title">DEJA DE COMPRAR <span class="text-highlight">CARO</span></h2>
        <div class="va-comp-box">
          <div class="va-comp-side va-comp-enemy">
            <div class="va-side-label">COMPETENCIA PROVINCIA</div>
            <div class="va-side-rows">
              <div class="va-side-row"><span>Precio Unit.</span><span class="va-row-price bad-price">S/ 38.00</span></div>
              <div class="va-side-row"><span>Margen</span><span>Mínimo</span></div>
            </div>
          </div>
          <div class="va-comp-vs">VS</div>
          <div class="va-comp-side va-comp-pro">
            <div class="va-side-label pro-label">MODELO B2B</div>
            <div class="va-side-rows">
              <div class="va-side-row pro-row"><span>Costo Unit.</span><span class="va-row-price good-price">S/ 21.00</span></div>
              <div class="va-side-row pro-row"><span class="pro-text">Rentabilidad</span><span class="pro-text">ALTA (+40%)</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>''')

# --- 11 FLYER ---
update_file(os.path.join(BASE_PATH, '11-flyer', 'content.html'),
    '''<section class="va-flyer">
      <div class="va-flyer-card">
        <img src="img/infog-cta-banner.png" alt="Únete a la Red de Distribuidores" style="width:100%;">
      </div>
    </section>''')

# --- 13 CHECKOUT ---
update_file(os.path.join(BASE_PATH, '13-checkout', 'content.html'),
    '''<section class="va-checkout-section" id="checkout">
      <div class="va-check-container">
        <div class="va-check-card">
          <div class="va-check-head"><h2 class="va-check-title">🛡️ GENERAR ORDEN B2B</h2><p class="va-check-subtitle">Protección de Datos & Pago Contra Entrega Shalom</p></div>
          <div class="va-check-grid">
            <div class="va-check-form">
              <div class="va-input-group"><label>Nombre / Razón Social</label><input type="text" id="va-name" class="va-input" placeholder="Tu nombre"></div>
              <div class="va-input-group"><label>DNI / RUC</label><input type="text" id="va-doc-num" class="va-input" placeholder="Para boleta/factura"></div>
              <div class="va-input-group"><label>Cantidad de Pedido</label><select id="va-qty" class="va-input"><option value="4">4 CAJAS (MÁS RENTABLE)</option><option value="8">8 CAJAS (VOLUMEN)</option></select></div>
            </div>
            <div class="va-check-summary">
              <div class="va-total-box"><span class="va-total-label">TOTAL (PRODUCTO + ENVÍO):</span><span class="va-total-val" id="va-total-final">S/. 1,078.00</span></div>
              <div class="va-profit-box"><p>Ganancia Proyectada vediendo a S/ 27:</p><span id="va-profit-unit">S/. 4.55 por unidad</span></div>
              <button id="va-submit-btn" class="va-check-btn">GENERAR ORDEN DE COMPRA</button>
            </div>
          </div>
        </div>
      </div>
    </section>''')

print("All modules updated with new visual assets and pricing strategy.")

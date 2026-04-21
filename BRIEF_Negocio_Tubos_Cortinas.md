# BRIEF DE NEGOCIO — Tubos y Cortinas Perú
> Operado por **Somos Marketing Peru EIRL** · RUC 20615554384
> Proyecto: Landing Page B2B para Vendedores de Provincia

---

## 🤖 INSTRUCCIONES PARA EL ASISTENTE IA
> **Lee esta sección primero antes de tocar cualquier archivo.**

Este proyecto está basado en la arquitectura del proyecto **Mancuernas Perú**.
Lee SOLO estos 3 archivos de referencia (no necesitas leer todo el proyecto Mancuernas):

### 1. Arquitectura visual (obligatorio leer primero)
```
C:\Users\user\Documents\ChatBots GitHub\Landing Page Modelo Mancuernas\BLUEPRINT_Visual_Anatomia.html
```
**Qué extraer:** La estructura de 18 filas (rows) del layout, los nombres de las clases CSS (.arow, .l-cell, .wf-col, .r-cell, .wfs, .anno), y el sistema de conectores horizontales. Este proyecto DEBE seguir el mismo sistema visual.

### 2. Orquestador principal (leer para entender la arquitectura modular)
```
C:\Users\user\Documents\ChatBots GitHub\Landing Page Modelo Mancuernas\index.html
```
**Qué extraer:** Cómo se cargan los módulos HTML mediante `fetch()`, cómo se inyectan los estilos de cada sección al `<head>`, y la configuración de Tailwind CSS inline.

### 3. Ejemplo de módulo Hero (leer para entender el patrón de cada sección)
```
C:\Users\user\Documents\ChatBots GitHub\Landing Page Modelo Mancuernas\01_Hero_Beneficios_Comprar.html
```
**Qué extraer:** La estructura de un módulo independiente: tiene su propio `<style>`, su contenido HTML, y NO tiene `<html>`/`<body>` completos porque es inyectado por `index.html`.

### Reglas del proyecto
- Cada sección = 1 archivo HTML independiente (sin `<html>`/`<body>`)
- `index.html` los carga todos dinámicamente via `fetch()`
- Usar **Tailwind CSS** (cargado en index.html), **no CDNs adicionales**
- Todas las imágenes en formato **WebP**
- Mobile-first: breakpoints 390px → 768px → 1280px
- Color principal: `#d0d712` (lima/yellow-green)
- Agencia de envío principal: **Shalom** (pago contra entrega)
- El público es **B2B** (vendedores de provincia), NO consumidor final

---

## 🎯 Modelo de Negocio

Somos Marketing Perú actúa como **intermediario B2B** entre importadores de Lima y vendedores de provincia:

1. **Captación** → Redes sociales + Landing Page → Lead (vendedor de provincia)
2. **Pedido** → WhatsApp 24/7 → Orden enviada al importador
3. **Despacho** → Importador arma pedido → Lleva a Shalom → Envío al cliente
4. **Cobro** → Pago Contra Entrega (Shalom) → Somos Marketing cobra diferencial

**Público Objetivo:** Emprendedores y tiendas provincianas que actualmente compran a importadores locales a precios altos.

---

## 📦 PRODUCTO 1 — Tubo de Cortina Extendible (hasta 3 mts)

### Precios de mercado
| Canal | Precio unitario |
|---|---|
| Retail Lima (precio final consumidor) | S/. 35 |
| Provincias (precio actual de competencia local) | S/. 35 – 40 |

### Costo de adquisición
| Detalle | Valor |
|---|---|
| Costo por unidad (mínimo 1 caja) | **S/. 21** |
| Unidades por caja | 12 unidades |
| Costo de 1 caja | S/. 252 |

### 📊 Análisis de Fletes — Tubo (caja = 12 unidades)

| Cantidad | Unidades | Costo Producto | Flete | Envío a Agencia | **Total** | Flete % del total |
|---|---|---|---|---|---|---|
| 1 caja | 12 | S/. 252 | S/. 35 | S/. 20 | **S/. 307** | ~17% |
| 4 cajas | 48 | S/. 1,008 | S/. 50 | S/. 20 | **S/. 1,078** | ~6% |
| 8 cajas | 96 | S/. 2,016 | S/. 100 | S/. 20 | **S/. 2,136** | ~5% |

> 💡 **Punto óptimo: 4–5 cajas** → El flete baja de 17% a 6% del costo total

### Margen del intermediario (Somos Marketing)
- Compra a importador: **S/. 21/unidad**
- Vende al cliente B2B: **S/. 25–27/unidad**
- Margen estimado: **S/. 4–6 por unidad**

---

## 🪟 PRODUCTO 2 — Cortinas Dobles (hasta 3 mts)

### Precios de mercado
| Canal | Precio unitario |
|---|---|
| Retail Lima (precio final consumidor) | S/. 50 |
| Provincias (precio actual de competencia local) | S/. 40 – 50 |

### Costo de adquisición
| Detalle | Valor |
|---|---|
| Costo por unidad (mínimo 1 caja) | **S/. 27** |
| Unidades por caja | 24 unidades |
| Costo de 1 caja | S/. 648 |

### 📊 Análisis de Fletes — Cortinas (caja = 24 unidades)

| Cantidad | Unidades | Costo Producto | Flete | Envío a Agencia | **Total** | Flete % del total |
|---|---|---|---|---|---|---|
| 1 caja | 24 | S/. 648 | S/. 60 | S/. 20 | **S/. 728** | ~11% |
| 4 cajas | 96 | S/. 2,592 | S/. 100 | S/. 20 | **S/. 2,712** | ~4% |
| 8 cajas | 192 | S/. 5,184 | S/. 150 | S/. 20 | **S/. 5,354** | ~3% |

> 💡 **Punto óptimo: 4–5 cajas** → El flete baja de 11% a 4% del costo total

### Margen del intermediario (Somos Marketing)
- Compra a importador: **S/. 27/unidad**
- Vende al cliente B2B: **S/. 32–35/unidad**
- Margen estimado: **S/. 5–8 por unidad**

---

## 🏆 Propuesta de Valor para el Vendedor de Provincia

| Beneficio | Detalle |
|---|---|
| **Precio competitivo** | Compra más barato que a su importador local (S/21 vs S/35–40) |
| **Pago Contra Entrega** | Cero riesgo, paga cuando recibe con Shalom |
| **Stock garantizado** | Importador Lima tiene stock constante |
| **Pedido mínimo manejable** | Desde 1 caja (12 tubos / 24 cortinas) |
| **Envío a todo el Perú** | Shalom cubre todas las provincias |
| **Atención 24/7** | WhatsApp siempre disponible |

---

## 📐 Estructura de la Landing Page (a desarrollar)

El proyecto seguirá la misma arquitectura modular del proyecto **Mancuernas Perú**:
- `index.html` — orquestador principal
- `01_Hero_*.html` — CTA principal + precio por caja
- `02_Beneficios_*.html` — Por qué comprar al por mayor
- `03_Calculadora_Flete.html` — **NUEVO**: calculadora interactiva de ahorro en flete
- `04_Comparativa_*.html` — Precio nuestro vs. precio importador local
- `05_Testimonios_*.html` — Vendedores provinciales satisfechos
- `06_Oferta_Mayorista.html` — Tabla de precios por volumen
- `07_FAQ_*.html` — Preguntas frecuentes + CTA final
- `BLUEPRINT_Visual_Anatomia.html` — Documento de arquitectura

---

## 🗓 Estado
- [x] Brief de negocio creado
- [ ] Diseño de wireframes
- [ ] Desarrollo de módulos HTML
- [ ] Integración con WhatsApp Business
- [ ] Campaña de captación en Meta Ads

---
*Documento creado el 2026-04-15 · Somos Marketing Peru EIRL*

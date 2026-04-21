# MEGA-PROMPT MAESTRO — Landing Page B2B "Tubos de Cortina"
## Para usar en: Stitch, Vercel v0, Claude Artifacts o similar IA Visual

Copia todo el texto a partir de la línea "---INICIO DEL PROMPT---" hasta "---FIN DEL PROMPT---"

---INICIO DEL PROMPT---

## ROL Y OBJETIVO

Actúa como un arquitecto frontend senior especializado en páginas de alta conversión B2B (Business-to-Business) y diseño de interiores premium. Tu misión es generar una landing page completa, de alta fidelidad visual, para la empresa **Somos Marketing Perú EIRL** (RUC: 20615554384). El producto son **Tubos de Cortina Extensibles de Metal** vendidos en modalidad mayorista a emprendedores y tiendas de provincia peruanas.

La página tiene que ser funcional, visualmente premium, y estar orientada a la conversión de distribuidores, NO al consumidor final.

---

## DESIGN SYSTEM ESTRICTO — CUMPLIMIENTO OBLIGATORIO

### Paleta de Colores (NO cambiar)
- **Fondo global (body/página):** `#f0ebe4` — Alabastro cálido / crema
- **Fondos de contenedores / cards:** `#ffffff` — Blanco puro
- **Fondos alternados (secciones pares):** `#f9f6f0` — Marfil suave
- **Color de ACENTO principal (CTA, botones, íconos, highlights):** `#c88264` — Cobre cálido pulido (evoca el metal de los tubos de cortina)
- **Tipografía principal / títulos:** `#302621` — Marrón Espresso oscuro
- **Tipografía secundaria / párrafos:** `#6b5f58` — Warm Brown suave
- **Bordes y separadores:** `#e6dbd0` — Beige/Topo muy claro
- **Footer:** Fondo `#1a1a1a` oscuro con logo e iconos en `#c88264`

### Tipografía
- **Familia:** `Inter`, `Montserrat`, o cualquier Sans-Serif geométrica limpia y moderna
- **Pesos:** 400 (cuerpo), 700 (subtítulos), 900 (títulos y CTAs)
- ❌ CERO tipografías serif o cursivas (no Times New Roman, no Georgia, no fuentes caligráficas)
- ❌ CERO EMOJIS en ninguna sección. Usar iconos SVG de línea fina si se necesitan.

### Estilo Visual General
- Estética de catálogo premium de decoración del hogar (estilo Zara Home, IKEA Premium, Restoration Hardware)
- Fondos limpios y luminosos
- Sombras suaves: `box-shadow: 0 4px 20px rgba(0,0,0,0.06)`
- Bordes redondeados: `border-radius: 12px` para cards, `border-radius: 999px` para botones
- El color Cobre `#c88264` aparece como borde izquierdo de las cards, como fondo de botones, y como color de highlight en precios y stats
- Mobile-first: funciona perfectamente en 390px de ancho

---

## DATOS REALES DEL NEGOCIO (No inventar — usar estos datos exactos)

### Empresa
- Nombre: **Somos Marketing Perú EIRL**
- Contacto: **WhatsApp 24/7**
- Agencia de envíos usada: **Shalom** — Cobertura nacional, Pago Contra Entrega
- Web: `www.somosmarketing.pe`

### Producto 1 — Tubo de Cortina Extensible
- Rango: de **1.60 m a 3.00 m** extensible
- Material: Metal/Acero con acabado metálico resistente
- **Precio costo (compra Somos Marketing):** S/. 21 por unidad
- **Precio venta al distribuidor B2B:** S/. 25 – 27 por unidad
- **Precio minorista en Lima:** S/. 35 (competencia)
- **Precio en Provincias (competencia local):** S/. 35 – 40
- Mínimo de compra: 1 caja = **12 unidades**
- Costo de 1 caja: S/. 252

### Producto 2 — Cortinas Dobles (complemento)
- Rango hasta 3 metros
- **Precio costo:** S/. 27 por unidad
- **Precio venta B2B:** S/. 32 – 35 por unidad
- 1 caja = 24 unidades

### Tabla de Fletes Reales (Tubo, usar estos datos para la calculadora)
| Cantidad    | Unidades | Costo Producto | Flete Shalom | Envío a Agencia | TOTAL      | Flete % |
|-------------|----------|----------------|--------------|-----------------|------------|---------|
| 1 caja      | 12       | S/. 252        | S/. 35       | S/. 20          | S/. 307    | ~17%    |
| 4 cajas     | 48       | S/. 1,008      | S/. 50       | S/. 20          | S/. 1,078  | ~6%     |
| 8 cajas     | 96       | S/. 2,016      | S/. 100      | S/. 20          | S/. 2,136  | ~5%     |

> Punto óptimo de compra: **4 a 5 cajas**, donde el flete cae de 17% a solo 6% del costo total.

---

## ARQUITECTURA DE 12 MÓDULOS — CONSTRUIR EN ESTE ORDEN EXACTO DE ARRIBA HACIA ABAJO

### [SECCIÓN 0] Banner Sticky + Navegación
- Banner horizontal superior en color `#c88264` con texto blanco en mayúsculas: *"¡ENVÍO A PROVINCIA CON SHALOM! · PAGO CONTRA ENTREGA B2B"*
- Debajo: Header blanco con logo a la izquierda (solo texto "Somos Marketing Perú" en bold) y a la derecha un botón CTA redondo color Cobre con texto: *"COMPRAR CAJA (S/. 252)"*
- Sticky: El header se queda fijo al hacer scroll

### [SECCIÓN 01] Hero Principal
- Layout de dos columnas: texto a la izquierda, imagen a la derecha
- **Etiqueta pequeña** en color Cobre uppercase: "STOCK INMEDIATO A PROVINCIA"
- **Título principal** (H1) grande y bold: "TUBOS DE CORTINA **EXTENSIBLES**" (la palabra EXTENSIBLES en color Cobre)
- Lista de 3 beneficios con checkmarks en Cobre:
  1. De 1.60 mts a 3.00 mts de extensión
  2. Diseño Metálico Resistente
  3. Pago Contra Entrega via Shalom
- **Botón CTA principal** grande color Cobre fondo, texto blanco: *"S/. 27 / Tubo • Comprando x Caja"*
- **Imagen:** Foto high-quality de tubos de cortina metálicos o una habitación elegante con cortinas colgadas (unsplash.com o similar)

### [SECCIÓN 02] Por Qué Comprar con Nosotros
- Título: *"¿POR QUÉ CON NOSOTROS?"*
- Grid de 5 tarjetas horizontales, cada una con:
  - Un ícono SVG en cuadrado Cobre a la izquierda
  - **Razón** en texto Bold (11px)
  - Breve descripción (2 palabras)
- Las 5 razones son:
  1. ✦ Precio Mayorista Real (S/. 21 vs S/. 35–40 de la competencia)
  2. ✦ Pago Contra Entrega (cero riesgo para el comprador)
  3. ✦ Stock Garantizado Lima
  4. ✦ Envío a todo el Perú (via Shalom)
  5. ✦ Soporte WhatsApp 24/7

### [SECCIÓN 03] Calculadora Interactiva de Flete (JavaScript OBLIGATORIO)
- Título centrado: *"SIMULADOR EXACTO DE COSTOS"* + la palabra *"COSTOS"* en Cobre
- Un **slider interactivo** (range input) con 3 posiciones:
  - Posición 1: 1 caja (12 unidades)
  - Posición 2: 4 cajas (48 unidades) — Posición recomendada por defecto, label en Cobre
  - Posición 3: 8 cajas (96 unidades)
- Debajo del slider: una **tabla de desglose** que se actualiza dinámicamente con JS:
  - Subtotal Tubos
  - Costo Envío a Agencia
  - Flete Shalom
  - **INVERSIÓN TOTAL** (en bold, Cobre)
  - **COSTO REAL POR TUBO** (highlight principal en caja Cobre con texto blanco)
- Al mover el slider, los valores cambian en tiempo real con `document.getElementById` y `addEventListener`

### [SECCIÓN 04] Perfil del Distribuidor Ideal
- Título: *"¿PARA QUIÉN ES ESTA **OPORTUNIDAD**?"*
- Tres filas de "perfil", cada una con:
  - Un círculo/dot color Cobre a la izquierda
  - Texto Bold de 11px al lado (descripción breve del cliente ideal)
- Los 3 perfiles son:
  1. Ferreteros y tiendas de hogar de provincia
  2. Emprendedores que venden por WhatsApp o redes sociales
  3. Distribuidores que compran a precios altos al importador local
- A la derecha de los textos: foto o ilustración de persona de negocio / tienda

### [SECCIÓN 05] Contenido del Kit Completo (Alta Fidelidad)
- Tarjeta blanca grande con imagen de fondo de room interior elegant y panel blanco semitransparente superpuesto a la izquierda (glassmorphism sutil)
- En el panel izquierdo: título *"LO QUE INCLUYE EL KIT COMPLETO DE 26 PIEZAS"*
- Lista de piezas con íconos geométricos SVG (no emojis) en Cobre:
  - ✦ 1× Barra Extensible
  - ✦ 2× Terminales Decorativas (Remates de Jaula)
  - ▌ 2× Soportes de Pared Resistentes
  - ◎ 20× Anillos con Ganchos para Cortina
  - ● 1× Kit de Herrajes de Montaje (4 tornillos, 2 tacos)
- **Badge circular** flotante en color Cobre `#c88264` con número **"26"** en grande y texto curvo "PIEZAS COMPLETAS"
- Debajo: Etiqueta de precio con clip-path en forma de flecha hacia la derecha, fondo Cobre, texto: *"Solo S/ 379"*
- Pequeño texto tachado arriba: *"Antes: S/ 450"*

### [SECCIÓN 06] Tabla de Precios Mayorista por Volumen (Wholesale)
- Título centrado: *"PRECIOS POR VOLUMEN"*
- Tabla limpia con 3 filas de precios y 4 columnas:

| Cantidad      | Unidades | Precio/Unidad | TOTAL         |
|---------------|----------|---------------|---------------|
| 1 caja        | 12 u.    | S/. 27        | S/. 324       |
| 4 cajas       | 48 u.    | **S/. 25**    | **S/. 1,200** |
| 8 cajas       | 96 u.    | **S/. 23**    | **S/. 2,208** |

- El row de "4 cajas" y "8 cajas" tiene el precio destacado en Cobre (el mejor deal)
- Debajo de la tabla: badge o nota *"Punto óptimo: 4 cajas — Flete baja de 17% a solo 6%"*

### [SECCIÓN 07] Comparativa (Nuestro precio vs. Competencia)
- Título: *"LO QUE PAGAS HOY VS. LO QUE COBRAN ELLOS"*
- Dos columnas:
  - **Izquierda (Competencia):** Fondo beige, borde rojo derecho, con X roja, precio S/. 35–40 tachado o marcado como "precio local"
  - **Derecha (Nosotros):** Fondo blanco, borde Cobre izquierdo, con ✦ checkmark Cobre, precio S/. 27 destacado
- Separator vertical central con etiqueta "VS" en Cobre

### [SECCIÓN 08] Testimoniales / Prueba Social
- Título: *"LO QUE DICEN NUESTROS DISTRIBUIDORES"*
- Grid de 3 tarjetas blancas con sombra suave:
  - Avatar circular (color #d4c8b8 o foto)
  - Nombre del distribuidor (ej: "Carlos R. — Cusco")
  - Estrellas en Cobre ★★★★★
  - 2–3 líneas de testimonio en italic (texto descriptivo realista)
- Los 3 testimonios deben hablar de:
  1. La rentabilidad del producto en provincia
  2. La facilidad del pago contra entrega
  3. La rapidez del envío Shalom

### [SECCIÓN 09] Preguntas Frecuentes (FAQ — Acordeón interactivo)
- Título: *"PREGUNTAS FRECUENTES"*
- 4 preguntas claves con respuestas en acordeón (se abren al clic con JavaScript):
  1. *¿Cuál es el pedido mínimo?* → 1 caja (12 tubos) = S/. 252
  2. *¿Cómo es el envío?* → Via Shalom Pago Contra Entrega a todo el Perú
  3. *¿Puedo pedir diferentes tallas?* → Sí, el tubo es extensible de 1.60m a 3.00m
  4. *¿Cómo hago mi pedido?* → Por WhatsApp, te guiamos paso a paso

### [SECCIÓN 10] Flujo de Compra en 4 Pasos
- Título: *"ASÍ DE FÁCIL ES COMPRAR"*
- Barra de metal (imagen de tubo de cortina) como separador horizontal lleno de ancho
- 4 pasos en columna, cada uno con:
  - Cuadro redondeado fondo blanco borde Cobre `#c88264` (borde de 2px, sombra lateral Cobre)
  - Número en bold Cobre dentro del cuadro (1, 2, 3, 4)
  - Texto corto del paso al lado
- Los 4 pasos son:
  1. **Pide por WhatsApp** — Escríbenos tu pedido al número de contacto
  2. **Ingresa tu información** — Te pediremos datos de envío Shalom
  3. **Generamos tu Orden** — El importador arma y despacha tu pedido
  4. **Recoge con Shalom** — Paga contra entrega en tu agencia local
- Tarjeta oscura adicional (`#1a1a1a` con borde-top Cobre) mostrando los ítems del kit incluido a la derecha, con borde izquierdo Cobre y cantidades en bold blanco

### [SECCIÓN 11] Cierre Final / CTA Hero de Cierre
- Layout: Imagen de fondo grande de habitación con cortinas (oscurecida con overlay)
- Encima: texto centrado grande en blanco o Cobre:
  - H1: *"¡TRANSFORMA TU HOGAR CON ESTILO!"*
  - Subtítulo: *"Set de Barra de Cortina Oro Rosa Copper"*
- Foto de barra de cortina con una píldora badge en Cobre que dice: *"KIT COMPLETO DE 26 PIEZAS"*
- Lista compacta de piezas incluidas con íconos geométricos en color Cobre
- **Botón CTA masivo** redondeado color `#c88264` fondo, borde oscuro `#302621`, texto en bold uppercase:
  *"¡APROVECHA LA OFERTA Y CÓMPRALO YA!"*
- Debajo del botón: texto pequeño *"Encuentra más beneficios en: www.somosmarketing.pe"* con el dominio subrayado en Cobre

### [SECCIÓN 12] Footer
- Fondo oscuro `#111111`
- Logo centrado: cuadrado Cobre + texto "Somos Marketing Perú" en Cobre horizontal
- Texto inferior muy pequeño: *"© 2026 Somos Marketing Perú EIRL"*
- Borde superior sutil con opacidad: `border-top: 2px solid rgba(200, 130, 100, 0.3)`

---

## REGLAS TÉCNICAS DE CÓDIGO

1. **HTML5 semántico estricto**: `<header>`, `<section>`, `<article>`, `<footer>`, IDs únicos por sección
2. **CSS Variables en :root** para todos los colores del Design System
3. **Responsive Mobile-First**: Breakpoints en 390px → 768px → 1280px usando CSS Grid y Flexbox
4. **JavaScript nativo** (sin jQuery ni librerías externas) para:
   - El slider de la calculadora de flete (Sección 03)
   - El acordeón de FAQ (Sección 09)
5. **CERO frameworks CSS externos** (sin Bootstrap). Tailwind está permitido solo si usas `@apply` o variantes de diseño.
6. **Sin emojis**: Todos los íconos serán SVG inline o símbolos tipográficos (✦ ▌ ◎ ●) consistentes
7. **Imágenes**: Usar URLs de Unsplash.com relacionadas con cortinas, habitaciones, decoración de interiores y metal pulido
8. Las sombras deben ser suaves y realistas: `box-shadow: 0 8px 30px rgba(0,0,0,0.08)`
9. Los botones CTA deben tener `transition: all 0.2s ease` para efecto hover sutil

---

## ENTREGABLE ESPERADO

Un único archivo `index.html` completamente funcional y autocontenido, con:
- `<style>` embebido en `<head>` con todas las reglas CSS
- El HTML de los 12 módulos en `<body>` en el orden descrito
- El `<script>` de JavaScript al final del `<body>` (antes de `</body>`)
- Responsive y visualmente premium sin ninguna librería externa
- Al abrirlo en el navegador, debe verse como un catálogo de decoración de lujo B2B peruano

---FIN DEL PROMPT---

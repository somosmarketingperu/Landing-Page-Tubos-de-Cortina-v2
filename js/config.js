/**
 * CONFIG.JS — Datos de Negocio, Precios y Agencias
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwvlNkBzNsNgeqIa1-4PtDId191IV80Kad5-BDFAlT0mIU6cxP-MYfscd3HFEfGzLeL/exec';
const APPS_SECRET_KEY = 'TCP2026-SOMOS-MKT-PERÜ-SECURE-8f3k9';

const PRECIO_TUBO   = 27;   // precio base (1-9 cajas)
const TUBOS_CAJA    = 12;

// Precios escalonados por volumen
const PRECIOS_ESCALONADOS = [
    { minCajas: 30, precio: 26.30, label: '30+ cajas' },
    { minCajas: 10, precio: 26.50, label: '10–29 cajas' },
    { minCajas:  1, precio: 27.00, label: '1–9 cajas'  },
];

// NUEVA LÓGICA DE FLETE:
// S/. 20 (Fijo: Embalaje + Envío Agencia Lima) 
// + Flete Shalom (S/. 35 para 1 caja, o S/. 12.50 por caja para 4+ cajas)
const FLETE_FIJO_LIMA  = 20;
const FLETE_SHALOM_MIN = 35;
const FLETE_SHALOM_VAR = 12.5;

const WA_EMPRESA    = '51999900396';

const ALMACENES_LIMA = [
    "Jirón Virrey Manuel Guirior 260 - Urb. Oyague - Magdalena del Mar",
    "Avenida Francisco Javier Mariátegui 1785 Dpto. 100 - Jesús María",
    "Avenida Chillón M - Dpto 301 - Urb. Los Álamos - Comas (Principal)",
    "Jirón Puno 271 Hall de Recepción Edificio Ítalo Peruano - Centro de Lima"
];

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

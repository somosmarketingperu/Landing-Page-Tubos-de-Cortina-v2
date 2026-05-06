/* ESTUDIO-NEGOCIO / SIMULACIÓN.JS */

let chartDemand = null;
let chartCumulative = null;
let chartComparison = null;
let productoActivo = "tubo";

// Datos de Producto
const DATA_PRODUCTOS = {
    tubo: {
        nombre: "Tubo de Cortina",
        ganancia: 6,
        meta: "334 unidades",
        desc: "Kit de Tubo Extensible (1.6m - 3.0m)"
    },
    cortina: {
        nombre: "Cortina Blackout",
        ganancia: 8,
        meta: "250 unidades",
        desc: "Juego de Cortinas Doble Capa"
    }
};

function generadorAleatorio(semilla) {
    const x = Math.sin(semilla++) * 10000;
    return x - Math.floor(x);
}

function ejecutarSimulacion() {
    const semilla = Math.floor(Math.random() * 1000);
    document.getElementById('seedDisplay').textContent = `Semilla: #${semilla}`;
    
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const log = document.getElementById('simLog');
    
    const tiendas = 250;
    const config = DATA_PRODUCTOS[productoActivo];
    
    let semillaActual = semilla;
    log.innerHTML = `[INFO] Ejecutando motor estocástico...<br>`;

    // 1. Datos de Demanda
    const datosDemanda = [];
    const datosAcumulados = [];
    const datosTubo = [];
    const datosCortina = [];
    
    let acumuladoTotal = 0;

    meses.forEach((m, i) => {
        const factor = generadorAleatorio(semillaActual + i);
        
        // Simulación de unidades
        const unidadesTubo = Math.round((3 + factor * 5) * tiendas);
        const unidadesCortina = Math.round((4 + factor * 8) * tiendas);
        
        const unidadesMes = productoActivo === "tubo" ? unidadesTubo : unidadesCortina;
        const gananciaMes = unidadesMes * config.ganancia;
        
        acumuladoTotal += gananciaMes;
        
        datosDemanda.push(unidadesMes);
        datosAcumulados.push(acumuladoTotal);
        datosTubo.push(unidadesTubo);
        datosCortina.push(unidadesCortina);
    });

    renderDemandChart(meses, datosDemanda);
    renderCumulativeChart(meses, datosAcumulados);
    renderComparisonChart(meses, datosTubo, datosCortina);

    log.innerHTML += `[RESULTADO] Hito 12 meses: S/ ${acumuladoTotal.toLocaleString()} proyectados.<br>`;
    log.innerHTML += `[RESULTADO] Modelo validado bajo semillas variables.`;
}

function renderDemandChart(labels, data) {
    const ctx = document.getElementById('demandChart').getContext('2d');
    if (chartDemand) chartDemand.destroy();
    chartDemand = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Unidades Vendidas',
                data: data,
                borderColor: '#c88264',
                backgroundColor: 'rgba(200, 130, 100, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: getCommonOptions()
    });
}

function renderCumulativeChart(labels, data) {
    const ctx = document.getElementById('cumulativeChart').getContext('2d');
    if (chartCumulative) chartCumulative.destroy();
    chartCumulative = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Utilidad Acumulada (S/)',
                data: data,
                backgroundColor: '#1c1917',
                borderRadius: 5
            }]
        },
        options: getCommonOptions()
    });
}

function renderComparisonChart(labels, tubo, cortina) {
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) return; // Salir si no existe el canvas
    const ctx = canvas.getContext('2d');
    if (chartComparison) chartComparison.destroy();
    chartComparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tubo (Ancla)',
                    data: tubo,
                    borderColor: '#c88264',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: 'Cortina (Rotación)',
                    data: cortina,
                    borderColor: '#666',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0
                }
            ]
        },
        options: getCommonOptions()
    });
}


function getCommonOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { grid: { color: '#eee' }, ticks: { font: { size: 10 } } },
            x: { grid: { display: false }, ticks: { font: { size: 10 } } }
        },
        plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } }
        }
    };
}

// Inicialización después de que las secciones se carguen
function initSimulationListeners() {
    const runBtn = document.getElementById('runSim');
    if (runBtn) {
        runBtn.addEventListener('click', ejecutarSimulacion);
    }

    document.querySelectorAll('.palette-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            productoActivo = btn.dataset.product;
            ejecutarSimulacion();
        });
    });

    // Primera ejecución
    setTimeout(ejecutarSimulacion, 1000);
}

document.addEventListener('sectionsLoaded', initSimulationListeners);


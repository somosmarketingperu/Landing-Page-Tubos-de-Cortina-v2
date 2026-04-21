const fetch = require('node-fetch'); // we'll use native fetch if available or node HTTP

const payload = {
    ocNumber: "TEST-1234",
    email: "test@example.com",
    nombre: "Juan Perez",
    wsp: "999999999",
    agencia: "Shalom Lima",
    cajas: 4,
    esTransferencia: true,
    comprobanteType: "factura",
    ruc: "20123456789",
    razon: "Empresa de Prueba S.A.C.",
    dir: "Av. Test 123",
    total: 1000
};

const URL = 'https://script.google.com/macros/s/AKfycbwtzNEYYIb9HHxNLvhe3IfQE29jTM3UynhYypmYr1YpoUS_HU6CrJhLsmoNPECuYWf1/exec';

async function test() {
    console.log("Enviando POST a Google Apps Script...");
    try {
        const resp = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload)
        });
        const url = resp.url; // apps script usually redirects
        const text = await resp.text();
        console.log("Respuesta:");
        console.log(text);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();

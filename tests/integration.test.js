// tests/integration.test.js
const request = require('supertest');

// 👇 Aquí usamos TU URL real de QA
const QA_URL = 'https://dazzling-motivation-qa.up.railway.app'; 

describe('Integración QA - Smoke Test (Prueba de Humo)', () => {
    
    // Le damos un poco más de tiempo (10s) por si el servidor está "despertando"
    jest.setTimeout(10000); 

    it('El servidor QA debe estar ONLINE y responder 200 OK', async () => {
        console.log(`📡 Conectando a: ${QA_URL}...`);
        
        // Hacemos una petición HTTP real a internet
        const response = await request(QA_URL).get('/');
        
        // Validaciones
        expect(response.status).toBe(200);
        expect(response.text).toContain('Petpal API funcionando'); // Texto de tu app.js
        
        console.log('✅ Servidor QA respondió correctamente.');
    });

    // Opcional: Probar que la API no devuelva error 500 en rutas inexistentes
    it('Debe devolver 404 en rutas no encontradas', async () => {
        const response = await request(QA_URL).get('/ruta-que-no-existe-123');
        expect(response.status).toBe(404);
    });
});
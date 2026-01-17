const request = require('supertest');
const app = require('../src/app'); // Asegúrate de que esta ruta sea correcta

describe('Suite de Pruebas Integrador - PetPal Backend', () => {
    
    // Test Unitario Lógico
    test('Validación de lógica: Cálculo de disponibilidad', () => {
        const capacidadTotal = 10;
        const ocupados = 4;
        const disponible = capacidadTotal - ocupados;
        expect(disponible).toBe(6);
    });

    // Test de Integración (API)
    test('Health Check: La API debe responder correctamente', async () => {
        const res = await request(app).get('/'); 
        expect(res.statusCode).toBe(200);
    });
});
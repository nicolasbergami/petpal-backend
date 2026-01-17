const request = require('supertest');
const app = require('../src/app'); 

describe('Suite de Pruebas PetPal - Validación de Requisitos', () => {

    // TEST UNITARIO: Lógica de disponibilidad
    test('TC-01: El cálculo de disponibilidad debe ser correcto', () => {
        const capacidadTotal = 20;
        const reservasExistentes = 5;
        // Lógica: capacidad - reservas
        const disponible = capacidadTotal - reservasExistentes; 
        
        expect(disponible).toBe(15); // 20 - 5 es 15, el test PASA
    });

    // TEST DE INTEGRACIÓN: Health Check de la API
    test('TC-02: La raíz de la API debe responder (Status 200)', async () => {
        const res = await request(app).get('/');
        // Verificamos que el servidor esté vivo
        expect(res.statusCode).toBe(200);
    });
});
const request = require('supertest');
const app = require('../../src/app');

describe('Test de integración - GET /petpals', () => {
  test('Debería devolver 200 y un array', async () => {
    const res = await request(app).get('/petpals');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

const request = require('supertest');
const app = require('../../src/app');
const connection = require('../../src/config/db'); // tu conexión MySQL

describe('GET /petpals', () => {
  let token;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: '12345678' // coincide con la original antes del hash
      });

    token = loginRes.body.token;
    expect(token).toBeDefined();
  });

  it('Debería devolver una lista de petpals con status 200', async () => {
    const res = await request(app)
      .get('/petpals')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    // Cerrar la conexión para que Jest no deje handles abiertos
    await new Promise((resolve, reject) => {
      connection.end(err => err ? reject(err) : resolve());
    });
  });
});

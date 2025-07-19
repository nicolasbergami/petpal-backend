const request = require('supertest');
const app = require('../../src/app');
const connection = require('../../src/config/db');

describe('GET /api/petpals', () => {
  let token;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')     // ← prefijo /api
      .send({
        email: 'test@example.com',
        password: '12345678'
      });

    expect(loginRes.statusCode).toBe(200);
    token = loginRes.body.token;
    expect(token).toBeDefined();
  });

  it('Debería devolver una lista de petpals con status 200', async () => {
    const res = await request(app)
      .get('/api/petpals')         // ← prefijo /api
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    await new Promise((resolve, reject) => {
      connection.end(err => err ? reject(err) : resolve());
    });
  });
});



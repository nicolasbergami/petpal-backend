const request = require('supertest');
const app = require('../../src/app');

describe('GET /petpals', () => {
  let token;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: '123456'  // este debe coincidir con la contraseña real
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
});

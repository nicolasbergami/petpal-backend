const request = require('supertest');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const app = require('../../src/app');

describe('GET /api/petpals', () => {
  let token;
  let db; // conexión promise

  beforeAll(async () => {
    // 1) Conectar al MySQL local de CI
    db = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'ci_petpal',
      port: process.env.DB_PORT || 3306
    });

    // 2) Leer y ejecutar el script de semillas
    const seedSql = fs.readFileSync(
      path.join(__dirname, '../../scripts/seed-ci.sql'),
      'utf8'
    );
    // El script puede contener varios statements separados por `;`
    await db.query(seedSql);

    // 3) Ahora hacemos login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: '123456'
      });

    expect(loginRes.statusCode).toBe(200);
    token = loginRes.body.token;
    expect(token).toBeDefined();
  });

  it('Debería devolver una lista de petpals con status 200', async () => {
    const res = await request(app)
      .get('/api/petpals')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  afterAll(async () => {
    // cerrar conexión tanto de la app como de MySQL
    await new Promise((resolve) =>
      require('../../src/config/db').end(() => resolve())
    );
    if (db) {
      await db.end();
    }
  });
});

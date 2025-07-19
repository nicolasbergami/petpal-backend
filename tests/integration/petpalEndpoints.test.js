const request = require('supertest');
const fs      = require('fs');
const path    = require('path');
const mysql   = require('mysql2/promise');
const app     = require('../../src/app');

describe('GET /api/petpals', () => {
  let token;
  let db; // conexión promise para sembrar datos

  beforeAll(async () => {
    // 1) Conectar a MySQL (servicio de CI)
    db = await mysql.createConnection({
      host:     process.env.DB_HOST     || '127.0.0.1',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'testdb',
      port:     process.env.DB_PORT     ? +process.env.DB_PORT : 3306,
    });

    // 2) Leer y ejecutar el seed
    const seedPath = path.join(__dirname, '../../scripts/seed-ci.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      for (const stmt of seedSql
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)) {
        await db.query(stmt);
      }
    } else {
      console.warn('⚠️ No se encontró scripts/seed-ci.sql en', seedPath);
    }

    // 3) Loguearnos y obtener token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email:    'test@example.com',
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
    // cerrar conexión interna de la app
    const appDb = require('../../src/config/db');
    if (appDb && typeof appDb.end === 'function') {
      await new Promise(r => appDb.end(r));
    }
    // cerrar la conexión de CI
    if (db) {
      await db.end();
    }
  });
});

const request = require('supertest');
const app = require('../../src/app');
const mysql = require('mysql2/promise');

describe('GET /api/petpals', () => {
  let token;
  let db;

  beforeAll(async () => {
    // 1) Conectar a MySQL de CI (igual que antes)
    db = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'testdb',
      port: process.env.DB_PORT ? +process.env.DB_PORT : 3306
    });

    // 2) Limpiar tablas directamente
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE petpals_profiles');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');

    // 3) Registar usuario vía API para que el backend haga el hash
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123456',    // contraseña en claro
        role: 'petpal',
        dni: '12345678',
        direccion: 'Calle Falsa 123',
        barrio: 'Nueva Córdoba',
        telefono: '3511234567'
      });
    expect(registerRes.statusCode).toBe(201);

    // 4) Crear un petpal básico para la ruta GET /petpals
    // (usa directamente SQL porque no tenemos endpoint para esto)
    await db.query(
      `INSERT INTO petpals (user_id, service_type, price_per_hour, experience, location, pet_type, size_accepted)
       VALUES (
         (SELECT id FROM users WHERE email = 'test@example.com'),
         'dog walker', 15.00, '2 años','Nueva Córdoba','dog','all'
       )`
    );

    // 5) Ahora hacemos login
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
    // cerrar conexiones
    const appDb = require('../../src/config/db');
    if (appDb && typeof appDb.end === 'function') await new Promise(r => appDb.end(r));
    if (db) await db.end();
  });
});

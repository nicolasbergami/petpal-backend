const request = require('supertest');
const app = require('../src/app');

// 1. MOCKEAMOS LA BASE DE DATOS (Para evitar conexión real)
jest.mock('../src/config/db', () => ({
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn()
}));

// 2. MOCKEAMOS EL MODELO DE USUARIO
// ⚠️ IMPORTANTE: Usamos los nombres reales que usas en tu controller: "getByEmail" y "create"
jest.mock('../src/models/userModel', () => ({
  // Tu controller usa callbacks: (email, callback) => ...
  getByEmail: jest.fn((email, callback) => {
    // Simulamos que NO encuentra usuario (results = [])
    // El primer argumento es error (null), el segundo es resultados
    callback(null, []); 
  }),
  create: jest.fn((newUser, callback) => {
    // Simulamos creación exitosa
    callback(null, { insertId: 1 });
  })
}));

// 3. MOCKEAMOS BCRYPT y JWT
jest.mock('bcryptjs', () => ({
  compareSync: jest.fn().mockReturnValue(false), // Sync porque usas compareSync
  hashSync: jest.fn().mockReturnValue('hashed_password') // Sync porque usas hashSync
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('fake_token_123'),
  verify: jest.fn().mockReturnValue({ id: 1 })
}));

describe('🔗 Tests de Integración Local (HTTP Layer)', () => {
    
    // Test 1: Verificar que el servidor responde
    it('GET / - Debe devolver 200 OK (o 404 si no hay ruta raiz, pero sin explotar)', async () => {
        const res = await request(app).get('/');
        // Aceptamos 200 (Bienvenida) o 404 (No encontrada), pero NO 500.
        expect(res.statusCode).not.toBe(500);
    });

    // Test 2: Ruta Inexistente
    it('GET /ruta-inexistente - Debe devolver 404', async () => {
        const res = await request(app).get('/api/ruta-que-no-existe-jamas');
        expect(res.statusCode).toBe(404);
    });

    // Test 3: Login Vacio -> Ahora debe dar 400 gracias a tu validación
    it('POST /api/auth/login - Debe devolver 400 si faltan datos', async () => {
        const res = await request(app).post('/api/auth/login').send({});
        
        console.log('Status Code Login Vacio:', res.statusCode);
        
        // Ahora esperamos 400 porque agregaste el "if (!email)" en el controller
        expect(res.statusCode).toBe(400); 
    });
});
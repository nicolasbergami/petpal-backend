// tests/integration/petpalEndpoints.test.js
const mysql = require('mysql2/promise');
const request = require('supertest');
const app = require('../../src/app');

let connection;
let server;
let api;

beforeAll(async () => {
  try {
    console.log('Jest beforeAll: Attempting to connect to DB with testuser...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'testuser',
      password: process.env.DB_PASSWORD || 'testpassword',
      database: process.env.DB_DATABASE || 'testdb',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
    });
    console.log('🎉 Jest beforeAll: Successfully connected to MySQL with testuser.');

    // No necesitas cargar el esquema aquí si ya lo estás haciendo en el pipeline.
    // Pero si quieres que los tests se ejecuten localmente sin el pipeline,
    // podrías descomentar y habilitar una lógica para cargar el esquema.
    // Para el pipeline, ya lo cargamos en el paso "Load database schema for tests".

    // Importante: `app.listen(0)` hace que Express elija un puerto disponible.
    // Esto es ideal para los tests, ya que evita conflictos de puerto.
    server = app.listen(0, () => {
      const port = server.address().port;
      console.log(`🚀 Jest beforeAll: Express server started on port ${port}`);
    });
    api = request(server);
    console.log('Jest beforeAll: Setup complete.');

  } catch (error) {
    console.error('❌ Jest beforeAll ERROR: Fatal error during setup!', error);
    throw error; // Esto hará que el test suite falle y se reporte.
  }
}, 60000); // Aumentado el timeout de beforeAll a 60 segundos por si acaso

afterAll(async () => {
  console.log('Jest afterAll: Starting cleanup...');
  if (connection) {
    await connection.end();
    console.log('Jest afterAll: MySQL connection closed.');
  }
  if (server) {
    // Asegurarse de cerrar el servidor correctamente
    await new Promise(resolve => server.close(resolve));
    console.log('Jest afterAll: Express server closed.');
  }
  console.log('Jest afterAll: Cleanup complete.');
});

describe('PetPal Integration Tests', () => {
  // CAMBIO AQUÍ: El test ahora apunta a la ruta raíz y espera el texto de tu app.js
  it('should respond with a 200 status for / (root) endpoint', async () => {
    console.log('Running test: / (root) endpoint');
    const res = await api.get('/'); // <-- ¡CAMBIO CLAVE AQUÍ! De '/health' a '/'
    expect(res.statusCode).toEqual(200);
    // Espera el texto exacto que tu app.js devuelve para la ruta '/'
    expect(res.text).toEqual('Petpal API funcionando correctamente 🚀'); // <-- ¡CAMBIO CLAVE AQUÍ!
  });

  // Agrega más tests de integración aquí
  // Ejemplo:
  // it('should create a new petpal', async () => {
  //   const newPetpal = { /* tus datos de petpal */ };
  //   const res = await api.post('/api/petpals').send(newPetpal);
  //   expect(res.statusCode).toEqual(201);
  //   expect(res.body.name).toEqual(newPetpal.name);
  //   // Puedes verificar que el petpal se guardó en la DB si quieres
  // });
});
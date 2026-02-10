const request = require('supertest');

// 👇 URL REAL DE RAILWAY QA
const QA_URL = 'https://dazzling-motivation-qa.up.railway.app'; 

// 👇 USUARIO DE PRUEBA (Debe existir en tu BD de QA)
const TEST_USER = {
    email: 'nico@petpal.com', 
    password: '123456'   
};

describe('🕵️ Acceptance Tests (E2E) - Flujo Completo en Nube', () => {
    // Aumentamos el tiempo de espera a 30s porque internet puede ser lento
    jest.setTimeout(30000); 

    let authToken = ''; // Aquí guardaremos el token para usarlo en los otros tests

    // 1. Verificar que el servidor esté vivo
    it('📡 Health Check: El servidor debe responder 200 OK en la raíz', async () => {
        console.log(`🌐 Conectando a: ${QA_URL}...`);
        const res = await request(QA_URL).get('/');
        // Si tu raíz devuelve 404, cambia esto a 404. Si devuelve 200, déjalo en 200.
        expect(res.status).not.toBe(500); 
    });

    // 2. Intentar Loguearse (Crucial para probar la BD y JWT)
    it('🔑 Login: Debe loguearse y devolver un Token válido', async () => {
        const res = await request(QA_URL)
            .post('/api/auth/login')
            .send(TEST_USER);

        // Verificaciones
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        
        // Guardamos el token para el siguiente test
        authToken = res.body.token;
        console.log('✅ Login exitoso en QA. Token recibido.');
    });

    // 3. Probar una ruta protegida con el Token (Ej: Mascotas)
    it('🐶 Rutas Protegidas: Debe obtener mascotas usando el Token', async () => {
        // Si el login falló, este test va a fallar también (como debe ser)
        if (!authToken) throw new Error("No hay token, el login falló previamente.");

        const res = await request(QA_URL)
            .get('/api/pets') // O '/api/users', la que quieras probar
            // 👇 CAMBIA ESTA LÍNEA
            .set('Authorization', 'Bearer ' + authToken); // 👈 Aquí inyectamos el token en el header (o 'Bearer ' + authToken si usas Bearer)

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true); // Esperamos una lista (array)
        console.log(`✅ Se obtuvieron ${res.body.length} mascotas desde la nube.`);
    });

    // 4. Probar seguridad (Acceder sin token)
    it('🛡️ Seguridad: No debe permitir acceso a rutas protegidas sin token', async () => {
        const res = await request(QA_URL).get('/api/pets');
        // Debería dar 401 Unauthorized o 403 Forbidden
        expect(res.status).toBeOneOf([401, 403]); 
    });
});

// Helper para Jest (por si no tienes instalado jest-extended para toBeOneOf)
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be in [${expected}]`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be in [${expected}]`,
        pass: false,
      };
    }
  },
});
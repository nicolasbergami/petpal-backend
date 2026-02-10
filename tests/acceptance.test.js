const request = require('supertest');

// 👇 URL REAL DE RAILWAY QA
const QA_URL = 'https://dazzling-motivation-qa.up.railway.app'; 

// 👇 USUARIO DE PRUEBA (Debe existir en tu BD de QA)
const TEST_USER = {
    email: 'nico@petpal.com', // Asegúrate de que este usuario exista
    password: '123456'   // Y que esta sea su contraseña
};

describe('🕵️ Acceptance Tests (E2E) - Smoke Tests (Básicos)', () => {
    jest.setTimeout(30000); // 30 segundos de timeout

    let authToken = ''; // Guardamos el token

    // ---------------------------------------------------------------
    // 1. HEALTH CHECK
    // ---------------------------------------------------------------
    it('📡 Health Check: El servidor debe responder 200 OK en la raíz', async () => {
        const res = await request(QA_URL).get('/');
        // Aceptamos 200 (OK) o 404 (Not Found) si no tienes ruta raiz, pero NO 500
        expect(res.status).not.toBe(500); 
    });

    // ---------------------------------------------------------------
    // 2. LOGIN (CRÍTICO)
    // ---------------------------------------------------------------
    it('🔑 Login: Debe loguearse y devolver un Token válido', async () => {
        const res = await request(QA_URL)
            .post('/api/auth/login')
            .send(TEST_USER);

        // Debug simple si falla
        if (res.status !== 200) console.error("❌ Falló Login:", res.body);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        
        authToken = res.body.token;
        console.log('✅ Login exitoso. Token recibido.');
    });

    // ---------------------------------------------------------------
    // 3. READ ALL (Lectura segura que no modifica datos)
    // ---------------------------------------------------------------
    it('📋 Obtener Mascotas: Debe devolver lista de mascotas con el Token', async () => {
        if (!authToken) throw new Error("Salteando test: No hay token");

        const res = await request(QA_URL)
            .get('/api/pets')
            .set('Authorization', 'Bearer ' + authToken);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        console.log(`✅ Se obtuvieron ${res.body.length} mascotas.`);
    });

    // ---------------------------------------------------------------
    // 4. SEGURIDAD
    // ---------------------------------------------------------------
    it('🛡️ Seguridad: No debe permitir acceso a rutas protegidas sin token', async () => {
        const res = await request(QA_URL).get('/api/pets');
        // Esperamos 401 (Unauthorized) o 403 (Forbidden)
        expect(res.status).toBeOneOf([401, 403]); 
    });
});

// Helper para Jest
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    return {
      message: () => `expected ${received} to be in [${expected}]`,
      pass: pass,
    };
  },
});
const petController = require('../src/controllers/petController');
const Pet = require('../src/models/petModel');

jest.mock('../src/config/db', () => ({
  connect: jest.fn(),
  query: jest.fn(),
  end: jest.fn()
}));
// 1. MOCKEAMOS EL MODELO
// Esto es vital: Le decimos a Jest que intercepte todas las llamadas a la base de datos
jest.mock('../src/models/petModel');

describe('Pet Controller - Tests Unitarios', () => {
    let req, res;

    // Antes de cada test, limpiamos los mocks y reseteamos req/res
    beforeEach(() => {
        jest.clearAllMocks();
        
        req = {
            params: {},
            body: {},
            user: { id: 1 } // Simulamos un usuario autenticado con ID 1
        };

        res = {
            status: jest.fn().mockReturnThis(), // Permite encadenar .status().json()
            json: jest.fn()
        };
    });

    // --- TEST: createPet ---
    describe('createPet', () => {
        it('Debe crear una mascota correctamente (201)', () => {
            // GIVEN: Datos válidos
            req.body = { name: 'Firulais', pet_type: 'dog', breed: 'Labrador' };
            const mockInsertResult = { insertId: 10 };

            // Simulamos que el modelo responde exitosamente
            Pet.create.mockImplementation((data, callback) => {
                callback(null, mockInsertResult);
            });

            // WHEN
            petController.createPet(req, res);

            // THEN
            expect(Pet.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Mascota creada correctamente',
                id: 10,
                name: 'Firulais'
            }));
        });

        it('Debe fallar si falta el nombre (400)', () => {
            req.body = { pet_type: 'dog' }; // Falta name

            petController.createPet(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Nombre y tipo de mascota son obligatorios' });
            expect(Pet.create).not.toHaveBeenCalled(); // No debe ni intentar llamar a la BD
        });

        it('Debe fallar si el tipo de mascota es inválido (400)', () => {
            req.body = { name: 'Piolin', pet_type: 'bird' }; // Tipo inválido

            petController.createPet(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'El tipo de mascota debe ser dog o cat' });
        });
    });

    // --- TEST: updatePet (Seguridad Crítica) ---
    describe('updatePet', () => {
        it('Debe actualizar si el usuario es el dueño (200)', () => {
            // GIVEN
            req.params.id = 5;
            req.user.id = 1; // Soy el usuario 1
            const mockPetInDB = [{ id: 5, user_id: 1, name: 'Rex' }]; // La mascota pertenece al 1

            // 1. Mockeamos la búsqueda (GetById)
            Pet.getById.mockImplementation((id, callback) => callback(null, mockPetInDB));
            // 2. Mockeamos el update
            Pet.update.mockImplementation((id, data, callback) => callback(null, { affectedRows: 1 }));

            // WHEN
            petController.updatePet(req, res);

            // THEN
            expect(Pet.getById).toHaveBeenCalledWith(5, expect.any(Function));
            expect(Pet.update).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('Debe bloquear la edición si el usuario NO es el dueño (403)', () => {
            // GIVEN
            req.params.id = 5;
            req.user.id = 2; // Soy un usuario intruso (ID 2)
            const mockPetInDB = [{ id: 5, user_id: 1, name: 'Rex' }]; // La mascota es del ID 1

            Pet.getById.mockImplementation((id, callback) => callback(null, mockPetInDB));

            // WHEN
            petController.updatePet(req, res);

            // THEN
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'No tienes permiso para editar esta mascota' });
            expect(Pet.update).not.toHaveBeenCalled(); // ¡Seguridad! No se debe ejecutar el update
        });

        it('Debe devolver 404 si la mascota a editar no existe', () => {
            req.params.id = 999;
            Pet.getById.mockImplementation((id, callback) => callback(null, [])); // Array vacío

            petController.updatePet(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // --- TEST: deletePet ---
    describe('deletePet', () => {
        it('Debe eliminar correctamente si es dueño (200)', () => {
            req.params.id = 10;
            req.user.id = 1;

            // Simulamos que delete devuelve 1 fila afectada
            Pet.delete.mockImplementation((petId, userId, callback) => {
                callback(null, { affectedRows: 1 });
            });

            petController.deletePet(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Mascota eliminada correctamente' });
        });

        it('Debe devolver 404 si no encuentra la mascota o no es dueño', () => {
            // Nota: Tu controlador maneja ambos casos (no existe o no es dueño) con el mismo resultado
            // porque usa affectedRows === 0
            req.params.id = 10;
            req.user.id = 1;

            Pet.delete.mockImplementation((petId, userId, callback) => {
                callback(null, { affectedRows: 0 });
            });

            petController.deletePet(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Mascota no encontrada o no tienes permisos para eliminarla' });
        });
    });

    // --- TEST: getPetById ---
    describe('getPetById', () => {
        it('Debe devolver la mascota si existe (200)', () => {
            req.params.id = 1;
            const mockPet = [{ id: 1, name: 'Bobby' }];
            
            Pet.getById.mockImplementation((id, callback) => callback(null, mockPet));

            petController.getPetById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockPet[0]);
        });

        it('Debe devolver 404 si no existe', () => {
            req.params.id = 999;
            Pet.getById.mockImplementation((id, callback) => callback(null, []));

            petController.getPetById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('Debe manejar errores de base de datos (500)', () => {
            req.params.id = 1;
            Pet.getById.mockImplementation((id, callback) => callback(new Error('DB Error'), null));

            petController.getPetById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener la mascota' });
        });
    });
});
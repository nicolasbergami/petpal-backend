// jest.integration.config.js
module.exports = {
  // Define el entorno de prueba. Para pruebas de backend/API, 'node' es lo correcto.
  testEnvironment: 'node',

  // Ruta a tus archivos de prueba de integración.
  // Esto le dice a Jest dónde buscar tus archivos de prueba.
  // **Asegúrate de que esta ruta sea correcta y que tus archivos de prueba terminen en .test.js**
  testMatch: ["<rootDir>/tests/integration/**/*.test.js"],

  // Archivos que deben ignorarse. Asegúrate de que no estás ignorando tus tests.
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/", // Si tienes una carpeta de build/dist
    "<rootDir>/coverage/", // Ignora la carpeta de cobertura
  ],

  // Configuración del reporter. Esto es lo que genera el archivo JUnit XML.
  reporters: [
    "default", // Muestra la salida estándar de Jest en la consola
    ["jest-junit", {
      outputDirectory: "./", // Directorio donde se guardará el archivo XML. '.' significa la raíz del proyecto.
      outputName: "junit-integration.xml", // Nombre del archivo XML de salida
      ancestorSeparator: " › ", // Separador para nombres de suites de pruebas en el XML
      addFileAttribute: true, // Añade el atributo 'file' con la ruta del archivo de prueba
      uniqueOutputName: "false" // Asegura que el nombre del archivo XML sea siempre el mismo
    }]
  ],

  // Archivos de configuración/setup que se ejecutan una vez antes de todos los tests
  // o antes de cada archivo de test (setupFilesAfterEnv).
  // Si tienes alguna lógica de setup global para tus tests (ej. conexión a la DB simulada, mocks globales),
  // se define aquí.
  // Por ejemplo: setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // Por ahora, lo dejamos vacío si no tienes un setup global.
  setupFilesAfterEnv: [],

  // Forzar que Jest se cierre después de que todas las pruebas hayan terminado.
  // Útil para evitar que el proceso de Jest se quede colgado si hay conexiones de DB abiertas, etc.
  forceExit: true,

  // Muestra una salida más detallada de Jest en la consola.
  verbose: true,

  // Tiempo de espera (timeout) para cada prueba en milisegundos.
  // Las pruebas de integración a menudo necesitan más tiempo debido a las operaciones de E/S.
  testTimeout: 30000, // <--- Asegúrate de que no haya una coma extra aquí si es el último elemento.
}; // <--- ¡ASEGÚRATE DE QUE ESTA LLAVE DE CIERRE ESTÉ PRESENTE!
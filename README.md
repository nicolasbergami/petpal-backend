🐾 Petpal Backend

Este es el backend de Petpal, una aplicación que conecta a dueños de mascotas con cuidadores confiables (PetPals). Desarrollado con Node.js, Express y MySQL.

📦 Tecnologías utilizadas

Node.js + Express

MySQL

JWT Authentication

Docker

Azure DevOps Pipelines (CI/CD)

Railway (entorno de producción actual)

⚙️ Estructura del Proyecto

petpal-backend/
├── src/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ └── app.js
├── Dockerfile
├── azure-pipelines.yml
└── ...

🚀 CI/CD con Azure Pipelines

El pipeline ya se encuentra implementado en el archivo azure-pipelines.yml y tiene la siguiente lógica:

Build automático del contenedor Docker con cada push a main.

(Pendiente) Ejecución de tests unitarios.

Deploy automático a entorno QA (próximamente Railway).

Aprobación manual para deploy a Producción.

💡 Actualmente el backend ya está funcionando en Railway como entorno de Producción.

⏳ Sobre el estado actual del pipeline

⚠️ IMPORTANTE:
En este momento, el pipeline no puede ejecutarse debido a que Microsoft aún no ha aprobado el acceso gratuito a recursos de ejecución (hosted parallelism) en Azure DevOps para este proyecto.
Ya se completó el formulario de solicitud y estamos a la espera de confirmación por parte de Microsoft.

Una vez aprobado, el pipeline funcionará automáticamente sin necesidad de cambios.

📚 Este proyecto forma parte de:

Trabajo Final Integrador
Facultad de Ingeniería – Ingeniería de Software III
Universidad Católica de Córdoba (UCC) – 2025

👤 Autor

Nicolás Bergami – https://github.com/nicolasbergami

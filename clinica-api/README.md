# Clínica API — REST API para Clínica Médica Privada

API REST construida con **Node.js + Express** que expone endpoints para demostrar el funcionamiento de objetos de base de datos (stored procedures, funciones, vistas materializadas en PostgreSQL) y pipelines de aggregation en MongoDB.

## Requisitos previos

- **Node.js 18+**
- **PostgreSQL 14+** con la base de datos `clinica` y todos los objetos ya creados (tablas, vistas, funciones, stored procedures)
- **MongoDB 6+** corriendo en localhost

## Instalación

```bash
# 1. Clonar o copiar el proyecto
cd clinica-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
#    Copiar el archivo de ejemplo y editar con tus credenciales
cp .env.example .env
#    En Windows:
#    copy .env.example .env

# 4. Editar .env con tus datos de conexión
```

## Variables de entorno

| Variable      | Descripción                    | Default                          |
|---------------|--------------------------------|----------------------------------|
| `PORT`        | Puerto del servidor HTTP       | `3000`                           |
| `PG_HOST`     | Host de PostgreSQL             | `localhost`                      |
| `PG_PORT`     | Puerto de PostgreSQL           | `5432`                           |
| `PG_USER`     | Usuario de PostgreSQL          | `postgres`                       |
| `PG_PASSWORD` | Contraseña de PostgreSQL       | —                                |
| `PG_DATABASE` | Nombre de la BD PostgreSQL     | `clinica`                        |
| `MONGO_URI`   | URI de conexión a MongoDB      | `mongodb://localhost:27017`      |
| `MONGO_DB`    | Nombre de la BD MongoDB        | `clinica`                        |

## Ejecución

```bash
# Producción
npm start

# Desarrollo (auto-reload con --watch, Node.js 18+)
npm run dev
```

El servidor iniciará en `http://localhost:3000` (o el puerto configurado en `.env`).

## Endpoints

### Operaciones críticas (Stored Procedures PostgreSQL)

| Método | Ruta                        | Descripción                     |
|--------|-----------------------------|---------------------------------|
| POST   | `/api/pagos`                | Registrar un pago (SP `registrar_pago`) |
| POST   | `/api/citas/:id/cancelar`   | Cancelar una cita (SP `cancelar_cita`)  |

### Consultas con funciones PostgreSQL

| Método | Ruta                                          | Descripción                          |
|--------|-----------------------------------------------|--------------------------------------|
| GET    | `/api/pacientes/:id/saldo`                    | Saldo de un paciente (`saldo_paciente()`) |
| GET    | `/api/medicos/:id/disponibilidad?fecha=YYYY-MM-DD` | Disponibilidad de un médico (`disponibilidad_medico()`) |

### Reportes gerenciales (Vistas materializadas PostgreSQL)

| Método | Ruta                                  | Descripción                          |
|--------|---------------------------------------|--------------------------------------|
| GET    | `/api/reportes/facturacion-mensual`   | Facturación mensual consolidada      |
| GET    | `/api/reportes/ranking-medicos`       | Ranking de médicos por trimestre     |

### Reportes MongoDB (Pipelines de aggregation)

| Método | Ruta                                  | Descripción                          |
|--------|---------------------------------------|--------------------------------------|
| GET    | `/api/reportes/top-diagnosticos`      | Top 5 diagnósticos por especialidad  |
| GET    | `/api/reportes/medicamentos`          | Ranking de medicamentos              |
| GET    | `/api/reportes/signos-vitales`        | Promedios de signos vitales por grupo etario |
| GET    | `/api/reportes/tiempo-consultas`      | Tiempo promedio entre consultas      |

### Historial clínico (MongoDB)

| Método | Ruta                | Descripción                          |
|--------|---------------------|--------------------------------------|
| POST   | `/api/historiales`  | Insertar un historial clínico        |

### Utilidad

| Método | Ruta           | Descripción     |
|--------|----------------|-----------------|
| GET    | `/api/health`  | Health check    |

## Ejemplos de uso con cURL

### Registrar un pago
```bash
curl -X POST http://localhost:3000/api/pagos \
  -H "Content-Type: application/json" \
  -d '{"factura_id": 15, "monto": 250.00, "metodo_pago": "tarjeta", "referencia": "VISA-4521", "usuario_id": 1}'
```

### Cancelar una cita
```bash
curl -X POST http://localhost:3000/api/citas/42/cancelar \
  -H "Content-Type: application/json" \
  -d '{"motivo": "Paciente llamó indicando emergencia familiar", "usuario_id": 1}'
```

### Consultar saldo de un paciente
```bash
curl http://localhost:3000/api/pacientes/7/saldo
```

### Consultar disponibilidad de un médico
```bash
curl "http://localhost:3000/api/medicos/3/disponibilidad?fecha=2025-06-10"
```

### Insertar un historial clínico
```bash
curl -X POST http://localhost:3000/api/historiales \
  -H "Content-Type: application/json" \
  -d '{
    "cita_id": 101,
    "paciente_id": 7,
    "medico_id": 3,
    "especialidad": "Cardiología",
    "nombre_medico": "Juan Pérez",
    "nombre_paciente": "María López",
    "fecha_nacimiento_paciente": "1980-03-15",
    "fecha_consulta": "2025-06-10",
    "motivo_consulta": "Dolor en el pecho",
    "signos_vitales": {
      "presion_sistolica": 120,
      "presion_diastolica": 80,
      "frecuencia_cardiaca": 72
    },
    "diagnosticos": [{"codigo_cie10": "I20", "descripcion": "Angina de pecho", "tipo": "principal"}],
    "medicamentos": [{"nombre": "Aspirina", "dosis": "100mg", "frecuencia": "1 vez al día", "duracion": "30 días"}]
  }'
```

### Consultar reportes
```bash
curl http://localhost:3000/api/reportes/facturacion-mensual
curl http://localhost:3000/api/reportes/ranking-medicos
curl http://localhost:3000/api/reportes/top-diagnosticos
curl http://localhost:3000/api/reportes/medicamentos
curl http://localhost:3000/api/reportes/signos-vitales
curl http://localhost:3000/api/reportes/tiempo-consultas
```

## Estructura del proyecto

```
clinica-api/
├── .env.example
├── package.json
├── README.md
└── src/
    ├── app.js                  ← Express app, registra rutas
    ├── server.js               ← Levanta el servidor
    ├── db/
    │   ├── postgres.js         ← Pool de pg
    │   └── mongo.js            ← Conexión Mongoose
    ├── models/
    │   └── HistorialClinico.js ← Modelo Mongoose
    ├── routes/
    │   ├── pagos.js
    │   ├── citas.js
    │   ├── reportes.js
    │   ├── pacientes.js
    │   ├── medicos.js
    │   └── historiales.js
    └── utils/
        ├── reutilizable-mongo.js   ← Función normalizarHistorialClinico
        └── pipelines-mongo.js      ← 4 pipelines de aggregation
```

## Manejo de errores

| Situación                                  | Código HTTP | Formato de respuesta          |
|--------------------------------------------|-------------|-------------------------------|
| Error del stored procedure (`PAGO_ERR_*`, `CITA_ERR_*`) | 400 | `{ "error": "mensaje del SP" }` |
| Error de validación en normalización       | 400         | `{ "error": "mensaje" }`     |
| Duplicado (cita_id unique en MongoDB)      | 400         | `{ "error": "mensaje" }`     |
| Error inesperado de BD                     | 500         | `{ "error": "Error interno del servidor" }` |
| Ruta no encontrada                         | 404         | `{ "error": "Ruta no encontrada" }` |

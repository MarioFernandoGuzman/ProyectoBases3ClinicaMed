require('dotenv').config();
const { Client } = require('pg');
const { MongoClient } = require('mongodb');
const { fakerES: faker } = require('@faker-js/faker'); // Usando Faker en español

// Datos médicos realistas por especialidad
const datosPorEspecialidad = {
    "Cardiología": {
        diagnosticos: [
            { c: "I10", d: "Hipertensión esencial" },
            { c: "I49.9", d: "Arritmia cardíaca no especificada" },
            { c: "I50.9", d: "Insuficiencia cardíaca" },
            { c: "I20.9", d: "Angina de pecho" }
        ],
        medicamentos: [
            { nombre: "Losartán", dosis: "50mg", frecuencia: "Cada 12 horas", duracion: "Continuo" },
            { nombre: "Amlodipino", dosis: "5mg", frecuencia: "1 vez al día", duracion: "Continuo" },
            { nombre: "Bisoprolol", dosis: "2.5mg", frecuencia: "1 vez al día", duracion: "Continuo" },
            { nombre: "Aspirina Protect", dosis: "100mg", frecuencia: "1 vez al día", duracion: "Continuo" }
        ]
    },
    "Pediatría": {
        diagnosticos: [
            { c: "J02.9", d: "Faringitis aguda" },
            { c: "H66.9", d: "Otitis media aguda" },
            { c: "J00", d: "Resfriado común" },
            { c: "A09", d: "Gastroenteritis infecciosa" }
        ],
        medicamentos: [
            { nombre: "Amoxicilina en suspensión", dosis: "250mg/5ml", frecuencia: "Cada 8 horas", duracion: "7 días" },
            { nombre: "Paracetamol jarabe", dosis: "150mg/5ml", frecuencia: "Cada 6 horas (si hay fiebre)", duracion: "3 días" },
            { nombre: "Ibuprofeno infantil", dosis: "100mg/5ml", frecuencia: "Cada 8 horas", duracion: "3 días" },
            { nombre: "Suero oral", dosis: "A libre demanda", frecuencia: "Continuo", duracion: "3 días" }
        ]
    },
    "Dermatología": {
        diagnosticos: [
            { c: "L20.9", d: "Dermatitis atópica" },
            { c: "L70.0", d: "Acné vulgar" },
            { c: "L40.9", d: "Psoriasis vulgar" },
            { c: "B35.4", d: "Tiña corporal (Hongos)" }
        ],
        medicamentos: [
            { nombre: "Crema de Hidrocortisona 1%", dosis: "Capa fina", frecuencia: "2 veces al día", duracion: "7 días" },
            { nombre: "Isotretinoína", dosis: "20mg", frecuencia: "1 vez al día", duracion: "1 mes" },
            { nombre: "Ketoconazol Crema", dosis: "Capa fina", frecuencia: "2 veces al día", duracion: "14 días" },
            { nombre: "Jabón Dermolimpiador suave", dosis: "Lavado", frecuencia: "Mañana y noche", duracion: "Continuo" }
        ]
    },
    "Ginecología": {
        diagnosticos: [
            { c: "N76.0", d: "Vaginitis aguda (Candidiasis)" },
            { c: "E28.2", d: "Síndrome de ovario poliquístico" },
            { c: "Z34.9", d: "Supervisión de embarazo normal" },
            { c: "N92.0", d: "Menstruación excesiva y frecuente" }
        ],
        medicamentos: [
            { nombre: "Fluconazol", dosis: "150mg", frecuencia: "Dosis única", duracion: "1 día" },
            { nombre: "Ácido Fólico", dosis: "5mg", frecuencia: "1 vez al día", duracion: "Durante el embarazo" },
            { nombre: "Anticonceptivo Oral (Drospirenona)", dosis: "1 tableta", frecuencia: "1 vez al día", duracion: "1 mes" },
            { nombre: "Hierro (Sulfato Ferroso)", dosis: "300mg", frecuencia: "1 vez al día", duracion: "3 meses" }
        ]
    },
    "Medicina General": {
        diagnosticos: [
            { c: "Z00.0", d: "Examen médico general de rutina" },
            { c: "N39.0", d: "Infección de tracto urinario" },
            { c: "E11.9", d: "Diabetes mellitus tipo 2 sin complicaciones" },
            { c: "M54.5", d: "Lumbago (Dolor de espalda)" }
        ],
        medicamentos: [
            { nombre: "Ciprofloxacino", dosis: "500mg", frecuencia: "Cada 12 horas", duracion: "7 días" },
            { nombre: "Metformina", dosis: "850mg", frecuencia: "1 con el desayuno y 1 con la cena", duracion: "Continuo" },
            { nombre: "Complejo B", dosis: "1 tableta", frecuencia: "1 vez al día", duracion: "30 días" },
            { nombre: "Diclofenaco sódico", dosis: "50mg", frecuencia: "Cada 8 horas (si hay dolor)", duracion: "5 días" }
        ]
    }
};

async function seedDatabase() {
    const pgClient = new Client({
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
    });

    const mongoClient = new MongoClient(process.env.MONGO_URI);

    try {
        await pgClient.connect();
        await mongoClient.connect();

        console.log("Limpiando bases de datos...");
        await pgClient.query(`
            TRUNCATE TABLE 
            log_auditoria, pagos, detalle_factura, facturas, servicios, 
            citas, horarios_medico, medicos, pacientes, especialidades, usuarios 
            RESTART IDENTITY CASCADE;
        `);

        const mongoDb = mongoClient.db(process.env.MONGO_DB);
        const historialesCollection = mongoDb.collection('historiales_clinicos');
        await historialesCollection.deleteMany({});

        console.log("Creando usuarios...");
        const resAdmin = await pgClient.query(
            `INSERT INTO usuarios (username, password_hash, rol, nombre_completo, activo) VALUES ($1, 'hash123', $2, $3, true) RETURNING id`,
            ['admin', 'admin', 'Administrador Principal']
        );
        const adminId = resAdmin.rows[0].id;

        const resRecep = await pgClient.query(
            `INSERT INTO usuarios (username, password_hash, rol, nombre_completo, activo) VALUES ($1, 'hash123', $2, $3, true) RETURNING id`,
            ['recepcion', 'recepcion', 'Ana María Recepción']
        );
        const recepId = resRecep.rows[0].id;

        console.log("Creando especialidades...");
        const especialidadesNombres = Object.keys(datosPorEspecialidad);
        const especialidadesIds = [];
        for (const esp of especialidadesNombres) {
            const resEsp = await pgClient.query(
                `INSERT INTO especialidades (nombre, descripcion) VALUES ($1, $2) RETURNING id`,
                [esp, `Departamento de ${esp}`]
            );
            especialidadesIds.push(resEsp.rows[0].id);
        }

        console.log("Creando servicios...");
        const resServ = await pgClient.query(
            `INSERT INTO servicios (nombre, descripcion, precio) VALUES ($1, $2, $3) RETURNING id`,
            ["Consulta Médica Especializada", "Atención clínica por médico especialista", 350.00]
        );
        const servicioId = resServ.rows[0].id;

        console.log("Creando 10 médicos realistas...");
        const medicosIds = [];
        const medicoEspecialidadIds = [];
        const medicosNombres = [];
        
        for (let i = 0; i < 10; i++) {
            const espIdx = i % 5;
            const espId = especialidadesIds[espIdx];
            const nombres = faker.person.firstName();
            const apellidos = faker.person.lastName();

            const resMed = await pgClient.query(
                `INSERT INTO medicos (especialidad_id, usuario_id, nombres, apellidos, colegiado, telefono, email, activo) VALUES ($1, null, $2, $3, $4, $5, $6, true) RETURNING id`,
                [espId, nombres, apellidos, faker.string.numeric(5), faker.string.numeric(8), faker.internet.email().toLowerCase()]
            );
            medicosIds.push(resMed.rows[0].id);
            medicoEspecialidadIds.push(espIdx);
            medicosNombres.push(`Dr(a). ${nombres} ${apellidos}`);
        }

        // Horarios para los médicos
        for (const mId of medicosIds) {
            for (let d = 1; d <= 5; d++) {
                await pgClient.query(
                    `INSERT INTO horarios_medico (medico_id, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4)`,
                    [mId, d, '08:00:00', '16:00:00']
                );
            }
        }

        console.log("Creando 30 pacientes realistas...");
        const pacientesIds = [];
        const pacientesNombres = [];
        const pacientesNacimiento = [];
        
        for (let i = 0; i < 30; i++) {
            const pNombre = faker.person.firstName();
            const pApellido = faker.person.lastName();
            // Edades variadas: 10 niños, 10 adultos, 10 adultos mayores para que el reporte de Signos Vitales sea rico
            let minAge = 5, maxAge = 80;
            if (i < 10) { minAge = 1; maxAge = 17; } // Pediátricos
            else if (i < 20) { minAge = 18; maxAge = 49; } // Adultos
            else { minAge = 50; maxAge = 85; } // Adultos mayores

            const birthDate = faker.date.birthdate({ min: minAge, max: maxAge, mode: 'age' });

            const resPac = await pgClient.query(
                `INSERT INTO pacientes (nombres, apellidos, fecha_nacimiento, dpi, telefono, email, direccion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                [pNombre, pApellido, birthDate, faker.string.numeric(13), faker.string.numeric(8), faker.internet.email().toLowerCase(), faker.location.streetAddress()]
            );
            pacientesIds.push(resPac.rows[0].id);
            pacientesNombres.push(`${pNombre} ${pApellido}`);
            pacientesNacimiento.push(birthDate);
        }

        console.log("Generando 200 citas en los últimos 6 meses...");
        const atendidaCitas = [];
        const atendidaCitasPaciente = [];
        const atendidaCitasMedico = [];
        const atendidaCitasEspecialidad = [];
        const atendidaCitasFecha = [];
        const atendidaNombresMedicos = [];
        const atendidaNombresPacientes = [];
        const atendidaNacimientosPacientes = [];

        for (let i = 1; i <= 200; i++) {
            const pIdx = faker.number.int({ min: 0, max: pacientesIds.length - 1 });
            let mIdx = faker.number.int({ min: 0, max: medicosIds.length - 1 });
            
            // Si el paciente es niño, priorizamos que vaya a pediatría
            const age = new Date().getFullYear() - pacientesNacimiento[pIdx].getFullYear();
            if (age < 18 && faker.number.int({min:1, max:10}) > 2) {
                // Forzar pediatra (índice especialidad 2)
                const pediatras = medicosIds.map((id, idx) => medicoEspecialidadIds[idx] === 2 ? idx : -1).filter(i => i !== -1);
                if (pediatras.length > 0) mIdx = faker.helpers.arrayElement(pediatras);
            }

            const citaFecha = faker.date.recent({ days: 180 });
            const horaRandom = faker.number.int({ min: 8, max: 14 });
            const minutoRandom = faker.helpers.arrayElement(['00', '30']);
            const horaInicio = `${horaRandom.toString().padStart(2, '0')}:${minutoRandom}:00`;
            const horaFin = minutoRandom === '00' 
                ? `${horaRandom.toString().padStart(2, '0')}:30:00`
                : `${(horaRandom + 1).toString().padStart(2, '0')}:00:00`;

            let estado = 'atendida';
            let motivo = null;
            
            // Mezcla de estados
            if (i > 150 && i <= 170) {
                estado = 'programada';
            } else if (i > 170 && i <= 190) {
                estado = 'cancelada';
                motivo = "El paciente llamó para reagendar.";
            } else if (i > 190) {
                estado = 'no_asistio';
            }

            const resCita = await pgClient.query(
                `INSERT INTO citas (medico_id, paciente_id, fecha, hora_inicio, hora_fin, estado, motivo_cancelacion, creado_por) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [medicosIds[mIdx], pacientesIds[pIdx], citaFecha, horaInicio, horaFin, estado, motivo, recepId]
            );
            const citaId = resCita.rows[0].id;

            if (estado === 'atendida') {
                atendidaCitas.push(citaId);
                atendidaCitasPaciente.push(pacientesIds[pIdx]);
                atendidaCitasMedico.push(medicosIds[mIdx]);
                atendidaCitasEspecialidad.push(especialidadesNombres[medicoEspecialidadIds[mIdx]]);
                atendidaCitasFecha.push(citaFecha);
                atendidaNombresMedicos.push(medicosNombres[mIdx]);
                atendidaNombresPacientes.push(pacientesNombres[pIdx]);
                atendidaNacimientosPacientes.push(pacientesNacimiento[pIdx]);
            }
        }

        console.log(`Generando ${atendidaCitas.length} historiales clínicos reales en MongoDB...`);
        // Queremos exactamente 150 historiales (uno por cada cita atendida, limitamos a 150 si hay más)
        const totalHistoriales = Math.min(150, atendidaCitas.length);

        for (let i = 0; i < totalHistoriales; i++) {
            const especialidadNombre = atendidaCitasEspecialidad[i];
            const catalogoEsp = datosPorEspecialidad[especialidadNombre];
            
            // Elegir entre 1 y 2 diagnósticos de esa especialidad
            const diags = faker.helpers.arrayElements(catalogoEsp.diagnosticos, faker.number.int({min:1, max:2})).map(d => ({
                codigo_cie10: d.c,
                descripcion: d.d,
                tipo: "principal"
            }));

            // Elegir entre 1 y 3 medicamentos de esa especialidad
            const meds = faker.helpers.arrayElements(catalogoEsp.medicamentos, faker.number.int({min:1, max:3}));

            // Variar signos vitales según la edad
            const age = new Date().getFullYear() - atendidaNacimientosPacientes[i].getFullYear();
            let pSis, pDia, fCar;
            if (age < 18) {
                pSis = faker.number.int({min: 90, max: 110});
                pDia = faker.number.int({min: 50, max: 70});
                fCar = faker.number.int({min: 80, max: 120});
            } else if (age > 60) {
                pSis = faker.number.int({min: 130, max: 160});
                pDia = faker.number.int({min: 80, max: 95});
                fCar = faker.number.int({min: 60, max: 90});
            } else {
                pSis = faker.number.int({min: 110, max: 130});
                pDia = faker.number.int({min: 70, max: 85});
                fCar = faker.number.int({min: 65, max: 85});
            }

            const doc = {
                cita_id: atendidaCitas[i],
                paciente_id: atendidaCitasPaciente[i],
                medico_id: atendidaCitasMedico[i],
                especialidad: especialidadNombre,
                fecha_consulta: atendidaCitasFecha[i],
                fecha_nacimiento_paciente: atendidaNacimientosPacientes[i],
                motivo_consulta: `Paciente acude por síntomas relacionados a ${diags[0].descripcion.toLowerCase()}.`,
                nombre_medico: atendidaNombresMedicos[i],
                nombre_paciente: atendidaNombresPacientes[i],
                signos_vitales: {
                    presion_sistolica: pSis,
                    presion_diastolica: pDia,
                    frecuencia_cardiaca: fCar,
                    frecuencia_respiratoria: faker.number.int({ min: 14, max: 20 }),
                    temperatura: faker.number.float({ min: 36.5, max: 38.0, fractionDigits: 1 }), // Ocasionalmente fiebre
                    peso_kg: age < 18 ? faker.number.float({min:15, max:50, fractionDigits:1}) : faker.number.float({ min: 60, max: 95, fractionDigits: 1 }),
                    talla_cm: age < 18 ? faker.number.float({min:100, max:160, fractionDigits:1}) : faker.number.float({ min: 155, max: 185, fractionDigits: 1 }),
                    saturacion_o2: faker.number.int({ min: 94, max: 99 })
                },
                diagnosticos: diags,
                medicamentos: meds,
                notas_adicionales: "Paciente estable. Recomiendo dieta balanceada y reposo.",
                creado_en: new Date()
            };
            await historialesCollection.insertOne(doc);
        }

        console.log("Generando 100 facturas...");
        const facturasIds = [];
        
        for (let i = 0; i < 100; i++) {
            const resFac = await pgClient.query(
                `INSERT INTO facturas (cita_id, paciente_id, total, estado, emitida_por) VALUES ($1, $2, $3, 'pendiente', $4) RETURNING id`,
                [atendidaCitas[i], atendidaCitasPaciente[i], 350.00, recepId]
            );
            const facturaId = resFac.rows[0].id;
            facturasIds.push(facturaId);

            await pgClient.query(
                `INSERT INTO detalle_factura (factura_id, servicio_id, cantidad, precio_unitario, subtotal) VALUES ($1, $2, 1, $3, $4)`,
                [facturaId, servicioId, 350.00, 350.00]
            );
        }

        console.log("Registrando 80 pagos (mezcla de completos y parciales)...");
        for (let i = 0; i < 80; i++) {
            // Pagos parciales en algunos, completos en otros
            const monto = i % 3 === 0 ? 150.00 : 350.00; 
            await pgClient.query(
                `CALL registrar_pago($1, $2, $3, $4, $5)`,
                [facturasIds[i], monto, 'tarjeta', faker.string.numeric(8), recepId]
            );
        }

        console.log("Generando logs de auditoría masivos (>500)...");
        for (let i = 0; i < 550; i++) {
            await pgClient.query(
                `INSERT INTO log_auditoria (usuario_id, operacion, tabla_afectada, detalle) VALUES ($1, $2, $3, $4::jsonb)`,
                [adminId, 'CONSULTA_REPORTE', 'varias', JSON.stringify({ accion: "Generación de reporte gerencial", IP: faker.internet.ipv4() })]
            );
        }

        console.log("==========================================");
        console.log("🎉 POBLACIÓN DE DATOS REALISTA COMPLETADA!");
        console.log("==========================================");
    } catch (error) {
        console.error("Error al poblar la base de datos:", error);
    } finally {
        await pgClient.end();
        await mongoClient.close();
    }
}

seedDatabase();
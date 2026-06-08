const mongoose = require('mongoose');

const signosVitalesSchema = new mongoose.Schema(
  {
    presion_sistolica: Number,
    presion_diastolica: Number,
    frecuencia_cardiaca: Number,
    frecuencia_respiratoria: Number,
    temperatura: Number,
    peso_kg: Number,
    talla_cm: Number,
    saturacion_o2: Number,
  },
  { _id: false }
);

const diagnosticoSchema = new mongoose.Schema(
  {
    codigo_cie10: String,
    descripcion: String,
    tipo: {
      type: String,
      enum: ['principal', 'secundario', 'presuntivo'],
    },
  },
  { _id: false }
);

const medicamentoSchema = new mongoose.Schema(
  {
    nombre: String,
    dosis: String,
    frecuencia: String,
    duracion: String,
    indicaciones: String,
  },
  { _id: false }
);

const examenSchema = new mongoose.Schema(
  {
    tipo: String,
    descripcion: String,
    urgencia: {
      type: String,
      enum: ['rutina', 'urgente', 'stat'],
    },
  },
  { _id: false }
);

const historialClinicoSchema = new mongoose.Schema(
  {
    cita_id: { type: Number, required: true, unique: true },
    paciente_id: { type: Number, required: true },
    medico_id: { type: Number, required: true },
    especialidad: { type: String, required: true },
    nombre_medico: String,
    nombre_paciente: String,
    fecha_nacimiento_paciente: Date,
    fecha_consulta: { type: Date, required: true },
    motivo_consulta: { type: String, required: true },
    signos_vitales: signosVitalesSchema,
    diagnosticos: [diagnosticoSchema],
    medicamentos: [medicamentoSchema],
    examenes_solicitados: [examenSchema],
    datos_especialidad: { type: mongoose.Schema.Types.Mixed },
    notas_adicionales: String,
    creado_en: { type: Date, default: Date.now },
    version_documento: { type: Number, default: 1 },
  },
  {
    collection: 'historiales_clinicos',
  }
);

module.exports = mongoose.model('HistorialClinico', historialClinicoSchema);

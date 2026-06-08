/**
 * normalizarHistorialClinico(doc)
 *
 * Recibe el body del request, valida campos obligatorios,
 * normaliza tipos y strings, y devuelve el documento listo para insertar.
 * Lanza Error si faltan campos obligatorios.
 */
function normalizarHistorialClinico(doc) {
  if (!doc || typeof doc !== 'object') {
    throw new Error('El body debe ser un objeto JSON válido.');
  }

  // --- Campos obligatorios ---
  const camposObligatorios = [
    'cita_id',
    'paciente_id',
    'medico_id',
    'especialidad',
    'fecha_consulta',
    'motivo_consulta',
  ];

  const faltantes = camposObligatorios.filter(
    (c) => doc[c] === undefined || doc[c] === null || doc[c] === ''
  );
  if (faltantes.length > 0) {
    throw new Error(`Campos obligatorios faltantes: ${faltantes.join(', ')}`);
  }

  // --- Normalización de tipos numéricos ---
  const camposNumericos = ['cita_id', 'paciente_id', 'medico_id'];
  for (const campo of camposNumericos) {
    const valor = Number(doc[campo]);
    if (isNaN(valor)) {
      throw new Error(`El campo "${campo}" debe ser numérico.`);
    }
    doc[campo] = valor;
  }

  // --- Normalización de strings ---
  if (doc.especialidad) {
    doc.especialidad = doc.especialidad.trim();
  }
  if (doc.motivo_consulta) {
    doc.motivo_consulta = doc.motivo_consulta.trim();
  }
  if (doc.nombre_medico) {
    doc.nombre_medico = doc.nombre_medico.trim();
  }
  if (doc.nombre_paciente) {
    doc.nombre_paciente = doc.nombre_paciente.trim();
  }
  if (doc.notas_adicionales) {
    doc.notas_adicionales = doc.notas_adicionales.trim();
  }

  // --- Normalización de fechas ---
  if (doc.fecha_consulta) {
    const fecha = new Date(doc.fecha_consulta);
    if (isNaN(fecha.getTime())) {
      throw new Error('El campo "fecha_consulta" no es una fecha válida.');
    }
    doc.fecha_consulta = fecha;
  }
  if (doc.fecha_nacimiento_paciente) {
    const fecha = new Date(doc.fecha_nacimiento_paciente);
    if (isNaN(fecha.getTime())) {
      throw new Error(
        'El campo "fecha_nacimiento_paciente" no es una fecha válida.'
      );
    }
    doc.fecha_nacimiento_paciente = fecha;
  }

  // --- Normalización de signos vitales ---
  if (doc.signos_vitales && typeof doc.signos_vitales === 'object') {
    const camposSV = [
      'presion_sistolica',
      'presion_diastolica',
      'frecuencia_cardiaca',
      'frecuencia_respiratoria',
      'temperatura',
      'peso_kg',
      'talla_cm',
      'saturacion_o2',
    ];
    for (const campo of camposSV) {
      if (doc.signos_vitales[campo] !== undefined) {
        const val = Number(doc.signos_vitales[campo]);
        if (isNaN(val)) {
          throw new Error(
            `El signo vital "${campo}" debe ser numérico.`
          );
        }
        doc.signos_vitales[campo] = val;
      }
    }
  }

  // --- Normalización de diagnósticos ---
  if (doc.diagnosticos && Array.isArray(doc.diagnosticos)) {
    const tiposValidos = ['principal', 'secundario', 'presuntivo'];
    doc.diagnosticos = doc.diagnosticos.map((d, i) => {
      if (d.tipo && !tiposValidos.includes(d.tipo)) {
        throw new Error(
          `diagnosticos[${i}].tipo inválido: "${d.tipo}". Valores permitidos: ${tiposValidos.join(', ')}`
        );
      }
      return {
        ...d,
        codigo_cie10: d.codigo_cie10 ? d.codigo_cie10.trim().toUpperCase() : d.codigo_cie10,
        descripcion: d.descripcion ? d.descripcion.trim() : d.descripcion,
        tipo: d.tipo ? d.tipo.trim().toLowerCase() : d.tipo,
      };
    });
  }

  // --- Normalización de medicamentos ---
  if (doc.medicamentos && Array.isArray(doc.medicamentos)) {
    doc.medicamentos = doc.medicamentos.map((m) => ({
      ...m,
      nombre: m.nombre ? m.nombre.trim() : m.nombre,
      dosis: m.dosis ? m.dosis.trim() : m.dosis,
      frecuencia: m.frecuencia ? m.frecuencia.trim() : m.frecuencia,
      duracion: m.duracion ? m.duracion.trim() : m.duracion,
      indicaciones: m.indicaciones ? m.indicaciones.trim() : m.indicaciones,
    }));
  }

  // --- Normalización de exámenes solicitados ---
  if (doc.examenes_solicitados && Array.isArray(doc.examenes_solicitados)) {
    const urgenciasValidas = ['rutina', 'urgente', 'stat'];
    doc.examenes_solicitados = doc.examenes_solicitados.map((e, i) => {
      if (e.urgencia && !urgenciasValidas.includes(e.urgencia)) {
        throw new Error(
          `examenes_solicitados[${i}].urgencia inválido: "${e.urgencia}". Valores permitidos: ${urgenciasValidas.join(', ')}`
        );
      }
      return {
        ...e,
        tipo: e.tipo ? e.tipo.trim() : e.tipo,
        descripcion: e.descripcion ? e.descripcion.trim() : e.descripcion,
        urgencia: e.urgencia ? e.urgencia.trim().toLowerCase() : e.urgencia,
      };
    });
  }

  // --- Defaults ---
  if (!doc.creado_en) {
    doc.creado_en = new Date();
  }
  if (!doc.version_documento) {
    doc.version_documento = 1;
  }

  return doc;
}

module.exports = { normalizarHistorialClinico };
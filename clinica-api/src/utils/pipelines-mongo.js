/**
 * Pipelines de aggregation para la colección historiales_clinicos.
 *
 * Cada pipeline se exporta como una función que retorna el array de stages,
 * para que `hace3Meses` se calcule al momento de la ejecución.
 */

/**
 * Top 5 diagnósticos por especialidad en los últimos 3 meses.
 */
function pipelineTopDiagnosticos() {
  const hace3Meses = new Date();
  hace3Meses.setMonth(hace3Meses.getMonth() - 3);

  return [
    { $match: { fecha_consulta: { $gte: hace3Meses } } },
    { $unwind: '$diagnosticos' },
    {
      $group: {
        _id: {
          especialidad: '$especialidad',
          codigo_cie10: '$diagnosticos.codigo_cie10',
          descripcion: '$diagnosticos.descripcion',
        },
        total: { $sum: 1 },
      },
    },
    { $sort: { '_id.especialidad': 1, total: -1 } },
    {
      $group: {
        _id: '$_id.especialidad',
        diagnosticos: {
          $push: {
            codigo_cie10: '$_id.codigo_cie10',
            descripcion: '$_id.descripcion',
            total: '$total',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        especialidad: '$_id',
        top_diagnosticos: { $slice: ['$diagnosticos', 5] },
      },
    },
    { $sort: { especialidad: 1 } },
  ];
}

/**
 * Ranking de medicamentos: global top 10 y top 5 por especialidad con porcentaje.
 */
function pipelineMedicamentos() {
  const hace3Meses = new Date();
  hace3Meses.setMonth(hace3Meses.getMonth() - 3);

  return [
    { $match: { fecha_consulta: { $gte: hace3Meses } } },
    { $unwind: '$medicamentos' },
    {
      $facet: {
        ranking_global: [
          {
            $group: {
              _id: '$medicamentos.nombre',
              total_prescripciones: { $sum: 1 },
            },
          },
          {
            $setWindowFields: {
              output: {
                total_todas: { $sum: '$total_prescripciones' }
              }
            }
          },
          { $sort: { total_prescripciones: -1 } },
          { $limit: 10 },
          {
            $project: {
              _id: 0,
              medicamento: '$_id',
              total_prescripciones: 1,
              porcentaje: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$total_prescripciones', '$total_todas'] },
                      100,
                    ],
                  },
                  2,
                ],
              },
            },
          },
        ],
        por_especialidad: [
          {
            $group: {
              _id: {
                especialidad: '$especialidad',
                medicamento: '$medicamentos.nombre',
              },
              total: { $sum: 1 },
            },
          },
          { $sort: { '_id.especialidad': 1, total: -1 } },
          {
            $group: {
              _id: '$_id.especialidad',
              total_especialidad: { $sum: '$total' },
              medicamentos: {
                $push: {
                  medicamento: '$_id.medicamento',
                  total: '$total',
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              especialidad: '$_id',
              medicamentos: {
                $map: {
                  input: { $slice: ['$medicamentos', 5] },
                  as: 'med',
                  in: {
                    medicamento: '$$med.medicamento',
                    total: '$$med.total',
                    porcentaje: {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ['$$med.total', '$total_especialidad'] },
                            100,
                          ],
                        },
                        2,
                      ],
                    },
                  },
                },
              },
            },
          },
          { $sort: { especialidad: 1 } },
        ],
      },
    },
  ];
}

/**
 * Promedios de signos vitales por grupo etario.
 */
function pipelineSignosVitales() {
  const hace3Meses = new Date();
  hace3Meses.setMonth(hace3Meses.getMonth() - 3);

  return [
    {
      $match: {
        fecha_consulta: { $gte: hace3Meses },
        signos_vitales: { $exists: true, $ne: null },
        fecha_nacimiento_paciente: { $exists: true, $ne: null },
      },
    },
    {
      $addFields: {
        edad: {
          $floor: {
            $divide: [
              { $subtract: ['$fecha_consulta', '$fecha_nacimiento_paciente'] },
              365.25 * 24 * 60 * 60 * 1000,
            ],
          },
        },
      },
    },
    {
      $addFields: {
        grupo_etario: {
          $switch: {
            branches: [
              { case: { $lt: ['$edad', 18] }, then: 'Pediátrico (0-17)' },
              { case: { $lt: ['$edad', 30] }, then: 'Adulto joven (18-29)' },
              { case: { $lt: ['$edad', 50] }, then: 'Adulto (30-49)' },
              { case: { $lt: ['$edad', 65] }, then: 'Adulto mayor (50-64)' },
            ],
            default: 'Tercera edad (65+)',
          },
        },
      },
    },
    {
      $group: {
        _id: '$grupo_etario',
        promedio_presion_sistolica: { $avg: '$signos_vitales.presion_sistolica' },
        promedio_presion_diastolica: { $avg: '$signos_vitales.presion_diastolica' },
        promedio_frecuencia_cardiaca: { $avg: '$signos_vitales.frecuencia_cardiaca' },
        total_registros: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        grupo_etario: '$_id',
        promedio_presion_sistolica: { $round: ['$promedio_presion_sistolica', 1] },
        promedio_presion_diastolica: { $round: ['$promedio_presion_diastolica', 1] },
        promedio_frecuencia_cardiaca: { $round: ['$promedio_frecuencia_cardiaca', 1] },
        total_registros: 1,
      },
    },
    { $sort: { grupo_etario: 1 } },
  ];
}

/**
 * Tiempo promedio entre consultas por paciente usando $setWindowFields.
 */
function pipelineTiempoEntreConsultas() {
  return [
    { $sort: { paciente_id: 1, fecha_consulta: 1 } },
    {
      $setWindowFields: {
        partitionBy: '$paciente_id',
        sortBy: { fecha_consulta: 1 },
        output: {
          consulta_anterior: {
            $shift: {
              output: '$fecha_consulta',
              by: -1,
            },
          },
        },
      },
    },
    {
      $match: {
        consulta_anterior: { $ne: null },
      },
    },
    {
      $addFields: {
        dias_entre_consultas: {
          $divide: [
            { $subtract: ['$fecha_consulta', '$consulta_anterior'] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
    {
      $group: {
        _id: {
          paciente_id: '$paciente_id',
          nombre_paciente: '$nombre_paciente',
        },
        promedio_dias: { $avg: '$dias_entre_consultas' },
        total_intervalos: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        paciente_id: '$_id.paciente_id',
        nombre_paciente: '$_id.nombre_paciente',
        promedio_dias: { $round: ['$promedio_dias', 1] },
        total_intervalos: 1,
      },
    },
    { $sort: { promedio_dias: 1 } },
  ];
}

module.exports = {
  pipelineTopDiagnosticos,
  pipelineMedicamentos,
  pipelineSignosVitales,
  pipelineTiempoEntreConsultas,
};

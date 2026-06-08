const mongoose = require('mongoose');

async function conectarMongo() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB;

  await mongoose.connect(uri, { dbName });
  console.log(`MongoDB conectado a ${dbName}`);
}

module.exports = conectarMongo;

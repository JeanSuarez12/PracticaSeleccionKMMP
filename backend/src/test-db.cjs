// src/test-db.cjs
const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('DEBUG → DB_USER:', process.env.DB_USER);
console.log('DEBUG → DB_PASS:', process.env.DB_PASS);
console.log('DEBUG → DB_NAME:', process.env.DB_NAME);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    dialect: 'postgres',
    logging: false,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al conectar a BD:', err);
    process.exit(1);
  }
})();

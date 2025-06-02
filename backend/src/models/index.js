// src/models/index.js
import sequelize from '../config/database.js';
import Role from './Role.js';
import User from './User.js';
import Order from './Order.js';
import StopLog from './StopLog.js';
import ReprogramLog from './ReprogramLog.js';
import DistributionList from './DistributionList.js';


const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Tablas recreadas y sincronizadas con la base de datos.');
  } catch (error) {
    console.error('❌ Error al sincronizar tablas:', error);
  }
};

export { sequelize, Role, User, Order, StopLog, ReprogramLog, DistributionList, syncDatabase };

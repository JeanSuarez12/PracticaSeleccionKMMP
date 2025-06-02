// src/models/ReprogramLog.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Order from './Order.js';

class ReprogramLog extends Model {}

ReprogramLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    reprogrammedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ReprogramLog',
    tableName: 'reprogram_logs',
    timestamps: false,
  }
);

// Relación: ReprogramLog.belongsTo(Order)
ReprogramLog.belongsTo(Order, {
  foreignKey: {
    name: 'orderId',
    allowNull: false,
  },
  as: 'order',
});

Order.hasMany(ReprogramLog, {
  foreignKey: 'orderId',
  as: 'reprogramLogs',
});

export default ReprogramLog;

// src/models/StopLog.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Order from './Order.js';

class StopLog extends Model {}

StopLog.init(
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
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isPlanned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'StopLog',
    tableName: 'stop_logs',
    timestamps: false,
  }
);

// Relación: StopLog.belongsTo(Order)
StopLog.belongsTo(Order, {
  foreignKey: {
    name: 'orderId',
    allowNull: false,
  },
  as: 'order',
});

Order.hasMany(StopLog, {
  foreignKey: 'orderId',
  as: 'stopLogs',
});

export default StopLog;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.STRING(9),
      primaryKey: true,
      allowNull: false,
      validate: {
        len: [9, 9], // Debe tener exactamente 9 caracteres
        isNumeric: true,
      },
    },
    astApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('TO-DO', 'IN-PROCESS', 'DONE'),
      allowNull: false,
      defaultValue: 'TO-DO',
    },
    isStopped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    stopReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stage: {
      type: DataTypes.ENUM('Desarme', 'Armado'),
      allowNull: false,
      defaultValue: 'Desarme',
    },
    reprogramReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    // createdAt: fecha de creación, updatedAt: última modificación
  }
);

export default Order;

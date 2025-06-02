// src/models/DistributionList.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class DistributionList extends Model {}

DistributionList.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // “reason” será la clave para el motivo (ej: ‘Falta de base’, ‘Prueba de flexión (MS)’, etc.)
    reason: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    // “emails” será un texto donde guardamos lista separada por comas, p.ej “a@x.com,b@x.com”
    emails: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        // Devolver como array
        const raw = this.getDataValue('emails');
        return raw.split(',').map((s) => s.trim());
      },
      set(val) {
        // Esperamos que “val” sea un array de strings; guardamos como cadena separada por comas
        this.setDataValue('emails', val.join(','));
      },
    },
  },
  {
    sequelize,
    modelName: 'DistributionList',
    tableName: 'distribution_lists',
    timestamps: false,
  }
);

export default DistributionList;

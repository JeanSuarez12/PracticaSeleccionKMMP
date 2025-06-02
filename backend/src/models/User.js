import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Role from './Role.js';

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    // Si luego agregas login, guardas password hashed aquí:
    // password: { type: DataTypes.STRING, allowNull: false }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  }
);

// Relación: User.belongsTo(Role)
User.belongsTo(Role, {
  foreignKey: {
    name: 'roleId',
    allowNull: false,
  },
  as: 'role',
});

Role.hasMany(User, {
  foreignKey: 'roleId',
  as: 'users',
});

export default User;

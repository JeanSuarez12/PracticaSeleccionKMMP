// src/controllers/userController.js
import { User, Role } from '../models/index.js';

// Listar todos los usuarios (con su rol)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener usuarios.' });
  }
};

// Crear usuario con rol
// Body: { username, email, roleId }
export const createUser = async (req, res) => {
  try {
    const { username, email, roleId } = req.body;
    // Validar que el rol exista
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: 'El rol especificado no existe.' });
    }
    // Crear el usuario
    const newUser = await User.create({ username, email, roleId });
    // Recargar incluyendo el rol
    const userWithRole = await User.findByPk(newUser.id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });
    return res.status(201).json(userWithRole);
  } catch (err) {
    console.error(err);
    // Detectar duplicados
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Usuario o correo ya existe.' });
    }
    return res.status(500).json({ message: 'Error al crear usuario.' });
  }
};

// Actualizar rol de usuario (o email/username si quieres)
// PUT or PATCH: /api/users/:id   Body: { roleId, username?, email? }
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId, username, email } = req.body;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    // Si enviaron un roleId, validar
    if (roleId) {
      const role = await Role.findByPk(roleId);
      if (!role) return res.status(400).json({ message: 'Rol inválido.' });
      user.roleId = roleId;
    }
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();
    // Recargar con rol
    const updated = await User.findByPk(id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al actualizar usuario.' });
  }
};

// Eliminar o desactivar usuario (en este MVP haremos un "borrado lógico" opcionalmente)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    // Opcional: en lugar de borrar físicamente, podríamos marcar un `isActive` falso.
    await user.destroy();
    return res.json({ message: 'Usuario eliminado.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al eliminar usuario.' });
  }
};

// Listar todos los roles
export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({ order: [['id', 'ASC']] });
    return res.json(roles);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener roles.' });
  }
};

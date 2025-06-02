import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllRoles,
} from '../controllers/userController.js';

const router = express.Router();

// Roles
router.get('/roles', getAllRoles);

// Usuarios
router.get('/', getAllUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

// src/routes/distributionRoutes.js
import express from 'express';
import {
  getAllDistributions,
  upsertDistribution,
  deleteDistribution,
} from '../controllers/distributionController.js';

const router = express.Router();

// Listar
router.get('/', getAllDistributions);

// Crear o actualizar (upsert)
router.post('/', upsertDistribution);

// Eliminar (por id)
router.delete('/:id', deleteDistribution);

export default router;

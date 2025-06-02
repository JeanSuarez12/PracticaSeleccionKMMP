// backend/src/routes/orderRoutes.js
import express from 'express';
import {
  createOrder,
  getAllOrders,
  startOrder,
  stopOrder,
  resumeOrder,
  finishOrder,
  reprogramOrder,
  exportOrdersToCSV,
} from '../controllers/orderController.js';

const router = express.Router();

// Crear nueva OS
router.post('/', createOrder);

// Obtener todas (o filtradas por astApproved)
router.get('/', getAllOrders);

// Iniciar OS
router.patch('/:id/start', startOrder);

// Detener OS
router.patch('/:id/stop', stopOrder);

// Reanudar OS
router.patch('/:id/resume', resumeOrder);

// Finalizar OS
router.patch('/:id/finish', finishOrder);

// Reprogramar OS
router.patch('/:id/reprogram', reprogramOrder);

// Exportar CSV
router.get('/export/csv', exportOrdersToCSV);

export default router;

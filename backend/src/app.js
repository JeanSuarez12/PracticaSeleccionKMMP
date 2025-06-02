import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { syncDatabase } from './models/index.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import distributionRoutes from './routes/distributionRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json()); // Permite recibir JSON en body

// Rutas
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/distribution', distributionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Gestión de Órdenes de Servicio 🚀');
});

// Sincronizar modelos y luego arrancar servidor
syncDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🌱 Servidor backend corriendo en http://localhost:${PORT}`);
  });
});

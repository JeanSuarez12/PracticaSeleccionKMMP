import { Op } from 'sequelize';
import { Order, StopLog, ReprogramLog, DistributionList } from '../models/index.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configura Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // e.g. "gmail"
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1) Crear nueva OS
export const createOrder = async (req, res) => {
  try {
    const { id, astApproved = false, stage } = req.body;
    // Validar ID de 9 dígitos
    if (!/^\d{9}$/.test(id)) {
      return res.status(400).json({ message: 'El ID debe ser una cadena de 9 dígitos numéricos.' });
    }
    // Validar etapa
    if (!['Desarme', 'Armado'].includes(stage)) {
      return res.status(400).json({ message: 'Etapa inválida.' });
    }
    // Intentar crear la OS
    const newOrder = await Order.create({
      id,
      astApproved,
      stage,
      status: 'TO-DO',
      isStopped: false,
      stopReason: null,
      reprogramReason: null,
    });
    return res.status(201).json(newOrder);
  } catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ya existe una OS con ese ID.' });
    }
    return res.status(500).json({ message: 'Error al crear la OS.' });
  }
};

// 2) Obtener todas las OS (opcionalmente filtradas)
export const getAllOrders = async (req, res) => {
  try {
    const { astApproved } = req.query;
    const whereClause = {};
    if (astApproved !== undefined) {
      whereClause.astApproved = astApproved === 'true';
    }
    const orders = await Order.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });
    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener órdenes.' });
  }
};

// 3) Iniciar OS (TO-DO → IN-PROCESS)
export const startOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'OS no encontrada.' });
    if (order.status !== 'TO-DO') {
      return res.status(400).json({ message: 'Solo se puede iniciar una OS en TO-DO.' });
    }
    order.status = 'IN-PROCESS';
    await order.save();
    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al iniciar OS.' });
  }
};

// 4) Detener OS (IN-PROCESS → detenido)
export const stopOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, isPlanned = false } = req.body;
    // 4.1) Verificar OS
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'OS no encontrada.' });
    }
    if (order.status !== 'IN-PROCESS' || order.isStopped) {
      return res
        .status(400)
        .json({ message: 'Solo puede detenerse si está en IN-PROCESS y no está ya detenido.' });
    }

    // 4.2) Crear StopLog
    const stopLog = await StopLog.create({
      orderId: id,
      reason,
      startTime: new Date(),
      isPlanned,
    });

    // 4.3) Actualizar OS
    order.isStopped = true;
    order.stopReason = reason;
    await order.save();

    // 4.4) Construir asunto y texto del correo
    const subject = isPlanned
      ? `Parada planificada de OS ${id}`
      : `Parada NO planificada de OS ${id}`;

    const text = isPlanned
      ? `La OS ${id} ha sido detenida para parada planificada.\n\nMotivo: ${reason}\nHora: ${stopLog.startTime.toISOString()}`
      : `La OS ${id} ha sido detenida por parada no planificada.\n\nMotivo: ${reason}\nHora: ${stopLog.startTime.toISOString()}\nPor favor coordinar con supervisor/técnico líder.`;

    // 4.5) Buscar lista de distribución en BD
    let recipients = [];
    const distRecord = await DistributionList.findOne({ where: { reason } });
    if (distRecord) {
      // El getter de “emails” devuelve un array de strings
      recipients = distRecord.emails;
    } else {
      // Lista por defecto si no existe registro para el motivo
      recipients = [
        'area.planeamiento@empresa.com',
        'supervisor.taller@empresa.com',
      ];
    }

    // 4.6) Enviar correo
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipients.join(','),
      subject,
      text,
    });

    return res.json({ order, stopLog });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al detener OS.' });
  }
};

// 5) Reanudar OS (detenido → IN-PROCESS)
export const resumeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'OS no encontrada.' });
    if (!order.isStopped) {
      return res.status(400).json({ message: 'La OS no está detenida.' });
    }

    // 5.1) Cerrar StopLog pendiente
    const stopLog = await StopLog.findOne({
      where: { orderId: id, endTime: { [Op.is]: null } },
      order: [['startTime', 'DESC']],
    });
    if (stopLog) {
      stopLog.endTime = new Date();
      await stopLog.save();
    }

    // 5.2) Actualizar OS
    order.isStopped = false;
    order.stopReason = null;
    await order.save();

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al reanudar OS.' });
  }
};

// 6) Finalizar OS (IN-PROCESS → DONE)
export const finishOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'OS no encontrada.' });
    if (order.status !== 'IN-PROCESS') {
      return res.status(400).json({ message: 'La OS tiene que estar en IN-PROCESS para finalizar.' });
    }

    // 6.1) Cerrar StopLog si estaba detenido
    if (order.isStopped) {
      const stopLog = await StopLog.findOne({
        where: { orderId: id, endTime: { [Op.is]: null } },
        order: [['startTime', 'DESC']],
      });
      if (stopLog) {
        stopLog.endTime = new Date();
        await stopLog.save();
      }
    }

    // 6.2) Actualizar OS
    order.status = 'DONE';
    order.isStopped = false;
    order.stopReason = null;
    await order.save();

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al finalizar OS.' });
  }
};

// 7) Reprogramar OS (TO-DO o IN-PROCESS → TO-DO)
export const reprogramOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'OS no encontrada.' });
    if (!['TO-DO', 'IN-PROCESS'].includes(order.status)) {
      return res.status(400).json({ message: 'Solo puede reprogramar si está en TO-DO o IN-PROCESS.' });
    }

    // 7.1) Crear ReprogramLog
    await ReprogramLog.create({
      orderId: id,
      reason,
      reprogrammedAt: new Date(),
    });

    // 7.2) Si estaba detenido, cerrar StopLog
    if (order.isStopped) {
      const stopLog = await StopLog.findOne({
        where: { orderId: id, endTime: { [Op.is]: null } },
        order: [['startTime', 'DESC']],
      });
      if (stopLog) {
        stopLog.endTime = new Date();
        await stopLog.save();
      }
    }

    // 7.3) Actualizar OS de vuelta a TO-DO
    order.status = 'TO-DO';
    order.isStopped = false;
    order.stopReason = null;
    order.reprogramReason = reason;
    await order.save();

    // 7.4) Enviar correo de reprogramación (fallback de destinatarios)
    const distRecord = await DistributionList.findOne({ where: { reason } });
    let recipients = [];
    if (distRecord) {
      recipients = distRecord.emails;
    } else {
      recipients = [
        'area.planeamiento@empresa.com',
        'supervisor.taller@empresa.com',
      ];
    }
    const subject = `OS ${id} REPROGRAMADA`;
    const text = `La OS ${id} ha sido reprogramada.\n\nMotivo: ${reason}\nHora: ${new Date().toISOString()}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipients.join(','),
      subject,
      text,
    });

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al reprogramar OS.' });
  }
};

// 8) Exportar todas las OS a CSV
export const exportOrdersToCSV = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['createdAt', 'ASC']],
    });
    // Construir CSV manualmente o con una librería. Aquí un ejemplo sencillo:
    const header = [
      'id',
      'astApproved',
      'status',
      'isStopped',
      'stopReason',
      'stage',
      'reprogramReason',
      'createdAt',
      'updatedAt',
    ];
    const rows = orders.map((o) => [
      o.id,
      o.astApproved,
      o.status,
      o.isStopped,
      o.stopReason || '',
      o.stage,
      o.reprogramReason || '',
      o.createdAt.toISOString(),
      o.updatedAt.toISOString(),
    ]);

    const csvLines = [
      header.join(','),
      ...rows.map((r) => r.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')),
    ];
    const csvData = csvLines.join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders_export.csv"');
    return res.send(csvData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al exportar a CSV.' });
  }
};

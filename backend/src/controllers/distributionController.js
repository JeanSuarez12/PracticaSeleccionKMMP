import DistributionList from '../models/DistributionList.js';

// Listar todos los registros de distribución
export const getAllDistributions = async (req, res) => {
  try {
    const lists = await DistributionList.findAll({ order: [['reason', 'ASC']] });
    // El field “emails” saldrá como array gracias al getter
    return res.json(lists);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener listas de distribución.' });
  }
};

// Crear o actualizar un registro (upsert por “reason”)
// Body: { reason, emails: ['a@x.com','b@x.com'] }
export const upsertDistribution = async (req, res) => {
  try {
    const { reason, emails } = req.body;
    if (!reason || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'Debe enviar “reason” y un array de “emails”.' });
    }
    // Buscamos si existe
    let record = await DistributionList.findOne({ where: { reason } });
    if (record) {
      // Actualizar
      record.emails = emails;
      await record.save();
    } else {
      // Crear
      record = await DistributionList.create({ reason, emails });
    }
    return res.json(record);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al actualizar lista de distribución.' });
  }
};

// Eliminar un registro
export const deleteDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await DistributionList.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Registro no encontrado.' });
    await record.destroy();
    return res.json({ message: 'Registro eliminado.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al eliminar registro.' });
  }
};

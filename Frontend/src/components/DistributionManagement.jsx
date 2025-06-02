// src/components/DistributionManagement.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DistributionManagement = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulario para crear/editar
  const [reason, setReason] = useState('');
  const [emailsText, setEmailsText] = useState(''); // string con comas
  const [editingId, setEditingId] = useState(null); // null=crear, id=editar

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:4000/api/distribution');
      setLists(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validaciones mínimas
    if (!reason.trim() || !emailsText.trim()) {
      alert('Complete motivo y al menos un email (separados por coma).');
      return;
    }
    // Convertir texto en arreglo de strings
    const emailsArray = emailsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);

    try {
      await axios.post('http://localhost:4000/api/distribution', {
        reason: reason.trim(),
        emails: emailsArray,
      });
      alert(editingId ? 'Configuración actualizada.' : 'Motivo agregado.');
      setReason('');
      setEmailsText('');
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al guardar configuración.');
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setReason(record.reason);
    setEmailsText(record.emails.join(', ')); // emails es array
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta configuración?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/distribution/${id}`);
      alert('Configuración eliminada.');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setReason('');
    setEmailsText('');
  };

  return (
    <div className="distribution-management">
      <h2>Gestión de Listas de Distribución</h2>

      {loading && <p>Cargando configuraciones...</p>}
      {!loading && (
        <>
          {/* Formulario crear/editar */}
          <form className="dist-form" onSubmit={handleSubmit}>
            <h3>{editingId ? 'Editar Configuración' : 'Agregar Configuración'}</h3>

            <div className="form-group">
              <label>Motivo (texto exacto):</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Falta de base"
                required
              />
            </div>

            <div className="form-group">
              <label>Emails (separados por coma):</label>
              <textarea
                value={emailsText}
                onChange={(e) => setEmailsText(e.target.value)}
                placeholder="ej: a@x.com, b@x.com"
                rows={2}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit">{editingId ? 'Guardar' : 'Agregar'}</button>
              {editingId && (
                <button type="button" onClick={handleCancel} className="btn-cancel">
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Tabla de configuraciones */}
          <table className="dist-table">
            <thead>
              <tr>
                <th>Motivo</th>
                <th>Emails</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lists.map((l) => (
                <tr key={l.id}>
                  <td>{l.reason}</td>
                  <td>{l.emails.join(', ')}</td>
                  <td>
                    <button onClick={() => handleEdit(l)}>Editar</button>
                    <button onClick={() => handleDelete(l.id)} className="btn-delete">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default DistributionManagement;

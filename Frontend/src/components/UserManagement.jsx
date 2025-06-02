import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulario para crear/updating
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null); // null=crear, id=editar

  // Cargar usuarios y roles
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUsers, resRoles] = await Promise.all([
        axios.get('http://localhost:4000/api/users'),
        axios.get('http://localhost:4000/api/users/roles'),
      ]);
      setUsers(resUsers.data);
      setRoles(resRoles.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Crear o actualizar usuario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newUsername || !newEmail || !newRoleId) {
      alert('Completa todos los campos.');
      return;
    }
    try {
      if (updatingUserId) {
        // Actualizar
        await axios.patch(`http://localhost:4000/api/users/${updatingUserId}`, {
          username: newUsername,
          email: newEmail,
          roleId: newRoleId,
        });
        alert('Usuario actualizado.');
      } else {
        // Crear
        await axios.post(`http://localhost:4000/api/users`, {
          username: newUsername,
          email: newEmail,
          roleId: newRoleId,
        });
        alert('Usuario creado.');
      }
      setNewUsername('');
      setNewEmail('');
      setNewRoleId('');
      setUpdatingUserId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al guardar usuario.');
    }
  };

  // Preparar formulario para editar
  const handleEdit = (user) => {
    setUpdatingUserId(user.id);
    setNewUsername(user.username);
    setNewEmail(user.email);
    setNewRoleId(user.role.id);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setUpdatingUserId(null);
    setNewUsername('');
    setNewEmail('');
    setNewRoleId('');
  };

  // Eliminar usuario
  const handleDelete = async (userId) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await axios.delete(`http://localhost:4000/api/users/${userId}`);
      alert('Usuario eliminado.');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar usuario.');
    }
  };

  return (
    <div className="user-management">
      <h2>Administración de Usuarios</h2>

      {loading && <p>Cargando usuarios...</p>}
      {!loading && (
        <>
          {/* Formulario crear/editar */}
          <form className="user-form" onSubmit={handleSubmit}>
            <h3>{updatingUserId ? 'Editar Usuario' : 'Crear Usuario'}</h3>

            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Rol:</label>
              <select
                value={newRoleId}
                onChange={(e) => setNewRoleId(e.target.value)}
                required
              >
                <option value="">-- Seleccione Rol --</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit">
                {updatingUserId ? 'Guardar cambios' : 'Crear usuario'}
              </button>
              {updatingUserId && (
                <button type="button" onClick={handleCancelEdit} className="btn-cancel">
                  Cancelar
                </button>
              )}
            </div>
          </form>

          {/* Tabla de usuarios */}
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.role.name}</td>
                  <td>
                    <button onClick={() => handleEdit(u)}>Editar</button>
                    <button onClick={() => handleDelete(u.id)} className="btn-delete">
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

export default UserManagement;

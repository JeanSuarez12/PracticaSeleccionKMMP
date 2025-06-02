// src/App.jsx
import React, { useState } from 'react';
import KanbanBoard from './components/KanbanBoard';
import UserManagement from './components/UserManagement';
import DistributionManagement from './components/DistributionManagement';
import './App.css';

function App() {
  const [view, setView] = useState('kanban'); // 'kanban', 'users', 'distribution'

  return (
    <div className="App">
      <header>
        <h1>Gestión de Órdenes de Servicio</h1>
        <nav className="main-nav">
          <button
            className={view === 'kanban' ? 'active' : ''}
            onClick={() => setView('kanban')}
          >
            Kanban
          </button>
          <button
            className={view === 'users' ? 'active' : ''}
            onClick={() => setView('users')}
          >
            Usuarios
          </button>
          <button
            className={view === 'distribution' ? 'active' : ''}
            onClick={() => setView('distribution')}
          >
            Distribución
          </button>
        </nav>
      </header>

      {view === 'kanban' && <KanbanBoard />}
      {view === 'users' && <UserManagement />}
      {view === 'distribution' && <DistributionManagement />}
    </div>
  );
}

export default App;

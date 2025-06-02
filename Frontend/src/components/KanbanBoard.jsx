import React, { useEffect, useState } from 'react';
import Column from './Column';
import InProcessTabs from './InProcessTabs';
import {
  getApprovedOrders,
  startOrder,
} from '../services/orderService';
import '../App.css';

const KanbanBoard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar órdenes con AST aprobado
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    getApprovedOrders()
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar órdenes:', err);
        setLoading(false);
      });
  };

  // Filtrar los tres estados
  const todoOrders = orders.filter((o) => o.status === 'TO-DO');
  const inProcessOrders = orders.filter((o) => o.status === 'IN-PROCESS');
  const doneOrders = orders.filter((o) => o.status === 'DONE');

  // Función para iniciar OS (queda igual que antes)
  const handleStart = (order) => {
    startOrder(order.id)
      .then(() => fetchOrders())
      .catch((e) => console.error(e));
  };

  return (
    <div>
      {/* REFRESH + Export CSV, puedes conservarlos aquí o llevarlos arriba */}
      <div className="refresh-container">
        <button onClick={fetchOrders}>Refresh</button>
        <a
          href="http://localhost:4000/api/orders/export/csv"
          target="_blank"
          rel="noopener noreferrer"
          className="export-link"
        >
          Exportar CSV
        </a>
      </div>

      {loading && <p>Cargando órdenes…</p>}

      {!loading && (
        <div className="kanban-container">
          {/* COLUMNA TO-DO */}
          <Column
            title="TO-DO"
            orders={todoOrders}
            onStart={handleStart}
            onStop={() => {}}
            onResume={() => {}}
            onFinish={() => {}}
            onReprogram={() => {}}
          />

          {/* COLUMNA IN-PROCESS ahora se sustituye por InProcessTabs */}
          <div className="column inprocess-column">
            <h3>IN-PROCESS</h3>
            <InProcessTabs orders={inProcessOrders} onRefresh={fetchOrders} />
          </div>

          {/* COLUMNA DONE: si quisieras mostrar tarjetas “Solo terminadas” */}
          <Column
            title="DONE"
            orders={doneOrders}
            onStart={() => {}}
            onStop={() => {}}
            onResume={() => {}}
            onFinish={() => {}}
            onReprogram={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;

// src/components/Column.jsx
import React from 'react';
import OrderCard from './OrderCard';

const Column = ({ title, orders, onStart, onStop, onResume, onFinish, onReprogram }) => {
  return (
    <div className="column">
      <h3>{title}</h3>
      <div className="order-list">
        {orders.length === 0 && <p className="empty-text">— vacío —</p>}

        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onStart={onStart}
            onStop={onStop}
            onResume={onResume}
            onFinish={onFinish}
            onReprogram={onReprogram}
          />
        ))}
      </div>
    </div>
  );
};

export default Column;

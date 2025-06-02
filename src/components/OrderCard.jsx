// src/components/OrderCard.jsx
import React from 'react';

const OrderCard = ({ order, onStart, onStop, onResume, onFinish, onReprogram }) => {
  const { id, status, isStopped, stopReason, stage } = order;

  return (
    <div className="order-card">
      <div className="order-header">
        <strong>OS:</strong> {id} &nbsp;|&nbsp; <em>{stage}</em>
      </div>

      <div className="order-status">
        <span>{status}</span>
        {isStopped && <span className="stopped-badge">DETENIDA</span>}
      </div>

      {isStopped && stopReason && (
        <div className="stop-reason">
          <small>Motivo: {stopReason}</small>
        </div>
      )}

      <div className="order-actions">
        {status === 'TO-DO' && (
          <button onClick={() => onStart(order)}>INICIAR</button>
        )}

        {status === 'IN-PROCESS' && !isStopped && (
          <>
            <button onClick={() => onStop(order)}>STOP</button>
            <button onClick={() => onFinish(order)}>FINALIZAR</button>
            <button onClick={() => onReprogram(order)}>REPROGRAMAR</button>
          </>
        )}

        {status === 'IN-PROCESS' && isStopped && (
          <>
            <button onClick={() => onResume(order)}>REANUDAR</button>
            <button onClick={() => onReprogram(order)}>REPROGRAMAR</button>
          </>
        )}

        {status === 'DONE' && (
          <span className="done-label">TERMINADA</span>
        )}
      </div>
    </div>
  );
};

export default OrderCard;

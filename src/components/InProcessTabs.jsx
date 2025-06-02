// src/components/InProcessTabs.jsx
import React, { useState, useEffect } from 'react';
import {
  stopOrder,
  resumeOrder,
  finishOrder,
  reprogramOrder,
} from '../services/orderService';

const InProcessTabs = ({ orders, onRefresh }) => {
  // orders aquí es el array de órdenes en estado "IN-PROCESS"
  // onRefresh es una función que hace fetchOrders() en el KanbanBoard

  // TAB SELECCIONADA: trackea qué pestaña (index) está activa
  const [activeTab, setActiveTab] = useState(0);

  // ESTADOS LOCALES para cada OS: motivo elegido y si está detenido
  // Vamos a construir un array paralelo con la misma longitud que `orders`
  const [localStates, setLocalStates] = useState([]);

  // Listas estáticas de motivos
  const UNPLANNED_REASONS = [
    'Falta de base',
    'Máquina no disponible',
    'Falla eléctrica',
    'Falla mecánica',
  ];
  const PLANNED_REASONS = [
    'Inspección ultrasónico',
    'Prueba de flexión (MS)',
    'Extracción de machón (730/830)',
    'Mantenimiento preventivo programado',
  ];

  // Inicializamos localStates cada vez que cambie `orders`
  useEffect(() => {
    const initialStates = orders.map((o) => ({
      isStopped: o.isStopped || false,
      selectedUnplanned: '', // motivo de parada no planificada
      selectedPlanned: '',   // motivo de parada planificada
    }));
    setLocalStates(initialStates);
    setActiveTab(0); // si cambian las órdenes, volvemos a la primera pestaña
  }, [orders]);

  // Función para actualizar el estado local de una pestaña (por índice)
  const updateLocalState = (idx, newPartial) => {
    setLocalStates((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...newPartial };
      return copy;
    });
  };

  // ----------------- HANDLERS -----------------

  // Handler STOP
  const handleStop = (order, idx, isPlanned) => {
    // Según isPlanned, elegimos el motivo correcto:
    const reason = isPlanned
      ? localStates[idx].selectedPlanned
      : localStates[idx].selectedUnplanned;

    if (!reason) {
      alert('Debe seleccionar primero un motivo.');
      return;
    }
    // Llamar al backend
    stopOrder(order.id, reason, isPlanned)
      .then(() => {
        // Marcar localmente que ahora está detenido
        updateLocalState(idx, { isStopped: true });
        onRefresh(); // refrescar lista general
        alert(`OS ${order.id} detenida (${isPlanned ? 'planificada' : 'no planificada'}).`);
      })
      .catch((err) => {
        console.error(err);
        alert('Error al detener OS.');
      });
  };

  // Handler REANUDAR
  const handleResume = (order, idx) => {
    resumeOrder(order.id)
      .then(() => {
        // Limpiar estado local de parada
        updateLocalState(idx, {
          isStopped: false,
          selectedUnplanned: '',
          selectedPlanned: '',
        });
        onRefresh();
        alert(`OS ${order.id} reanudada.`);
      })
      .catch((err) => {
        console.error(err);
        alert('Error al reanudar OS.');
      });
  };

  // Handler FINALIZAR
  const handleFinish = (order) => {
    if (!window.confirm(`¿Seguro que desea finalizar la OS ${order.id}?`)) return;
    finishOrder(order.id)
      .then(() => {
        onRefresh();
        alert(`OS ${order.id} finalizada.`);
      })
      .catch((err) => {
        console.error(err);
        alert('Error al finalizar OS.');
      });
  };

  // Handler REPROGRAMAR
  const handleReprogram = (order) => {
    const reason = window.prompt('¿Cuál es el motivo de la reprogramación?');
    if (!reason) return;
    reprogramOrder(order.id, reason)
      .then(() => {
        onRefresh();
        alert(`OS ${order.id} reprogramada.`);
      })
      .catch((err) => {
        console.error(err);
        alert('Error al reprogramar OS.');
      });
  };

  // ----------------- RENDER -----------------

  if (orders.length === 0) {
    return <p>No hay órdenes en IN‐PROCESS.</p>;
  }

  // La pestaña “cabecera” con botones para cada OS
  return (
    <div className="inprocess-tabs-container">
      {/* Títulos de pestañas */}
      <div className="tabs-header">
        {orders.map((o, idx) => (
          <button
            key={o.id}
            className={`tab-button ${activeTab === idx ? 'active' : ''}`}
            onClick={() => setActiveTab(idx)}
          >
            {o.id}
          </button>
        ))}
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="tab-content">
        {orders.map((order, idx) => {
          if (idx !== activeTab) return null;

          const local = localStates[idx] || {};
          const disabledUnplanned = local.isStopped || !!local.selectedPlanned;
          const disabledPlanned = local.isStopped || !!local.selectedUnplanned;

          return (
            <div key={order.id} className="tab-pane">
              <h4>OS {order.id} - Etapa: {order.stage}</h4>

              {/* Motivos No Planificados */}
              <div className="reason-block">
                <label>Motivos NO planificados:</label>
                <select
                  disabled={local.isStopped}
                  value={local.selectedUnplanned}
                  onChange={(e) =>
                    updateLocalState(idx, { selectedUnplanned: e.target.value, selectedPlanned: '' })
                  }
                >
                  <option value="">-- Seleccione --</option>
                  {UNPLANNED_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Botón STOP (No Planificado) */}
              {!local.isStopped && local.selectedUnplanned && (
                <button
                  className="btn-stop-unplanned"
                  onClick={() => handleStop(order, idx, false)}
                >
                  STOP
                </button>
              )}

              {/* Motivos Planificados */}
              <div className="reason-block" style={{ marginTop: '20px' }}>
                <label>Motivos planificados:</label>
                <select
                  disabled={local.isStopped}
                  value={local.selectedPlanned}
                  onChange={(e) =>
                    updateLocalState(idx, { selectedPlanned: e.target.value, selectedUnplanned: '' })
                  }
                >
                  <option value="">-- Seleccione --</option>
                  {PLANNED_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Botón STOP (Planificado) */}
              {!local.isStopped && local.selectedPlanned && (
                <button
                  className="btn-stop-planned"
                  onClick={() => handleStop(order, idx, true)}
                >
                  STOP
                </button>
              )}

              {/* Si ya está detenido, mostrar botón REANUDAR */}
              {local.isStopped && (
                <button
                  className="btn-resume"
                  onClick={() => handleResume(order, idx)}
                >
                  REANUDAR
                </button>
              )}

              {/* Botones de Finalizar y Reprogramar (siempre visibles mientras está IN-PROCESS) */}
              <div className="final-reprog-buttons">
                <button className="btn-finish" onClick={() => handleFinish(order)}>
                  Finalizar
                </button>
                <button className="btn-reprogram" onClick={() => handleReprogram(order)}>
                  Reprogramar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InProcessTabs;

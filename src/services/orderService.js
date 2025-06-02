// src/services/orderService.js
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api/orders';

export const getApprovedOrders = () => {
  // Trae solo las órdenes con astApproved=true
  return axios.get(`${API_BASE}?astApproved=true`);
};

export const startOrder = (id) => {
  return axios.patch(`${API_BASE}/${id}/start`);
};

export const stopOrder = (id, reason, isPlanned = false) => {
  return axios.patch(`${API_BASE}/${id}/stop`, { reason, isPlanned });
};

export const resumeOrder = (id) => {
  return axios.patch(`${API_BASE}/${id}/resume`);
};

export const finishOrder = (id) => {
  return axios.patch(`${API_BASE}/${id}/finish`);
};

export const reprogramOrder = (id, reason) => {
  return axios.patch(`${API_BASE}/${id}/reprogram`, { reason });
};

// No necesitamos llamar directamente al CSV aquí; colocaremos un <a> en el componente.

import api from './api';
export const getHabits = () => api.get('/habits').then(r => r.data);
export const createHabit = (data) => api.post('/habits', data).then(r => r.data);
export const updateHabit = (id, data) => api.put(`/habits/${id}`, data).then(r => r.data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`).then(r => r.data);
export const completeHabit = (id) => api.post(`/habits/${id}/complete`).then(r => r.data);
export const uncompleteHabit = (id) => api.delete(`/habits/${id}/complete`).then(r => r.data);
export const getHabitHistory = (id) => api.get(`/habits/${id}/history`).then(r => r.data);
export const getHabitStats = (id) => api.get(`/habits/${id}/stats`).then(r => r.data);

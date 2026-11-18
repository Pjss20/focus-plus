import api from './api';
export const getSettings = () => api.get('/users/settings').then(r => r.data);
export const updateSettings = (data) => api.put('/users/settings', data).then(r => r.data);
export const updateProfile = (data) => api.put('/users/profile', data).then(r => r.data);
export const changePassword = (data) => api.put('/auth/change-password', data).then(r => r.data);
export const getPlannerEvents = (params) => api.get('/planner/events', { params }).then(r => r.data);
export const createPlannerEvent = (data) => api.post('/planner/events', data).then(r => r.data);
export const updatePlannerEvent = (id, data) => api.put(`/planner/events/${id}`, data).then(r => r.data);
export const deletePlannerEvent = (id) => api.delete(`/planner/events/${id}`).then(r => r.data);

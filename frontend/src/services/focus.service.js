import api from './api';
export const getFocusSessions = () => api.get('/focus/sessions').then(r => r.data);
export const createSession = (data) => api.post('/focus/sessions', data).then(r => r.data);
export const updateSession = (id, data) => api.put(`/focus/sessions/${id}`, data).then(r => r.data);
export const getFocusStats = () => api.get('/focus/stats').then(r => r.data);

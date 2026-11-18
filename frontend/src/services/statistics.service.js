import api from './api';
export const getStats = (period) => api.get('/statistics', { params: { period } }).then(r => r.data);

import api from './api';
export const getAchievements = () => api.get('/achievements').then(r => r.data);
export const checkAchievements = () => api.post('/achievements/check').then(r => r.data);

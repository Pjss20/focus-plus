import api from './api';
export const getTasks = (params) => api.get('/tasks', { params }).then(r => r.data);
export const createTask = (data) => api.post('/tasks', data).then(r => r.data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data).then(r => r.data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`).then(r => r.data);
export const completeTask = (id) => api.post(`/tasks/${id}/complete`).then(r => r.data);
export const createSubtask = (taskId, data) => api.post(`/tasks/${taskId}/subtasks`, data).then(r => r.data);
export const updateSubtask = (taskId, subId, data) => api.put(`/tasks/${taskId}/subtasks/${subId}`, data).then(r => r.data);
export const deleteSubtask = (taskId, subId) => api.delete(`/tasks/${taskId}/subtasks/${subId}`).then(r => r.data);

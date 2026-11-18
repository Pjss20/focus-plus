import api from './api';
export const getNotes = (search) => api.get('/notes', { params: search ? { search } : {} }).then(r => r.data);
export const createNote = (data) => api.post('/notes', data).then(r => r.data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data).then(r => r.data);
export const deleteNote = (id) => api.delete(`/notes/${id}`).then(r => r.data);
export const togglePin = (id) => api.put(`/notes/${id}/pin`).then(r => r.data);

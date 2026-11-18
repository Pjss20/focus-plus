import api from './api';
export const getCalendarEvents = (start, end) => api.get('/calendar/events', { params: { start, end } }).then(r => r.data);
export const createEvent = (data) => api.post('/calendar/events', data).then(r => r.data);
export const updateEvent = (id, data) => api.put(`/calendar/events/${id}`, data).then(r => r.data);
export const deleteEvent = (id) => api.delete(`/calendar/events/${id}`).then(r => r.data);

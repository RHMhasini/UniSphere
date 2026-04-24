import api from './api';

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get('/bookings/my');
  return response.data;
};

export const getAllBookings = async (status = null) => {
  const params = status ? { status } : {};
  const response = await api.get('/bookings', { params });
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

export const approveBooking = async (id) => {
  const response = await api.patch(`/bookings/${id}/approve`);
  return response.data;
};

export const rejectBooking = async (id, reason) => {
  const response = await api.patch(`/bookings/${id}/reject`, { reason });
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data;
};

export const updateBooking = async (id, bookingData) => {
  const response = await api.put(`/bookings/${id}`, bookingData);
  return response.data;
};

export const getResourceById = async (id) => {
  // Temporary mock function until Member 1 is fully integrated
  // In a real scenario, this connects to GET /api/resources/{id}
  return {
    id: id,
    name: 'Main Auditorium',
    type: 'ROOM',
    capacity: 150
  };
};

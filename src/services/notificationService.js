import API from '../api/axios';

export const fetchNotifications   = ()   => API.get('/notifications');
export const markAsRead           = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead        = ()   => API.put('/notifications/read-all');
export const deleteNotification   = (id) => API.delete(`/notifications/${id}`);
// clear-all backend mein nahi hai, frontend se sab ek ek delete karenge
export const clearAllNotifications = async () => {
  const res = await API.get('/notifications');
  const notifs = res.data?.notifications || [];
  await Promise.allSettled(notifs.map((n) => API.delete(`/notifications/${n._id}`)));
};
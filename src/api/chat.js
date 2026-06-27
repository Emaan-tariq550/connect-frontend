import api from './axios';

// Chat APIs
export const getMyChats = () => api.get('/chats');
export const createOrGetChat = (userId) => api.post('/chats', { userId });
export const getChatById = (chatId) => api.get(`/chats/${chatId}`);
export const deleteChat = (chatId) => api.delete(`/chats/${chatId}`);

// Message APIs
export const getMessages = (chatId, page = 1) =>
  api.get(`/messages/${chatId}?page=${page}&limit=30`);
export const sendMessage = (chatId, formData) => {
  formData.append('chatId', chatId);

  return api.post('/messages', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const deleteMessage = (messageId) =>
  api.delete(`/messages/${messageId}`);
export const editMessage = (messageId, text) =>
  api.put(`/messages/${messageId}`, { text });
export const reactToMessage = (messageId, emoji) =>
  api.post(`/messages/${messageId}/react`, { emoji });
export const markMessagesRead = (chatId) =>
  api.put(`/chats/${chatId}/read`);
export const pinMessage = (messageId) =>
  api.put(`/messages/${messageId}/pin`);
export const starMessage = (messageId) =>
  api.put(`/messages/${messageId}/star`);
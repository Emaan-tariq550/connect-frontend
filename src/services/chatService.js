import api from '@/api/axios'

export const chatService = {
  getChats: () => api.get('/chats'),

  createOrGetChat: (userId) =>
    api.post(`/chats/dm/${userId}`),

  getChatById: (chatId) =>
    api.get(`/chats/${chatId}`),

  deleteChat: (chatId) =>
    api.delete(`/chats/${chatId}`),
}
import api from '@/api/axios'

export const friendService = {
  sendRequest: (userId) => api.post(`/friends/request/${userId}`),
  acceptRequest: (userId) => api.patch(`/friends/accept/${userId}`),
  rejectRequest: (userId) => api.patch(`/friends/reject/${userId}`),
  cancelRequest: (userId) => api.delete(`/friends/cancel/${userId}`),
  removeFriend: (userId) => api.delete(`/friends/remove/${userId}`),
  blockUser: (userId) => api.post(`/friends/block/${userId}`),
  getFriends: (page = 1) => api.get(`/friends?page=${page}&limit=12`),
  getIncomingRequests: () => api.get('/friends/requests/incoming'),
  getOutgoingRequests: () => api.get('/friends/requests/outgoing'),
  getOnlineFriends: () => api.get('/friends/online'),
  getFriendshipStatus: (userId) => api.get(`/friends/status/${userId}`),
}
import api from '@/api/axios'

export const userService = {
  getProfile:    (username)      => api.get(`/users/profile/${username}`),
  updateProfile: (data)          => api.put('/users/profile', data),
  uploadAvatar:  (formData)      => api.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadMedia:   (formData)      => api.post('/users/media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getUserMedia:  (username)      => api.get(`/users/${username}/media`),
  createPost:    (data)          => api.post('/posts', data),
  getUserPosts:  (username)      => api.get(`/posts/user/${username}`),
  updateStatus:  (data)          => api.put('/users/status', data),
  updatePrivacy: (settings)      => api.put('/users/privacy', settings),
  getSuggestions:(limit = 8)     => api.get(`/users/suggestions?limit=${limit}`),
  searchUsers:   (q, limit = 10) => api.get(`/users/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  getUserStats:  ()              => api.get('/users/stats'),
}
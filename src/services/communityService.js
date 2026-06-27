import api from '@/api/axios'

export const communityService = {
  getAll:       (page = 1)             => api.get(`/communities?page=${page}&limit=12`),
  explore:      (search = '')          => api.get(`/communities/explore?search=${search}`),
  getMine:      ()                     => api.get('/communities/mine'),
  getById:      (id)                   => api.get(`/communities/${id}`),
  create:       (data)                 => api.post('/communities', data),
  join:         (id)                   => api.post(`/communities/${id}/join`),
  leave:        (id)                   => api.post(`/communities/${id}/leave`),
  getMembers:   (id)                   => api.get(`/communities/${id}/members`),
  updateMember: (id, userId, role)     => api.put(`/communities/${id}/members/${userId}`, { role }),
}
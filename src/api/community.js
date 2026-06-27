import api from './axios';

export const getCommunities        = (page = 1)      => api.get(`/communities?page=${page}&limit=12`);
export const getExploreCommunities = (search = '')   => api.get(`/communities/explore?search=${search}`);
export const getCommunityById      = (id)            => api.get(`/communities/${id}`);
export const createCommunity       = (formData)      => api.post('/communities', formData);           // ✅ fixed
export const updateCommunity       = (id, formData)  => api.put(`/communities/${id}`, formData);      // ✅ fixed
export const deleteCommunity       = (id)            => api.delete(`/communities/${id}`);
export const joinCommunity         = (id)            => api.post(`/communities/${id}/join`);
export const leaveCommunity        = (id)            => api.post(`/communities/${id}/leave`);
export const getCommunityMembers   = (id)            => api.get(`/communities/${id}/members`);
export const getCommunityFeed      = (id, page = 1)  => api.get(`/communities/${id}/feed?page=${page}`);
export const postToCommunity       = (id, formData)  => api.post(`/communities/${id}/post`, formData); // ✅ fixed
export const getMyChannels         = (communityId)   => api.get(`/channels/community/${communityId}`);
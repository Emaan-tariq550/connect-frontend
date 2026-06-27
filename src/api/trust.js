import api from './axios';

export const getMyTrustScore    = ()           => api.get('/trust/me');
export const getUserTrustScore  = (userId)     => api.get(`/trust/user/${userId}`);
export const getTrustHistory    = (page = 1)   => api.get(`/trust/history?page=${page}&limit=15`);
export const getUserTrustHistory= (userId, page = 1) => api.get(`/trust/history/${userId}?page=${page}&limit=15`);
export const getTrustLeaderboard= ()           => api.get('/trust/leaderboard');
export const reportUser         = (data)       => api.post('/trust/report', data);
export const getTrustStats      = ()           => api.get('/trust/stats');
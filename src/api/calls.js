import api from './axios';

export const initiateCall   = (data)   => api.post('/calls/initiate', data);
export const endCall        = (callId) => api.put(`/calls/${callId}/end`);
export const getCallHistory = ()       => api.get('/calls/history');
export const getCallById    = (callId) => api.get(`/calls/${callId}`);
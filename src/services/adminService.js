import API from '../api/axios';

export const getAdminStats       = ()        => API.get('/admin/stats');
export const getAllUsers          = (params)  => API.get('/admin/users', { params });
export const banUser              = (id)      => API.patch(`/admin/users/${id}/ban`);
export const unbanUser            = (id)      => API.patch(`/admin/users/${id}/unban`);
export const deleteUser           = (id)      => API.delete(`/admin/users/${id}`);
export const getAllReports         = (params)  => API.get('/admin/reports', { params });
export const resolveReport        = (id)      => API.patch(`/admin/reports/${id}/resolve`);
export const dismissReport        = (id)      => API.patch(`/admin/reports/${id}/dismiss`);
export const deleteReport         = (id)      => API.delete(`/admin/reports/${id}`);
export const getAllCommunities     = (params)  => API.get('/admin/communities', { params });
export const deleteCommunity      = (id)      => API.delete(`/admin/communities/${id}`);
export const toggleCommunityLock  = (id)      => API.patch(`/admin/communities/${id}/toggle-lock`);
import api from '@/api/axios'

export const authService = {
  register:       (data)                      => api.post('/auth/register', data),
  login:          (data)                      => api.post('/auth/login', data),
  logout:         (refreshToken)              => api.post('/auth/logout', { refreshToken }),
  verifyEmail:    (userId, otp)               => api.post('/auth/verify-email', { userId, otp }),
  resendOTP:      (userId)                    => api.post('/auth/resend-otp', { userId }),
  refreshToken:   (refreshToken)              => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email)                     => api.post('/auth/forgot-password', { email }),
  resetPassword:  (userId, otp, newPassword)  => api.post('/auth/reset-password', { userId, otp, newPassword }),
  getMe:          ()                          => api.get('/auth/me'),
}
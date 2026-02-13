import apiauth from './index.api.js';

export const authApi = {
     login: (data) => apiauth.post('/auth/login', data),
     me : () => apiauth.get('/auth/me'),
     logout: () => apiauth.post('/auth/logout'),
}
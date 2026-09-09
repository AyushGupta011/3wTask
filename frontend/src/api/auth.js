import API from './axios';

export const signupAPI = (data) => API.post('/auth/signup', data);
export const loginAPI = (data) => API.post('/auth/login', data);
export const getMeAPI = () => API.get('/auth/me');

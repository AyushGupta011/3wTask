import API from './axios';

export const getUserProfileAPI = (id) => API.get(`/users/${id}`);
export const toggleFollowAPI = (id) => API.post(`/users/${id}/follow`);
export const getAllUsersAPI = () => API.get('/users');
export const getFollowersAPI = (id) => API.get(`/users/${id}/followers`);
export const getFollowingAPI = (id) => API.get(`/users/${id}/following`);

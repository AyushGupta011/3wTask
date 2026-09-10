import API from './axios';

export const getPostsAPI = (page = 1, limit = 10, userId = null, likedBy = null, commentedBy = null) => {
  let url = `/posts?page=${page}&limit=${limit}`;
  if (userId) url += `&userId=${userId}`;
  if (likedBy) url += `&likedBy=${likedBy}`;
  if (commentedBy) url += `&commentedBy=${commentedBy}`;
  return API.get(url);
};

export const getPostAPI = (id) => API.get(`/posts/${id}`);

export const createPostAPI = (formData) =>
  API.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const toggleLikeAPI = (id) => API.post(`/posts/${id}/like`);

export const addCommentAPI = (id, text) =>
  API.post(`/posts/${id}/comment`, { text });

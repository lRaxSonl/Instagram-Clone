import axios from "axios"


export const getPosts = () => axios.get('http://127.0.0.1:8000/api/posts/');
export const createPost = (data) => axios.post("/api/posts/create/", data);
export const updatePost = (id, data) => axios.put(`/api/posts/update/${id}/`, data);
export const deletePost = (id) => axios.delete(`/api/posts/delete/${id}/`);
export const getPostComments = (postId) => axios.get(`/api/posts/${postId}/comments/`);
export const createPostComment = (postId, data) => axios.post(`/api/posts/${postId}/comments/create/`, data);
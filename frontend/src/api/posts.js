import axiosInstance from "./axiosInstance";


export const getPosts = () => axiosInstance.get("posts/");
export const getPostsByUser = (id) => axiosInstance.get(`posts/user/${id}`)
export const createPost = (data) => axiosInstance.post("posts/create/", data);
export const updatePost = (id, data) => axiosInstance.put(`posts/update/${id}/`, data);
export const deletePost = (id) => axiosInstance.delete(`posts/delete/${id}/`);
export const getPostComments = (postId) => axiosInstance.get(`posts/${postId}/comments/`);
export const createPostComment = (postId, data) => axiosInstance.post(`posts/${postId}/comments/create/`, data);
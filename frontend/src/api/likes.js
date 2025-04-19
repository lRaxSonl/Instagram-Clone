import axiosInstance from "./axiosInstance";


export const likePost = (postId) => axiosInstance.post(`post/${postId}/like/add/`);
export const likeComment = (commentId) => axiosInstance.post(`comment/${commentId}/like/add/`);
export const deleteLike = (likeId) => axiosInstance.delete(`like/delete/${likeId}/`);
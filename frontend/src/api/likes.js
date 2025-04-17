import axios from "axios";


export const likePost = (postId) => axios.post(`/api/post/int:${postId}/like/add/`);
export const likeComment = (commentId) => axios.post(`/api/comment/${commentId}/like/add/`);
export const deleteLike = (likeId) => axios.delete(`/api/like/delete/${likeId}/`);
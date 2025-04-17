import axios from "axios";


export const replyToComment = (parentId, data) => axios.post(`/api/comments/${parentId}/reply/create/`, data);
export const updateComment = (id, data) => axios.put(`/api/comments/update/${id}/`, data);
export const deleteComment = (id) => axios.delete(`/api/comments/delete/${id}/`);
import axiosInstance from "./axiosInstance";



export const replyToComment = (parentId, data) => axiosInstance.post(`comments/${parentId}/reply/create/`, data);
export const updateComment = (id, data) => axiosInstance.put(`comments/update/${id}/`, data);
export const deleteComment = (id) => axiosInstance.delete(`comments/delete/${id}/`);
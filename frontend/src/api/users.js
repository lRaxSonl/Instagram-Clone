import axios from "axios";
import axiosInstance from "./axiosInstance"


export const registerUser = (data) => axios.post(`user/register/`, data);
export const getUser = (id) => axiosInstance.get(`user/${id}/`);
export const getCurrentUser = () => axiosInstance.get(`user/me/`)
export const updateUser = (data) => axiosInstance.put(`user/update/`, data);
export const deleteUser = () => axiosInstance.delete(`user/delete/`);
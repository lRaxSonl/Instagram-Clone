import axios from "axios";
import axiosInstance from "./axiosInstance"
import { BACKEND_SERVER } from "../config";


export const registerUser = (data) => axios.post(`${BACKEND_SERVER}/api/v1/user/register/`, data);
export const getUser = (id) => axiosInstance.get(`user/${id}/`);
export const getCurrentUser = () => axiosInstance.get(`user/me/`)
export const getUserSubcriptions = (id) => axiosInstance.get(`user/${id}/subscriptions/`);
export const getUserSubscribers = (id) => axiosInstance.get(`user/${id}/subscribers/`);
export const createSubcription = (id) => axiosInstance.post(`subscription/create/${id}/`);
export const deleteSubcription = (id) => axiosInstance.delete(`subscription/delete/${id}/`);
export const updateUser = (data) => axiosInstance.put(`user/update/`, data);
export const deleteUser = () => axiosInstance.delete(`user/delete/`);
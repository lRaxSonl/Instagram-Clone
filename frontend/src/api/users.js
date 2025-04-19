import axios from "axios";
import axiosInstance from "./axiosInstance"
import { BACKEND_SERVER } from "../config";


export const registerUser = (data) => axios.post(`${BACKEND_SERVER}/api/user/register/`, data);
export const getUser = (id) => axiosInstance.get(`user/${id}/`);
export const updateUser = (data) => axiosInstance.put(`user/update/`, data);
export const deleteUser = () => axiosInstance.delete(`user/delete/`);
import axios from "axios";
import { BACKEND_SERVER } from "../config";


export const getToken = (data) => axios.post(`${BACKEND_SERVER}/api/token/`, data);
export const getRefreshToken = (data) => axios.post(`${BACKEND_SERVER}/api/token/refresh/`, data);
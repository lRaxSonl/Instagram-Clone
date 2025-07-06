import axios from "axios";
import { getRefreshToken } from "./auth";
import { jwtDecode } from "jwt-decode"
import { BACKEND_SERVER } from "../config";
import { Navigate } from 'react-router-dom';

let accessToken = localStorage.getItem("access");

const axiosInstance = axios.create({
    baseURL: `${BACKEND_SERVER}/api/v1/`,
    headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
    },
});


//Token expired check
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const { exp } = jwtDecode(token);
        return Date.now() >= (exp - 30) * 1000;
    }catch {
        return true;
    }
};

//Request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
      let accessToken = localStorage.getItem("access");
      let refreshToken = localStorage.getItem("refresh");
  
      if (isTokenExpired(accessToken)) {
        try {
          const response = await getRefreshToken({ "refresh": refreshToken  });
          const newAccess = response.data.access;
          localStorage.setItem("access", newAccess);
          config.headers.Authorization = `Bearer ${newAccess}`;
        } catch (err) {
          console.error("Не удалось обновить токен", err);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          //TODO: Redirect to login or throw exception
          return <Navigate to="/" replace />;
        }
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
  
      return config;
    },
    (error) => Promise.reject(error)
  );


export default axiosInstance;
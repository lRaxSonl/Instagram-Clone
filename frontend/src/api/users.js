import axios from "axios";


export const registerUser = (data) => axios.post("/api/user/register/", data);
export const getUser = (id) => axios.get(`/api/user/${id}/`);
export const updateUser = (data) => axios.put("/api/user/update/", data);
export const deleteUser = () => axios.delete("/api/user/delete/");
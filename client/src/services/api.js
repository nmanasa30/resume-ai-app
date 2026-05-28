import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser    = (data) => API.post("/auth/login", data);
export const getMe        = ()     => API.get("/auth/me");

export const getAllResumes  = ()         => API.get("/resume/all");
export const getResume      = (id)       => API.get(`/resume/${id}`);
export const createResume   = (data)     => API.post("/resume", data);
export const updateResume   = (id, data) => API.put(`/resume/${id}`, data);
export const deleteResume   = (id)       => API.delete(`/resume/${id}`);

export default API;
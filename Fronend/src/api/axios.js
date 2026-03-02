import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // your backend URL
  withCredentials: true, // include cookies in requests
});
export default api;

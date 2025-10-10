import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:4000/api", // backend API base
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 วิ กัน request ค้าง
});

// 👉 interceptor request (แนบ token)
// axiosClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("auth_token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// 👉 interceptor response (error handling กลาง)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error.response || error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;

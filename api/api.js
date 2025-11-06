import axios from "axios";
import devLogger from "../src/utils/logger.js";

// 개발/프로덕션 환경에 따라 baseURL 자동 설정
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    devLogger.api(config.method.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    devLogger.apiError("Request Error", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    devLogger.apiResponse(response.config.url, response.data);
    return response;
  },
  (error) => {
    devLogger.apiError(error.config?.url || "Unknown", error.response || error);
    return Promise.reject(error);
  }
);

export default api;

// 개발 모드에서 테스트 실행
if (import.meta.env.DEV || import.meta.env.MODE === "development") {
  api
    .get("/api/test")
    .then((response) => {
      devLogger.log("Test API Response:", response.data);
    })
    .catch((error) => {
      devLogger.error("Test API Error:", error);
    });
}

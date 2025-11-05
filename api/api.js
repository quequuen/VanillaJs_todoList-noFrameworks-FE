import axios from "axios";

// 개발/프로덕션 환경에 따라 baseURL 자동 설정
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

export default api;

//테스트
api
  .get("/api/test")
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error);
  });

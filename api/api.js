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
    // 에러 처리 개선
    if (error.response) {
      // 서버 응답이 있는 경우
      const { status, data } = error.response;

      // 에러 메시지 추출 (NestJS 형식 지원)
      let errorMessage =
        data?.error || data?.message || "서버 오류가 발생했습니다.";

      if (Array.isArray(errorMessage)) {
        // ValidationPipe 에러 형식: ["field must be...", ...]
        errorMessage = errorMessage.join(", ");
      }

      devLogger.apiError(error.config?.url || "Unknown", {
        status,
        statusCode: data?.statusCode || status,
        message: errorMessage,
        data,
      });

      // 401 에러 (인증 실패) 처리
      if (status === 401) {
        // 인증 실패 시 user 정보 제거 (비동기 처리)
        import("../src/utils/auth.js").then(({ clearUser }) => {
          clearUser();
        });
      }

      // 429 에러 (Rate Limiting) 처리
      if (status === 429) {
        devLogger.warn("Rate Limiting: 요청이 너무 많습니다.");
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 에러)
      devLogger.apiError(error.config?.url || "Unknown", {
        message: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
        error: error.message,
      });
    } else {
      // 요청 설정 중 에러 발생
      devLogger.apiError("Request Setup Error", {
        message: "요청 설정 중 오류가 발생했습니다.",
        error: error.message,
      });
    }

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
      // 네트워크 에러는 정상적인 상황일 수 있으므로 에러 로그만 출력
      if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
        devLogger.debug(
          "백엔드 서버가 실행되지 않았습니다. API 테스트를 건너뜁니다."
        );
      } else {
        devLogger.error("Test API Error:", error);
      }
    });
}

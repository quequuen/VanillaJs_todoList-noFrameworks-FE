import axios from "axios";
import devLogger from "../src/utils/logger.js";

// 개발/프로덕션 환경에 따라 baseURL 자동 설정
// 프로덕션: 프록시 사용 (/api로 시작하는 경로는 vercel.json의 rewrites로 백엔드로 전달)
// 개발: VITE_API_BASE_URL 또는 localhost 사용
const getBaseURL = () => {
  if (import.meta.env.PROD || window.location.hostname.includes("vercel.app")) {
    return "/api"; // 상대 경로로 설정하여 프록시 사용
  }
  // 개발 환경
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    devLogger.api(config.method.toUpperCase(), config.url, config.data);

    // 쿠키 확인 (개발 모드에서만)
    if (import.meta.env.DEV || import.meta.env.MODE === "development") {
      const cookies = document.cookie;
      if (cookies) {
        console.log("🍪 Request Cookies:", cookies);
      } else {
        console.warn("⚠️ Request에 쿠키가 없습니다.");
      }
    }

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

    // Set-Cookie 헤더 확인
    const setCookieHeader = response.headers["set-cookie"];
    if (setCookieHeader) {
      console.log("✅ Response Set-Cookie Header:", setCookieHeader);
      console.log("📋 Set-Cookie 헤더 상세:", {
        header: setCookieHeader,
        isArray: Array.isArray(setCookieHeader),
        length: Array.isArray(setCookieHeader) ? setCookieHeader.length : 1,
      });
    } else {
      console.warn("⚠️ Set-Cookie 헤더가 없습니다.");
    }

    // 쿠키 저장 확인
    setTimeout(() => {
      const cookies = document.cookie;
      console.log("🍪 응답 후 쿠키 상태:", {
        cookies: cookies || "쿠키 없음",
        cookieCount: cookies ? cookies.split(";").length : 0,
        hasSessionId: cookies?.includes("sessionId"),
        allCookies: cookies ? cookies.split(";").map((c) => c.trim()) : [],
      });

      // Set-Cookie 헤더가 있었는데 쿠키가 저장되지 않은 경우
      if (setCookieHeader && !cookies) {
        console.error(
          "❌ Set-Cookie 헤더는 있었지만 브라우저가 쿠키를 저장하지 않았습니다!"
        );
        console.error("❌ 크로스 도메인 쿠키 설정 문제일 수 있습니다.");
        console.error("❌ 확인 사항:");
        console.error("   1. SameSite=None은 Secure가 필수입니다.");
        console.error(
          "   2. 도메인이 다르면 브라우저가 쿠키를 차단할 수 있습니다."
        );
        console.error("   3. 브라우저의 쿠키 정책을 확인하세요.");
      }
    }, 100);

    return response;
  },
  (error) => {
    //  명세에 따른 에러 처리
    if (error.response) {
      // 서버 응답이 있는 경우
      const { status, data } = error.response;

      // 에러 메시지 추출 (NestJS 형식 지원)
      let errorMessage =
        data?.message || data?.error || "서버 오류가 발생했습니다.";

      // 배열 형식의 메시지 처리 (ValidationPipe)
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.join(", ");
      }

      //  명세에 따른 상태 코드별 로깅
      devLogger.apiError(error.config?.url || "Unknown", {
        status,
        statusCode: data?.statusCode || status,
        message: errorMessage,
        data,
        path: data?.path || error.config?.url,
        timestamp: data?.timestamp,
      });

      // 401 에러 (인증 실패) 처리 - : "로그인이 필요합니다."
      if (status === 401) {
        // 인증 실패 시 user 정보 제거 및 화면 리렌더링 (비동기 처리)
        const authErrorMessage =
          errorMessage || "세션이 만료되었습니다. 다시 로그인해주세요.";

        import("../src/utils/auth.js").then(({ clearUser }) => {
          clearUser(); // globalStore.setState() 호출 → notify() → render() 자동 호출

          // 사용자에게 알림 표시
          alert(authErrorMessage);
        });
      }

      // 429 에러 (Rate Limiting) 처리 - : "Too Many Requests"
      if (status === 429) {
        const retryAfter = error.response.headers?.["retry-after"];
        devLogger.warn(
          `Rate Limiting: 요청이 너무 많습니다.${
            retryAfter ? ` ${retryAfter}초 후 재시도 가능합니다.` : ""
          }`
        );
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

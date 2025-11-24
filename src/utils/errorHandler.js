// API 에러 처리 유틸리티
// Error.md 명세에 따른 에러 처리

/**
 * API 에러에서 메시지 추출
 * @param {Object} error - Axios 에러 객체
 * @returns {string} 에러 메시지
 */
export const extractErrorMessage = (error) => {
  if (!error.response) {
    // 네트워크 에러
    if (error.request) {
      return "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
    }
    return "요청 설정 중 오류가 발생했습니다.";
  }

  const { status, data } = error.response;
  let errorMessage =
    data?.message || data?.error || "서버 오류가 발생했습니다.";

  // 배열 형식의 메시지 처리 (ValidationPipe)
  if (Array.isArray(errorMessage)) {
    errorMessage = errorMessage.join(", ");
  }

  return errorMessage;
};

/**
 * 상태 코드별 에러 처리
 * @param {Object} error - Axios 에러 객체
 * @param {Object} options - 처리 옵션
 * @returns {Object} 처리 결과
 */
export const handleApiError = (error, options = {}) => {
  const {
    on400 = null, // Bad Request 처리 함수
    on401 = null, // Unauthorized 처리 함수
    on404 = null, // Not Found 처리 함수
    on429 = null, // Too Many Requests 처리 함수
    on500 = null, // Internal Server Error 처리 함수
    defaultHandler = null, // 기본 처리 함수
  } = options;

  if (!error.response) {
    // 네트워크 에러
    const message = extractErrorMessage(error);
    if (defaultHandler) {
      defaultHandler(message, error);
    }
    return { handled: false, message };
  }

  const { status, data } = error.response;
  const errorMessage = extractErrorMessage(error);

  switch (status) {
    case 400:
      // Bad Request - DTO 검증 실패, 토큰 만료 등
      if (on400) {
        on400(errorMessage, data, error);
        return { handled: true, message: errorMessage };
      }
      break;

    case 401:
      // Unauthorized - 인증 실패, 로그인 필요
      if (on401) {
        on401(errorMessage, data, error);
        return { handled: true, message: errorMessage };
      }
      break;

    case 404:
      // Not Found - 리소스를 찾을 수 없음
      if (on404) {
        on404(errorMessage, data, error);
        return { handled: true, message: errorMessage };
      }
      break;

    case 429:
      // Too Many Requests - Rate Limit 초과
      if (on429) {
        const retryAfter = error.response.headers?.["retry-after"];
        on429(errorMessage, data, error, retryAfter);
        return { handled: true, message: errorMessage, retryAfter };
      }
      break;

    case 500:
      // Internal Server Error - 서버 내부 오류
      if (on500) {
        on500(errorMessage, data, error);
        return { handled: true, message: errorMessage };
      }
      break;

    default:
      // 기타 에러
      if (defaultHandler) {
        defaultHandler(errorMessage, error);
        return { handled: true, message: errorMessage };
      }
  }

  // 처리되지 않은 경우
  if (defaultHandler) {
    defaultHandler(errorMessage, error);
  }

  return { handled: false, message: errorMessage };
};

/**
 * 사용자에게 에러 메시지 표시
 * @param {string} message - 에러 메시지
 * @param {string} type - 메시지 타입 ('error' | 'warning' | 'info')
 */
export const showErrorMessage = (message, type = "error") => {
  // alert로 표시 (나중에 모달이나 토스트로 변경 가능)
  alert(message);
};

/**
 * Todo API 에러 처리
 */
export const handleTodoError = (error) => {
  return handleApiError(error, {
    on400: (message) => {
      showErrorMessage(`잘못된 요청입니다: ${message}`);
    },
    on404: (message) => {
      showErrorMessage(`Todo를 찾을 수 없습니다: ${message}`);
    },
    on500: (message) => {
      showErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    },
    defaultHandler: (message) => {
      showErrorMessage(`오류가 발생했습니다: ${message}`);
    },
  });
};

/**
 * Auth API 에러 처리
 */
export const handleAuthError = (error) => {
  return handleApiError(error, {
    on400: (message) => {
      showErrorMessage(message);
    },
    on401: (message) => {
      showErrorMessage(`인증에 실패했습니다: ${message}`);
    },
    on429: (message, data, error, retryAfter) => {
      const waitTime = retryAfter ? `${retryAfter}초` : "잠시";
      showErrorMessage(
        `요청이 너무 많습니다. ${waitTime} 후 다시 시도해주세요.`
      );
    },
    on500: (message) => {
      showErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    },
    defaultHandler: (message) => {
      showErrorMessage(`오류가 발생했습니다: ${message}`);
    },
  });
};

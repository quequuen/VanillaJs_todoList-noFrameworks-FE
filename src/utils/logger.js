/**
 * 개발 모드에서만 동작하는 로거
 * 프로덕션 빌드 시에는 로그가 출력되지 않습니다.
 */

const isDev = import.meta.env.DEV || import.meta.env.MODE === "development";

/**
 * 에러 스택 트레이스에서 파일명과 줄 번호 추출
 */
const getErrorLocation = (error) => {
  if (!error || !error.stack) return null;

  const stackLines = error.stack.split("\n");
  // 첫 번째 스택 라인에서 파일 정보 추출 (브라우저 환경)
  const stackLine = stackLines[1] || stackLines[0];

  // 파일명과 줄 번호 패턴 매칭
  // 예: "at functionName (http://localhost:5173/src/utils/logger.js:45:12)"
  const match =
    stackLine.match(/\((.+):(\d+):(\d+)\)/) ||
    stackLine.match(/(.+):(\d+):(\d+)/);

  if (match) {
    const filePath = match[1];
    const line = match[2];
    const column = match[3];

    // 파일명만 추출 (경로에서 마지막 파일명)
    const fileName = filePath.split("/").pop() || filePath;

    return {
      file: fileName,
      filePath: filePath,
      line: line,
      column: column,
      fullLocation: `${fileName}:${line}:${column}`,
    };
  }

  return null;
};

/**
 * 에러 정보 포맷팅
 */
const formatError = (error) => {
  if (!error) return error;

  const location = getErrorLocation(error);

  if (location) {
    return {
      message: error.message || String(error),
      location: location,
      stack: error.stack,
      error: error,
    };
  }

  return {
    message: error.message || String(error),
    stack: error.stack,
    error: error,
  };
};

export const devLogger = {
  /**
   * 일반 로그
   */
  log: (...args) => {
    if (isDev) {
      console.log("[DEV]", ...args);
    }
  },

  /**
   * 에러 로그
   */
  error: (...args) => {
    if (isDev) {
      const formattedArgs = args.map((arg) => {
        if (arg instanceof Error) {
          return formatError(arg);
        }
        return arg;
      });

      console.error("[DEV ERROR]", ...formattedArgs);

      // 에러 위치가 있으면 별도로 출력
      const errorArg = args.find((arg) => arg instanceof Error);
      if (errorArg) {
        const location = getErrorLocation(errorArg);
        if (location) {
          console.error(`위치: ${location.fullLocation}`);
        }
      }
    }
  },

  /**
   * 경고 로그
   */
  warn: (...args) => {
    if (isDev) {
      console.warn("[DEV WARN]", ...args);
    }
  },

  /**
   * 정보 로그
   */
  info: (...args) => {
    if (isDev) {
      console.info("[DEV INFO]", ...args);
    }
  },

  /**
   * 디버그 로그
   */
  debug: (...args) => {
    if (isDev) {
      console.debug("[DEV DEBUG]", ...args);
    }
  },

  /**
   * API 요청 로그
   */
  api: (method, url, data = null) => {
    if (isDev) {
      console.log(`[API ${method}]`, url, data ? { data } : "");
    }
  },

  /**
   * API 응답 로그
   */
  apiResponse: (url, response) => {
    if (isDev) {
      console.log(`[API RESPONSE]`, url, response);
    }
  },

  /**
   * API 에러 로그
   */
  apiError: (url, error) => {
    if (isDev) {
      const errorInfo = error instanceof Error ? formatError(error) : error;
      console.error(`[API ERROR] ${url}`, errorInfo);

      // 에러 위치가 있으면 별도로 출력
      if (error instanceof Error) {
        const location = getErrorLocation(error);
        if (location) {
          console.error(`위치: ${location.fullLocation}`);
        }
      }
    }
  },
};

export default devLogger;

// 인증 관련 api
import api, { isUsingProxy } from "./api";

const API_PREFIX = isUsingProxy() ? "" : "/api";

const AUTH_ENDPOINTS = {
  sendMagicLink: `${API_PREFIX}/auth/send-magic-link`,
  verifyMagicLink: `${API_PREFIX}/auth/verify-api`,
  logout: `${API_PREFIX}/auth/logout`,
  getCurrentUser: `${API_PREFIX}/auth/me`,
};

const resolveEndpoint = (key) => {
  const endpoint = AUTH_ENDPOINTS[key];
  if (!endpoint) {
    throw new Error(`AUTH_ENDPOINTS.${key}가 아직 설정되지 않았습니다.`);
  }
  return endpoint;
};

export const sendMagicLink = async (email) => {
  return api.post(resolveEndpoint("sendMagicLink"), { email });
};

export const verifyMagicLink = async (token) => {
  const endpoint = resolveEndpoint("verifyMagicLink");
  console.log("🌐 verifyMagicLink 호출:", {
    endpoint,
    token,
    fullURL: `${api.defaults.baseURL}${endpoint}?token=${token}`,
  });

  const response = await api.get(endpoint, { params: { token } });
  console.log("✅ verifyMagicLink 응답 받음:", response.status, response.data);

  return response;
};

export const logout = async () => {
  return api.post(resolveEndpoint("logout"));
};

// 현재 로그인한 사용자 정보 조회 (세션 쿠키 기반)
export const getCurrentUser = async () => {
  const endpoint = resolveEndpoint("getCurrentUser");

  // 호출 전 쿠키 상태 확인
  const cookiesBefore = document.cookie;
  console.log("👤 getCurrentUser 호출 시작:", {
    endpoint,
    fullURL: `${api.defaults.baseURL}${endpoint}`,
    cookiesBefore: cookiesBefore || "쿠키 없음",
    hasSessionId: cookiesBefore?.includes("sessionId"),
    cookieDetails: cookiesBefore
      ? cookiesBefore.split(";").map((c) => c.trim())
      : [],
  });

  try {
    const response = await api.get(endpoint);

    console.log("✅ getCurrentUser 응답 받음:", {
      status: response.status,
      data: response.data,
      hasUserId: !!response.data?.id,
      hasEmail: !!response.data?.email,
    });

    const user = response?.data;
    if (user && typeof user === "object" && user.id && user.email) {
      console.log("✅ getCurrentUser 성공 - 사용자 정보:", {
        id: user.id,
        email: user.email,
      });
      return user;
    }

    // 응답 형식이 올바르지 않으면 null 반환
    console.warn("⚠️ getCurrentUser: 응답 형식이 올바르지 않습니다.", user);
    return null;
  } catch (error) {
    // 401 에러는 세션이 없거나 만료된 상태
    if (error.response?.status === 401) {
      console.warn(
        "⚠️ getCurrentUser: 401 Unauthorized - 세션이 없거나 만료되었습니다."
      );
      console.warn("⚠️ 세션 확인 필요:", {
        cookiesBefore,
        hasSessionId: cookiesBefore?.includes("sessionId"),
        errorResponse: error.response?.data,
      });
      return null;
    }
    // 네트워크 에러나 다른 에러는 null 반환 (에러를 throw하지 않음)
    console.error("❌ getCurrentUser API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      cookiesBefore,
    });
    return null;
  }
};

export default {
  sendMagicLink,
  verifyMagicLink,
  logout,
  getCurrentUser,
};

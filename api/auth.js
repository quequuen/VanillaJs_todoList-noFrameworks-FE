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
  return api.get(resolveEndpoint("verifyMagicLink"), { params: { token } });
};

export const logout = async () => {
  return api.post(resolveEndpoint("logout"));
};

// 현재 로그인한 사용자 정보 조회 (세션 쿠키 기반)
export const getCurrentUser = async () => {
  try {
    const response = await api.get(resolveEndpoint("getCurrentUser"));

    const user = response?.data;
    if (user && typeof user === "object" && user.id && user.email) {
      return user;
    }

    // 응답 형식이 올바르지 않으면 null 반환
    console.warn("getCurrentUser: 응답 형식이 올바르지 않습니다.", user);
    return null;
  } catch (error) {
    // 401 에러는 세션이 없거나 만료된 상태
    if (error.response?.status === 401) {
      console.warn(
        "getCurrentUser: 401 Unauthorized - 세션이 없거나 만료되었습니다."
      );
      return null;
    }
    // 네트워크 에러나 다른 에러는 null 반환 (에러를 throw하지 않음)
    console.error("getCurrentUser API Error:", error);
    return null;
  }
};

export default {
  sendMagicLink,
  verifyMagicLink,
  logout,
  getCurrentUser,
};

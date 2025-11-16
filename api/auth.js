// 인증 관련 api
import api from "./api";

const AUTH_ENDPOINTS = {
  sendMagicLink: "/api/auth/send-magic-link",
  verifyMagicLink: "/api/auth/verify-api",
  logout: "/api/auth/logout",
  getCurrentUser: "/api/auth/me",
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
    return response.data;
  } catch (error) {
    // 401 에러면 로그인 안 된 상태
    if (error.response?.status === 401) {
      return null;
    }
    throw new Error("사용자 정보를 가져올 수 없습니다.");
  }
};

export default {
  sendMagicLink,
  verifyMagicLink,
  logout,
  getCurrentUser,
};

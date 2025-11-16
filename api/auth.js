// 인증 관련 api
import api from "./api";

const AUTH_ENDPOINTS = {
  sendMagicLink: "/magic-link/send",
  verifyMagicLink: "/magic-link/verify",
  logout: "/api/auth/logout",
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
  // TODO: 토큰 검증 로직 구현 세부화
  return api.get(resolveEndpoint("verifyMagicLink"), { params: { token } });
};

export const logout = async () => {
  // TODO: 로그아웃 로직 구현 세부화
  return api.post(resolveEndpoint("logout"));
};

export default {
  sendMagicLink,
  verifyMagicLink,
  logout,
};

import { globalStore } from "../stores/globalStore";

// 로그인 여부 확인
export const isAuthenticated = () => {
  const user = globalStore.getState().user;
  return !!user && user !== null; // null 체크 추가
};

// user 정보 가져오기
export const getUser = () => {
  return globalStore.getState().user;
};

// user 정보 설정 (매직링크 인증 성공 시 사용)
export const setUser = (user) => {
  globalStore.setState({ user });
};

// user 정보 제거 (로그아웃 시 사용)
export const clearUser = () => {
  globalStore.setState({ user: null });
};

// 매직링크 토큰 처리 (URL에서 token 파싱)
export const handleMagicLinkToken = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    // 토큰이 있으면 인증 시도
    try {
      const { verifyMagicLink } = await import("../../api/auth.js");
      const response = await verifyMagicLink(token);
      const user = response.data.user;
      setUser(user);

      // URL에서 token 제거
      window.history.replaceState({}, "", window.location.pathname);

      return { success: true, user };
    } catch (error) {
      return { success: false, error };
    }
  }

  return null; // token이 없으면 null 반환
};

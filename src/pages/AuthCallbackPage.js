// 매직링크 인증 콜백 페이지
import { verifyMagicLink } from "../../api/auth.js";
import { getCurrentUser } from "../utils/auth.js";

const AuthCallbackPage = async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    try {
      console.log("🔐 매직링크 토큰 검증 시작:", token);

      // verify-api 호출
      await verifyMagicLink(token);

      // 세션 쿠키가 설정되었으므로 getCurrentUser로 사용자 정보 가져오기
      const user = await getCurrentUser();

      if (!user || !user.id || !user.email) {
        console.error("❌ 사용자 정보를 가져올 수 없습니다.");
        alert("로그인은 성공했지만 사용자 정보를 가져오는데 실패했습니다.");
        window.location.href = "/";
        return "<div>인증 처리 중...</div>";
      }

      console.log("✅ 로그인 완료:", user);

      // 홈으로 리다이렉트
      window.location.href = "/";
      return "<div>인증 처리 중...</div>";
    } catch (error) {
      // 에러 응답 처리
      let errorMessage = "인증에 실패했습니다.";

      if (error.response?.status === 401 || error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData?.message) {
          if (Array.isArray(errorData.message)) {
            errorMessage = errorData.message.join(", ");
          } else {
            errorMessage = errorData.message;
          }
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }
      }

      console.error("❌ 매직링크 인증 에러:", errorMessage);
      alert(errorMessage);

      // 홈으로 리다이렉트
      window.location.href = "/";
      return "<div>인증 처리 중...</div>";
    }
  }

  // token이 없으면 홈으로 리다이렉트
  window.location.href = "/";
  return "<div>인증 처리 중...</div>";
};

export default AuthCallbackPage;


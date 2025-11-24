import render from "../render.js";
import { router } from "../router.js";
import { createRouter } from "./lib/createRouter.js";
import AllTodosPage from "./pages/AllTodosPage.js";
import HomePage from "./pages/HomePage.js";
import { globalStore } from "./stores/globalStore.js";
import { handleMagicLinkToken } from "./utils/auth.js";

router.set(
  createRouter({
    "/": HomePage,
    "/all": AllTodosPage,
  })
);

async function main() {
  // URL 쿼리 파라미터에서 success/error 확인
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get("success");
  const error = urlParams.get("error");

  if (success) {
    // 성공 메시지 표시
    alert(decodeURIComponent(success));

    // URL 정리 (보안)
    window.history.replaceState({}, "", window.location.pathname);
  }

  if (error) {
    // 인증 실패 메시지 표시
    alert(decodeURIComponent(error));

    // URL에서 쿼리 파라미터 제거
    window.history.replaceState({}, "", window.location.pathname);
  }

  // 기존 매직링크 토큰 처리 (백엔드가 리다이렉트하지 않는 경우 대비)
  let magicLinkProcessed = false;
  try {
    const result = await handleMagicLinkToken();
    magicLinkProcessed = !!result; // token이 처리되었는지 확인
  } catch (err) {
    console.error("매직링크 토큰 처리 중 에러:", err);
  }

  // 매직링크 토큰이 처리되지 않은 경우에만 getCurrentUser 호출
  if (!magicLinkProcessed) {
    // 앱 시작 시 항상 로그인 상태 확인 및 todos 가져오기
    // getCurrentUser 내부에서 setUser, fetchTodosFromDB, clearUser를 자동으로 처리함
    try {
      const { getCurrentUser } = await import("./utils/auth.js");
      await getCurrentUser();
    } catch (err) {
      console.error("사용자 정보 조회 실패:", err);
      // 에러 발생 시에도 로그아웃 처리
      const { clearUser } = await import("./utils/auth.js");
      clearUser();
    }
  }

  router.get().subscribe(render);
  globalStore.subscribe(render);
  render();
}

main();

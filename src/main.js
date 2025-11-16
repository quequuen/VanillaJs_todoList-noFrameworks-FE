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

    // 세션 쿠키로 사용자 정보 조회
    try {
      const { getCurrentUser } = await import("./utils/auth.js");
      const user = await getCurrentUser();

      if (user) {
        console.log("로그인된 사용자:", user);
        // setUser는 getCurrentUser 내부에서 이미 호출됨
      } else {
        console.warn("사용자 정보를 가져올 수 없습니다.");
      }
    } catch (err) {
      console.error("사용자 정보 조회 실패:", err);
    }

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
  try {
    await handleMagicLinkToken();
  } catch (err) {
    console.error("매직링크 토큰 처리 중 에러:", err);
  }

  router.get().subscribe(render);
  globalStore.subscribe(render);
  render();
}

main();

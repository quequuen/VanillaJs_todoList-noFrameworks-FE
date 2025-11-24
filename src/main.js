import render from "../render.js";
import { router } from "../router.js";
import { createRouter } from "./lib/createRouter.js";
import AllTodosPage from "./pages/AllTodosPage.js";
import HomePage from "./pages/HomePage.js";
import { globalStore } from "./stores/globalStore.js";
import { handleMagicLinkSuccess } from "./utils/auth.js";

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

  // 매직링크 인증 성공 처리 (백엔드에서 redirect로 온 경우)
  let magicLinkProcessed = false;
  if (success === "true") {
    try {
      const result = await handleMagicLinkSuccess();
      magicLinkProcessed = !!result; // success가 처리되었는지 확인

      if (result?.success) {
        // 성공 메시지는 handleMagicLinkSuccess 내부에서 처리
        console.log("✅ 매직링크 인증 완료");
      }
    } catch (err) {
      console.error("매직링크 인증 처리 중 에러:", err);
    }
  }

  if (error) {
    // 인증 실패 메시지 표시
    alert(decodeURIComponent(error));

    // URL에서 쿼리 파라미터 제거
    window.history.replaceState({}, "", window.location.pathname);
  }

  // 매직링크 인증이 처리되지 않은 경우에만 getCurrentUser 호출
  // (일반적인 앱 시작 시 로그인 상태 확인)
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

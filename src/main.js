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
  // 매직링크 토큰 처리 (프론트엔드 URL에서 token 파라미터 확인)
  // 이메일 링크: https://프론트주소/?token=xxx
  let magicLinkProcessed = false;
  try {
    const result = await handleMagicLinkToken();
    magicLinkProcessed = !!result; // token이 처리되었는지 확인

    if (result?.success) {
      console.log("✅ 매직링크 인증 완료");
    }
  } catch (err) {
    console.error("매직링크 토큰 처리 중 에러:", err);
  }

  // 매직링크 토큰이 처리되지 않은 경우에만 getCurrentUser 호출
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

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
    // 에러가 발생해도 조용히 처리하고 화면은 정상적으로 렌더링
    try {
      const { getCurrentUser } = await import("./utils/auth.js");
      await getCurrentUser();
    } catch (err) {
      // getCurrentUser 내부에서 이미 clearUser와 alert를 호출하므로
      // 여기서는 추가 처리만 수행
      console.error("❌ 사용자 정보 조회 중 예상치 못한 에러:", err);
      const { clearUser } = await import("./utils/auth.js");
      await clearUser();
    }
  }

  // 라우터와 스토어 구독 설정
  router.get().subscribe(render);
  globalStore.subscribe(render);

  // 초기 렌더링 (getCurrentUser 완료 후 실행됨)
  render();
}

main();

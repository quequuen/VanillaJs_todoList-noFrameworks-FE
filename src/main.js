import render from "../render.js";
import { router } from "../router.js";
import { createRouter } from "./lib/createRouter.js";
import AllTodosPage from "./pages/AllTodosPage.js";
import HomePage from "./pages/HomePage.js";
import { globalStore } from "./stores/globalStore.js";
// import { handleMagicLinkToken } from "./utils/auth.js";

router.set(
  createRouter({
    "/": HomePage,
    "/all": AllTodosPage,
  })
);

async function main() {
  console.log("🚀 main() 함수 실행 시작");
  console.log("📍 현재 URL:", window.location.href);
  console.log("🔍 URL 파라미터:", window.location.search);

  // // 매직링크 토큰 처리 (프론트엔드 URL에서 token 파라미터 확인)
  // // 이메일 링크: https://프론트주소/?token=xxx
  // // handleMagicLinkToken() → verify-api 호출 → 세션 생성 → getCurrentUser
  // let magicLinkProcessed = false;
  // try {
  //   console.log("🔐 handleMagicLinkToken 호출 시작");
  //   const result = await handleMagicLinkToken();
  //   magicLinkProcessed = !!result; // token이 처리되었는지 확인
  //   console.log("🔐 handleMagicLinkToken 결과:", result);

  //   if (result?.success) {
  //     console.log("✅ 매직링크 인증 완료");
  //   }
  // } catch (err) {
  //   console.error("❌ 매직링크 토큰 처리 중 에러:", err);
  // }

  // 앱 시작 시 DB에서 todos 가져오기 (로그인 없이)
  try {
    const { getTodos } = await import("../api/todos.js");
    const response = await getTodos();
    const todos = response?.data || [];

    // todos가 배열인지 확인
    if (Array.isArray(todos)) {
      globalStore.setState({ posts: todos });
      console.log("✅ DB에서 todos 가져오기 성공:", todos.length, "개");
    } else {
      console.warn("⚠️ DB 응답이 배열이 아닙니다:", todos);
      globalStore.setState({ posts: [] });
    }
  } catch (err) {
    console.error("❌ DB에서 todos 가져오기 실패:", err);
    // 에러 발생 시 빈 배열로 초기화
    globalStore.setState({ posts: [] });
  }

  // 라우터와 스토어 구독 설정
  router.get().subscribe(render);
  globalStore.subscribe(render);

  // 초기 렌더링 (getCurrentUser 완료 후 실행됨)
  render();
}

main();

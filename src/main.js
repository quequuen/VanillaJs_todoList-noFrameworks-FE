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
  try {
    // 매직링크 토큰 처리 (에러가 발생해도 앱은 계속 실행)
    await handleMagicLinkToken();
  } catch (error) {
    console.error("매직링크 토큰 처리 중 에러:", error);
    // 에러가 발생해도 앱은 계속 실행
  }

  router.get().subscribe(render);
  globalStore.subscribe(render);
  render();
}

main();

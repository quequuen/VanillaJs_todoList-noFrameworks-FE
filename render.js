import { router } from "./router";
import DMinusThree from "./src/components/DMinusThree";
import Header from "./src/layout/Header";
import NotFoundPage from "./src/pages/NotFoundPage";
import { addEvent, registerGlobalEvents } from "./src/utils/eventUtil";

addEvent("click", "[data-link]", (e) => {
  e.preventDefault();
  router.get().push(e.target.href.replace(window.location.origin, ""));
});

function render() {
  console.log("render");
  const $root = document.getElementById("root");
  try {
    const Page = router.get().getTarget() ?? NotFoundPage;
    // 일치하는 컴포넌트가 없을 시 NotFoundPage 를 Page에 저장
    // ??->Null, None일 때 false
    $root.innerHTML = `
  <div class="max-w-[700px] mx-auto h-[100%] px-4">
    ${Header()}
    ${Page()}
    ${DMinusThree()}
  </div>
`;
  } catch (error) {
    console.error("Render Error:", error);
    // 에러가 발생해도 최소한 빈 화면이라도 보여주기
    if ($root) {
      $root.innerHTML = `
        <div class="max-w-[700px] mx-auto h-[100%] px-4">
          <div class="p-4 text-red-500">화면을 렌더링하는 중 오류가 발생했습니다.</div>
        </div>
      `;
    }
  }
  registerGlobalEvents();
}

export default render;

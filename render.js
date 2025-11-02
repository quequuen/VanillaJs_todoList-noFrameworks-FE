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
  } catch (error) {}
  registerGlobalEvents();
}

export default render;
